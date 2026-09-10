import { nodes, edges, plannedNodes } from './globals.js';
import { getIconForImage } from './icons.js';
import { openDeployModal } from './modal.js';
import { loadDock } from './dock.js';

export let network = null;

export function initNetwork() {
    var container = document.getElementById('mynetwork');
    var graphData = { nodes: nodes, edges: edges };
    var options = {
        physics: {
            enabled: false // Better for manual layout
        },
        nodes: { borderWidth: 2, shadow: true, margin: 10 },
        edges: { width: 2, smooth: { type: 'continuous', roundness: 0.5 } },
        manipulation: {
            enabled: true,
            addNode: false,
            addEdge: function (data, callback) {
                if (data.from === data.to) return callback(null);
                
                // Verify both nodes exist in plannedNodes
                if (plannedNodes[data.from] && plannedNodes[data.to]) {
                    callback(data); // Draw the edge
                } else {
                    alert("Can only connect container nodes.");
                    callback(null);
                }
            },
            deleteNode: function(data, callback) {
                if(confirm("Remove container? This will stop and delete it if it is running.")) {
                    data.nodes.forEach(nodeId => {
                        let node = plannedNodes[nodeId];
                        if (node) {
                            fetch(`/api/docker/containers/${node.name}`, { method: 'DELETE' })
                                .then(res => res.json())
                                .then(res => {
                                    delete plannedNodes[nodeId];
                                });
                        }
                    });
                    callback(data);
                } else {
                    callback(null);
                }
            }
        }
    };
    network = new vis.Network(container, graphData, options);

    // Toolbar logic
    document.getElementById('connectBtn').addEventListener('click', function() {
        network.addEdgeMode();
    });
    
    document.getElementById('deleteBtn').addEventListener('click', function() {
        network.deleteSelected();
    });

    // Search canvas
    var searchBox = document.getElementById('searchBox');
    searchBox.addEventListener('input', function(e) {
        var query = e.target.value.toLowerCase();
        if (!query) { network.unselectAll(); return; }
        var matchedNodeIds = [];
        nodes.forEach(function(node) {
            if (node.label && node.label.toLowerCase().includes(query)) matchedNodeIds.push(node.id);
        });
        if (matchedNodeIds.length > 0) {
            network.selectNodes(matchedNodeIds);
            network.focus(matchedNodeIds[0], { scale: 1.2, animation: { duration: 500 } });
        } else {
            network.unselectAll();
        }
    });

    // Drag and Drop
    container.addEventListener('dragover', function(e) { e.preventDefault(); });
    container.addEventListener('drop', function(e) {
        e.preventDefault();
        const image = e.dataTransfer.getData('text/plain');
        if (image) {
            // Get coordinates
            const rect = container.getBoundingClientRect();
            const domX = e.clientX - rect.left;
            const domY = e.clientY - rect.top;
            const pos = network.DOMtoCanvas({x: domX, y: domY});
            
            openDeployModal(image, pos.x, pos.y);
            
            // Auto-pull in the background if it's not downloaded
            fetch('/api/docker/pull', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({image: image})
            }).then(res => res.json()).then(data => {
                if (data.status === 'success') loadDock(); // refresh checkmarks
            }).catch(e => console.error("Auto-pull error:", e));
        }
    });

    // Double click to open terminal
    network.on("doubleClick", function (params) {
        if (params.nodes.length > 0) {
            let nodeId = params.nodes[0];
            if (plannedNodes[nodeId]) {
                let containerName = plannedNodes[nodeId].name;
                fetch(`/api/docker/terminal/${containerName}`, {
                    method: 'POST'
                }).then(async res => {
                    if (!res.ok) {
                        let data = await res.json();
                        throw new Error(data.detail || "Failed to open terminal");
                    }
                    return res.json();
                }).then(data => {
                    console.log("Terminal opened for", containerName);
                }).catch(err => {
                    console.error("Error opening terminal:", err);
                    alert("Could not open terminal: " + err.message + "\nDid you Launch the topology first?");
                });
            }
        }
    });
}

export function setupNetworkUI() {
    // Launch Topology
    document.getElementById('launchBtn').addEventListener('click', function() {
        // Gather nodes
        let payloadNodes = Object.values(plannedNodes);
        
        // Gather edges
        let payloadEdges = [];
        edges.forEach(function(edge) {
            let sourceNode = plannedNodes[edge.from];
            let targetNode = plannedNodes[edge.to];
            if (sourceNode && targetNode) {
                payloadEdges.push({
                    source: sourceNode.name,
                    target: targetNode.name
                });
            }
        });

        if (payloadNodes.length === 0) {
            alert("No containers planned!");
            return;
        }
        
        document.getElementById('launchBtn').innerText = "⏳ Launching...";
        document.getElementById('launchBtn').disabled = true;

        fetch('/api/docker/launch_topology', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({nodes: payloadNodes, edges: payloadEdges})
        }).then(res => res.json()).then(data => {
            alert("Topology launched successfully!");
            document.getElementById('launchBtn').innerText = "🚀 Launch Topology";
            document.getElementById('launchBtn').disabled = false;
            
            // Mark them as running visually
            nodes.forEach(function(node) {
                let containerConfig = plannedNodes[node.id];
                if (containerConfig) {
                    nodes.update({ 
                        id: node.id, 
                        image: getIconForImage(containerConfig.image, '#22c55e')
                    });
                }
            });
        }).catch(err => {
            alert("Error launching topology");
            document.getElementById('launchBtn').innerText = "🚀 Launch Topology";
            document.getElementById('launchBtn').disabled = false;
        });
    });

    // Teardown Topology
    document.getElementById('teardownBtn').addEventListener('click', function() {
        let payloadNodes = Object.values(plannedNodes);
        if (payloadNodes.length === 0) {
            alert("No containers to teardown!");
            return;
        }
        
        if(!confirm("Are you sure you want to teardown the entire topology? This stops and removes all containers.")) {
            return;
        }

        let btn = document.getElementById('teardownBtn');
        btn.innerText = "⏳ Tearing down...";
        btn.disabled = true;

        fetch('/api/docker/stop_topology', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({nodes: payloadNodes})
        }).then(res => res.json()).then(data => {
            alert("Topology stopped and removed!");
            btn.innerText = "🛑 Teardown";
            btn.disabled = false;
            
            // Remove all nodes visually
            nodes.clear();
            edges.clear();
            for (let prop in plannedNodes) {
                if (plannedNodes.hasOwnProperty(prop)) {
                    delete plannedNodes[prop];
                }
            }
        }).catch(err => {
            alert("Error tearing down topology");
            btn.innerText = "🛑 Teardown";
            btn.disabled = false;
        });
    });
}

fetch('/api/topology/data')
    .then(response => response.json())
    .then(data => {
        var vis_nodes = [];
        var vis_edges = [];
        var added_nodes = new Set();
        
        // Add Host Mac node
        vis_nodes.push({
            id: "host_mac", 
            label: "💻 My Mac\n(Host)", 
            shape: "box", 
            color: "#f59e0b", 
            font: {color: "#000", size: 16, bold: true},
            borderWidth: 3
        });
        added_nodes.add("host_mac");
        
        for (const [net_name, containers] of Object.entries(data)) {
            let net_id = `net_${net_name}`;
            if (!added_nodes.has(net_id)) {
                vis_nodes.push({id: net_id, label: `Network:\n${net_name}`, shape: "cloud", color: "#38bdf8", font: {color: "#000"}});
                added_nodes.add(net_id);
            }
            
            for (const c of containers) {
                let c_id = `cont_${c.name}`;
                if (!added_nodes.has(c_id)) {
                    let label = `${c.name}\nIP: ${c.ip}\nPort: ${c.port}`;
                    vis_nodes.push({id: c_id, label: label, shape: "box", color: "#1e293b", font: {color: "#f8fafc"}});
                    added_nodes.add(c_id);
                }
                
                // Connect container to network
                vis_edges.push({from: net_id, to: c_id, color: "#94a3b8"});
                
                // Connect Host Mac to container if port is exposed
                if (c.port && c.port !== "No Port") {
                    vis_edges.push({
                        from: "host_mac", 
                        to: c_id, 
                        color: "#f59e0b", 
                        dashes: true,
                        label: c.port,
                        font: {color: "#cbd5e1", size: 11, background: "#0f172a"}
                    });
                }
            }
        }

        var nodes = new vis.DataSet(vis_nodes);
        var edges = new vis.DataSet(vis_edges);

        var container = document.getElementById('mynetwork');
        var graphData = {
            nodes: nodes,
            edges: edges
        };
        var options = {
            physics: {
                solver: 'repulsion',
                repulsion: {
                    nodeDistance: 300,
                    centralGravity: 0.05,
                    springLength: 300,
                    springConstant: 0.05
                },
                stabilization: {
                    iterations: 200
                }
            },
            layout: {
                improvedLayout: true
            },
            nodes: {
                borderWidth: 2,
                shadow: true,
                margin: 10
            },
            edges: {
                width: 2,
                smooth: { 
                    type: 'continuous',
                    roundness: 0.5
                }
            }
        };
        var network = new vis.Network(container, graphData, options);

        // Search functionality
        var searchBox = document.getElementById('searchBox');
        
        // Intercept Ctrl+F / Cmd+F to focus our search box
        window.addEventListener("keydown", function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === "f") {
                e.preventDefault();
                searchBox.focus();
            }
        });

        searchBox.addEventListener('input', function(e) {
            var query = e.target.value.toLowerCase();
            if (!query) {
                network.unselectAll();
                return;
            }
            
            var matchedNodeIds = [];
            nodes.forEach(function(node) {
                if (node.label && node.label.toLowerCase().includes(query)) {
                    matchedNodeIds.push(node.id);
                }
            });
            
            if (matchedNodeIds.length > 0) {
                network.selectNodes(matchedNodeIds);
                network.focus(matchedNodeIds[0], {
                    scale: 1.2,
                    animation: {
                        duration: 500,
                        easingFunction: 'easeInOutQuad'
                    }
                });
            } else {
                network.unselectAll();
            }
        });
    });

import { nodes, plannedNodes } from './globals.js';
import { getIconForImage } from './icons.js';

export function openDeployModal(image, x, y) {
    document.getElementById('deployModal').style.display = 'block';
    document.getElementById('deployImage').value = image;
    document.getElementById('nodeX').value = x;
    document.getElementById('nodeY').value = y;
    document.getElementById('modalTitle').innerText = `Configure ${image}`;
    
    // Auto-generate a name
    let randomSuffix = Math.floor(Math.random() * 10000);
    let safeImgName = image.replace(/[^a-zA-Z0-9]/g, '_');
    document.getElementById('deployName').value = `cont_${safeImgName}_${randomSuffix}`;
    document.getElementById('deployPorts').value = '';
    document.getElementById('deployEnvs').value = '';
}

export function closeDeployModal() {
    document.getElementById('deployModal').style.display = 'none';
}

export function setupModal() {
    document.getElementById('closeModalBtn').addEventListener('click', closeDeployModal);

    document.getElementById('deployForm').addEventListener('submit', function(e) {
        e.preventDefault();
        let name = document.getElementById('deployName').value;
        let image = document.getElementById('deployImage').value;
        let ports = document.getElementById('deployPorts').value;
        let envs = document.getElementById('deployEnvs').value;
        let x = parseFloat(document.getElementById('nodeX').value);
        let y = parseFloat(document.getElementById('nodeY').value);
        
        // Add to canvas
        let nodeId = "node_" + name;
        
        // Ensure name is unique in our plan
        if(plannedNodes[nodeId]) {
            alert("A container with this name is already on the canvas.");
            return;
        }
        
        plannedNodes[nodeId] = {
            name: name,
            image: image,
            ports: ports,
            envs: envs
        };
        
        nodes.add({
            id: nodeId,
            x: x,
            y: y,
            label: `${name}\n(${image})`,
            shape: 'image',
            image: getIconForImage(image, '#38bdf8'),
            size: 30,
            font: {color: '#f8fafc', size: 14, background: '#0f172a'}
        });
        
        closeDeployModal();
    });
}

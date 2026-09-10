import { getFaClassForImage } from './icons.js';

export const popularImages = ['ubuntu:latest', 'alpine:latest', 'nginx:latest', 'httpd:latest', 'mysql:latest', 'postgres:latest', 'redis:latest', 'node:18', 'python:3.9', 'golang:1.20'];

export function renderDock(localImages) {
    const dock = document.getElementById('dock');
    dock.innerHTML = '';
    
    // Combine popular and local, removing duplicates
    let allImages = new Set([...popularImages, ...localImages]);
    
    allImages.forEach(img => {
        let isLocal = localImages.includes(img);
        
        let el = document.createElement('div');
        el.className = 'dock-item';
        el.draggable = true;
        
        let iconClass = getFaClassForImage(img);
        let downloadIcon = isLocal ? '<i class="fa-solid fa-check-circle" title="Downloaded" style="color: #22c55e; font-size: 14px; position: absolute; top: 5px; right: 5px;"></i>' : '<i class="fa-solid fa-cloud-arrow-down" title="Not Downloaded" style="color: #94a3b8; font-size: 14px; position: absolute; top: 5px; right: 5px;"></i>';
        
        el.innerHTML = `
            ${downloadIcon}
            <i class="${iconClass}" style="font-size: 32px; color: #38bdf8; margin-bottom: 8px;"></i>
            <div style="font-size: 12px; width: 100%; overflow: hidden; text-overflow: ellipsis; color: #f8fafc;" title="${img}">${img}</div>
        `;
        
        el.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', img);
        });
        dock.appendChild(el);
    });
}

export function loadDock() {
    // Render instantly with empty local images
    renderDock([]);
    
    // Fetch background info
    fetch('/api/docker/images')
        .then(response => response.json())
        .then(localImages => {
            renderDock(localImages);
        });
}

export function setupDockUI() {
    // Pull Image
    document.getElementById('pullImageBtn').addEventListener('click', function() {
        let imgName = document.getElementById('pullImageName').value;
        if (!imgName) return;
        
        // Immediately add it to the popular list so it shows in the dock
        if (!popularImages.includes(imgName)) {
            popularImages.push(imgName);
            loadDock();
        }
        
        let btn = document.getElementById('pullImageBtn');
        btn.innerText = "Adding...";
        btn.disabled = true;
        
        fetch('/api/docker/pull', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({image: imgName})
        }).then(res => res.json()).then(data => {
            btn.innerText = "Add/Pull";
            btn.disabled = false;
            if (data.status === 'success') {
                document.getElementById('pullImageName').value = '';
                loadDock(); // Refresh dock to show green checkmark
            } else {
                alert('Error pulling image: ' + data.message);
            }
        });
    });
}

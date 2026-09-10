import { initNetwork, setupNetworkUI } from './network.js';
import { loadDock, setupDockUI } from './dock.js';
import { setupModal } from './modal.js';

window.onload = function() {
    initNetwork();
    loadDock();
    setupDockUI();
    setupNetworkUI();
    setupModal();
};

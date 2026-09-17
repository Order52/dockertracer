import React, { useEffect, useRef, useState } from 'react';
import { Link2, Trash2, Play, Square } from 'lucide-react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { Button } from '../components/Button';

const DockerTracerPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  
  const [nodes] = useState(new DataSet<{ id: number; label: string; shape: string; color: string }>([]));
  const [edges] = useState(new DataSet<{ id: string; from: number; to: number }>([]));
  const [nodeIdCounter, setNodeIdCounter] = useState(1);

  useEffect(() => {
    if (containerRef.current) {
      const data = { nodes, edges };
      const options = {
        physics: { enabled: true, solver: 'forceAtlas2Based' },
        interaction: { dragNodes: true, hover: true }
      };
      networkRef.current = new Network(containerRef.current, data, options);
    }
  }, [nodes, edges]);

  const addNode = (type: string) => {
    const id = nodeIdCounter;
    setNodeIdCounter(id + 1);
    
    let color = '#97C2FC';
    if (type === 'ubuntu') color = '#fb8c00';
    if (type === 'nginx') color = '#43a047';
    if (type === 'redis') color = '#e53935';

    nodes.add({ id, label: `${type}-${id}`, shape: 'box', color });
  };

  const handleLaunch = () => console.log("Launching", { nodes: nodes.get(), edges: edges.get() });
  const handleTeardown = () => console.log("Teardown");

  return (
    <div className="flex h-[calc(100vh-100px)]">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 p-4 overflow-y-auto h-full">
        <h2 className="text-lg font-medium text-gray-800 mb-1">Images Library</h2>
        <p className="text-sm text-gray-500 mb-4">Click to add to canvas</p>
        
        <div className="flex flex-col gap-2">
          {['ubuntu', 'nginx', 'redis', 'alpine'].map((text) => (
            <button 
              key={text}
              onClick={() => addNode(text)}
              className="w-full text-left px-4 py-3 border border-gray-200 rounded-md bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none"
            >
              <span className="font-medium text-gray-700 capitalize">{text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="flex-grow flex flex-col p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-gray-800">Topology Builder</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Link2 className="w-4 h-4" /> Connect Mode
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
            <Button variant="primary" size="sm" className="gap-2 bg-green-600 hover:bg-green-700 focus:ring-green-500" onClick={handleLaunch}>
              <Play className="w-4 h-4" /> Launch
            </Button>
            <Button variant="danger" size="sm" className="gap-2" onClick={handleTeardown}>
              <Square className="w-4 h-4" /> Teardown
            </Button>
          </div>
        </div>

        <div 
          ref={containerRef} 
          className="flex-grow border border-gray-300 rounded-lg bg-gray-50 shadow-inner"
        />
      </div>
    </div>
  );
};

export default DockerTracerPage;

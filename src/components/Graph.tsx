import React, { useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  ReactFlowInstance
} from 'reactflow';
import 'reactflow/dist/style.css';
import WorkflowNode from './WorkflowNode';
import Legend from './Legend';
import { ProcessedNode } from '../types/workflow';

const nodeTypes = {
  aid: WorkflowNode,
  credential: WorkflowNode,
  multisig: WorkflowNode,
  client: WorkflowNode,
  registry: WorkflowNode,
  default: WorkflowNode
};

interface GraphProps {
  initialNodes: ProcessedNode[];
  initialEdges: Edge[];
}

export const Graph: React.FC<GraphProps> = ({ initialNodes, initialEdges }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // Log when props change
  useEffect(() => {
    console.log('Graph received new props:');
    console.log('Initial nodes:', initialNodes);
    console.log('Initial edges:', initialEdges);
    
    // Log edge details for debugging
    initialEdges.forEach(edge => {
      console.log(`Edge: ${edge.id}`, {
        source: edge.source,
        target: edge.target,
        type: edge.type,
        label: edge.label
      });
    });
  }, [initialNodes, initialEdges]);

  // Update nodes and edges when props change
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    console.log('Updated nodes and edges in Graph component');
    console.log(`Nodes count: ${initialNodes.length}, Edges count: ${initialEdges.length}`);
    
    // Schedule a delayed fit view to ensure nodes are properly positioned
    const timer = setTimeout(() => {
      if (reactFlowInstance.current) {
        // Use the fitView method with custom options for a sparser view
        reactFlowInstance.current.fitView({
          padding: 0.3, // Increased padding
          maxZoom: 0.6, // Reduced zoom to show more of the graph
          duration: 800
        });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
    console.log('Graph initialized with nodes:', nodes);
    console.log('Graph initialized with edges:', edges);
  }, [nodes, edges]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onInit={onInit}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 0.6 }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
        panOnScroll={false}
        preventScrolling={true}
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
        style={{ background: '#f8f9fa' }}
      >
        <Background />
        <Controls />
        <Legend />
        <Panel position="top-left" className="graph-info">
          <div>
            <strong>Nodes:</strong> {nodes.length}
            <br />
            <strong>Edges:</strong> {edges.length}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}; 
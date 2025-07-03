import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowInstance,
  Connection,
  Controls,
  Background,
  Panel,
  NodeTypes,
  EdgeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import { WorkflowBuilderNode } from '../components/workflowBuilder/WorkflowBuilderNode';
import { WorkflowBuilderEdge } from '../components/workflowBuilder/WorkflowBuilderEdge';
import { NodeToolbar } from '../components/workflowBuilder/NodeToolbar';
import { EdgeToolbar } from '../components/workflowBuilder/EdgeToolbar';
import { NodeModal } from '../components/workflowBuilder/NodeModal';
import { EdgeModal } from '../components/workflowBuilder/EdgeModal';
import { ExportModal } from '../components/workflowBuilder/ExportModal';
import { Workflow, Configuration } from '../types/workflow';
import { exportWorkflowAndConfig } from '../utils/exportUtils';
import './WorkflowBuilderPage.css';

const nodeTypes: NodeTypes = {
  createAid: WorkflowBuilderNode,
  createAidKli: WorkflowBuilderNode,
  issueCredential: WorkflowBuilderNode,
  revokeCredential: WorkflowBuilderNode,
};

const edgeTypes: EdgeTypes = {
  delegation: WorkflowBuilderEdge,
  credentialIssuer: WorkflowBuilderEdge,
  credentialIssuee: WorkflowBuilderEdge,
  credentialSource: WorkflowBuilderEdge,
  revokedCredentialLink: WorkflowBuilderEdge,
  multisigMember: WorkflowBuilderEdge,
};

export const WorkflowBuilderPage: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [showEdgeModal, setShowEdgeModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [editingEdge, setEditingEdge] = useState<Edge | null>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = addEdge(params, edges);
      setEdges((eds) => newEdge);
      
      // Auto-open edit edge modal when nodes are connected
      const newEdgeId = `${params.source}-${params.target}`;
      const createdEdge = newEdge.find(edge => edge.id === newEdgeId);
      if (createdEdge) {
        setEditingEdge(createdEdge);
        setShowEdgeModal(true);
      }
      
      // Handle multisig member edge creation
      const sourceNode = nodes.find(node => node.id === params.source);
      const targetNode = nodes.find(node => node.id === params.target);
      if (sourceNode && targetNode && sourceNode.data.config.aid) {
        // Update target node to be a multisig
        setNodes((nds) =>
          nds.map((node) =>
            node.id === targetNode.id
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    config: {
                      ...node.data.config,
                      is_multisig: true,
                      members: [
                        ...(node.data.config.members || []),
                        sourceNode.data.config.aid
                      ]
                    }
                  }
                }
              : node
          )
        );
      }
    },
    [setEdges, edges, nodes, setNodes]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  const addNode = useCallback((nodeType: string) => {
    const newNode: Node = {
      id: `${nodeType}_${Date.now()}`,
      type: nodeType,
      position: { x: 250, y: 250 },
      data: {
        label: nodeType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        nodeType,
        config: {},
        workflow: {}
      }
    };
    setNodes((nds) => [...nds, newNode]);
    setEditingNode(newNode);
    setShowNodeModal(true);
  }, [setNodes]);

  const editNode = useCallback((node: Node) => {
    setEditingNode(node);
    setShowNodeModal(true);
  }, []);

  const editEdge = useCallback((edge: Edge) => {
    setEditingEdge(edge);
    setShowEdgeModal(true);
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  const deleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    setSelectedEdge(null);
  }, [setEdges]);

  const handleNodeSave = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      )
    );
    setShowNodeModal(false);
    setEditingNode(null);
  }, [setNodes]);

  const handleEdgeSave = useCallback((edgeId: string, data: any) => {
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === edgeId
          ? { ...edge, data: { ...edge.data, ...data } }
          : edge
      )
    );
    
    // Handle multisig member edge creation
    if (data.edgeType === 'multisigMember') {
      const edge = edges.find(e => e.id === edgeId);
      if (edge) {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        if (sourceNode && targetNode && sourceNode.data.config.aid) {
          // Update target node to be a multisig
          setNodes((nds) =>
            nds.map((node) =>
              node.id === targetNode.id
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      config: {
                        ...node.data.config,
                        is_multisig: true,
                        members: [
                          ...(node.data.config.members || []),
                          sourceNode.data.config.aid
                        ]
                      }
                    }
                  }
                : node
            )
          );
        }
      }
    }
    
    setShowEdgeModal(false);
    setEditingEdge(null);
  }, [setEdges, edges, nodes, setNodes]);

  const handleExport = useCallback(() => {
    setShowExportModal(true);
  }, []);

  const exportWorkflow = useCallback((workflowName: string) => {
    // Convert nodes and edges to workflow and config format
    const workflow: Workflow = {
      workflow: {
        steps: {}
      }
    };

    const config: Configuration = {
      secrets: {},
      credentials: {},
      agents: {},
      identifiers: {},
      users: []
    };

    // Process nodes
    nodes.forEach((node) => {
      const stepId = node.id;
      workflow.workflow.steps[stepId] = {
        id: stepId,
        type: node.data.nodeType,
        ...node.data.workflow
      };

      // Add to config based on node type
      if (node.data.nodeType === 'createAid' || node.data.nodeType === 'createAidKli') {
        if (node.data.config.aid) {
          config.identifiers[node.data.config.aid] = {
            agent: node.data.config.agent || `${node.data.config.aid}-agent`,
            name: node.data.config.aid
          };
          
          // Handle multisig configuration
          if (node.data.config.is_multisig && node.data.config.members) {
            config.identifiers[node.data.config.aid].multisig = {
              members: node.data.config.members,
              threshold: node.data.config.threshold || node.data.config.members.length
            };
          }
        }
      } else if (node.data.nodeType === 'issueCredential') {
        if (node.data.config.credential) {
          config.credentials[node.data.config.credential] = {
            type: 'direct',
            schema: node.data.config.schema || 'DEFAULT_SCHEMA',
            privacy: node.data.config.privacy || false,
            attributes: node.data.config.attributes || {}
          };
        }
      }
    });

    // Process edges
    edges.forEach((edge) => {
      // Add edge-specific configurations
      if (edge.data) {
        // Handle delegation relationships
        if (edge.type === 'delegation' && edge.data.delegator && edge.data.delegate) {
          const delegateNode = nodes.find(n => n.id === edge.target);
          if (delegateNode && delegateNode.data.config.aid) {
            config.identifiers[delegateNode.data.config.aid].delegator = edge.data.delegator;
          }
        }
        
        // Handle multisig member relationships
        if (edge.type === 'multisigMember') {
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          
          if (sourceNode && targetNode && sourceNode.data.config.aid && targetNode.data.config.aid) {
            if (!config.identifiers[targetNode.data.config.aid].multisig) {
              config.identifiers[targetNode.data.config.aid].multisig = {
                members: [],
                threshold: 1
              };
            }
            
            if (!config.identifiers[targetNode.data.config.aid].multisig.members.includes(sourceNode.data.config.aid)) {
              config.identifiers[targetNode.data.config.aid].multisig.members.push(sourceNode.data.config.aid);
            }
          }
        }
      }
    });

    // Export the files
    exportWorkflowAndConfig(workflow, config, `${workflowName}.yaml`, `${workflowName}-config.json`);
    setShowExportModal(false);
  }, [nodes, edges]);

  return (
    <div className="workflow-builder-page">
      <div className="builder-header">
        <h1>Workflow Builder</h1>
        <p>Create custom workflows by adding nodes and connecting them with edges</p>
      </div>

      <div className="builder-container">
        <div className="toolbar-panel">
          <div className="toolbar-section">
            <h3>Add Nodes</h3>
            <div className="node-buttons">
              <button
                className="toolbar-btn node-btn"
                onClick={() => addNode('createAid')}
              >
                <div className="btn-icon">🆔</div>
                <span>Create AID</span>
              </button>
              <button
                className="toolbar-btn node-btn"
                onClick={() => addNode('createAidKli')}
              >
                <div className="btn-icon">🔑</div>
                <span>Create AID KLI</span>
              </button>
              <button
                className="toolbar-btn node-btn"
                onClick={() => addNode('issueCredential')}
              >
                <div className="btn-icon">📜</div>
                <span>Issue Credential</span>
              </button>
              <button
                className="toolbar-btn node-btn"
                onClick={() => addNode('revokeCredential')}
              >
                <div className="btn-icon">❌</div>
                <span>Revoke Credential</span>
              </button>
            </div>
          </div>

          <div className="toolbar-section">
            <h3>Add Edges</h3>
            <div className="edge-buttons">
              <button className="toolbar-btn edge-btn" disabled>
                <div className="btn-icon">🔗</div>
                <span>Connect Nodes</span>
              </button>
            </div>
          </div>

          <div className="toolbar-section">
            <h3>Actions</h3>
            <div className="action-buttons">
              <button
                className="toolbar-btn action-btn"
                onClick={handleExport}
                disabled={nodes.length === 0}
              >
                <div className="btn-icon">📤</div>
                <span>Export Workflow</span>
              </button>
            </div>
          </div>
        </div>

        <div className="graph-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={onInit}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
            panOnDrag={true}
            zoomOnScroll={true}
            panOnScroll={false}
            preventScrolling={true}
            minZoom={0.1}
            maxZoom={1.5}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            style={{ background: '#f8f9fa' }}
          >
            <Background />
            <Controls />
            <Panel position="top-right" className="graph-info">
              <div className="info-card">
                <div><strong>Nodes:</strong> {nodes.length}</div>
                <div><strong>Edges:</strong> {edges.length}</div>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {(selectedNode || selectedEdge) && (
          <div className="properties-panel">
            <div className="panel-header">
              <h3>Properties</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setSelectedNode(null);
                  setSelectedEdge(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="panel-content">
              {selectedNode && (
                <NodeToolbar
                  node={selectedNode}
                  onEdit={() => editNode(selectedNode)}
                  onDelete={() => deleteNode(selectedNode.id)}
                />
              )}
              {selectedEdge && (
                <EdgeToolbar
                  edge={selectedEdge}
                  onEdit={() => editEdge(selectedEdge)}
                  onDelete={() => deleteEdge(selectedEdge.id)}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {showNodeModal && editingNode && (
        <NodeModal
          node={editingNode}
          onSave={handleNodeSave}
          onClose={() => {
            setShowNodeModal(false);
            setEditingNode(null);
          }}
        />
      )}

      {showEdgeModal && editingEdge && (
        <EdgeModal
          edge={editingEdge}
          nodes={nodes}
          onSave={handleEdgeSave}
          onClose={() => {
            setShowEdgeModal(false);
            setEditingEdge(null);
          }}
        />
      )}

      {showExportModal && (
        <ExportModal
          onExport={exportWorkflow}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}; 
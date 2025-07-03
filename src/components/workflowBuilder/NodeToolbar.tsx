import React from 'react';
import { Node } from 'reactflow';
import './NodeToolbar.css';

interface NodeToolbarProps {
  node: Node;
  onEdit: () => void;
  onDelete: () => void;
}

export const NodeToolbar: React.FC<NodeToolbarProps> = ({ node, onEdit, onDelete }) => {
  const getNodeTypeLabel = (nodeType: string) => {
    switch (nodeType) {
      case 'createAid':
        return 'Create AID';
      case 'createAidKli':
        return 'Create AID KLI';
      case 'issueCredential':
        return 'Issue Credential';
      case 'revokeCredential':
        return 'Revoke Credential';
      default:
        return nodeType;
    }
  };

  const renderConfigDetails = () => {
    const config = node.data?.config || {};
    const workflow = node.data?.workflow || {};

    return (
      <div className="config-details">
        <h4>Configuration</h4>
        {Object.keys(config).length > 0 ? (
          <div className="config-items">
            {Object.entries(config).map(([key, value]) => (
              <div key={key} className="config-item">
                <span className="config-key">{key}:</span>
                <span className="config-value">{String(value)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-config">No configuration set</p>
        )}

        <h4>Workflow Parameters</h4>
        {Object.keys(workflow).length > 0 ? (
          <div className="config-items">
            {Object.entries(workflow).map(([key, value]) => (
              <div key={key} className="config-item">
                <span className="config-key">{key}:</span>
                <span className="config-value">{String(value)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-config">No workflow parameters set</p>
        )}
      </div>
    );
  };

  return (
    <div className="node-toolbar">
      <div className="toolbar-header">
        <h3>{getNodeTypeLabel(node.data?.nodeType)}</h3>
        <div className="node-id">ID: {node.id}</div>
      </div>

      <div className="toolbar-actions">
        <button className="action-btn edit-btn" onClick={onEdit}>
          <span className="btn-icon">✏️</span>
          Edit Node
        </button>
        <button className="action-btn delete-btn" onClick={onDelete}>
          <span className="btn-icon">🗑️</span>
          Delete Node
        </button>
      </div>

      {renderConfigDetails()}
    </div>
  );
}; 
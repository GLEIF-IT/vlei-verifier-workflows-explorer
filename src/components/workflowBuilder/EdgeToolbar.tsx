import React from 'react';
import { Edge } from 'reactflow';
import './EdgeToolbar.css';

interface EdgeToolbarProps {
  edge: Edge;
  onEdit: () => void;
  onDelete: () => void;
}

export const EdgeToolbar: React.FC<EdgeToolbarProps> = ({ edge, onEdit, onDelete }) => {
  const getEdgeTypeLabel = (edgeType: string) => {
    switch (edgeType) {
      case 'delegation':
        return 'Delegation';
      case 'credentialIssuer':
        return 'Credential Issuer';
      case 'credentialIssuee':
        return 'Credential Issuee';
      case 'credentialSource':
        return 'Credential Source';
      case 'revokedCredentialLink':
        return 'Revoked Credential Link';
      case 'multisigMember':
        return 'Multisig Member';
      default:
        return edgeType;
    }
  };

  const renderEdgeDetails = () => {
    const edgeData = edge.data || {};

    return (
      <div className="edge-details">
        <h4>Edge Properties</h4>
        {Object.keys(edgeData).length > 0 ? (
          <div className="edge-items">
            {Object.entries(edgeData).map(([key, value]) => (
              <div key={key} className="edge-item">
                <span className="edge-key">{key}:</span>
                <span className="edge-value">{String(value)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-edge-data">No edge properties set</p>
        )}

        <div className="connection-info">
          <h4>Connection</h4>
          <div className="connection-item">
            <span className="connection-label">From:</span>
            <span className="connection-value">{edge.source}</span>
          </div>
          <div className="connection-item">
            <span className="connection-label">To:</span>
            <span className="connection-value">{edge.target}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="edge-toolbar">
      <div className="toolbar-header">
        <h3>{getEdgeTypeLabel(edge.type || 'default')}</h3>
        <div className="edge-id">ID: {edge.id}</div>
      </div>

      <div className="toolbar-actions">
        <button className="action-btn edit-btn" onClick={onEdit}>
          <span className="btn-icon">✏️</span>
          Edit Edge
        </button>
        <button className="action-btn delete-btn" onClick={onDelete}>
          <span className="btn-icon">🗑️</span>
          Delete Edge
        </button>
      </div>

      {renderEdgeDetails()}
    </div>
  );
}; 
import React, { useState, useEffect } from 'react';
import { Edge, Node } from 'reactflow';
import './EdgeModal.css';

interface EdgeModalProps {
  edge: Edge;
  nodes: Node[];
  onSave: (edgeId: string, data: any) => void;
  onClose: () => void;
}

export const EdgeModal: React.FC<EdgeModalProps> = ({ edge, nodes, onSave, onClose }) => {
  const [formData, setFormData] = useState<any>({
    edgeType: edge.type || 'default',
    ...edge.data
  });

  useEffect(() => {
    setFormData({
      edgeType: edge.type || 'default',
      ...edge.data
    });
  }, [edge]);

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { edgeType, ...edgeData } = formData;
    onSave(edge.id, { edgeType, ...edgeData });
  };

  const getEdgeTypeFields = () => {
    const edgeType = formData.edgeType;
    
    switch (edgeType) {
      case 'delegation':
        return [
          { key: 'delegator', label: 'Delegator AID', type: 'text', placeholder: 'Enter delegator AID' },
          { key: 'delegate', label: 'Delegate AID', type: 'text', placeholder: 'Enter delegate AID' },
          { key: 'threshold', label: 'Threshold', type: 'number', placeholder: 'Enter threshold value' }
        ];
      
      case 'credentialIssuer':
        return [
          { key: 'issuer', label: 'Issuer AID', type: 'text', placeholder: 'Enter issuer AID' },
          { key: 'credential', label: 'Credential Name', type: 'text', placeholder: 'Enter credential name' }
        ];
      
      case 'credentialIssuee':
        return [
          { key: 'issuee', label: 'Issuee AID', type: 'text', placeholder: 'Enter issuee AID' },
          { key: 'credential', label: 'Credential Name', type: 'text', placeholder: 'Enter credential name' }
        ];
      
      case 'credentialSource':
        return [
          { key: 'source', label: 'Source AID', type: 'text', placeholder: 'Enter source AID' },
          { key: 'credential', label: 'Credential Name', type: 'text', placeholder: 'Enter credential name' }
        ];
      
      case 'revokedCredentialLink':
        return [
          { key: 'revoked_credential', label: 'Revoked Credential ID', type: 'text', placeholder: 'Enter revoked credential ID' },
          { key: 'reason', label: 'Revocation Reason', type: 'text', placeholder: 'Enter revocation reason' }
        ];
      
      case 'multisigMember':
        return [
          { key: 'member', label: 'Member AID', type: 'text', placeholder: 'Enter member AID' },
          { key: 'threshold', label: 'Threshold', type: 'number', placeholder: 'Enter threshold value' },
          { key: 'weight', label: 'Weight', type: 'number', placeholder: 'Enter weight value' }
        ];
      
      default:
        return [];
    }
  };

  const renderField = (field: any) => {
    const value = formData[field.key] || '';

    return (
      <div key={field.key} className="form-field">
        <label className="field-label">{field.label}</label>
        <input
          type={field.type}
          value={value}
          onChange={(e) => handleInputChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          className="field-input"
        />
      </div>
    );
  };

  const getNodeOptions = () => {
    return nodes.map(node => ({
      value: node.id,
      label: `${node.data?.label || node.type} (${node.id})`
    }));
  };

  const fields = getEdgeTypeFields();
  const nodeOptions = getNodeOptions();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Edge</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section">
            <h3>Edge Type</h3>
            <div className="form-field">
              <label className="field-label">Edge Type</label>
              <select
                value={formData.edgeType}
                onChange={(e) => handleInputChange('edgeType', e.target.value)}
                className="field-input"
              >
                <option value="delegation">Delegation</option>
                <option value="credentialIssuer">Credential Issuer</option>
                <option value="credentialIssuee">Credential Issuee</option>
                <option value="credentialSource">Credential Source</option>
                <option value="revokedCredentialLink">Revoked Credential Link</option>
                <option value="multisigMember">Multisig Member</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Connection</h3>
            <div className="connection-info">
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

          <div className="form-section">
            <h3>Edge Properties</h3>
            {fields.length > 0 ? (
              fields.map(field => renderField(field))
            ) : (
              <p className="no-fields">No properties for this edge type</p>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 
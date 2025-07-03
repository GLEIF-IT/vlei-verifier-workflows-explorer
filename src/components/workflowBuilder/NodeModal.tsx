import React, { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import './NodeModal.css';

interface NodeModalProps {
  node: Node;
  onSave: (nodeId: string, data: any) => void;
  onClose: () => void;
}

export const NodeModal: React.FC<NodeModalProps> = ({ node, onSave, onClose }) => {
  const [formData, setFormData] = useState<any>({
    config: node.data?.config || {},
    workflow: node.data?.workflow || {}
  });

  useEffect(() => {
    setFormData({
      config: node.data?.config || {},
      workflow: node.data?.workflow || {}
    });
  }, [node]);

  const handleInputChange = (section: 'config' | 'workflow', key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(node.id, formData);
  };

  const getNodeTypeFields = () => {
    const nodeType = node.data?.nodeType;
    
    switch (nodeType) {
      case 'createAid':
        return {
          config: [
            { key: 'aid', label: 'AID Name', type: 'text', placeholder: 'Enter AID name' },
            { key: 'agent', label: 'Agent Name', type: 'text', placeholder: 'Enter agent name' },
            { key: 'alias', label: 'Alias', type: 'text', placeholder: 'Enter alias' },
            { key: 'is_multisig', label: 'Is Multisig', type: 'checkbox' },
            { key: 'threshold', label: 'Multisig Threshold', type: 'number', placeholder: 'Enter threshold value' }
          ],
          workflow: [
            { key: 'is_kli', label: 'Is KLI', type: 'checkbox' },
            { key: 'transferable', label: 'Transferable', type: 'checkbox', defaultValue: true },
            { key: 'wits', label: 'Witnesses', type: 'number', placeholder: 'Number of witnesses' }
          ]
        };
      
      case 'createAidKli':
        return {
          config: [
            { key: 'aid', label: 'AID Name', type: 'text', placeholder: 'Enter AID name' },
            { key: 'agent', label: 'Agent Name', type: 'text', placeholder: 'Enter agent name' },
            { key: 'alias', label: 'Alias', type: 'text', placeholder: 'Enter alias' },
            { key: 'is_multisig', label: 'Is Multisig', type: 'checkbox' },
            { key: 'threshold', label: 'Multisig Threshold', type: 'number', placeholder: 'Enter threshold value' }
          ],
          workflow: [
            { key: 'is_kli', label: 'Is KLI', type: 'checkbox', defaultValue: true },
            { key: 'transferable', label: 'Transferable', type: 'checkbox', defaultValue: true },
            { key: 'wits', label: 'Witnesses', type: 'number', placeholder: 'Number of witnesses' }
          ]
        };
      
      case 'issueCredential':
        return {
          config: [
            { key: 'credential', label: 'Credential Name', type: 'text', placeholder: 'Enter credential name' },
            { key: 'schema', label: 'Schema', type: 'text', placeholder: 'Enter schema' },
            { key: 'privacy', label: 'Privacy', type: 'checkbox' }
          ],
          workflow: [
            { key: 'issuer', label: 'Issuer AID', type: 'text', placeholder: 'Enter issuer AID' },
            { key: 'issuee', label: 'Issuee AID', type: 'text', placeholder: 'Enter issuee AID' },
            { key: 'attributes', label: 'Attributes (JSON)', type: 'textarea', placeholder: '{"key": "value"}' }
          ]
        };
      
      case 'revokeCredential':
        return {
          config: [
            { key: 'credential', label: 'Credential Name', type: 'text', placeholder: 'Enter credential name' }
          ],
          workflow: [
            { key: 'issuer', label: 'Issuer AID', type: 'text', placeholder: 'Enter issuer AID' },
            { key: 'credential_id', label: 'Credential ID', type: 'text', placeholder: 'Enter credential ID' },
            { key: 'reason', label: 'Revocation Reason', type: 'text', placeholder: 'Enter revocation reason' }
          ]
        };
      
      default:
        return { config: [], workflow: [] };
    }
  };

  const renderField = (field: any, section: 'config' | 'workflow') => {
    const value = formData[section][field.key] ?? field.defaultValue ?? '';

    switch (field.type) {
      case 'checkbox':
        return (
          <div key={field.key} className="form-field">
            <label className="field-label">
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => handleInputChange(section, field.key, e.target.checked)}
                className="field-input checkbox"
              />
              {field.label}
            </label>
          </div>
        );
      
      case 'textarea':
        return (
          <div key={field.key} className="form-field">
            <label className="field-label">{field.label}</label>
            <textarea
              value={value}
              onChange={(e) => handleInputChange(section, field.key, e.target.value)}
              placeholder={field.placeholder}
              className="field-input textarea"
              rows={3}
            />
          </div>
        );
      
      default:
        return (
          <div key={field.key} className="form-field">
            <label className="field-label">{field.label}</label>
            <input
              type={field.type}
              value={value}
              onChange={(e) => handleInputChange(section, field.key, e.target.value)}
              placeholder={field.placeholder}
              className="field-input"
            />
          </div>
        );
    }
  };

  const fields = getNodeTypeFields();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit {node.data?.label || 'Node'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section">
            <h3>Configuration</h3>
            {fields.config.length > 0 ? (
              fields.config.map(field => renderField(field, 'config'))
            ) : (
              <p className="no-fields">No configuration fields for this node type</p>
            )}
          </div>

          <div className="form-section">
            <h3>Workflow Parameters</h3>
            {fields.workflow.length > 0 ? (
              fields.workflow.map(field => renderField(field, 'workflow'))
            ) : (
              <p className="no-fields">No workflow parameters for this node type</p>
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
import React, { useState } from 'react';
import './ExportModal.css';

interface ExportModalProps {
  onExport: (workflowName: string) => void;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ onExport, onClose }) => {
  const [workflowName, setWorkflowName] = useState('my-workflow');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (workflowName.trim()) {
      onExport(workflowName.trim());
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Export Workflow</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section">
            <h3>Export Settings</h3>
            <div className="form-field">
              <label className="field-label">Workflow Name</label>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Enter workflow name"
                className="field-input"
                required
              />
              <p className="field-help">
                This will be used as the base name for your exported files (e.g., {workflowName}.yaml, {workflowName}-config.json)
              </p>
            </div>
          </div>

          <div className="form-section">
            <h3>Export Format</h3>
            <div className="export-info">
              <div className="export-item">
                <span className="export-label">Workflow File:</span>
                <span className="export-value">{workflowName}.yaml</span>
              </div>
              <div className="export-item">
                <span className="export-label">Configuration File:</span>
                <span className="export-value">{workflowName}-config.json</span>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Export Workflow
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 
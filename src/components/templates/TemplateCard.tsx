import React from 'react';
import { ExportedTemplate } from '../../types/template';
import './TemplateCard.css';

interface TemplateCardProps {
  template: ExportedTemplate;
  onLoad: (template: ExportedTemplate) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onLoad }) => {
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString();
  };

  const handleLoadClick = () => {
    onLoad(template);
  };

  return (
    <div className="template-card">
      <div className="card-header">
        <h3 className="template-name">{template.name}</h3>
        <div className="template-meta">
          <span className="template-author">by {template.author}</span>
          <span className="template-version">v{template.version}</span>
        </div>
      </div>

      <div className="card-content">
        <p className="template-description">{template.description}</p>
        
        <div className="template-tags">
          {template.tags.map(tag => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>

        <div className="template-info">
          <div className="info-item">
            <span className="info-label">Created:</span>
            <span className="info-value">{formatDate(template.createdDate)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Steps:</span>
            <span className="info-value">
              {Object.keys(template.workflow.workflow.steps).length}
            </span>
          </div>
        </div>
      </div>

      <div className="card-actions">
        <button 
          className="load-template-btn"
          onClick={handleLoadClick}
        >
          Load Template
        </button>
      </div>
    </div>
  );
};

export default TemplateCard; 
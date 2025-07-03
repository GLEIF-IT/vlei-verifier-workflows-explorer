import React from 'react';
import TemplateGallery from '../components/templates/TemplateGallery';
import { ExportedTemplate } from '../types/template';

interface TemplatesPageProps {
  onLoadTemplate: (template: ExportedTemplate) => void;
}

const TemplatesPage: React.FC<TemplatesPageProps> = ({ onLoadTemplate }) => {
  return (
    <div className="templates-page">
      <TemplateGallery onLoadTemplate={onLoadTemplate} />
    </div>
  );
};

export default TemplatesPage; 
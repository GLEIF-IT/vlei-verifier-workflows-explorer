import { ExportedTemplate } from '../types/template';

/**
 * Generate a unique template ID
 */
export function generateTemplateId(): string {
  return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new template from workflow and config data
 */
export function createTemplate(
  name: string,
  description: string,
  author: string,
  workflow: any,
  config: any,
  tags: string[] = []
): ExportedTemplate {
  return {
    id: generateTemplateId(),
    name,
    description,
    author,
    version: '1.0.0',
    createdDate: new Date(),
    workflow,
    config,
    tags
  };
}

/**
 * Validate template structure
 */
export function validateTemplate(template: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!template.id) errors.push('Template ID is required');
  if (!template.name) errors.push('Template name is required');
  if (!template.description) errors.push('Template description is required');
  if (!template.author) errors.push('Template author is required');
  if (!template.version) errors.push('Template version is required');
  if (!template.createdDate) errors.push('Template created date is required');
  if (!template.workflow) errors.push('Template workflow is required');
  if (!template.config) errors.push('Template config is required');
  if (!Array.isArray(template.tags)) errors.push('Template tags must be an array');
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Export template to JSON file
 */
export function exportTemplateToFile(template: ExportedTemplate, filename?: string): void {
  const dataStr = JSON.stringify(template, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = filename || `${template.name.replace(/\s+/g, '_')}.json`;
  link.click();
  
  URL.revokeObjectURL(link.href);
}

/**
 * Import template from JSON file
 */
export function importTemplateFromFile(file: File): Promise<ExportedTemplate> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const template = JSON.parse(e.target?.result as string);
        const validation = validateTemplate(template);
        
        if (!validation.isValid) {
          reject(new Error(`Invalid template: ${validation.errors.join(', ')}`));
          return;
        }
        
        resolve(template);
      } catch (error) {
        reject(new Error('Failed to parse template file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read template file'));
    };
    
    reader.readAsText(file);
  });
} 
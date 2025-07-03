import { Workflow, Configuration } from '../types/workflow';
import { ExportedTemplate } from '../types/template';
import { TemplateService } from '../services/templateService';
import jsYaml from 'js-yaml';

/**
 * Export workflow and config as separate files
 */
export const exportWorkflowAndConfig = (
  workflow: Workflow,
  config: Configuration,
  workflowFileName: string,
  configFileName: string
) => {
  // Create workflow file in YAML format
  const workflowYaml = jsYaml.dump(workflow, {
    indent: 2,
    lineWidth: -1,
    noRefs: true
  });
  const workflowBlob = new Blob([workflowYaml], {
    type: 'text/yaml'
  });
  const workflowUrl = URL.createObjectURL(workflowBlob);
  
  // Create config file in JSON format
  const configBlob = new Blob([JSON.stringify(config, null, 2)], {
    type: 'application/json'
  });
  const configUrl = URL.createObjectURL(configBlob);
  
  // Generate proper file names
  const workflowBaseName = workflowFileName.replace(/\.(yaml|yml|json)$/, '') || 'workflow';
  const configBaseName = configFileName.replace(/\.(yaml|yml|json)$/, '') || 'config';
  
  // Download workflow file (YAML)
  const workflowLink = document.createElement('a');
  workflowLink.href = workflowUrl;
  workflowLink.download = `${workflowBaseName}-workflow.yaml`;
  document.body.appendChild(workflowLink);
  workflowLink.click();
  document.body.removeChild(workflowLink);
  
  // Download config file (JSON)
  const configLink = document.createElement('a');
  configLink.href = configUrl;
  configLink.download = `${configBaseName}-config.json`;
  document.body.appendChild(configLink);
  configLink.click();
  document.body.removeChild(configLink);
  
  // Clean up URLs
  URL.revokeObjectURL(workflowUrl);
  URL.revokeObjectURL(configUrl);
};

/**
 * Export workflow and config as a template JSON file
 */
export const exportAsTemplate = (
  workflow: Workflow,
  config: Configuration,
  workflowFileName: string,
  configFileName: string
) => {
  // Generate template name from file names
  const baseName = workflowFileName.replace(/\.(yaml|yml)$/, '') || 'workflow';
  const templateName = `${baseName}-template`;
  
  // Create template object
  const template: ExportedTemplate = {
    id: TemplateService.generateTemplateId(),
    name: templateName,
    description: `Template exported from ${workflowFileName} and ${configFileName}`,
    author: 'VLEI Explorer User',
    version: '1.0.0',
    createdDate: new Date(),
    workflow,
    config,
    tags: ['exported', 'workflow', 'config']
  };
  
  // Create and download template file
  const templateBlob = new Blob([JSON.stringify(template, null, 2)], {
    type: 'application/json'
  });
  const templateUrl = URL.createObjectURL(templateBlob);
  
  const templateLink = document.createElement('a');
  templateLink.href = templateUrl;
  templateLink.download = `${templateName}.json`;
  document.body.appendChild(templateLink);
  templateLink.click();
  document.body.removeChild(templateLink);
  
  // Clean up URL
  URL.revokeObjectURL(templateUrl);
}; 
import { ExportedTemplate } from '../types/template';

// Import default templates
import qviSinglesigLight from '../data/templates/qvi-singlesig-light.json';
import qviSinglesigFull from '../data/templates/qvi-singlesig-full.json';
import qviMultisig from '../data/templates/qvi-multisig.json';
import testingRevocation from '../data/templates/testing-revocation.json';
import testingAidKli from '../data/templates/testing-aid-kli.json';
import devMultisigNonDelegated from '../data/templates/dev-multisig-non-delegated.json';
import devProductionGleif from '../data/templates/dev-production-gleif.json';

// Default templates array
const defaultTemplates: ExportedTemplate[] = [
  qviSinglesigLight,
  qviSinglesigFull,
  qviMultisig,
  testingRevocation,
  testingAidKli,
  devMultisigNonDelegated,
  devProductionGleif,
];

export class TemplateService {
  /**
   * Get all available templates
   */
  static getAllTemplates(): ExportedTemplate[] {
    return defaultTemplates;
  }

  /**
   * Get template by ID
   */
  static getTemplateById(id: string): ExportedTemplate | undefined {
    return defaultTemplates.find(template => template.id === id);
  }

  /**
   * Search templates by name, description, or tags
   */
  static searchTemplates(query: string): ExportedTemplate[] {
    const lowerQuery = query.toLowerCase();
    return defaultTemplates.filter(template => 
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Filter templates by tags
   */
  static filterTemplatesByTags(tags: string[]): ExportedTemplate[] {
    return defaultTemplates.filter(template =>
      tags.some(tag => template.tags.includes(tag))
    );
  }

  /**
   * Generate unique template ID
   */
  static generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create new template from workflow and config
   */
  static createTemplate(
    name: string,
    description: string,
    author: string,
    workflow: any,
    config: any,
    tags: string[] = []
  ): ExportedTemplate {
    return {
      id: this.generateTemplateId(),
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
} 
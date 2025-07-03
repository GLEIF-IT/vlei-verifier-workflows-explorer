import { Workflow, Configuration } from './workflow';

export interface ExportedTemplate {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  createdDate: Date;
  workflow: Workflow;
  config: Configuration;
  tags: string[];
}

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  createdDate: Date;
  tags: string[];
} 
export type WorkflowStepType = 
  | 'create_client'
  | 'create_aid'
  | 'create_aid_kli'
  | 'create_registry'
  | 'issue_credential'
  | 'revoke_credential'
  | 'workflowNode';

export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  agent_name?: string;
  aid?: string;
  description?: string;
  attributes?: Record<string, any>;
  issuer_aid?: string;
  issuee_aid?: string;
  credential?: string;
  credential_source?: string;
  initiator?: string;
}

export interface Workflow {
  steps: {
    [key: string]: WorkflowStep;
  };
}

export interface Secret {
  [key: string]: string;
}

export interface Credential {
  type: string;
  schema: string;
  privacy: boolean;
  attributes: Record<string, any>;
  credSource?: {
    type: string;
  };
  rules?: string;
}

export interface Agent {
  secret: string;
}

export interface Identifier {
  agent: string;
  name: string;
  delegator?: string;
}

export interface User {
  type: string;
  alias: string;
  identifiers: string[];
}

export interface Configuration {
  secrets: Secret;
  credentials: {
    [key: string]: Credential;
  };
  agents: {
    [key: string]: Agent;
  };
  identifiers: {
    [key: string]: Identifier;
  };
  users: User[];
}

export interface NodeData {
  label: string;
  type: WorkflowStepType;
  config: WorkflowStep;
}

export interface WorkflowNode {
  id: string;
  type: WorkflowStepType;
  data: NodeData;
  position: {
    x: number;
    y: number;
  };
} 
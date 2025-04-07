export interface WorkflowStep {
  id: string;
  type: string;
  agent_name?: string;
  aid?: string;
  description?: string;
  attributes?: Record<string, any>;
  issuer_aid?: string;
  issuee_aid?: string;
  credential?: string;
  credential_source?: string;
  [key: string]: any; // Allow for additional properties
}

export interface Workflow {
  workflow: {
    steps: {
      [key: string]: WorkflowStep;
    };
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
  [key: string]: any; // Allow for additional properties
}

export interface Agent {
  secret: string;
  [key: string]: any;
}

export interface Identifier {
  agent: string;
  name: string;
  delegator?: string;
  [key: string]: any;
}

export interface User {
  type: string;
  alias: string;
  identifiers: string[];
  [key: string]: any;
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

export interface ProcessedNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    type?: string;
    aid?: string;
    agent_name?: string;
    description?: string;
    attributes?: Record<string, any>;
    issuer_aid?: string;
    issuee_aid?: string;
    credential?: string;
    credential_source?: string;
    [key: string]: any; // Allow additional properties
  };
} 
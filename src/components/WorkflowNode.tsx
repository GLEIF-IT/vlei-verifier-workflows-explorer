import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import './WorkflowNode.css';

interface WorkflowNodeProps {
  data: {
    label: string;
    stepType: string;
    style?: React.CSSProperties;
    isRootOfTrust?: boolean;
    [key: string]: any;
  };
}

const WorkflowNode: React.FC<WorkflowNodeProps> = ({ data }) => {
  // Use the style from data if available, otherwise use default styles
  const nodeStyle = data.style || getDefaultNodeStyle(data.stepType);

  // Extract all relevant information from the data
  const {
    label,
    stepType,
    aid,
    agent_name,
    description,
    attributes,
    issuer_aid,
    issuee_aid,
    credential,
    credential_source,
    rot_aid,
    isRootOfTrust,
    ...otherData
  } = data;

  // Function to render attributes as a list
  const renderAttributes = () => {
    if (!attributes || Object.keys(attributes).length === 0) return null;
    
    return (
      <div className="node-section">
        <div className="node-section-title">Attributes:</div>
        <ul className="node-list">
          {Object.entries(attributes).map(([key, value]) => (
            <li key={key} className="node-list-item">
              <span className="node-list-key">{key}:</span> {String(value)}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Function to render other data as a list
  const renderOtherData = () => {
    const relevantOtherData = Object.entries(otherData).filter(
      ([key]) => !['label', 'stepType', 'style', 'isRootOfTrust'].includes(key)
    );
    
    if (relevantOtherData.length === 0) return null;
    
    return (
      <div className="node-section">
        <div className="node-section-title">Additional Info:</div>
        <ul className="node-list">
          {relevantOtherData.map(([key, value]) => (
            <li key={key} className="node-list-item">
              <span className="node-list-key">{key}:</span> {String(value)}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div style={nodeStyle} className="workflow-node">
      {isRootOfTrust && (
        <div className="root-of-trust-badge">
          <span>Root of Trust</span>
        </div>
      )}
      <Handle type="target" position={Position.Top} />
      <div className="node-header">
        <div className="node-title">{label}</div>
        <div className="node-type">{stepType}</div>
      </div>
      
      <div className="node-content">
        {description && (
          <div className="node-description">{description}</div>
        )}
        
        {aid && (
          <div className="node-info">
            <span className="node-info-label">AID:</span> {aid}
          </div>
        )}
        
        {agent_name && (
          <div className="node-info">
            <span className="node-info-label">Agent:</span> {agent_name}
          </div>
        )}
        
        {issuer_aid && (
          <div className="node-info">
            <span className="node-info-label">Issuer:</span> {issuer_aid}
          </div>
        )}
        
        {issuee_aid && (
          <div className="node-info">
            <span className="node-info-label">Issuee:</span> {issuee_aid}
          </div>
        )}
        
        {credential && (
          <div className="node-info">
            <span className="node-info-label">Credential:</span> {credential}
          </div>
        )}
        
        {credential_source && (
          <div className="node-info">
            <span className="node-info-label">Source:</span> {credential_source}
          </div>
        )}
        
        {rot_aid && (
          <div className="node-info">
            <span className="node-info-label">Root of Trust:</span> {rot_aid}
          </div>
        )}
        
        {renderAttributes()}
        {renderOtherData()}
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

// Default styles if no style is provided in the data
const getDefaultNodeStyle = (stepType: string): React.CSSProperties => {
  switch (stepType) {
    case 'create_aid':
      return {
        background: '#e6f3ff',
        border: '2px solid #1890ff',
        borderRadius: '8px',
        padding: '10px',
        minWidth: '200px',
        maxWidth: '300px'
      };
    case 'create_client':
      return {
        background: '#f0f5ff',
        border: '2px solid #722ed1',
        borderRadius: '8px',
        padding: '10px',
        minWidth: '200px',
        maxWidth: '300px'
      };
    case 'create_registry':
      return {
        background: '#f6ffed',
        border: '2px solid #52c41a',
        borderRadius: '8px',
        padding: '10px',
        minWidth: '200px',
        maxWidth: '300px'
      };
    case 'issue_credential':
      return {
        background: '#f6ffed',
        border: '2px solid #52c41a',
        borderRadius: '8px',
        padding: '10px',
        minWidth: '200px',
        maxWidth: '300px'
      };
    case 'revoke_credential':
      return {
        background: '#fff1f0',
        border: '2px solid #ff4d4f',
        borderRadius: '8px',
        padding: '10px',
        minWidth: '200px',
        maxWidth: '300px'
      };
    default:
      return {
        background: '#fafafa',
        border: '2px solid #d9d9d9',
        borderRadius: '8px',
        padding: '10px',
        minWidth: '200px',
        maxWidth: '300px'
      };
  }
};

export default memo(WorkflowNode); 
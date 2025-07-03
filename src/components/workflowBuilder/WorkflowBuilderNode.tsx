import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import './WorkflowBuilderNode.css';

const getNodeStyle = (nodeType: string): React.CSSProperties => {
  switch (nodeType) {
    case 'createAid':
      return {
        background: '#e6f3ff',
        border: '2px solid #1890ff',
        borderRadius: '8px',
        padding: '10px',
        minWidth: '200px',
        maxWidth: '300px'
      };
    case 'createAidKli':
      return {
        background: '#f0f5ff',
        border: '2px solid #722ed1',
        borderRadius: '8px',
        padding: '10px',
        minWidth: '200px',
        maxWidth: '300px'
      };
    case 'issueCredential':
      return {
        background: '#f6ffed',
        border: '2px solid #52c41a',
        borderRadius: '8px',
        padding: '10px',
        minWidth: '200px',
        maxWidth: '300px'
      };
    case 'revokeCredential':
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

const getNodeTypeLabel = (nodeType: string) => {
  switch (nodeType) {
    case 'createAid':
      return 'CREATE AID';
    case 'createAidKli':
      return 'CREATE AID KLI';
    case 'issueCredential':
      return 'ISSUE CREDENTIAL';
    case 'revokeCredential':
      return 'REVOKE CREDENTIAL';
    default:
      return nodeType.toUpperCase();
  }
};

export const WorkflowBuilderNode = memo(({ data, selected }: NodeProps) => {
  const nodeType = data.nodeType || 'default';
  const nodeStyle = getNodeStyle(nodeType);
  const typeLabel = getNodeTypeLabel(nodeType);

  return (
    <div
      className={`workflow-node ${selected ? 'selected' : ''}`}
      style={nodeStyle}
    >
      <Handle type="target" position={Position.Top} />
      
      <div className="node-header">
        <div className="node-title">{data.label || typeLabel}</div>
        <div className="node-type">{typeLabel}</div>
      </div>
      
      <div className="node-content">
        {data.config?.aid && (
          <div className="node-info">
            <span className="node-info-label">AID:</span> {data.config.aid}
          </div>
        )}
        
        {data.config?.agent && (
          <div className="node-info">
            <span className="node-info-label">Agent:</span> {data.config.agent}
          </div>
        )}
        
        {data.config?.alias && (
          <div className="node-info">
            <span className="node-info-label">Alias:</span> {data.config.alias}
          </div>
        )}
        
        {data.config?.credential && (
          <div className="node-info">
            <span className="node-info-label">Credential:</span> {data.config.credential}
          </div>
        )}
        
        {data.config?.schema && (
          <div className="node-info">
            <span className="node-info-label">Schema:</span> {data.config.schema}
          </div>
        )}
        
        {data.config?.is_multisig && (
          <div className="node-section">
            <div className="node-section-title">Multisig Configuration:</div>
            <div className="node-info">
              <span className="node-info-label">Members:</span> {data.config.members?.length || 0}
            </div>
            {data.config.threshold && (
              <div className="node-info">
                <span className="node-info-label">Threshold:</span> {data.config.threshold}
              </div>
            )}
            {data.config.members && data.config.members.length > 0 && (
              <ul className="node-list">
                {data.config.members.map((member: string, index: number) => (
                  <li key={index} className="node-list-item">
                    <span className="node-list-key">Member {index + 1}:</span> {member}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        
        {data.workflow && Object.keys(data.workflow).length > 0 && (
          <div className="node-section">
            <div className="node-section-title">Workflow Parameters:</div>
            <ul className="node-list">
              {Object.entries(data.workflow).map(([key, value]) => (
                <li key={key} className="node-list-item">
                  <span className="node-list-key">{key}:</span> {String(value)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

WorkflowBuilderNode.displayName = 'WorkflowBuilderNode'; 
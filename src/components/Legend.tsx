import React from 'react';
import { Panel } from 'reactflow';
import './Legend.css';

const legendItems = [
  {
    color: '#ff00ff',
    label: 'Delegation',
    description: 'Delegation relationship connection between delegator and delegate'
  },
  {
    color: '#ff0000',
    label: 'Credential Issuer',
    description: 'Connection from the credential issuer to the credential'
  },
  {
    color: '#ff0000',
    label: 'Credential Revoker',
    description: 'Connection from the credential revoker to the revoked credential'
  },
  {
    color: '#00ff00',
    label: 'Credential Issuee',
    description: 'Connection from the credential issuee to the credential'
  },
  {
    color: '#00ff00',
    label: 'Revoked Credential Issuee',
    description: 'Connection from the issuee to the revoked credential'
  },
  {
    color: '#0000ff',
    label: 'Credential Source',
    description: 'Connection from the source credential to the derived credential'
  },
  {
    color: '#ff4d4f',
    label: 'Revoked Credential Link',
    description: 'Connection from the original credential to the revoked credential'
  },
  {
    color: '#ff8800',
    label: 'Multisig Member',
    description: 'Connection from a multisig member to the multisig group'
  }
];

const nodeTypes = [
  {
    color: '#1890ff',
    label: 'AID',
    description: 'Singlesig Identifier'
  },
  {
    color: '#faad14',
    label: 'Multisig AID',
    description: 'Multisig identifier'
  },
  {
    color: '#52c41a',
    label: 'Credential',
    description: 'Issued credential'
  },
  {
    color: '#ff4d4f',
    label: 'Revoked Credential',
    description: 'Revoked credential'
  }
];

const Legend: React.FC = () => {
  return (
    <Panel position="bottom-right" className="legend-panel">
      <div className="legend-container">
        <div className="legend-section">
          <h3 className="legend-title">Edge Types</h3>
          {legendItems.map((item, index) => (
            <div key={index} className="legend-item">
              <div className="legend-item-header">
                <div 
                  className="legend-edge-indicator"
                  style={{ backgroundColor: item.color }}
                />
                <span className="legend-item-label">{item.label}</span>
              </div>
              <div className="legend-item-description">
                {item.description}
              </div>
            </div>
          ))}
        </div>
        
        <div className="legend-section">
          <h3 className="legend-title">Node Types</h3>
          {nodeTypes.map((item, index) => (
            <div key={index} className="legend-item">
              <div className="legend-item-header">
                <div 
                  className="legend-node-indicator"
                  style={{ backgroundColor: item.color }}
                />
                <span className="legend-item-label">{item.label}</span>
              </div>
              <div className="legend-item-description">
                {item.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
};

export default Legend; 
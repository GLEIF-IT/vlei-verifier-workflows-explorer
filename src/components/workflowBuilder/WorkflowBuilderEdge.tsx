import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from 'reactflow';
import './WorkflowBuilderEdge.css';

const getEdgeColor = (edgeType: string) => {
  switch (edgeType) {
    case 'delegation':
      return '#1890ff';
    case 'credentialIssuer':
      return '#52c41a';
    case 'credentialIssuee':
      return '#722ed1';
    case 'credentialSource':
      return '#fa8c16';
    case 'revokedCredentialLink':
      return '#ff4d4f';
    case 'multisigMember':
      return '#13c2c2';
    default:
      return '#666';
  }
};

const getEdgeLabel = (edgeType: string) => {
  switch (edgeType) {
    case 'delegation':
      return 'Delegation';
    case 'credentialIssuer':
      return 'Issuer';
    case 'credentialIssuee':
      return 'Issuee';
    case 'credentialSource':
      return 'Source';
    case 'revokedCredentialLink':
      return 'Revoked';
    case 'multisigMember':
      return 'Multisig';
    default:
      return edgeType;
  }
};

export const WorkflowBuilderEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeType = data?.edgeType || 'default';
  const color = getEdgeColor(edgeType);
  const label = getEdgeLabel(edgeType);

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: color,
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: edgeType === 'revokedCredentialLink' ? '5,5' : undefined,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="react-flow__edge-text"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: '12px',
            fontWeight: '500',
            fill: '#595959',
            pointerEvents: 'all',
          }}
        >
          <div
            className="react-flow__edge-text-bg"
            style={{
              background: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
              fontSize: '11px',
              fontWeight: '500',
              color: '#595959',
            }}
          >
            {label}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

WorkflowBuilderEdge.displayName = 'WorkflowBuilderEdge'; 
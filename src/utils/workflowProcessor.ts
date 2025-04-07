import { Edge } from 'reactflow';
import { Workflow, Configuration, ProcessedNode } from '../types/workflow';

// Define the types of steps we want to include in the graph
const ALLOWED_STEP_TYPES = [
  'create_aid',
  'issue_credential',
  'revoke_credential'
];

// Define node types for grouping
const NODE_TYPES = {
  AID: 'aid',
  CREDENTIAL: 'credential',
  MULTISIG: 'multisig'
} as const;

// Define group positions
const GROUP_POSITIONS = {
  [NODE_TYPES.AID]: { x: 100, y: 100 },
  [NODE_TYPES.CREDENTIAL]: { x: 500, y: 100 },
  [NODE_TYPES.MULTISIG]: { x: 300, y: 100 }
} as const;

// Calculate position within a group
const calculateNodePosition = (
  nodeId: string, 
  nodeType: string, 
  groupIndex: number, 
  totalInGroup: number
): { x: number, y: number } => {
  // Default position if nodeType is not found
  const defaultPosition = { x: 100, y: 100 };
  
  // Get base position from group or use default
  const basePosition = GROUP_POSITIONS[nodeType as keyof typeof GROUP_POSITIONS] || defaultPosition;
  const baseX = basePosition.x;
  const baseY = basePosition.y;
  
  // Calculate offset within group
  const row = Math.floor(groupIndex / 3); // 3 nodes per row
  const col = groupIndex % 3;
  
  // Add some randomness for natural look
  const randomX = Math.random() * 30 - 15;
  const randomY = Math.random() * 30 - 15;
  
  return {
    x: baseX + (col * 200) + randomX,
    y: baseY + (row * 150) + randomY
  };
};

// Group nodes by type
const groupNodesByType = (nodes: ProcessedNode[]): Record<string, ProcessedNode[]> => {
  const groups: Record<string, ProcessedNode[]> = {
    aid: [],
    credential: [],
    multisig: []
  };
  
  console.log('Grouping nodes by type. Total nodes:', nodes.length);
  
  nodes.forEach(node => {
    console.log(`Processing node for grouping: ${node.id}, type: ${node.type}`);
    
    if (node.type === 'multisig') {
      groups.multisig.push(node);
      console.log(`Added node ${node.id} to multisig group`);
    } else if (node.type === 'aid') {
      groups.aid.push(node);
      console.log(`Added node ${node.id} to aid group`);
    } else if (node.type === 'credential') {
      groups.credential.push(node);
      console.log(`Added node ${node.id} to credential group`);
    } else {
      console.log(`Unknown node type: ${node.type} for node ${node.id}`);
    }
  });
  
  console.log('Grouped nodes result:', {
    aid: groups.aid.length,
    credential: groups.credential.length,
    multisig: groups.multisig.length
  });
  
  return groups;
};

// Calculate node positions based on their type and relationships
const calculateNodePositions = (nodes: ProcessedNode[]): ProcessedNode[] => {
  // Define spacing between nodes
  const HORIZONTAL_SPACING = 300; // Reduced from 600 for closer horizontal spacing
  const VERTICAL_SPACING = 800;   // Vertical spacing between different types of nodes
  const NODE_WIDTH = 180;         // Width of a node
  const NODE_HEIGHT = 100;        // Approximate height of a node

  // Group nodes by type
  const groupedNodes = groupNodesByType(nodes);
  
  console.log('Grouped nodes:', groupedNodes);
  
  // Position nodes within each group
  const positionedNodes: ProcessedNode[] = [];
  
  // Define the order of groups (top to bottom)
  const groupOrder = ['aid', 'multisig', 'credential'];
  
  // Process each group in the specified order
  groupOrder.forEach((type, groupIndex) => {
    const groupNodes = groupedNodes[type] || [];
    console.log(`Positioning ${groupNodes.length} nodes of type ${type}`);
    
    // Calculate the total width needed for this group
    const totalWidth = groupNodes.length * HORIZONTAL_SPACING;
    
    // Calculate the starting X position to center the group
    const startX = -totalWidth / 2 + HORIZONTAL_SPACING / 2;
    
    // Calculate the Y position for this group
    const baseY = groupIndex * VERTICAL_SPACING;
    
    groupNodes.forEach((node, index) => {
      // Calculate position for this node
      const baseX = startX + index * HORIZONTAL_SPACING;
      
      // Add some randomness for natural look (reduced to minimize overlap)
      const randomX = Math.random() * 10 - 5; // Reduced randomness
      const randomY = Math.random() * 10 - 5; // Reduced randomness
      
      // Create the node with its position
      const newNode = {
        ...node,
        position: { 
          x: baseX + randomX, 
          y: baseY + randomY 
        }
      };
      
      // Check for collisions with already positioned nodes
      let finalPosition = { x: baseX + randomX, y: baseY + randomY };
      let attempts = 0;
      const maxAttempts = 10;
      
      while (hasCollision(finalPosition, positionedNodes, NODE_WIDTH, NODE_HEIGHT) && attempts < maxAttempts) {
        // Try a new position with more randomness
        finalPosition = {
          x: baseX + (Math.random() * 50 - 25), // Reduced randomness range
          y: baseY + (Math.random() * 50 - 25)  // Reduced randomness range
        };
        attempts++;
      }
      
      positionedNodes.push({
        ...newNode,
        position: finalPosition
      });
    });
  });
  
  console.log('Total positioned nodes:', positionedNodes.length);
  console.log('Positioned nodes by type:', {
    aid: positionedNodes.filter(n => n.type === 'aid').length,
    credential: positionedNodes.filter(n => n.type === 'credential').length,
    multisig: positionedNodes.filter(n => n.type === 'multisig').length
  });
  
  return positionedNodes;
};

// Helper function to check if a node position collides with any existing nodes
const hasCollision = (
  position: { x: number, y: number }, 
  existingNodes: ProcessedNode[], 
  nodeWidth: number, 
  nodeHeight: number
): boolean => {
  // Define a safety margin to ensure nodes don't get too close
  const safetyMargin = 50;
  
  // Check collision with each existing node
  for (const node of existingNodes) {
    const dx = Math.abs(position.x - node.position.x);
    const dy = Math.abs(position.y - node.position.y);
    
    // If the distance is less than the sum of half-widths plus safety margin, there's a collision
    if (dx < (nodeWidth / 2 + safetyMargin) && dy < (nodeHeight / 2 + safetyMargin)) {
      return true;
    }
  }
  
  return false;
};

export const processWorkflowAndConfig = (
  workflow: Workflow,
  config: Configuration
): { nodes: ProcessedNode[], edges: Edge[] } => {
  console.log('Processing workflow and config:', workflow, config);
  
  if (!workflow || !workflow.workflow || !workflow.workflow.steps) {
    console.error('Invalid workflow format');
    return { nodes: [], edges: [] };
  }
  
  // Log all steps in the workflow
  console.log('All workflow steps:', Object.entries(workflow.workflow.steps));
  
  // Filter steps by allowed types
  const filteredSteps = Object.entries(workflow.workflow.steps)
    .filter(([_, step]) => ALLOWED_STEP_TYPES.includes(step.type));
  
  console.log('Filtered steps:', filteredSteps);
  console.log('Allowed step types:', ALLOWED_STEP_TYPES);
  
  // Check if there are any create_aid steps
  const aidSteps = Object.entries(workflow.workflow.steps)
    .filter(([_, step]) => step.type === 'create_aid');
  console.log('AID steps found:', aidSteps);
  
  // Find root of trust steps
  const rotSteps = Object.entries(workflow.workflow.steps)
    .filter(([_, step]) => step.type === 'add_root_of_trust');
  console.log('Root of Trust steps found:', rotSteps);
  
  // Extract root of trust AIDs
  const rootOfTrustAids = rotSteps.map(([_, step]) => step.rot_aid);
  console.log('Root of Trust AIDs:', rootOfTrustAids);
  
  // Create nodes from filtered steps
  const nodes: ProcessedNode[] = [];
  
  // First, create nodes for all AIDs in the configuration
  if (config && config.identifiers) {
    console.log('Creating nodes for all AIDs in the configuration');
    
    // Find all multisig AIDs
    const multisigAids = Object.entries(config.identifiers)
      .filter(([_, aidData]) => aidData.identifiers && Array.isArray(aidData.identifiers))
      .map(([aidName, _]) => aidName);
    
    console.log('Found multisig AIDs:', multisigAids);
    
    // Create nodes for all AIDs in the configuration
    Object.entries(config.identifiers).forEach(([aidId, aidData]) => {
      // Skip if this is a multisig AID (we'll create these separately)
      if (multisigAids.includes(aidId)) {
        console.log(`Skipping multisig AID: ${aidId}`);
        return;
      }
      
      console.log(`Creating node for AID: ${aidId}`);
      
      // Get delegator
      const delegator = aidData.delegator || null;
      
      // Get agent secret
      let agentSecret = undefined;
      if (aidData.agent && config.agents && config.agents[aidData.agent]) {
        const agent = config.agents[aidData.agent];
        if (agent.secret && config.secrets && config.secrets[agent.secret]) {
          agentSecret = config.secrets[agent.secret];
        }
      }
      
      // Check if this AID is a member of any multisig
      let isMemberOfMultisig = false;
      multisigAids.forEach(multisigId => {
        const multisigData = config.identifiers[multisigId];
        if (multisigData.identifiers && Array.isArray(multisigData.identifiers) && 
            multisigData.identifiers.includes(aidId)) {
          isMemberOfMultisig = true;
          console.log(`AID ${aidId} is a member of multisig ${multisigId}`);
        }
      });
      
      const node: ProcessedNode = {
        id: aidId,
        type: 'aid',
        position: { x: 0, y: 0 }, // Will be updated later
        data: {
          label: aidData.name || aidId,
          description: `AID: ${aidId}`,
          type: 'AID',
          delegator: delegator,
          'agent-secret': agentSecret,
          isMultisig: false,
          isMemberOfMultisig: isMemberOfMultisig,
          style: {
            background: '#1890ff',
            color: 'white',
            border: '2px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '6px',
            padding: '12px 16px',
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            width: 180
          }
        }
      };
      
      // Check if this AID is a root of trust
      const isRootOfTrust = rootOfTrustAids.includes(aidId);
      if (isRootOfTrust) {
        node.data.isRootOfTrust = true;
        node.data.style = {
          ...node.data.style,
          border: '2px solid #1890ff',
          borderRadius: '8px'
        };
      }
      
      nodes.push(node);
      console.log('Added AID node:', node);
    });
    
    // Create nodes for multisig AIDs
    multisigAids.forEach(multisigId => {
      const multisigData = config.identifiers[multisigId];
      console.log(`Creating node for multisig AID: ${multisigId}`);
      
      // Get delegator
      const delegator = multisigData.delegator || null;
      
      const node: ProcessedNode = {
        id: multisigId,
        type: 'multisig',
        position: { x: 0, y: 0 }, // Will be updated later
        data: {
          label: multisigData.name || multisigId,
          description: `Multisig AID: ${multisigId}`,
          type: 'Multisig',
          delegator: delegator,
          isMultisig: true,
          members: multisigData.identifiers,
          style: {
            background: '#faad14',
            color: 'white',
            border: '2px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '6px',
            padding: '12px 16px',
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            width: 180
          }
        }
      };
      
      // Check if this AID is a root of trust
      const isRootOfTrust = rootOfTrustAids.includes(multisigId);
      if (isRootOfTrust) {
        node.data.isRootOfTrust = true;
        node.data.style = {
          ...node.data.style,
          border: '2px solid #1890ff',
          borderRadius: '8px'
        };
      }
      
      nodes.push(node);
      console.log('Added multisig node:', node);
    });
  }
  
  // Then, create nodes for credential steps
  filteredSteps.forEach(([id, step]) => {
    console.log(`Processing step: ${id}, type: ${step.type}`);
    
    // Skip create_aid steps as we've already created those nodes
    if (step.type === 'create_aid') {
      console.log(`Skipping create_aid step: ${id}`);
      return;
    }
    
    // Determine node type and label
    let nodeType = 'default';
    let label = id;
    let style = {};
    let isRootOfTrust = false;
    
    // Get additional information from config if available
    let configInfo = {};
    if (config) {
      // For credential nodes, get information from credentials
      if (step.type === 'issue_credential' && step.credential && config.credentials) {
        const credInfo = config.credentials[step.credential];
        if (credInfo) {
          configInfo = {
            ...configInfo,
            credType: credInfo.type,
            credSchema: credInfo.schema,
            credPrivacy: credInfo.privacy,
            credRules: credInfo.rules
          };
        }
      }
    }
    
    // Create credential nodes
    if (step.type === 'issue_credential') {
      nodeType = 'credential';
      label = step.credential || id;
      style = {
        background: '#52c41a',
        border: '2px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '6px',
        padding: '12px 16px',
        fontSize: '13px',
        fontWeight: 500,
        color: 'white',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        width: 180
      };
      
      nodes.push({
        id,
        type: nodeType,
        data: { 
          label,
          stepType: step.type,
          style,
          isRootOfTrust,
          ...step,
          ...configInfo
        },
        position: { x: 0, y: 0 } // Temporary position, will be updated
      });
    } else if (step.type === 'revoke_credential') {
      nodeType = 'credential';
      label = `Revoked: ${step.credential || id}`;
      style = {
        background: '#ff4d4f',
        border: '2px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '6px',
        padding: '12px 16px',
        fontSize: '13px',
        fontWeight: 500,
        color: 'white',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        width: 180
      };
      
      nodes.push({
        id,
        type: nodeType,
        data: { 
          label,
          stepType: step.type,
          style,
          isRootOfTrust,
          ...step,
          ...configInfo
        },
        position: { x: 0, y: 0 } // Temporary position, will be updated
      });
    }
  });
  
  console.log('Total nodes created:', nodes.length);
  console.log('Nodes by type:', {
    aid: nodes.filter(n => n.type === 'aid').length,
    credential: nodes.filter(n => n.type === 'credential').length
  });
  
  // Group nodes by type and assign positions
  const positionedNodes = calculateNodePositions(nodes);
  console.log('Positioned nodes:', positionedNodes);
  
  // Create edges for relationships
  const edges: Edge[] = [];
  
  // First, create edges for multisig relationships
  if (config && config.identifiers) {
    console.log('Creating multisig relationship edges');
    
    // Find all multisig AIDs
    const multisigAids = Object.entries(config.identifiers)
      .filter(([_, aidData]) => aidData.identifiers && Array.isArray(aidData.identifiers))
      .map(([aidName, _]) => aidName);
    
    console.log('Found multisig AIDs:', multisigAids);
    
    // Process each multisig AID
    multisigAids.forEach(multisigAid => {
      const multisigData = config.identifiers[multisigAid];
      console.log(`Processing multisig: ${multisigAid} with members:`, multisigData.identifiers);
      
      // Find the multisig node
      const multisigNode = positionedNodes.find(n => n.id === multisigAid);
      
      if (multisigNode) {
        // Create edges from each member to the multisig
        multisigData.identifiers.forEach((memberId: string) => {
          // Find the member node
          const memberNode = positionedNodes.find(n => n.id === memberId);
          
          if (memberNode) {
            const edgeId = `edge-multisig-member-${memberNode.id}-${multisigNode.id}`;
            console.log(`Creating multisig member edge: ${edgeId}`);
            edges.push({
              id: edgeId,
              source: memberNode.id,
              target: multisigNode.id,
              type: 'smoothstep',
              style: { stroke: '#ff8800', strokeWidth: 2 },
              label: 'Member'
            });
          } else {
            console.log(`No member node found for multisig member: ${memberId}`);
          }
        });
      } else {
        console.log(`No multisig node found for: ${multisigAid}`);
      }
    });
  }
  
  // Create edges for delegation relationships
  if (config && config.identifiers) {
    console.log('Creating delegation relationship edges');
    
    Object.entries(config.identifiers).forEach(([aidName, aidData]) => {
      if (aidData.delegator) {
        console.log(`Found delegation: ${aidName} is delegated by ${aidData.delegator}`);
        
        // Find the delegator node
        const delegatorNode = positionedNodes.find(n => n.id === aidData.delegator);
        
        // Find the delegate node
        const delegateNode = positionedNodes.find(n => n.id === aidName);
        
        if (delegatorNode && delegateNode) {
          const edgeId = `edge-delegation-${delegatorNode.id}-${delegateNode.id}`;
          console.log(`Creating delegation edge: ${edgeId}`);
          edges.push({
            id: edgeId,
            source: delegatorNode.id,
            target: delegateNode.id,
            type: 'smoothstep',
            style: { stroke: '#ff00ff', strokeWidth: 2 },
            label: 'Delegation'
          });
        } else {
          console.log(`Could not find nodes for delegation: ${aidData.delegator} -> ${aidName}`);
          if (!delegatorNode) console.log(`No delegator node found for delegation: ${aidData.delegator} -> ${aidName}`);
          if (!delegateNode) console.log(`No delegate node found for delegation: ${aidName} -> ${aidData.delegator}`);
        }
      }
    });
  }
  
  // Create edges for credential relationships
  positionedNodes.forEach(node => {
    if (node.type === 'credential') {
      console.log(`Processing credential node: ${node.id}`);
      console.log(`Credential step data:`, node.data);
      
      // Find issuer AID node
      const issuerNode = positionedNodes.find(n => 
        (n.type === 'aid' || n.type === 'multisig') && n.id === node.data.issuer_aid
      );
      
      // Find issuee AID node
      const issueeNode = positionedNodes.find(n => 
        (n.type === 'aid' || n.type === 'multisig') && n.id === node.data.issuee_aid
      );
      
      console.log(`Issuer node:`, issuerNode);
      console.log(`Issuee node:`, issueeNode);
      
      // Add edge from issuer to credential
      if (issuerNode) {
        const edgeId = `edge-issuer-credential-${issuerNode.id}-${node.id}`;
        console.log(`Creating issuer edge: ${edgeId}`);
        edges.push({
          id: edgeId,
          source: issuerNode.id,
          target: node.id,
          type: 'default',
          style: { stroke: '#ff0000', strokeWidth: 2 },
          label: node.data.stepType === 'revoke_credential' ? 'Revokes' : 'Issues',
          labelStyle: { fill: '#ff0000', fontWeight: 500 },
          labelBgStyle: { fill: 'white', fillOpacity: 0.8 },
          labelBgPadding: [4, 4],
          labelBgBorderRadius: 4
        });
      } else {
        console.log(`No issuer node found for credential: ${node.id}`);
      }
      
      // Add edge from issuee to credential
      if (issueeNode) {
        const edgeId = `edge-issuee-credential-${issueeNode.id}-${node.id}`;
        console.log(`Creating issuee edge: ${edgeId}`);
        edges.push({
          id: edgeId,
          source: issueeNode.id,
          target: node.id,
          type: 'default',
          style: { stroke: '#00ff00', strokeWidth: 2 },
          label: node.data.stepType === 'revoke_credential' ? 'Revoked' : 'Receives',
          labelStyle: { fill: '#00ff00', fontWeight: 500 },
          labelBgStyle: { fill: 'white', fillOpacity: 0.8 },
          labelBgPadding: [4, 4],
          labelBgBorderRadius: 4
        });
      } else {
        console.log(`No issuee node found for credential: ${node.id}`);
      }
      
      // Add edge from source credential to this credential (only for issue_credential)
      if (node.data.stepType === 'issue_credential' && node.data.credential_source) {
        console.log(`Looking for source credential: ${node.data.credential_source}`);
        
        // First try to find by step ID
        let sourceCredentialNode = positionedNodes.find(n => 
          n.id === node.data.credential_source
        );
        
        // If not found by ID, try to find by credential name
        if (!sourceCredentialNode) {
          sourceCredentialNode = positionedNodes.find(n => 
            n.type === 'credential' && 
            n.data.credential === node.data.credential_source
          );
        }
        
        if (sourceCredentialNode) {
          const edgeId = `edge-source-credential-${sourceCredentialNode.id}-${node.id}`;
          console.log(`Creating source credential edge: ${edgeId}`);
          edges.push({
            id: edgeId,
            source: sourceCredentialNode.id,
            target: node.id,
            type: 'default',
            style: { stroke: '#0000ff', strokeWidth: 2 },
            label: 'Source',
            labelStyle: { fill: '#0000ff', fontWeight: 500 },
            labelBgStyle: { fill: 'white', fillOpacity: 0.8 },
            labelBgPadding: [4, 4],
            labelBgBorderRadius: 4
          });
        } else {
          console.log(`No source credential node found for credential: ${node.id} with source: ${node.data.credential_source}`);
        }
      }
      
      // Add edge from original credential to revoked credential
      if (node.data.stepType === 'revoke_credential' && node.data.credential) {
        console.log(`Looking for original credential to revoke: ${node.data.credential}`);
        
        // Find the original credential node by step ID
        const originalCredentialNode = positionedNodes.find(n => 
          n.id === node.data.credential
        );
        
        if (originalCredentialNode) {
          const edgeId = `edge-revoked-credential-${originalCredentialNode.id}-${node.id}`;
          console.log(`Creating revoked credential edge: ${edgeId}`);
          edges.push({
            id: edgeId,
            source: originalCredentialNode.id,
            target: node.id,
            type: 'default',
            style: { stroke: '#ff4d4f', strokeWidth: 2, strokeDasharray: '5,5' },
            label: 'Revoked',
            labelStyle: { fill: '#ff4d4f', fontWeight: 500 },
            labelBgStyle: { fill: 'white', fillOpacity: 0.8 },
            labelBgPadding: [4, 4],
            labelBgBorderRadius: 4
          });
        } else {
          console.log(`No original credential node found for revoked credential: ${node.id} with credential: ${node.data.credential}`);
          
          // Try to find by credential name if step ID doesn't match
          const originalCredentialNodeByName = positionedNodes.find(n => 
            n.type === 'credential' && 
            n.data.credential === node.data.credential
          );
          
          if (originalCredentialNodeByName) {
            const edgeId = `edge-revoked-credential-${originalCredentialNodeByName.id}-${node.id}`;
            console.log(`Creating revoked credential edge by name: ${edgeId}`);
            edges.push({
              id: edgeId,
              source: originalCredentialNodeByName.id,
              target: node.id,
              type: 'default',
              style: { stroke: '#ff4d4f', strokeWidth: 2, strokeDasharray: '5,5' },
              label: 'Revoked',
              labelStyle: { fill: '#ff4d4f', fontWeight: 500 },
              labelBgStyle: { fill: 'white', fillOpacity: 0.8 },
              labelBgPadding: [4, 4],
              labelBgBorderRadius: 4
            });
          } else {
            console.log(`No original credential node found by name for revoked credential: ${node.id}`);
          }
        }
      }
    }
  });
  
  return { nodes: positionedNodes, edges };
};
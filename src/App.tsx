import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Edge } from 'reactflow';
import { processWorkflowAndConfig } from './utils/workflowProcessor';
import { Workflow, Configuration, ProcessedNode } from './types/workflow';
import Legend from './components/Legend';
import { Graph } from './components/Graph';
import './components/Toolbar.css';
import './components/Graph.css';
import jsYaml from 'js-yaml';
import './App.css';

const App: React.FC = () => {
  const [nodes, setNodes] = useState<ProcessedNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [config, setConfig] = useState<Configuration | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [workflowFileName, setWorkflowFileName] = useState<string>('');
  const [configFileName, setConfigFileName] = useState<string>('');

  const workflowInputRef = useRef<HTMLInputElement>(null);
  const configInputRef = useRef<HTMLInputElement>(null);

  // Log when nodes or edges change
  useEffect(() => {
    console.log('App state updated:');
    console.log('Nodes:', nodes);
    console.log('Edges:', edges);
  }, [nodes, edges]);

  const parseFileContent = (text: string, fileName: string) => {
    // Check if the file is YAML based on extension
    const isYaml = fileName.endsWith('.yaml') || fileName.endsWith('.yml');
    
    if (isYaml) {
      return jsYaml.load(text);
    } else {
      return JSON.parse(text);
    }
  };

  const handleWorkflowUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsedWorkflow = parseFileContent(content, file.name) as Workflow;
        console.log('Parsed workflow:', parsedWorkflow);
        console.log('Workflow file name:', file.name);
        
        // Check if this is a revocation workflow
        const isRevocationWorkflow = file.name.includes('revocation');
        console.log('Is revocation workflow:', isRevocationWorkflow);
        
        setWorkflow(parsedWorkflow);
        setWorkflowFileName(file.name);
        setError(null);
        
        if (config) {
          console.log('Processing workflow with existing config');
          const { nodes: newNodes, edges: newEdges } = processWorkflowAndConfig(parsedWorkflow, config);
          console.log('Setting nodes and edges from workflow upload:', newNodes.length, newEdges.length);
          console.log('Nodes:', newNodes);
          console.log('Edges:', newEdges);
          setNodes(newNodes);
          setEdges(newEdges);
        }
      } catch (error) {
        console.error('Error parsing workflow:', error);
        setError('Error parsing workflow file');
      }
    };
    reader.readAsText(file);
  }, [config]);
  
  const handleConfigUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsedConfig = parseFileContent(content, file.name) as Configuration;
        console.log('Parsed config:', parsedConfig);
        console.log('Config file name:', file.name);
        
        // Check if this is a revocation config
        const isRevocationConfig = file.name.includes('revocation');
        console.log('Is revocation config:', isRevocationConfig);
        
        setConfig(parsedConfig);
        setConfigFileName(file.name);
        setError(null);
        
        if (workflow) {
          console.log('Processing config with existing workflow');
          const { nodes: newNodes, edges: newEdges } = processWorkflowAndConfig(workflow, parsedConfig);
          console.log('Setting nodes and edges from config upload:', newNodes.length, newEdges.length);
          console.log('Nodes:', newNodes);
          console.log('Edges:', newEdges);
          setNodes(newNodes);
          setEdges(newEdges);
        }
      } catch (error) {
        console.error('Error parsing config:', error);
        setError('Error parsing configuration file');
      }
    };
    reader.readAsText(file);
  }, [workflow]);
  
  const clearGraph = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setWorkflow(null);
    setConfig(null);
    setError(null);
    setWorkflowFileName('');
    setConfigFileName('');
    if (workflowInputRef.current) workflowInputRef.current.value = '';
    if (configInputRef.current) configInputRef.current.value = '';
  }, []);
  
  return (
    <div className="app-container">
      <div className="toolbar">
        <div className="upload-section">
          <input
            ref={workflowInputRef}
            type="file"
            accept=".yaml,.yml"
            onChange={handleWorkflowUpload}
            className="file-input"
            id="workflow-upload"
          />
          <label
            htmlFor="workflow-upload"
            className="toolbar-button primary"
          >
            Upload Workflow
          </label>
          
          <input
            ref={configInputRef}
            type="file"
            accept=".json"
            onChange={handleConfigUpload}
            className="file-input"
            id="config-upload"
          />
          <label
            htmlFor="config-upload"
            className="toolbar-button secondary"
          >
            Upload Config
          </label>
          
          <button
            className="toolbar-button danger"
            onClick={clearGraph}
            disabled={!workflow && !config}
          >
            Clear Graph
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        
        {workflow && config && (
          <div className="file-info">
            <div>Workflow: {workflowFileName}</div>
            <div>Configuration: {configFileName}</div>
          </div>
        )}
      </div>

      <div className="graph-container">
        {nodes.length > 0 ? (
          <Graph initialNodes={nodes} initialEdges={edges} />
        ) : (
          <div className="placeholder">
            Upload a workflow and configuration file to visualize the graph
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

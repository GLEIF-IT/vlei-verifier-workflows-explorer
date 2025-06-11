import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Edge } from 'reactflow';
import { processWorkflowAndConfig } from './utils/workflowProcessor';
import { Workflow, Configuration, ProcessedNode } from './types/workflow';
import Legend from './components/Legend';
import { Graph } from './components/Graph';
import WorkflowProgress from './components/WorkflowProgress';
import './components/Toolbar.css';
import './components/Graph.css';
import './components/WorkflowProgress.css';
import jsYaml from 'js-yaml';
import './App.css';
import { WorkflowState } from '@gleif-it/vlei-verifier-workflows';

// Polyfill for timers/promises
const timersPromises = {
  setTimeout: (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms))
};

// Add the polyfill to window
(window as any).timers = {
  promises: timersPromises
};

const App: React.FC = () => {
  const [nodes, setNodes] = useState<ProcessedNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [config, setConfig] = useState<Configuration | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [workflowFileName, setWorkflowFileName] = useState<string>('');
  const [configFileName, setConfigFileName] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [parsedWorkflow, setParsedWorkflow] = useState<any | null>(null);
  const [parsedConfig, setParsedConfig] = useState<any | null>(null);
  const workflowInputRef = useRef<HTMLInputElement>(null);
  const configInputRef = useRef<HTMLInputElement>(null);
  const [progressSteps, setProgressSteps] = useState<{step: any, workflowState: WorkflowState}[]>([]);
  const [showProgress, setShowProgress] = useState(false);

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
        setParsedWorkflow(parsedWorkflow); // Store in state for access from other functions
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
        setParsedConfig(parsedConfig); // Store in state for access from other functions
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

  const handleRunWorkflow = useCallback(async () => {
    if (!workflow || !config) {
      setError('Please upload both workflow and configuration files first');
      return;
    }

    setIsRunning(true);
    setError(null);
    setProgressSteps([]);
    setShowProgress(true);

    try {
      console.log('Starting workflow execution...');
      
      const response = await fetch('http://localhost:3001/run-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow: parsedWorkflow,
          config: parsedConfig,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the Uint8Array to a string
        const text = new TextDecoder().decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'error') {
              setError(data.error);
              setIsRunning(false);
              return;
            }

            if (data.type === 'complete') {
              console.log('Workflow completed:', data.result);
              setIsRunning(false);
              return;
            }

            // Handle step updates
            setProgressSteps(prev => [...prev, { 
              step: data.step, 
              workflowState: data.workflowState 
            }]);
          }
        }
      }

    } catch (error: any) {
      console.error('Error running workflow:', error);
      setError(error.message || 'Failed to run workflow');
      setIsRunning(false);
    }
  }, [workflow, config, parsedWorkflow, parsedConfig]);

  
  const clearGraph = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setWorkflow(null);
    setConfig(null);
    setError(null);
    setWorkflowFileName('');
    setConfigFileName('');
    setProgressSteps([]);
    setShowProgress(false);
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
            className="toolbar-button primary"
          >
            Upload Config
          </label>
          
          <button
            className="toolbar-button success"
            onClick={handleRunWorkflow}
            disabled={!workflow || !config || isRunning}
          >
            {isRunning ? 'Running...' : 'Run Workflow'}
          </button>
          
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

      <div className="content-container">
        <div className="graph-container">
          {nodes.length > 0 ? (
            <Graph initialNodes={nodes} initialEdges={edges} />
          ) : (
            <div className="placeholder">
              Upload a workflow and configuration file to visualize the graph
            </div>
          )}
          {showProgress && (
            <WorkflowProgress 
              steps={progressSteps} 
              isRunning={isRunning} 
              onClose={() => setShowProgress(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;

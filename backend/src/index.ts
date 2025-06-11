import express from 'express';
import cors from 'cors';
import { WorkflowRunner, WorkflowState } from '@gleif-it/vlei-verifier-workflows';
import { Request, Response } from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set global.__dirname for packages that might need it
(global as any).__dirname = __dirname;

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Store active workflow executions and their callbacks
const activeExecutions = new Map<string, { res: Response }>();

app.post('/run-workflow', async (req: Request, res: Response) => {
  try {
    const { workflow, config } = req.body;
    
    if (!workflow || !config) {
      return res.status(400).json({ error: 'Workflow and config are required' });
    }

    const executionId = Date.now().toString();
    
    // Create a response stream for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Function to send step updates to the client
    const sendStepUpdate = (step: unknown, workflowState: WorkflowState) => {
      res.write(`data: ${JSON.stringify({ step, workflowState })}\n\n`);
    };

    // Store the execution context
    activeExecutions.set(executionId, { res });

    try {
      const wr = new WorkflowRunner(workflow, config);
      const result = await wr.runWorkflow(sendStepUpdate);
      
      // Send final result
      res.write(`data: ${JSON.stringify({ type: 'complete', result })}\n\n`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.write(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`);
    } finally {
      // Clean up
      activeExecutions.delete(executionId);
      res.end();
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
}); 
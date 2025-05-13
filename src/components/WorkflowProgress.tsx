import React from 'react';
import { WorkflowState } from '@gleif-it/vlei-verifier-workflows';
import Step from './Step';

interface WorkflowStep {
  step: any;
  workflowState: WorkflowState;
}

interface WorkflowProgressProps {
  steps: WorkflowStep[];
  isRunning: boolean;
  onClose: () => void;
}

const WorkflowProgress: React.FC<WorkflowProgressProps> = ({ steps, isRunning, onClose }) => {
  return (
    <div className="workflow-progress">
      <div className="progress-header">
        <h3>Workflow Progress {isRunning && '(Running...)'}</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <div className="progress-steps">
        {steps.map((stepData, index) => (
          <Step
            key={index}
            step={stepData.step}
            workflowState={stepData.workflowState}
            isCompleted={index < steps.length - 1}
            stepNumber={index + 1}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkflowProgress; 
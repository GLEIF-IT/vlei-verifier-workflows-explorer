import React from 'react';
import { WorkflowState } from '@gleif-it/vlei-verifier-workflows';

interface StepProps {
  step: any;
  workflowState: WorkflowState;
  isCompleted: boolean;
  stepNumber: number;
}

const Step: React.FC<StepProps> = ({ step, workflowState, isCompleted, stepNumber }) => {
  return (
    <div className={`progress-step ${isCompleted ? 'completed' : ''}`}>
      <span className="step-number">{stepNumber}</span>
      <div className="step-content">
        <div className="step-description">{step.description || 'Step executed'}</div>
        {workflowState && (
          <div className="step-state">
            {/* <pre>{JSON.stringify(workflowState, null, 2)}</pre> */}
          </div>
        )}
      </div>
      {isCompleted && <span className="checkmark">✓</span>}
    </div>
  );
};

export default Step; 
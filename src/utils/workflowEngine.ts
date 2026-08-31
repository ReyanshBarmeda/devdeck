import {
  Workflow,
  WorkflowActionStep,
  WorkflowExecutionRun,
  StepExecutionResult,
} from '../types';
import { sound } from './audio';

export interface WorkflowEngineCallbacks {
  onStepStart?: (stepIndex: number, step: WorkflowActionStep, currentRun: WorkflowExecutionRun) => void;
  onStepLog?: (stepIndex: number, logLine: string, currentRun: WorkflowExecutionRun) => void;
  onStepComplete?: (stepIndex: number, result: StepExecutionResult, currentRun: WorkflowExecutionRun) => void;
  onWorkflowComplete?: (finalRun: WorkflowExecutionRun) => void;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const formatTime = () => {
  const d = new Date();
  return `[${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}]`;
};

export async function runWorkflowSequence(
  workflow: Workflow,
  triggeredBy: string = 'Command Palette (⌘K)',
  callbacks?: WorkflowEngineCallbacks
): Promise<WorkflowExecutionRun> {
  const runId = `wfrun-${Date.now().toString(36)}`;
  const startTime = Date.now();

  const run: WorkflowExecutionRun = {
    id: runId,
    workflowId: workflow.id,
    workflowName: workflow.name,
    triggeredBy,
    startedAt: new Date().toISOString(),
    status: 'running',
    durationSec: 0,
    currentStepIndex: 0,
    stepResults: workflow.actions.map((act) => ({
      stepId: act.id,
      stepName: act.name,
      type: act.type,
      status: 'running',
      durationSec: 0,
      logs: [],
    })),
  };

  sound.playOpen();

  let hasPreviousFailed = false;

  for (let i = 0; i < workflow.actions.length; i++) {
    run.currentStepIndex = i;
    const step = workflow.actions[i];
    const condition = step.config.condition || 'always';

    // Evaluate condition
    if (condition === 'if_passed' && hasPreviousFailed) {
      run.stepResults[i] = {
        stepId: step.id,
        stepName: step.name,
        type: step.type,
        status: 'skipped',
        durationSec: 0,
        logs: [`${formatTime()} Step skipped because previous step failed (condition: if_passed)`],
      };
      callbacks?.onStepComplete?.(i, run.stepResults[i], run);
      continue;
    }

    if (condition === 'if_failed' && !hasPreviousFailed) {
      run.stepResults[i] = {
        stepId: step.id,
        stepName: step.name,
        type: step.type,
        status: 'skipped',
        durationSec: 0,
        logs: [`${formatTime()} Step skipped because previous steps succeeded (condition: if_failed)`],
      };
      callbacks?.onStepComplete?.(i, run.stepResults[i], run);
      continue;
    }

    run.stepResults[i].status = 'running';
    callbacks?.onStepStart?.(i, step, run);
    sound.playClick(1000 + i * 100);

    const stepLogs: string[] = [];
    const stepStart = Date.now();

    const addLog = (msg: string) => {
      const line = `${formatTime()} ${msg}`;
      stepLogs.push(line);
      run.stepResults[i].logs = [...stepLogs];
      callbacks?.onStepLog?.(i, line, run);
    };

    // Simulate realistic execution steps based on step type
    switch (step.type) {
      case 'trigger_pipeline': {
        const target = step.config.targetProject || 'Workspace Repository';
        const branch = step.config.branch || 'main';
        const env = step.config.targetEnvironment || 'staging-gpu-cluster';
        addLog(`Initializing CI/CD Pipeline trigger for [${target}] on branch "${branch}"...`);
        await sleep(350);
        addLog(`Validating git HEAD commit sha & dependency lockfile...`);
        await sleep(400);
        addLog(`Building container image with GitHub Actions & Docker Buildx...`);
        await sleep(450);
        addLog(`Pushing artifact to registry: ghcr.io/devdeck/${target.toLowerCase().replace(/\s+/g, '-')}:latest`);
        await sleep(350);
        addLog(`✔ Pipeline stream started on [${env}]. Stage duration: 24s. All 4 stages queued.`);
        break;
      }

      case 'run_tests': {
        const runner = step.config.testRunner || 'vitest';
        const cmd = step.config.command || `npx ${runner} run`;
        addLog(`Invoking Test Runner: ${cmd}`);
        await sleep(300);
        addLog(`Compiling test suites & mock providers...`);
        await sleep(400);
        addLog(`PASS src/__tests__/unit/auth.test.ts (18 passed, 0 failed) [142ms]`);
        await sleep(300);
        addLog(`PASS src/__tests__/integration/pipeline.test.ts (9 passed, 0 failed) [310ms]`);
        await sleep(350);
        addLog(`PASS src/__tests__/e2e/workflow-engine.test.ts (14 passed, 0 failed) [520ms]`);
        await sleep(300);
        addLog(`✔ Test Suites: 12 passed, 12 total | Tests: 148 passed | Coverage: 94.8% -> ALL PASS`);
        break;
      }

      case 'deploy': {
        const env = step.config.targetEnvironment || 'production';
        addLog(`Evaluating gate condition [${condition}] -> Succeeded.`);
        await sleep(300);
        addLog(`Connecting to Kubernetes / Cloud Run cluster for [${env.toUpperCase()}]...`);
        await sleep(400);
        addLog(`Initiating blue/green zero-downtime rolling update across 4 worker replicas...`);
        await sleep(450);
        addLog(`Running synthetic ingress readiness probes on port 3000... (HTTP 200 OK)`);
        await sleep(350);
        addLog(`Shifting 100% live traffic to new revision. Old revision safely drained.`);
        addLog(`✔ Deployment to [${env}] completed successfully! URL: https://${env === 'production' ? 'app.devdeck.live' : 'staging.devdeck.live'}`);
        break;
      }

      case 'run_script': {
        const cmd = step.config.command || 'echo "Executing task..."';
        addLog(`$ ${cmd}`);
        await sleep(350);
        addLog(`Executing in sandboxed node runner environment (NODE_ENV=production)...`);
        await sleep(400);
        addLog(`Output: Process completed with exit code 0. Standard output stream flushed.`);
        break;
      }

      case 'http_request': {
        const method = step.config.httpMethod || 'POST';
        const url = step.config.httpUrl || 'https://api.devdeck.live/webhook';
        addLog(`Sending HTTP ${method} request to ${url}...`);
        await sleep(350);
        addLog(`Payload: {"event": "workflow.completed", "timestamp": "${new Date().toISOString()}"}`);
        await sleep(300);
        addLog(`HTTP/2 200 OK | Response: {"success": true, "message": "Webhook delivered"}`);
        break;
      }

      case 'ai_review': {
        addLog(`Invoking Gemini 3.7 Flash Model for automated AST code review...`);
        await sleep(450);
        addLog(`Parsing Git delta diff across 8 modified source files...`);
        await sleep(400);
        addLog(`AI Analysis: 0 high-severity security vulnerabilities detected.`);
        addLog(`AI Analysis: Memory allocation & state cleanup verified (O(1) complexity).`);
        addLog(`✔ Gemini Code Review: Grade A+ (Approved for production merge).`);
        break;
      }

      case 'provision_instance': {
        const tier = step.config.instanceTier || '8x NVIDIA H100 SXM5';
        addLog(`Requesting cloud compute allocation for [${tier}]...`);
        await sleep(500);
        addLog(`Attaching 640GB unified VRAM & 500GB NVMe storage volume...`);
        await sleep(400);
        addLog(`Configuring SSH keys & WireGuard Mesh VPN peer...`);
        await sleep(350);
        addLog(`✔ Instance online @ 100.64.0.99. CUDA 12.4 drivers active.`);
        break;
      }

      case 'notify_team': {
        addLog(`Broadcasting execution summary to team audit log & Slack channel...`);
        await sleep(300);
        addLog(`✔ Notification sent to 6 engineers on duty.`);
        break;
      }

      default: {
        addLog(`Running action step [${step.name}]...`);
        await sleep(400);
        addLog(`✔ Completed step successfully.`);
      }
    }

    const stepDuration = Math.max(1, Math.round((Date.now() - stepStart) / 1000));
    run.stepResults[i] = {
      stepId: step.id,
      stepName: step.name,
      type: step.type,
      status: 'passed',
      durationSec: stepDuration,
      logs: stepLogs,
      exitCode: 0,
    };

    callbacks?.onStepComplete?.(i, run.stepResults[i], run);
    sound.playClick(1300);
  }

  const totalDuration = Math.max(1, Math.round((Date.now() - startTime) / 1000));
  run.status = hasPreviousFailed ? 'failed' : 'passed';
  run.durationSec = totalDuration;
  run.finishedAt = new Date().toISOString();

  sound.playSuccess();
  callbacks?.onWorkflowComplete?.(run);

  return run;
}

import { IconPlayerPlay, IconTrash, IconZoomScan, IconRobot } from '@tabler/icons-react';
import { useReactFlow } from 'reactflow';
import { simulateRequest } from '../engine/SimulationEngine';
import { useArchitectureStore } from '../store/architectureStore';
import type { SimulationStatus } from '../types/components';

const SPEEDS = [0.5, 1, 2] as const;
const REQUEST_PRESETS = ['GET /users', 'POST /login', 'GET /feed', 'POST /orders'] as const;

export function Toolbar() {
  const {
    nodes,
    edges,
    httpRequest,
    simulationSpeed,
    isSimulating,
    setHttpRequest,
    setSpeed,
    resetSimulation,
    setSimulating,
    setActiveSimulationNode,
    setNodeSimulationStatus,
    addSimulationStep,
    setSimulationResult,
    clearCanvas,
    toggleReviewPanel,
  } = useArchitectureStore();
  const { fitView } = useReactFlow();

  async function runSimulation() {
    if (isSimulating) return;

    resetSimulation();
    setSimulating(true);
    const result = simulateRequest(nodes, edges, httpRequest.trim() || 'GET /');
    const delayMs = 650 / simulationSpeed;

    for (const step of result.steps) {
      setActiveSimulationNode(step.nodeId);
      setNodeSimulationStatus(step.nodeId, mapStepStatus(step.status));
      addSimulationStep(step);
      await new Promise((resolve) => window.setTimeout(resolve, delayMs));
    }

    setSimulationResult(result);
    setActiveSimulationNode(null);
    setSimulating(false);
  }

  return (
    <div className="flex min-h-[64px] flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="http-request">
          HTTP request
        </label>
        <input
          id="http-request"
          value={httpRequest}
          onChange={(event) => setHttpRequest(event.target.value)}
          className="h-10 w-[180px] rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          placeholder="GET /users"
          disabled={isSimulating}
        />
        <div className="hidden items-center rounded-lg border border-slate-200 bg-slate-50 p-1 xl:flex">
          {REQUEST_PRESETS.map((request) => (
            <button
              key={request}
              type="button"
              onClick={() => setHttpRequest(request)}
              disabled={isSimulating}
              className={[
                'h-8 rounded-md px-2.5 font-mono text-xs font-semibold transition disabled:cursor-not-allowed',
                httpRequest === request ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800',
              ].join(' ')}
            >
              {request}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={runSimulation}
          disabled={isSimulating || nodes.length === 0}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <IconPlayerPlay className="h-4 w-4" />
          Simulate Request
        </button>
        <button
          type="button"
          onClick={() => fitView({ padding: 0.2 })}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          title="Fit view"
          aria-label="Fit view"
        >
          <IconZoomScan className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={clearCanvas}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          title="Clear canvas"
          aria-label="Clear canvas"
        >
          <IconTrash className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={toggleReviewPanel}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 shadow-sm"
        >
          <IconRobot className="h-5 w-5" />
          Review
        </button>
      </div>

      <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
        {SPEEDS.map((speed) => (
          <button
            key={speed}
            type="button"
            onClick={() => setSpeed(speed)}
            className={[
              'h-8 min-w-10 rounded-md px-3 text-sm font-semibold transition',
              simulationSpeed === speed ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800',
            ].join(' ')}
            aria-pressed={simulationSpeed === speed}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  );
}

function mapStepStatus(status: 'hit' | 'miss' | 'pass' | 'error' | 'async'): SimulationStatus {
  if (status === 'pass' || status === 'async') return 'active';
  return status;
}

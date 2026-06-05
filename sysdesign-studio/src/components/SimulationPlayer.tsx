import { useEffect, useRef } from 'react';
import { IconActivity, IconBolt, IconClock, IconRoute, IconServerCog } from '@tabler/icons-react';
import { useArchitectureStore } from '../store/architectureStore';

export function SimulationPlayer() {
  const { simulationSteps, simulationResult, isSimulating } = useArchitectureStore();
  const logRef = useRef<HTMLDivElement | null>(null);
  const totalLatency = simulationSteps.reduce(
    (sum, step) => sum + (step.status === 'async' ? 0 : step.durationMs),
    0,
  );

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [simulationSteps.length]);

  return (
    <aside className="flex h-full w-full max-w-[360px] shrink-0 flex-col border-l border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">Simulation</h2>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500">
            <IconClock className="h-4 w-4" />
            {totalLatency}ms
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Metric icon={<IconRoute className="h-4 w-4" />} label="Steps" value={simulationSteps.length} />
          <Metric icon={<IconBolt className="h-4 w-4" />} label="Async" value={simulationResult?.asyncEvents ?? 0} />
          <Metric icon={<IconServerCog className="h-4 w-4" />} label="Cache" value={`${simulationResult?.cacheHits ?? 0}/${simulationResult?.cacheMisses ?? 0}`} />
        </div>
      </div>

      <div ref={logRef} className="studio-scrollbar flex-1 overflow-y-auto bg-slate-950 p-4 font-mono text-sm text-slate-200">
        {simulationSteps.length === 0 ? (
          <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center text-slate-500">
            <IconActivity className="mb-3 h-8 w-8" />
            <p>Run a request to see each component step here.</p>
          </div>
        ) : (
          <ol className="space-y-3">
            {simulationSteps.map((step, index) => (
              <li key={`${step.nodeId}-${index}`} className="rounded-md border border-slate-800 bg-slate-900 p-3">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="text-xs uppercase tracking-wide text-slate-400">Step {index + 1}</span>
                  <span className={statusClassName(step.status)}>{step.status}</span>
                </div>
                <p className="mb-1 text-xs font-semibold text-slate-400">{step.nodeLabel}</p>
                <p className="break-words text-slate-100">{step.message}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {step.nodeId} - {step.durationMs}ms
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>

      {isSimulating ? (
        <div className="border-t border-slate-200 px-5 py-3 text-sm font-medium text-slate-600">
          Streaming local simulation...
        </div>
      ) : simulationResult ? (
        <div className="border-t border-slate-200 px-5 py-3 text-sm text-slate-600">
          <p className="font-medium text-slate-800">{simulationResult.summary}</p>
          <p className="mt-1 text-xs text-slate-500">
            Critical path: {simulationResult.criticalPath.length} blocking component
            {simulationResult.criticalPath.length === 1 ? '' : 's'}
          </p>
        </div>
      ) : null}
    </aside>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2">
      <div className="mx-auto flex items-center justify-center gap-1 text-slate-500">
        {icon}
        <span className="text-[11px] font-semibold uppercase">{label}</span>
      </div>
      <div className="mt-1 text-sm font-bold text-slate-900">{value}</div>
    </div>
  );
}

function statusClassName(status: string) {
  const base = 'rounded px-2 py-0.5 text-xs font-bold uppercase';
  const styles: Record<string, string> = {
    hit: 'bg-green-500/15 text-green-300',
    miss: 'bg-red-500/15 text-red-300',
    pass: 'bg-blue-500/15 text-blue-300',
    async: 'bg-amber-500/15 text-amber-300',
    error: 'bg-red-500/20 text-red-200',
  };

  return `${base} ${styles[status] ?? styles.pass}`;
}

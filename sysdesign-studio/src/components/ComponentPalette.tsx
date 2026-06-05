import {
  IconBolt,
  IconCloud,
  IconDatabase,
  IconGauge,
  IconLock,
  IconServer,
  IconStack2,
  IconTopologyStar,
  IconWorld,
  IconArrowsSplit,
  IconArrowLeft,
} from '@tabler/icons-react';
import { COMPONENT_DEFINITIONS, type ComponentDefinition } from '../types/components';
import { useArchitectureStore } from '../store/architectureStore';

const iconMap: Record<ComponentDefinition['icon'], typeof IconWorld> = {
  'ti-world': IconWorld,
  'ti-arrows-split': IconArrowsSplit,
  'ti-server': IconServer,
  'ti-database': IconDatabase,
  'ti-bolt': IconBolt,
  'ti-stack': IconStack2,
  'ti-topology-star': IconTopologyStar,
  'ti-cloud': IconCloud,
  'ti-lock': IconLock,
  'ti-gauge': IconGauge,
};

export function ComponentPalette() {
  const { selectedNodeId, nodes, updateNodeData, setSelectedNode } = useArchitectureStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <aside className="flex h-full w-full max-w-[280px] shrink-0 flex-col border-r border-slate-200 bg-white">
      {selectedNode ? (
        <>
          <div className="border-b border-slate-200 px-5 py-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              title="Back to components"
              aria-label="Back to components"
            >
              <IconArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900">Properties</h1>
              <p className="text-xs text-slate-500">Configure selected component</p>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <div className="space-y-1.5">
              <label htmlFor="node-label" className="text-xs font-semibold text-slate-600">
                Node Label
              </label>
              <input
                id="node-label"
                type="text"
                value={selectedNode.data.label}
                onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="node-latency" className="text-xs font-semibold text-slate-600">
                Latency (ms)
              </label>
              <input
                id="node-latency"
                type="number"
                min="0"
                max="10000"
                value={selectedNode.data.latencyMs}
                onChange={(e) => updateNodeData(selectedNode.id, { latencyMs: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="node-replicas" className="text-xs font-semibold text-slate-600">
                Replicas
              </label>
              <input
                id="node-replicas"
                type="number"
                min="1"
                max="10"
                value={selectedNode.data.replicas ?? 1}
                onChange={(e) => updateNodeData(selectedNode.id, { replicas: parseInt(e.target.value) || 1 })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="border-b border-slate-200 px-5 py-4">
            <h1 className="text-lg font-bold text-slate-900">SysDesign Studio</h1>
            <p className="mt-1 text-sm text-slate-500">Drag components onto the canvas.</p>
          </div>

          <div className="studio-scrollbar flex-1 space-y-2 overflow-y-auto p-3">
            {COMPONENT_DEFINITIONS.map((component) => {
              const Icon = iconMap[component.icon] ?? IconServer;

              return (
                <button
                  key={component.type}
                  type="button"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('componentType', component.type);
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                  className="group flex w-full items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  aria-label={`Add ${component.label}`}
                  title={component.description}
                >
                  <span className={`mt-0.5 rounded-md bg-${component.color}-50 p-2 text-${component.color}-500`}>
                    <Icon className="h-5 w-5" stroke={1.8} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-800">{component.label}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                      {component.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </aside>
  );
}

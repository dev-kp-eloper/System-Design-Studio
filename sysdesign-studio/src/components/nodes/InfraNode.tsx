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
} from '@tabler/icons-react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { ComponentDefinition, InfraNodeData } from '../../types/components';

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

const statusColors = {
  active: 'ring-2 ring-blue-400 shadow-blue-100',
  hit: 'ring-2 ring-green-400 shadow-green-100',
  miss: 'ring-2 ring-red-400 shadow-red-100',
  error: 'ring-2 ring-red-600 shadow-red-100',
  null: '',
};

const typeLabels: Record<string, string> = {
  'api-gateway': 'API Gateway',
  'load-balancer': 'Load Balancer',
  'service': 'Service',
  'database': 'Database',
  'cache': 'Cache',
  'queue': 'Queue',
  'kafka': 'Kafka',
  'cdn': 'CDN',
  'auth-service': 'Auth Service',
  'rate-limiter': 'Rate Limiter',
};

export function InfraNode({ data, selected }: NodeProps<InfraNodeData>) {
  const Icon = iconMap[data.icon] ?? IconServer;

  return (
    <div
      className={[
        'min-w-[160px] rounded-lg border-2 bg-white px-4 py-3 shadow-md transition-all duration-200',
        `border-${data.color}-300`,
        selected ? 'ring-2 ring-slate-900' : '',
        statusColors[data.simulationStatus ?? 'null'],
      ].join(' ')}
    >
      <Handle type="target" position={Position.Top} className="!h-3 !w-3 !bg-slate-400" />

      <div className="mb-1 flex items-start gap-2">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 text-${data.color}-500`} stroke={1.8} />
        <div className="flex flex-col min-w-0">
          <span className="truncate text-sm font-semibold text-slate-800" title={data.label}>
            {data.label}
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            {typeLabels[data.type] ?? data.type}
          </span>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
        <span>{data.latencyMs}ms</span>
        {data.replicas && data.replicas > 1 ? <span>x{data.replicas}</span> : null}
      </div>

      <Handle type="source" position={Position.Bottom} className="!h-3 !w-3 !bg-slate-400" />
    </div>
  );
}

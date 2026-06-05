export type ComponentType =
  | 'api-gateway'
  | 'load-balancer'
  | 'service'
  | 'database'
  | 'cache'
  | 'queue'
  | 'kafka'
  | 'cdn'
  | 'auth-service'
  | 'rate-limiter';

export type SimulationStatus = 'active' | 'hit' | 'miss' | 'error' | null;

export interface ComponentDefinition {
  type: ComponentType;
  label: string;
  icon: string;
  color: string;
  defaultLatencyMs: number;
  description: string;
}

export interface InfraNodeData extends ComponentDefinition {
  latencyMs: number;
  replicas?: number;
  simulationStatus?: SimulationStatus;
}

export const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  { type: 'api-gateway', label: 'API Gateway', icon: 'ti-world', color: 'purple', defaultLatencyMs: 10, description: 'Entry point for all client requests' },
  { type: 'load-balancer', label: 'Load Balancer', icon: 'ti-arrows-split', color: 'blue', defaultLatencyMs: 5, description: 'Distributes traffic across replicas' },
  { type: 'service', label: 'Service', icon: 'ti-server', color: 'teal', defaultLatencyMs: 20, description: 'Microservice / application logic' },
  { type: 'database', label: 'Database', icon: 'ti-database', color: 'amber', defaultLatencyMs: 50, description: 'Persistent data store' },
  { type: 'cache', label: 'Redis Cache', icon: 'ti-bolt', color: 'red', defaultLatencyMs: 2, description: 'In-memory key-value cache' },
  { type: 'queue', label: 'Message Queue', icon: 'ti-stack', color: 'orange', defaultLatencyMs: 5, description: 'Async message queue (RabbitMQ)' },
  { type: 'kafka', label: 'Kafka', icon: 'ti-topology-star', color: 'green', defaultLatencyMs: 8, description: 'Distributed event streaming' },
  { type: 'cdn', label: 'CDN', icon: 'ti-cloud', color: 'sky', defaultLatencyMs: 3, description: 'Content delivery network' },
  { type: 'auth-service', label: 'Auth Service', icon: 'ti-lock', color: 'pink', defaultLatencyMs: 15, description: 'Authentication and authorization' },
  { type: 'rate-limiter', label: 'Rate Limiter', icon: 'ti-gauge', color: 'slate', defaultLatencyMs: 1, description: 'Throttles requests per client' },
];

import type { Edge, Node } from 'reactflow';
import type { InfraNodeData } from '../types/components';

export type SimulationStepStatus = 'pass' | 'hit' | 'miss' | 'error' | 'async';

export interface SimulationStep {
  nodeId: string;
  nodeLabel: string;
  status: SimulationStepStatus;
  durationMs: number;
  message: string;
}

export interface SimulationResult {
  steps: SimulationStep[];
  totalLatencyMs: number;
  cacheHits: number;
  cacheMisses: number;
  asyncEvents: number;
  criticalPath: string[];
  summary: string;
}

export function getSourceNode(nodes: Node<InfraNodeData>[], edges: Edge[]) {
  const targets = new Set(edges.map((edge) => edge.target));
  return nodes.find((node) => !targets.has(node.id)) ?? nodes[0] ?? null;
}

export class SimulationEngine {
  private readonly nodesById: Map<string, Node<InfraNodeData>>;
  private readonly adjacencyList: Map<string, string[]>;

  constructor(
    private readonly nodes: Node<InfraNodeData>[],
    private readonly edges: Edge[],
  ) {
    this.nodesById = new Map(nodes.map((node) => [node.id, node]));
    this.adjacencyList = new Map(nodes.map((node) => [node.id, []]));

    edges.forEach((edge) => {
      const neighbors = this.adjacencyList.get(edge.source) ?? [];
      neighbors.push(edge.target);
      this.adjacencyList.set(edge.source, neighbors);
    });
  }

  simulate(httpRequest: string): SimulationResult {
    const source = getSourceNode(this.nodes, this.edges);
    if (!source) {
      return {
        steps: [],
        totalLatencyMs: 0,
        cacheHits: 0,
        cacheMisses: 0,
        asyncEvents: 0,
        criticalPath: [],
        summary: 'Add at least one component before simulating a request.',
      };
    }

    const queue = [source.id];
    const visited = new Set<string>();
    const steps: SimulationStep[] = [];
    const criticalPath: string[] = [];
    let totalLatencyMs = 0;
    let cacheHits = 0;
    let cacheMisses = 0;
    let asyncEvents = 0;

    while (queue.length > 0) {
      const nodeId = queue.shift();
      if (!nodeId || visited.has(nodeId)) continue;

      const node = this.nodesById.get(nodeId);
      if (!node) continue;

      visited.add(nodeId);
      const step = this.simulateNode(node, httpRequest);
      steps.push(step);

      if (step.status === 'hit') {
        cacheHits += 1;
      }
      if (step.status === 'miss') {
        cacheMisses += 1;
      }
      if (step.status === 'async') {
        asyncEvents += 1;
      } else {
        totalLatencyMs += step.durationMs;
        criticalPath.push(step.nodeId);
      }

      if (step.status === 'hit') {
        continue;
      }

      const neighbors = this.adjacencyList.get(nodeId) ?? [];
      queue.push(...neighbors.filter((neighborId) => !visited.has(neighborId)));
    }

    return {
      steps,
      totalLatencyMs,
      cacheHits,
      cacheMisses,
      asyncEvents,
      criticalPath,
      summary: this.buildSummary(httpRequest, steps, totalLatencyMs, cacheHits, cacheMisses, asyncEvents),
    };
  }

  private simulateNode(node: Node<InfraNodeData>, httpRequest: string): SimulationStep {
    const latency = node.data.latencyMs;

    switch (node.data.type) {
      case 'api-gateway':
        return this.step(node, 'pass', latency, `Accepted ${httpRequest} and forwarded to the architecture.`);
      case 'load-balancer': {
        const replicaCount = Math.max(node.data.replicas ?? 3, 1);
        const replica = Math.floor(Math.random() * replicaCount) + 1;
        return this.step(node, 'pass', latency, `Distributed to replica ${replica} with round-robin routing.`);
      }
      case 'service':
        return this.step(node, 'pass', latency, `${node.data.label} invoked handler and business logic.`);
      case 'database':
        return this.step(node, 'pass', latency, 'Query executed and 1 row returned.');
      case 'cache': {
        const isHit = Math.random() < 0.35;
        return this.step(
          node,
          isHit ? 'hit' : 'miss',
          latency,
          isHit
            ? 'CACHE HIT - returning cached result and stopping this path.'
            : 'CACHE MISS - key not found, continuing to origin.',
        );
      }
      case 'queue':
        return this.step(node, 'async', latency, 'Message enqueued asynchronously; response path continues.');
      case 'kafka':
        return this.step(node, 'async', latency, 'Event published to Kafka asynchronously; response path continues.');
      case 'cdn':
        return this.step(node, 'pass', latency, 'Edge cache checked before forwarding dynamic traffic.');
      case 'auth-service':
        return this.step(node, 'pass', latency, 'JWT validated and user authorization confirmed.');
      case 'rate-limiter':
        return this.step(node, 'pass', latency, 'Rate limit check passed: 42/100 req/min used.');
      default:
        return this.step(node, 'pass', latency, 'Request processed.');
    }
  }

  private step(
    node: Node<InfraNodeData>,
    status: SimulationStepStatus,
    durationMs: number,
    message: string,
  ): SimulationStep {
    return {
      nodeId: node.id,
      nodeLabel: node.data.label,
      status,
      durationMs,
      message,
    };
  }

  private buildSummary(
    httpRequest: string,
    steps: SimulationStep[],
    totalLatencyMs: number,
    cacheHits: number,
    cacheMisses: number,
    asyncEvents: number,
  ) {
    if (steps.length === 0) {
      return 'No simulation steps were produced.';
    }

    const cacheSummary =
      cacheHits + cacheMisses > 0 ? `${cacheHits} cache hit(s), ${cacheMisses} cache miss(es)` : 'no cache nodes';
    const asyncSummary = asyncEvents > 0 ? `${asyncEvents} async event(s)` : 'no async hops';

    return `${httpRequest} traversed ${steps.length} component${steps.length === 1 ? '' : 's'} in ${totalLatencyMs}ms with ${cacheSummary} and ${asyncSummary}.`;
  }
}

export function simulateRequest(
  nodes: Node<InfraNodeData>[],
  edges: Edge[],
  httpRequest: string,
): SimulationResult {
  return new SimulationEngine(nodes, edges).simulate(httpRequest);
}

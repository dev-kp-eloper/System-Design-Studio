# SysDesign Studio — Complete Build Guide

> **"Figma for Backend Architecture + Live Simulator"**
> A full-stack distributed-system architecture designer and request flow simulator.
> Users drag infrastructure components onto a canvas, connect them, then simulate how a real HTTP request travels through the system with animated step-by-step playback.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Phase 1 — Frontend Scaffold + Canvas](#4-phase-1--frontend-scaffold--canvas)
5. [Phase 2 — Request Simulator (Frontend)](#5-phase-2--request-simulator-frontend)
6. [Phase 3 — Spring Boot Backend](#6-phase-3--spring-boot-backend)
7. [Phase 4 — Redis + Kafka + WebSocket](#7-phase-4--redis--kafka--websocket)
8. [Phase 5 — AI Architecture Reviewer](#8-phase-5--ai-architecture-reviewer)
9. [Phase 6 — Docker + Deployment](#9-phase-6--docker--deployment)
10. [CI/CD with GitHub Actions](#10-cicd-with-github-actions)
11. [Weekly Timeline](#11-weekly-timeline)
12. [Resume Entry Guide](#12-resume-entry-guide)

---

## 1. Project Overview

### What You Are Building

SysDesign Studio is an interactive web application that lets engineers visually design distributed system architectures and simulate request flows through them.

**Core Features:**

| Feature | Description |
|---------|-------------|
| Drag-and-drop canvas | Place infrastructure components (API Gateway, Redis, Kafka, etc.) visually |
| Visual connections | Draw sync and async edges between components |
| Request simulation | Animate how `POST /login` or `GET /users` flows through your architecture |
| Real-time playback | WebSocket-driven step-by-step animation |
| Metrics analysis | Latency estimates, bottleneck detection, SPOF identification |
| AI architecture review | LLM-powered analysis of design quality |

### Infrastructure Components Supported

- API Gateway
- Load Balancer
- Generic Service (microservice)
- Database (PostgreSQL / MySQL)
- Cache (Redis)
- Message Queue (RabbitMQ)
- Kafka
- CDN
- Auth Service
- Rate Limiter

### Example Simulation Flow

**User designs:**
```
Client → API Gateway → Load Balancer → User Service → Redis Cache → PostgreSQL
```

**User clicks `POST /login`. Simulator outputs:**
```
Client          → request initiated
API Gateway     → authenticated, forwarded         (10ms)
Load Balancer   → distributed to replica 2          (5ms)
User Service    → handler invoked                   (8ms)
Redis Cache     → MISS — key not found              (2ms)
PostgreSQL      → query executed, 1 row returned    (45ms)
Redis Cache     → SET — result cached (TTL 300s)    (1ms)
User Service    → response assembled                (3ms)
Client          ← 200 OK                            total: 74ms
```

---

## 2. Technology Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool |
| ReactFlow | 11.x | Canvas + node/edge management |
| Zustand | 4.x | Global state management |
| Tailwind CSS | 3.x | Styling |
| shadcn/ui | latest | Component library |
| `@stomp/stompjs` | 7.x | WebSocket client (STOMP) |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Java | 21 (LTS) | Language |
| Spring Boot | 3.2.x | Application framework |
| Spring Security | 6.x | Authentication / authorization |
| Spring Data JPA | 3.x | ORM layer |
| Spring WebSocket | 3.x | Real-time STOMP messaging |
| JJWT | 0.12.x | JWT creation and validation |
| PostgreSQL | 16.x | Primary database |
| Redis | 7.x | Simulation result cache |
| Apache Kafka | 3.6.x | Event streaming |
| Maven | 3.9.x | Build tool |

### DevOps

| Technology | Purpose |
|-----------|---------|
| Docker + Docker Compose | Local development environment |
| GitHub Actions | CI/CD pipelines |
| Vercel | Frontend deployment |
| Railway | Backend + PostgreSQL + Redis deployment |
| Upstash Kafka | Managed Kafka (free tier, serverless) |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  ReactFlow   │  │   Zustand    │  │  Simulation  │          │
│  │    Canvas    │  │    Store     │  │     UI       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│              REST API + WebSocket (STOMP)                       │
└─────────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND (Railway)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Architecture │  │  Simulation  │  │   Metrics    │          │
│  │   Service    │  │   Engine     │  │   Service    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │     Auth     │  │ AI Reviewer  │                            │
│  │  (JWT/Sec)   │  │ (LLM calls)  │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │    Redis     │  │    Kafka     │          │
│  │  (diagrams)  │  │   (cache)    │  │   (events)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### API Endpoint Overview

```
POST   /api/auth/register
POST   /api/auth/login                    → { token, user }

GET    /api/architectures                 → paginated list
POST   /api/architectures                 → save diagram
GET    /api/architectures/{id}
PUT    /api/architectures/{id}
DELETE /api/architectures/{id}

POST   /api/simulate                      → { steps[], totalLatencyMs, summary }
GET    /api/metrics/{architectureId}      → { latency, throughput, bottlenecks[], spofs[] }
POST   /api/review/{architectureId}       → { issues[], recommendations[], score }

WebSocket: /ws/simulation
  STOMP topic: /topic/simulation/{sessionId}
```

---

## 4. Phase 1 — Frontend Scaffold + Canvas

**Duration:** Week 1–2  
**Goal:** Working drag-drop canvas with save-to-localStorage. No backend yet.

### 4.1 Project Setup

```bash
npm create vite@latest sysdesign-studio -- --template react-ts
cd sysdesign-studio
npm install reactflow zustand @radix-ui/react-dialog tailwindcss
npx tailwindcss init -p
npx shadcn-ui@latest init
```

### 4.2 Component Data Model

Define this in `src/types/components.ts`:

```typescript
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

export interface ComponentDefinition {
  type: ComponentType;
  label: string;
  icon: string;           // Tabler icon name
  color: string;          // Tailwind color class
  defaultLatencyMs: number;
  description: string;
}

export const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  { type: 'api-gateway',   label: 'API Gateway',   icon: 'ti-world',        color: 'purple', defaultLatencyMs: 10,  description: 'Entry point for all client requests' },
  { type: 'load-balancer', label: 'Load Balancer', icon: 'ti-arrows-split', color: 'blue',   defaultLatencyMs: 5,   description: 'Distributes traffic across replicas' },
  { type: 'service',       label: 'Service',       icon: 'ti-server',       color: 'teal',   defaultLatencyMs: 20,  description: 'Microservice / application logic' },
  { type: 'database',      label: 'Database',      icon: 'ti-database',     color: 'amber',  defaultLatencyMs: 50,  description: 'Persistent data store' },
  { type: 'cache',         label: 'Redis Cache',   icon: 'ti-bolt',         color: 'red',    defaultLatencyMs: 2,   description: 'In-memory key-value cache' },
  { type: 'queue',         label: 'Message Queue', icon: 'ti-stack',        color: 'orange', defaultLatencyMs: 5,   description: 'Async message queue (RabbitMQ)' },
  { type: 'kafka',         label: 'Kafka',         icon: 'ti-topology-star',color: 'green',  defaultLatencyMs: 8,   description: 'Distributed event streaming' },
  { type: 'cdn',           label: 'CDN',           icon: 'ti-cloud',        color: 'sky',    defaultLatencyMs: 3,   description: 'Content delivery network' },
  { type: 'auth-service',  label: 'Auth Service',  icon: 'ti-lock',         color: 'pink',   defaultLatencyMs: 15,  description: 'Authentication and authorization' },
  { type: 'rate-limiter',  label: 'Rate Limiter',  icon: 'ti-gauge',        color: 'slate',  defaultLatencyMs: 1,   description: 'Throttles requests per client' },
];
```

### 4.3 Zustand Store

Create `src/store/architectureStore.ts`:

```typescript
import { create } from 'zustand';
import { Node, Edge } from 'reactflow';

interface SimulationStep {
  nodeId: string;
  status: 'hit' | 'miss' | 'pass' | 'error' | 'async';
  durationMs: number;
  message: string;
}

interface ArchitectureStore {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  simulationSteps: SimulationStep[];
  isSimulating: boolean;
  simulationSpeed: 0.5 | 1 | 2;

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNode: (id: string | null) => void;
  addSimulationStep: (step: SimulationStep) => void;
  resetSimulation: () => void;
  setSimulating: (v: boolean) => void;
  setSpeed: (s: 0.5 | 1 | 2) => void;
}

export const useArchitectureStore = create<ArchitectureStore>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  simulationSteps: [],
  isSimulating: false,
  simulationSpeed: 1,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNode: (selectedNodeId) => set({ selectedNodeId }),
  addSimulationStep: (step) =>
    set((state) => ({ simulationSteps: [...state.simulationSteps, step] })),
  resetSimulation: () => set({ simulationSteps: [], isSimulating: false }),
  setSimulating: (isSimulating) => set({ isSimulating }),
  setSpeed: (simulationSpeed) => set({ simulationSpeed }),
}));
```

### 4.4 Custom Node Component

Create `src/components/nodes/InfraNode.tsx`:

```tsx
import { Handle, Position, NodeProps } from 'reactflow';

interface NodeData {
  label: string;
  type: string;
  latencyMs: number;
  color: string;
  icon: string;
  replicas?: number;
  simulationStatus?: 'active' | 'hit' | 'miss' | 'error' | null;
}

export function InfraNode({ data, selected }: NodeProps<NodeData>) {
  const statusColors = {
    active: 'ring-2 ring-blue-400 animate-pulse',
    hit:    'ring-2 ring-green-400',
    miss:   'ring-2 ring-red-400',
    error:  'ring-2 ring-red-600',
    null:   '',
  };

  return (
    <div className={`
      bg-white dark:bg-gray-800 border-2 rounded-xl px-4 py-3 min-w-[140px]
      border-${data.color}-300 shadow-md
      ${selected ? 'ring-2 ring-blue-500' : ''}
      ${statusColors[data.simulationStatus ?? 'null']}
      transition-all duration-200
    `}>
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      <div className="flex items-center gap-2 mb-1">
        <i className={`ti ${data.icon} text-${data.color}-500 text-lg`} />
        <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">
          {data.label}
        </span>
      </div>

      <div className="text-xs text-gray-400 flex gap-2">
        <span>{data.latencyMs}ms</span>
        {data.replicas && data.replicas > 1 && (
          <span>×{data.replicas}</span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
}
```

### 4.5 Architecture Canvas

Create `src/components/ArchitectureCanvas.tsx`:

```tsx
import ReactFlow, {
  Background, Controls, MiniMap,
  useNodesState, useEdgesState,
  addEdge, Connection
} from 'reactflow';
import 'reactflow/dist/style.css';
import { InfraNode } from './nodes/InfraNode';
import { useArchitectureStore } from '../store/architectureStore';

const nodeTypes = { infraNode: InfraNode };

export function ArchitectureCanvas() {
  const { nodes, edges, setNodes, setEdges } = useArchitectureStore();
  const [localNodes, , onNodesChange] = useNodesState(nodes);
  const [localEdges, , onEdgesChange] = useEdgesState(edges);

  const onConnect = (connection: Connection) => {
    // Validate: no self-loops
    if (connection.source === connection.target) return;
    setEdges(addEdge({ ...connection, animated: false, type: 'smoothstep' }, localEdges));
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('componentType');
    const def = COMPONENT_DEFINITIONS.find(d => d.type === type);
    if (!def) return;

    const newNode = {
      id: `${type}-${Date.now()}`,
      type: 'infraNode',
      position: { x: event.clientX - 100, y: event.clientY - 100 },
      data: { ...def, latencyMs: def.defaultLatencyMs },
    };
    setNodes([...localNodes, newNode]);
  };

  return (
    <ReactFlow
      nodes={localNodes}
      edges={localEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      nodeTypes={nodeTypes}
      fitView
    >
      <Background gap={20} size={1} />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}
```

### 4.6 Component Palette (Sidebar)

Create `src/components/ComponentPalette.tsx`:

```tsx
import { COMPONENT_DEFINITIONS } from '../types/components';

export function ComponentPalette() {
  const onDragStart = (event: React.DragEvent, type: string) => {
    event.dataTransfer.setData('componentType', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-gray-50 dark:bg-gray-900 border-r p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">
        Components
      </h2>
      <div className="flex flex-col gap-2">
        {COMPONENT_DEFINITIONS.map((def) => (
          <div
            key={def.type}
            draggable
            onDragStart={(e) => onDragStart(e, def.type)}
            className={`
              flex items-center gap-3 p-3 rounded-lg cursor-grab
              bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
              hover:border-${def.color}-400 hover:shadow-sm
              active:cursor-grabbing transition-all
            `}
          >
            <i className={`ti ${def.icon} text-${def.color}-500 text-xl`} />
            <div>
              <div className="text-sm font-medium">{def.label}</div>
              <div className="text-xs text-gray-400">{def.defaultLatencyMs}ms</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
```

### 4.7 Top Toolbar

```tsx
// src/components/Toolbar.tsx
export function Toolbar({ onSimulate, onSave, onLoad, onReview }) {
  const { nodes, edges } = useArchitectureStore();
  const canSimulate = nodes.length >= 2 && edges.length >= 1;

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b flex items-center px-4 gap-3">
      <h1 className="font-bold text-lg mr-auto">SysDesign Studio</h1>

      <button onClick={onLoad} className="btn-secondary">Load</button>
      <button onClick={onSave} className="btn-secondary">Save</button>

      <select className="border rounded px-2 py-1 text-sm">
        <option value="POST /login">POST /login</option>
        <option value="GET /users">GET /users</option>
        <option value="POST /order">POST /order</option>
        <option value="GET /feed">GET /feed</option>
      </select>

      <button
        onClick={onSimulate}
        disabled={!canSimulate}
        className="btn-primary disabled:opacity-40"
      >
        ▶ Simulate Request
      </button>

      <button onClick={onReview} className="btn-secondary">
        🤖 Review Architecture
      </button>
    </header>
  );
}
```

---

## 5. Phase 2 — Request Simulator (Frontend)

**Duration:** Week 2–3  
**Goal:** Full local simulation with animation. Works without any backend.

### 5.1 Client-Side Simulation Engine

Create `src/engine/SimulationEngine.ts`:

```typescript
import { Node, Edge } from 'reactflow';

export interface SimulationStep {
  nodeId: string;
  nodeLabel: string;
  status: 'pass' | 'hit' | 'miss' | 'error' | 'async';
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
}

export class SimulationEngine {
  private adjacencyList: Map<string, string[]> = new Map();

  constructor(private nodes: Node[], private edges: Edge[]) {
    // Build adjacency list
    nodes.forEach(n => this.adjacencyList.set(n.id, []));
    edges.forEach(e => {
      const neighbors = this.adjacencyList.get(e.source) ?? [];
      neighbors.push(e.target);
      this.adjacencyList.set(e.source, neighbors);
    });
  }

  simulate(request: string): SimulationResult {
    // Find source node (no incoming edges = entry point)
    const hasIncoming = new Set(this.edges.map(e => e.target));
    const sourceNode = this.nodes.find(n => !hasIncoming.has(n.id));
    if (!sourceNode) throw new Error('No entry point found');

    const steps: SimulationStep[] = [];
    let totalLatency = 0;
    let cacheHits = 0, cacheMisses = 0, asyncEvents = 0;

    // BFS traversal
    const queue = [sourceNode.id];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const node = this.nodes.find(n => n.id === nodeId)!;
      const step = this.simulateNode(node, request);
      steps.push(step);
      totalLatency += step.durationMs;

      if (step.status === 'hit') {
        cacheHits++;
        // Cache hit: stop traversal for this path
        continue;
      }
      if (step.status === 'miss') cacheMisses++;
      if (step.status === 'async') asyncEvents++;

      const neighbors = this.adjacencyList.get(nodeId) ?? [];
      queue.push(...neighbors);
    }

    return {
      steps,
      totalLatencyMs: totalLatency,
      cacheHits,
      cacheMisses,
      asyncEvents,
      criticalPath: steps.map(s => s.nodeId),
    };
  }

  private simulateNode(node: Node, request: string): SimulationStep {
    const type = node.data.type as string;
    const latency = node.data.latencyMs as number;
    const label = node.data.label as string;

    switch (type) {
      case 'cache': {
        const isHit = Math.random() < 0.35; // 35% hit rate
        return {
          nodeId: node.id, nodeLabel: label,
          status: isHit ? 'hit' : 'miss',
          durationMs: latency,
          message: isHit
            ? `CACHE HIT — returning cached result (TTL active)`
            : `CACHE MISS — key not found, continuing to origin`,
        };
      }
      case 'load-balancer': {
        const replica = Math.floor(Math.random() * 3) + 1;
        return {
          nodeId: node.id, nodeLabel: label,
          status: 'pass', durationMs: latency,
          message: `Distributed to replica ${replica} (round-robin)`,
        };
      }
      case 'database': {
        return {
          nodeId: node.id, nodeLabel: label,
          status: 'pass', durationMs: latency,
          message: `Query executed — 1 row returned`,
        };
      }
      case 'kafka':
      case 'queue': {
        return {
          nodeId: node.id, nodeLabel: label,
          status: 'async', durationMs: latency,
          message: `Event published to ${label} — async, not blocking response`,
        };
      }
      case 'auth-service': {
        return {
          nodeId: node.id, nodeLabel: label,
          status: 'pass', durationMs: latency,
          message: `JWT validated — user authenticated`,
        };
      }
      case 'rate-limiter': {
        return {
          nodeId: node.id, nodeLabel: label,
          status: 'pass', durationMs: latency,
          message: `Rate limit check passed — 42/100 req/min used`,
        };
      }
      default: {
        return {
          nodeId: node.id, nodeLabel: label,
          status: 'pass', durationMs: latency,
          message: `Request processed`,
        };
      }
    }
  }
}
```

### 5.2 Simulation Player Component

Create `src/components/SimulationPlayer.tsx`:

```tsx
import { useEffect, useRef } from 'react';
import { SimulationStep } from '../engine/SimulationEngine';

interface Props {
  steps: SimulationStep[];
  totalLatencyMs: number;
  isPlaying: boolean;
  speed: number;
  onStepActivate: (nodeId: string, status: string) => void;
}

const STATUS_COLORS = {
  pass:  'text-blue-600 bg-blue-50',
  hit:   'text-green-600 bg-green-50',
  miss:  'text-red-500 bg-red-50',
  error: 'text-red-700 bg-red-100',
  async: 'text-purple-600 bg-purple-50',
};

const STATUS_LABELS = {
  pass:  '✓ PASS',
  hit:   '⚡ HIT',
  miss:  '✗ MISS',
  error: '✗ ERROR',
  async: '~ ASYNC',
};

export function SimulationPlayer({ steps, totalLatencyMs, isPlaying, speed, onStepActivate }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps.length]);

  return (
    <div className="w-80 bg-gray-950 text-green-400 font-mono text-xs flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
        <span className="text-gray-400">simulation log</span>
        {totalLatencyMs > 0 && (
          <span className="text-yellow-400">total: {totalLatencyMs}ms</span>
        )}
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex gap-2 items-start animate-in slide-in-from-bottom-1"
          >
            <span className="text-gray-600 w-4">{i + 1}</span>
            <span className={`px-1.5 rounded text-[10px] font-bold shrink-0 ${STATUS_COLORS[step.status]}`}>
              {STATUS_LABELS[step.status]}
            </span>
            <div className="flex flex-col">
              <span className="text-white font-semibold">{step.nodeLabel}</span>
              <span className="text-gray-400">{step.message}</span>
              <span className="text-gray-600">{step.durationMs}ms</span>
            </div>
          </div>
        ))}

        {isPlaying && (
          <div className="text-gray-500 animate-pulse">▌ processing...</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Summary (shown when done) */}
      {!isPlaying && steps.length > 0 && (
        <div className="border-t border-gray-800 p-4 space-y-1 text-xs">
          <div className="text-gray-400 font-semibold mb-2">summary</div>
          <div>total latency: <span className="text-yellow-400">{totalLatencyMs}ms</span></div>
          <div>cache hits: <span className="text-green-400">{steps.filter(s => s.status === 'hit').length}</span></div>
          <div>cache misses: <span className="text-red-400">{steps.filter(s => s.status === 'miss').length}</span></div>
          <div>async events: <span className="text-purple-400">{steps.filter(s => s.status === 'async').length}</span></div>
        </div>
      )}
    </div>
  );
}
```

### 5.3 Wiring the Simulation

In your main `App.tsx`, run simulation steps with a timer-based player:

```typescript
const runSimulation = async (request: string) => {
  const engine = new SimulationEngine(nodes, edges);
  const result = engine.simulate(request);

  store.resetSimulation();
  store.setSimulating(true);

  const delayMs = 1000 / store.simulationSpeed;

  for (const step of result.steps) {
    // Highlight node on canvas
    highlightNode(step.nodeId, step.status);

    // Add step to log
    store.addSimulationStep(step);

    await new Promise(r => setTimeout(r, delayMs));
  }

  store.setSimulating(false);
};
```

---

## 6. Phase 3 — Spring Boot Backend

**Duration:** Week 3–5  
**Goal:** All REST endpoints working; React frontend connected to backend instead of localStorage.

### 6.1 Project Structure

```
sysdesign-api/
└── src/main/java/com/sysdesign/
    ├── SysdesignApiApplication.java
    ├── auth/
    │   ├── AuthController.java
    │   ├── AuthService.java
    │   ├── JwtService.java
    │   ├── JwtAuthFilter.java
    │   └── SecurityConfig.java
    ├── architecture/
    │   ├── ArchitectureController.java
    │   ├── ArchitectureService.java
    │   ├── ArchitectureRepository.java
    │   ├── Architecture.java         (entity)
    │   └── dto/
    │       ├── ArchitectureRequest.java
    │       └── ArchitectureResponse.java
    ├── simulation/
    │   ├── SimulationController.java
    │   ├── SimulationService.java
    │   ├── SimulationEngine.java
    │   ├── NodeSimulator.java        (interface)
    │   ├── simulators/
    │   │   ├── CacheNodeSimulator.java
    │   │   ├── DatabaseNodeSimulator.java
    │   │   ├── KafkaNodeSimulator.java
    │   │   └── DefaultNodeSimulator.java
    │   └── dto/
    │       ├── SimulationRequest.java
    │       └── SimulationResult.java
    ├── metrics/
    │   ├── MetricsController.java
    │   └── MetricsService.java
    └── common/
        ├── ApiResponse.java
        └── GlobalExceptionHandler.java
```

### 6.2 Maven `pom.xml` Dependencies

```xml
<dependencies>
  <!-- Spring Boot -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
  </dependency>

  <!-- JWT -->
  <dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
  </dependency>
  <dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
  </dependency>

  <!-- Database -->
  <dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
  </dependency>

  <!-- Utilities -->
  <dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
  </dependency>
</dependencies>
```

### 6.3 Architecture Entity

```java
// src/main/java/com/sysdesign/architecture/Architecture.java
@Entity
@Table(name = "architectures")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Architecture {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String nodesJson;   // Serialized ReactFlow nodes[]

    @Column(columnDefinition = "TEXT", nullable = false)
    private String edgesJson;   // Serialized ReactFlow edges[]

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User owner;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### 6.4 Architecture Controller

```java
@RestController
@RequestMapping("/api/architectures")
@RequiredArgsConstructor
public class ArchitectureController {

    private final ArchitectureService architectureService;

    @GetMapping
    public Page<ArchitectureResponse> getAll(
        @AuthenticationPrincipal User user,
        Pageable pageable
    ) {
        return architectureService.findByOwner(user, pageable);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ArchitectureResponse create(
        @Valid @RequestBody ArchitectureRequest request,
        @AuthenticationPrincipal User user
    ) {
        return architectureService.create(request, user);
    }

    @GetMapping("/{id}")
    public ArchitectureResponse getById(
        @PathVariable UUID id,
        @AuthenticationPrincipal User user
    ) {
        return architectureService.findByIdAndOwner(id, user);
    }

    @PutMapping("/{id}")
    public ArchitectureResponse update(
        @PathVariable UUID id,
        @Valid @RequestBody ArchitectureRequest request,
        @AuthenticationPrincipal User user
    ) {
        return architectureService.update(id, request, user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
        @PathVariable UUID id,
        @AuthenticationPrincipal User user
    ) {
        architectureService.delete(id, user);
    }
}
```

### 6.5 Simulation Engine (Java)

```java
// src/main/java/com/sysdesign/simulation/SimulationEngine.java
@Service
@RequiredArgsConstructor
public class SimulationEngine {

    private final Map<String, NodeSimulator> simulators;

    public SimulationResult simulate(List<NodeDto> nodes, List<EdgeDto> edges, String request) {
        // Build adjacency list
        Map<String, List<String>> graph = new HashMap<>();
        nodes.forEach(n -> graph.put(n.getId(), new ArrayList<>()));
        edges.forEach(e -> graph.get(e.getSource()).add(e.getTarget()));

        // Find source node (no incoming edges)
        Set<String> hasIncoming = edges.stream()
            .map(EdgeDto::getTarget)
            .collect(Collectors.toSet());
        NodeDto source = nodes.stream()
            .filter(n -> !hasIncoming.contains(n.getId()))
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("No entry point found"));

        // BFS traversal
        List<SimulationStep> steps = new ArrayList<>();
        Queue<String> queue = new LinkedList<>();
        Set<String> visited = new HashSet<>();
        queue.add(source.getId());

        while (!queue.isEmpty()) {
            String nodeId = queue.poll();
            if (visited.contains(nodeId)) continue;
            visited.add(nodeId);

            NodeDto node = nodes.stream().filter(n -> n.getId().equals(nodeId)).findFirst().orElseThrow();
            NodeSimulator simulator = simulators.getOrDefault(node.getType(), simulators.get("default"));
            SimulationStep step = simulator.simulate(node, request);
            steps.add(step);

            // Cache hit = stop path
            if (!"hit".equals(step.getStatus())) {
                queue.addAll(graph.getOrDefault(nodeId, List.of()));
            }
        }

        long totalLatency = steps.stream().mapToLong(SimulationStep::getDurationMs).sum();
        return SimulationResult.builder()
            .steps(steps)
            .totalLatencyMs(totalLatency)
            .build();
    }
}
```

### 6.6 `NodeSimulator` Strategy Pattern

```java
// Interface
public interface NodeSimulator {
    SimulationStep simulate(NodeDto node, String request);
    String getType();
}

// Cache implementation
@Component
public class CacheNodeSimulator implements NodeSimulator {
    private final Random random = new Random();

    @Override
    public SimulationStep simulate(NodeDto node, String request) {
        boolean isHit = random.nextDouble() < 0.35;
        return SimulationStep.builder()
            .nodeId(node.getId())
            .nodeLabel(node.getLabel())
            .status(isHit ? "hit" : "miss")
            .durationMs(node.getLatencyMs())
            .message(isHit ? "CACHE HIT — returning cached result" : "CACHE MISS — key not found")
            .build();
    }

    @Override public String getType() { return "cache"; }
}

// Register all simulators in a @Configuration
@Configuration
public class SimulatorConfig {
    @Bean
    public Map<String, NodeSimulator> simulators(List<NodeSimulator> simulatorList) {
        return simulatorList.stream()
            .collect(Collectors.toMap(NodeSimulator::getType, s -> s));
    }
}
```

### 6.7 Security Configuration

```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000", "https://your-app.vercel.app"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        CorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        ((UrlBasedCorsConfigurationSource) source).registerCorsConfiguration("/**", config);
        return source;
    }
}
```

### 6.8 `application.yml`

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/sysdesign
    username: dev
    password: dev
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
  data:
    redis:
      host: localhost
      port: 6379
  kafka:
    bootstrap-servers: localhost:9092

jwt:
  secret: your-256-bit-secret-key-here-replace-in-production
  expiration: 86400000   # 24 hours in ms

server:
  port: 8080
```

---

## 7. Phase 4 — Redis + Kafka + WebSocket

**Duration:** Week 5–7  
**Goal:** Real-time WebSocket simulation, Redis caching, Kafka event publishing.

### 7.1 Redis Caching

Add caching to `SimulationService.java`:

```java
@Service
@RequiredArgsConstructor
public class SimulationService {

    private final SimulationEngine engine;
    private final RedisTemplate<String, SimulationResult> redisTemplate;
    private static final Duration CACHE_TTL = Duration.ofMinutes(10);

    public SimulationResult simulate(SimulationRequest request) {
        String cacheKey = buildCacheKey(request);

        // Check cache
        SimulationResult cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            log.info("Cache hit for key: {}", cacheKey);
            return cached;
        }

        // Run simulation
        SimulationResult result = engine.simulate(
            request.getNodes(), request.getEdges(), request.getHttpRequest()
        );

        // Store in cache
        redisTemplate.opsForValue().set(cacheKey, result, CACHE_TTL);

        return result;
    }

    private String buildCacheKey(SimulationRequest request) {
        // Hash the architecture + request type
        String payload = request.getArchitectureId() + ":" + request.getHttpRequest();
        return "sim:" + DigestUtils.md5Hex(payload);
    }
}
```

### 7.2 Kafka Event Publishing

```java
// src/main/java/com/sysdesign/events/SimulationEventPublisher.java
@Component
@RequiredArgsConstructor
public class SimulationEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private static final String TOPIC = "simulation-events";

    public void publishSimulationStarted(String userId, String architectureId) {
        var event = Map.of(
            "type", "SIMULATION_STARTED",
            "userId", userId,
            "architectureId", architectureId,
            "timestamp", Instant.now().toString()
        );
        kafkaTemplate.send(TOPIC, userId, serialize(event));
    }

    public void publishNodeTraversed(String sessionId, SimulationStep step) {
        var event = Map.of(
            "type", "NODE_TRAVERSED",
            "sessionId", sessionId,
            "nodeId", step.getNodeId(),
            "status", step.getStatus(),
            "timestamp", Instant.now().toString()
        );
        kafkaTemplate.send(TOPIC, sessionId, serialize(event));
    }

    private String serialize(Object obj) {
        try { return objectMapper.writeValueAsString(obj); }
        catch (Exception e) { throw new RuntimeException(e); }
    }
}
```

### 7.3 WebSocket Configuration

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/simulation")
            .setAllowedOriginPatterns("*")
            .withSockJS();
    }
}
```

### 7.4 Streaming Simulation Controller

```java
@Controller
@RequiredArgsConstructor
public class SimulationStreamController {

    private final SimulationEngine engine;
    private final SimpMessagingTemplate messagingTemplate;
    private final SimulationEventPublisher eventPublisher;

    @MessageMapping("/simulate")
    public void startSimulation(SimulationRequest request) throws InterruptedException {
        String sessionId = UUID.randomUUID().toString();
        eventPublisher.publishSimulationStarted(request.getUserId(), request.getArchitectureId());

        List<SimulationStep> steps = engine.simulateSteps(request.getNodes(), request.getEdges(), request.getHttpRequest());

        for (SimulationStep step : steps) {
            // Stream each step to the client
            messagingTemplate.convertAndSend(
                "/topic/simulation/" + sessionId, step
            );
            eventPublisher.publishNodeTraversed(sessionId, step);

            // Artificial delay for animation
            Thread.sleep(250);
        }

        // Send completion event
        messagingTemplate.convertAndSend(
            "/topic/simulation/" + sessionId,
            Map.of("type", "SIMULATION_COMPLETE", "sessionId", sessionId)
        );
    }
}
```

### 7.5 Frontend WebSocket Client

```typescript
// src/hooks/useSimulationStream.ts
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useSimulationStream() {
  const store = useArchitectureStore();

  const startStreamedSimulation = (request: SimulationRequest) => {
    const sessionId = crypto.randomUUID();
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_URL}/ws/simulation`),
      onConnect: () => {
        // Subscribe to our session topic
        client.subscribe(`/topic/simulation/${sessionId}`, (message) => {
          const step = JSON.parse(message.body);

          if (step.type === 'SIMULATION_COMPLETE') {
            store.setSimulating(false);
            client.deactivate();
            return;
          }

          store.addSimulationStep(step);
          highlightNode(step.nodeId, step.status);
        });

        // Trigger simulation
        client.publish({
          destination: '/app/simulate',
          body: JSON.stringify({ ...request, sessionId }),
        });
      },
    });

    store.resetSimulation();
    store.setSimulating(true);
    client.activate();
  };

  return { startStreamedSimulation };
}
```

---

## 8. Phase 5 — AI Architecture Reviewer

**Duration:** Week 7–8  
**Goal:** Hybrid analysis combining deterministic rules + LLM review.

### 8.1 Deterministic Rule Engine

```java
// src/main/java/com/sysdesign/review/RuleEngine.java
@Service
public class RuleEngine {

    public List<ReviewIssue> analyze(List<NodeDto> nodes, List<EdgeDto> edges) {
        List<ReviewIssue> issues = new ArrayList<>();

        Set<String> nodeTypes = nodes.stream()
            .map(NodeDto::getType)
            .collect(Collectors.toSet());
        Set<String> hasIncoming = edges.stream()
            .map(EdgeDto::getTarget)
            .collect(Collectors.toSet());

        // Rule 1: Database without upstream cache
        boolean hasDatabase = nodeTypes.contains("database");
        boolean hasCache    = nodeTypes.contains("cache");
        if (hasDatabase && !hasCache) {
            issues.add(ReviewIssue.warning("database",
                "No cache layer detected before database. Consider adding Redis to reduce latency and DB load."));
        }

        // Rule 2: No auth service
        boolean hasAuthService  = nodeTypes.contains("auth-service");
        boolean hasApiGateway   = nodeTypes.contains("api-gateway");
        if (hasApiGateway && !hasAuthService) {
            issues.add(ReviewIssue.critical("api-gateway",
                "No Auth Service detected. All API routes are unauthenticated."));
        }

        // Rule 3: Single points of failure (no load balancer with multiple services)
        long serviceCount = nodes.stream().filter(n -> "service".equals(n.getType())).count();
        boolean hasLoadBalancer = nodeTypes.contains("load-balancer");
        if (serviceCount >= 2 && !hasLoadBalancer) {
            issues.add(ReviewIssue.warning("service",
                "Multiple services detected but no Load Balancer. Traffic cannot be distributed."));
        }

        // Rule 4: Single stateful services (SPOF)
        nodes.stream()
            .filter(n -> List.of("database", "kafka", "cache").contains(n.getType()))
            .filter(n -> n.getReplicas() == null || n.getReplicas() <= 1)
            .forEach(n -> issues.add(ReviewIssue.info(n.getType(),
                n.getLabel() + " has a single replica — single point of failure.")));

        return issues;
    }
}
```

### 8.2 LLM Review Service

```java
@Service
@RequiredArgsConstructor
public class AIReviewService {

    private final RestTemplate restTemplate;
    private final RuleEngine ruleEngine;

    @Value("${openai.api.key}")
    private String apiKey;

    public ArchitectureReview review(List<NodeDto> nodes, List<EdgeDto> edges) {
        // Run deterministic rules first
        List<ReviewIssue> ruleIssues = ruleEngine.analyze(nodes, edges);

        // Build architecture description for LLM
        String description = buildDescription(nodes, edges);

        // Call LLM
        String llmResponse = callLLM(description);
        LLMReview llmReview = parseLLMResponse(llmResponse);

        // Merge results
        List<ReviewIssue> allIssues = new ArrayList<>(ruleIssues);
        allIssues.addAll(llmReview.getIssues());

        return ArchitectureReview.builder()
            .issues(allIssues)
            .recommendations(llmReview.getRecommendations())
            .score(calculateScore(allIssues))
            .build();
    }

    private String buildDescription(List<NodeDto> nodes, List<EdgeDto> edges) {
        StringBuilder sb = new StringBuilder("System components: ");
        nodes.forEach(n -> sb.append(n.getLabel()).append(" (").append(n.getType()).append("), "));
        sb.append("\nConnections: ");
        edges.forEach(e -> {
            String from = nodes.stream().filter(n -> n.getId().equals(e.getSource())).findFirst().map(NodeDto::getLabel).orElse(e.getSource());
            String to   = nodes.stream().filter(n -> n.getId().equals(e.getTarget())).findFirst().map(NodeDto::getLabel).orElse(e.getTarget());
            sb.append(from).append(" → ").append(to).append(", ");
        });
        return sb.toString();
    }

    private String callLLM(String description) {
        // Using OpenAI-compatible API
        var headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String prompt = """
            You are a senior distributed systems architect.
            Analyze the following architecture and return ONLY valid JSON with this structure:
            {
              "issues": [{"severity":"critical|warning|info","component":"string","message":"string"}],
              "recommendations": [{"title":"string","description":"string"}]
            }
            
            Architecture: %s
            """.formatted(description);

        var body = Map.of(
            "model", "gpt-3.5-turbo",
            "messages", List.of(Map.of("role", "user", "content", prompt)),
            "temperature", 0.3
        );

        var entity = new HttpEntity<>(body, headers);
        var response = restTemplate.postForObject("https://api.openai.com/v1/chat/completions", entity, Map.class);
        return extractContent(response);
    }

    private int calculateScore(List<ReviewIssue> issues) {
        int score = 100;
        for (ReviewIssue issue : issues) {
            score -= switch (issue.getSeverity()) {
                case "critical" -> 20;
                case "warning"  -> 10;
                case "info"     -> 3;
                default -> 0;
            };
        }
        return Math.max(0, score);
    }
}
```

### 8.3 Review Panel (Frontend)

```tsx
// src/components/ReviewPanel.tsx
export function ReviewPanel({ architectureId }: { architectureId: string }) {
  const [review, setReview] = useState<ArchitectureReview | null>(null);
  const [loading, setLoading] = useState(false);

  const runReview = async () => {
    setLoading(true);
    const result = await api.post(`/review/${architectureId}`);
    setReview(result.data);
    setLoading(false);
  };

  const SEVERITY_STYLES = {
    critical: 'border-red-400 bg-red-50 text-red-800',
    warning:  'border-yellow-400 bg-yellow-50 text-yellow-800',
    info:     'border-blue-400 bg-blue-50 text-blue-800',
  };

  return (
    <div className="p-4 space-y-4">
      <button onClick={runReview} disabled={loading} className="btn-primary w-full">
        {loading ? 'Analyzing...' : '🤖 Review Architecture'}
      </button>

      {review && (
        <>
          {/* Score ring */}
          <div className="flex items-center justify-center gap-4">
            <ScoreRing score={review.score} />
            <div>
              <div className="text-2xl font-bold">{review.score}/100</div>
              <div className="text-sm text-gray-500">Architecture health score</div>
            </div>
          </div>

          {/* Issues */}
          <div className="space-y-2">
            <h3 className="font-semibold">Issues ({review.issues.length})</h3>
            {review.issues.map((issue, i) => (
              <div key={i} className={`border rounded-lg p-3 ${SEVERITY_STYLES[issue.severity]}`}>
                <div className="flex items-center gap-2 font-medium">
                  <span className="uppercase text-xs font-bold">{issue.severity}</span>
                  <span>{issue.component}</span>
                </div>
                <p className="text-sm mt-1">{issue.message}</p>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="space-y-2">
            <h3 className="font-semibold">Recommendations</h3>
            {review.recommendations.map((rec, i) => (
              <details key={i} className="border rounded-lg p-3">
                <summary className="font-medium cursor-pointer">{rec.title}</summary>
                <p className="text-sm text-gray-600 mt-2">{rec.description}</p>
              </details>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

---

## 9. Phase 6 — Docker + Deployment

**Duration:** Week 8–9  
**Goal:** Fully containerized local dev; deployed to Vercel (frontend) + Railway (backend).

### 9.1 `docker-compose.yml` (Local Development)

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: sysdesign
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dev"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  zookeeper:
    image: confluentinc/cp-zookeeper:7.6.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  kafka:
    image: confluentinc/cp-kafka:7.6.0
    depends_on: [zookeeper]
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true'

  backend:
    build:
      context: ./sysdesign-api
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
      kafka:
        condition: service_started
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/sysdesign
      SPRING_DATASOURCE_USERNAME: dev
      SPRING_DATASOURCE_PASSWORD: dev
      SPRING_DATA_REDIS_HOST: redis
      SPRING_KAFKA_BOOTSTRAP_SERVERS: kafka:9092
      JWT_SECRET: ${JWT_SECRET}
      OPENAI_API_KEY: ${OPENAI_API_KEY}

  frontend:
    build:
      context: ./sysdesign-studio
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      VITE_API_URL: http://localhost:8080

volumes:
  postgres_data:
  redis_data:
```

### 9.2 `Dockerfile` — Spring Boot Backend

```dockerfile
# Build stage
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn clean package -DskipTests -q

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/sysdesign-api-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 9.3 `Dockerfile` — React Frontend

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

### 9.4 `nginx.conf` (SPA routing support)

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 9.5 Deploying to Vercel (Frontend)

1. Push `sysdesign-studio/` to GitHub.
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo.
3. Set **Root Directory** to `sysdesign-studio`.
4. Set **Build Command** to `npm run build`.
5. Set **Output Directory** to `dist`.
6. Add environment variable: `VITE_API_URL=https://your-api.railway.app`.
7. Deploy. Every push to `main` auto-deploys.

### 9.6 Deploying to Railway (Backend + Database + Redis)

1. Go to [railway.app](https://railway.app) → New Project.
2. Add **PostgreSQL** plugin → Railway provides `DATABASE_URL` automatically.
3. Add **Redis** plugin → Railway provides `REDIS_URL` automatically.
4. Add **New Service** → GitHub Repo → select `sysdesign-api/`.
5. Set environment variables:
   ```
   SPRING_DATASOURCE_URL=jdbc:postgresql://...   (from Railway PostgreSQL plugin)
   SPRING_DATA_REDIS_HOST=...                    (from Railway Redis plugin)
   SPRING_KAFKA_BOOTSTRAP_SERVERS=...            (from Upstash Kafka)
   JWT_SECRET=your-256-bit-secret
   OPENAI_API_KEY=sk-...
   ```
6. Railway auto-detects the `Dockerfile` and builds on every push.

### 9.7 Upstash Kafka (Free Managed Kafka)

1. Go to [upstash.com](https://upstash.com) → Create Kafka cluster.
2. Create topic `simulation-events`.
3. Copy the **Bootstrap Servers** and **SASL credentials**.
4. Add to Railway environment:
   ```yaml
   spring:
     kafka:
       bootstrap-servers: ${UPSTASH_KAFKA_BROKER}
       properties:
         security.protocol: SASL_SSL
         sasl.mechanism: SCRAM-SHA-256
         sasl.jaas.config: "org.apache.kafka.common.security.scram.ScramLoginModule required username='${UPSTASH_KAFKA_USER}' password='${UPSTASH_KAFKA_PASS}';"
   ```

---

## 10. CI/CD with GitHub Actions

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # ─────────────────── Backend ───────────────────
  backend-ci:
    name: Backend — Build & Test
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: sysdesign_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Set up Java 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: 'maven'

      - name: Build with Maven
        working-directory: ./sysdesign-api
        run: mvn clean package -DskipTests

      - name: Run tests
        working-directory: ./sysdesign-api
        env:
          SPRING_DATASOURCE_URL: jdbc:postgresql://localhost:5432/sysdesign_test
          SPRING_DATASOURCE_USERNAME: test
          SPRING_DATASOURCE_PASSWORD: test
          JWT_SECRET: test-secret-key-for-ci-only-32-chars
        run: mvn test

  # ─────────────────── Frontend ───────────────────
  frontend-ci:
    name: Frontend — Build & Type Check
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: sysdesign-studio/package-lock.json

      - name: Install dependencies
        working-directory: ./sysdesign-studio
        run: npm ci

      - name: Type check
        working-directory: ./sysdesign-studio
        run: npx tsc --noEmit

      - name: Build
        working-directory: ./sysdesign-studio
        run: npm run build
        env:
          VITE_API_URL: https://placeholder.railway.app

  # ─────────────────── Docker Build Check ───────────────────
  docker-build:
    name: Docker Build Check
    runs-on: ubuntu-latest
    needs: [backend-ci, frontend-ci]
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Build backend image
        run: docker build -t sysdesign-api ./sysdesign-api

      - name: Build frontend image
        run: docker build -t sysdesign-studio ./sysdesign-studio
```

---

## 11. Weekly Timeline

| Week | Phase | Focus Areas | Deliverable |
|------|-------|-------------|-------------|
| 1 | Phase 1 | Vite scaffold, Tailwind, ReactFlow canvas, drag-drop palette, Zustand store | Drag-drop canvas with localStorage save |
| 2 | Phase 2 | SimulationEngine.ts, BFS traversal, SimulationPlayer, animation | Full local simulation with animated playback |
| 3 | Phase 3 | Spring Boot scaffold, JWT auth, User entity, Architecture CRUD endpoints | Working REST API with Swagger |
| 4 | Phase 3 | Java SimulationEngine, Strategy pattern per node type, connect frontend to backend | End-to-end: React → Spring Boot simulation |
| 5 | Phase 4 | Redis caching with `RedisTemplate`, cache invalidation on update | Cached simulation responses |
| 6 | Phase 4 | Kafka event publishing, WebSocket STOMP config, streaming simulation player | Real-time streamed simulation |
| 7 | Phase 5 | RuleEngine (deterministic), LLM integration, ReviewPanel component | Full AI architecture review |
| 8 | Phase 6 | Docker Compose local, Dockerfiles, Railway + Vercel deploy, env vars | Live deployed app with custom domain |
| 9 | Polish | README, demo GIF/video, load testing, quantified resume bullets | Production-ready portfolio project |

---

## 12. Resume Entry Guide

### Resume Bullet Points (Use These)

```
System Design Simulator | React, TypeScript, Spring Boot, PostgreSQL, Redis, Kafka, Docker

• Engineered an interactive distributed-system architecture simulator enabling users to design
  and simulate 10+ infrastructure components including API Gateways, Load Balancers, Databases,
  Caches, and Kafka clusters on a ReactFlow drag-and-drop canvas.

• Developed a Spring Boot simulation engine that traverses user-generated graph architectures
  via BFS, modeling request routing, cache hit/miss logic, database queries, and async event
  flows using a Strategy pattern with per-component NodeSimulator implementations.

• Implemented real-time simulation playback using Spring WebSocket (STOMP) and Kafka event
  streaming, visualizing request propagation across distributed services with per-step latency
  estimation streamed to the browser in under 250ms per step.

• Built a hybrid architecture analysis module combining 6 deterministic rules (SPOF detection,
  missing auth layer, unbalanced load) with an LLM reviewer (OpenAI API), returning structured
  issue severity ratings and actionable recommendations with a 0–100 health score.

• Cached simulation results in Redis with MD5-keyed TTL entries, reducing repeat simulation
  response time by ~80% and cutting PostgreSQL read load on identical architecture queries.

• Containerized all services using Docker Compose and deployed frontend to Vercel and backend
  to Railway with automated CI/CD via GitHub Actions on every push to main.
```

### Quantification Checklist

After building, replace these placeholders with real measurements from your app:

| Bullet claim | How to measure |
|---|---|
| "10+ infrastructure components" | Count items in `COMPONENT_DEFINITIONS` |
| "under 250ms per step" | Measure STOMP message latency with browser DevTools → WS tab |
| "~80% cache reduction" | Run `POST /simulate` twice for same architecture, compare response times |
| "6 deterministic rules" | Count rules in `RuleEngine.java` |
| "0–100 health score" | Document your `calculateScore()` logic |
| "BFS traversal" | Show it in code or README |

### GitHub Repository README Structure

```markdown
# SysDesign Studio

> Interactive distributed-system architecture designer and request flow simulator.

## Demo

[Live App](https://sysdesign-studio.vercel.app) | [API Docs](https://api.railway.app/swagger-ui)

![Demo GIF](./docs/demo.gif)

## Features
- Drag-and-drop 10+ infrastructure components
- Request simulation with BFS graph traversal
- Real-time animated playback via WebSocket
- Redis-cached simulation results
- Kafka event streaming
- AI architecture reviewer (rule-based + LLM)

## Tech Stack
Frontend: React, TypeScript, ReactFlow, Zustand, Tailwind
Backend: Java 21, Spring Boot 3, Spring Security, JWT
Storage: PostgreSQL, Redis
Messaging: Kafka (Upstash)
DevOps: Docker, GitHub Actions, Vercel, Railway

## Running Locally
\`\`\`bash
git clone https://github.com/yourname/sysdesign-studio
docker-compose up -d        # Start postgres, redis, kafka
cd sysdesign-api && mvn spring-boot:run
cd sysdesign-studio && npm install && npm run dev
\`\`\`
```

---

*Built to demonstrate: graph algorithms, real-time systems, distributed architecture design, full-stack Java + React development, and production deployment practices.*

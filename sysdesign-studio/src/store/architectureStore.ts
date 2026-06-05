import { create } from 'zustand';
import type { Edge, Node } from 'reactflow';
import type { InfraNodeData, SimulationStatus } from '../types/components';
import type { SimulationResult, SimulationStep } from '../engine/SimulationEngine';

const STORAGE_KEY = 'sysdesign-studio.architecture.v1';

type SimulationSpeed = 0.5 | 1 | 2;

interface PersistedArchitecture {
  nodes: Node<InfraNodeData>[];
  edges: Edge[];
}

interface ArchitectureStore {
  nodes: Node<InfraNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  httpRequest: string;
  simulationSteps: SimulationStep[];
  simulationResult: SimulationResult | null;
  activeSimulationNodeId: string | null;
  isSimulating: boolean;
  simulationSpeed: SimulationSpeed;
  isReviewPanelOpen: boolean;
  setNodes: (nodes: Node<InfraNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNode: (id: string | null) => void;
  updateNodeData: (id: string, data: Partial<InfraNodeData>) => void;
  setHttpRequest: (request: string) => void;
  addSimulationStep: (step: SimulationStep) => void;
  setSimulationResult: (result: SimulationResult | null) => void;
  resetSimulation: () => void;
  setActiveSimulationNode: (id: string | null) => void;
  setNodeSimulationStatus: (id: string, status: SimulationStatus) => void;
  setSimulating: (v: boolean) => void;
  setSpeed: (s: SimulationSpeed) => void;
  clearCanvas: () => void;
  toggleReviewPanel: () => void;
}

function loadArchitecture(): PersistedArchitecture {
  if (typeof window === 'undefined') return { nodes: [], edges: [] };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { nodes: [], edges: [] };

    const parsed = JSON.parse(raw) as PersistedArchitecture;
    return {
      nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
      edges: Array.isArray(parsed.edges) ? parsed.edges : [],
    };
  } catch {
    return { nodes: [], edges: [] };
  }
}

function persistArchitecture(nodes: Node<InfraNodeData>[], edges: Edge[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes: stripSimulationStatus(nodes), edges }));
}

function stripSimulationStatus(nodes: Node<InfraNodeData>[]) {
  return nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      simulationStatus: null,
    },
  }));
}

const initialArchitecture = loadArchitecture();

export const useArchitectureStore = create<ArchitectureStore>((set, get) => ({
  nodes: initialArchitecture.nodes,
  edges: initialArchitecture.edges,
  selectedNodeId: null,
  httpRequest: 'GET /users',
  simulationSteps: [],
  simulationResult: null,
  activeSimulationNodeId: null,
  isSimulating: false,
  simulationSpeed: 1,
  isReviewPanelOpen: false,

  setNodes: (nodes) => {
    const edges = get().edges;
    persistArchitecture(nodes, edges);
    set({ nodes });
  },
  setEdges: (edges) => {
    const nodes = get().nodes;
    persistArchitecture(nodes, edges);
    set({ edges });
  },
  setSelectedNode: (selectedNodeId) => set({ selectedNodeId }),
  updateNodeData: (id, data) => {
    const nodes = get().nodes.map((node) =>
      node.id === id
        ? {
            ...node,
            data: {
              ...node.data,
              ...data,
            },
          }
        : node
    );
    persistArchitecture(nodes, get().edges);
    set({ nodes });
  },
  setHttpRequest: (httpRequest) => set({ httpRequest }),
  addSimulationStep: (step) =>
    set((state) => ({ simulationSteps: [...state.simulationSteps, step] })),
  setSimulationResult: (simulationResult) => set({ simulationResult }),
  resetSimulation: () =>
    set({
      simulationSteps: [],
      simulationResult: null,
      activeSimulationNodeId: null,
      isSimulating: false,
      nodes: get().nodes.map((node) => ({
        ...node,
        data: { ...node.data, simulationStatus: null },
      })),
    }),
  setActiveSimulationNode: (activeSimulationNodeId) => set({ activeSimulationNodeId }),
  setNodeSimulationStatus: (id, status) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                simulationStatus: status,
              },
            }
          : node,
      ),
    })),
  setSimulating: (isSimulating) => set({ isSimulating }),
  setSpeed: (simulationSpeed) => set({ simulationSpeed }),
  clearCanvas: () => {
    persistArchitecture([], []);
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      httpRequest: 'GET /users',
      simulationSteps: [],
      simulationResult: null,
      activeSimulationNodeId: null,
      isSimulating: false,
    });
  },
  toggleReviewPanel: () => set((state) => ({ isReviewPanelOpen: !state.isReviewPanelOpen })),
}));

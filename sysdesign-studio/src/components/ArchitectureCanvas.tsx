import { useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeTypes,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { COMPONENT_DEFINITIONS } from '../types/components';
import type { InfraNodeData } from '../types/components';
import { useArchitectureStore } from '../store/architectureStore';
import { InfraNode } from './nodes/InfraNode';

const nodeTypes: NodeTypes = { infraNode: InfraNode };

export function ArchitectureCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    setSelectedNode,
    activeSimulationNodeId,
  } = useArchitectureStore();
  const [localNodes, setLocalNodes, onNodesChange] = useNodesState<InfraNodeData>(nodes);
  const [localEdges, setLocalEdges, onEdgesChange] = useEdgesState(edges);
  const { screenToFlowPosition } = useReactFlow();

  useEffect(() => {
    setLocalNodes(
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          simulationStatus:
            node.id === activeSimulationNodeId ? 'active' : node.data.simulationStatus ?? null,
        },
      })),
    );
  }, [activeSimulationNodeId, nodes, setLocalNodes]);

  useEffect(() => {
    setLocalEdges(edges);
  }, [edges, setLocalEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target || connection.source === connection.target) return;

      const nextEdges = addEdge(
        {
          ...connection,
          animated: false,
          type: 'smoothstep',
          style: { strokeWidth: 2 },
        },
        localEdges,
      );
      setLocalEdges(nextEdges);
      setEdges(nextEdges);
    },
    [localEdges, setEdges, setLocalEdges],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('componentType');
      const def = COMPONENT_DEFINITIONS.find((component) => component.type === type);
      if (!def) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode: Node<InfraNodeData> = {
        id: `${type}-${Date.now()}`,
        type: 'infraNode',
        position,
        data: { ...def, latencyMs: def.defaultLatencyMs, simulationStatus: null },
      };
      const nextNodes = [...localNodes, newNode];
      setLocalNodes(nextNodes);
      setNodes(nextNodes);
    },
    [localNodes, screenToFlowPosition, setLocalNodes, setNodes],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      setNodes(applyNodeChanges(changes, localNodes));
    },
    [localNodes, onNodesChange, setNodes],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      setEdges(applyEdgeChanges(changes, localEdges));
    },
    [localEdges, onEdgesChange, setEdges],
  );

  const onNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      const deletedIds = new Set(deletedNodes.map((n) => n.id));
      const nextEdges = localEdges.filter(
        (edge) => !deletedIds.has(edge.source) && !deletedIds.has(edge.target)
      );
      setLocalEdges(nextEdges);
      setEdges(nextEdges);
    },
    [localEdges, setEdges, setLocalEdges],
  );

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  return (
    <div ref={reactFlowWrapper} className="h-full min-h-[420px] flex-1 bg-slate-50">
      <ReactFlow
        nodes={localNodes}
        edges={localEdges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onNodesDelete={onNodesDelete}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={(_, node) => setSelectedNode(node.id)}
        onPaneClick={() => setSelectedNode(null)}
        fitView
        proOptions={proOptions}
      >
        <Background color="#cbd5e1" gap={24} />
        <MiniMap pannable zoomable nodeStrokeWidth={3} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

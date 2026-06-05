import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useArchitectureStore } from '../store/architectureStore';
import { SimulationStatus } from '../types/components';

// Note: Using standard Vite env variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface SimulationRequest {
  architectureId: string;
  userId: string;
  nodes: any[];
  edges: any[];
  httpRequest: string;
}

export function useSimulationStream() {
  const store = useArchitectureStore();

  const highlightNode = (nodeId: string, status: SimulationStatus) => {
    const updatedNodes = store.nodes.map(node => {
      if (node.id === nodeId) {
        return { ...node, data: { ...node.data, simulationStatus: status } };
      }
      return node;
    });
    store.setNodes(updatedNodes);
  };

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
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        store.setSimulating(false);
      }
    });

    store.resetSimulation();
    store.setSimulating(true);
    client.activate();
  };

  return { startStreamedSimulation };
}

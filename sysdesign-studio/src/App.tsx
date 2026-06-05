import { ReactFlowProvider } from 'reactflow';
import { ArchitectureCanvas } from './components/ArchitectureCanvas';
import { ComponentPalette } from './components/ComponentPalette';
import { SimulationPlayer } from './components/SimulationPlayer';
import { Toolbar } from './components/Toolbar';
import { ReviewPanel } from './components/ReviewPanel';
import { useArchitectureStore } from './store/architectureStore';

function MainApp() {
  const { isReviewPanelOpen, toggleReviewPanel, nodes, edges } = useArchitectureStore();

  return (
    <div className="flex h-screen min-h-[640px] overflow-hidden bg-slate-100 text-slate-900 relative">
      <ComponentPalette />
      <main className="flex min-w-0 flex-1 flex-col">
        <Toolbar />
        <ArchitectureCanvas />
      </main>
      <SimulationPlayer />
      
      {isReviewPanelOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <ReviewPanel 
            architectureId="local" 
            nodes={nodes} 
            edges={edges} 
            onClose={toggleReviewPanel} 
          />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <MainApp />
    </ReactFlowProvider>
  );
}

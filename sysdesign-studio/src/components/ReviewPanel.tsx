import React, { useState } from 'react';
import { IconX } from '@tabler/icons-react';
// Assuming you have an axios instance setup, if not using native fetch
// import api from '../api'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface ArchitectureReview {
  issues: { severity: 'critical' | 'warning' | 'info'; component: string; message: string }[];
  recommendations: { title: string; description: string }[];
  score: number;
}

function ScoreRing({ score }: { score: number }) {
  const color = score > 80 ? 'text-green-500' : score > 50 ? 'text-yellow-500' : 'text-red-500';
  return (
    <svg className={`w-16 h-16 ${color}`} viewBox="0 0 36 36">
      <path
        className="text-gray-200"
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="text-current"
        strokeDasharray={`${score}, 100`}
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
    </svg>
  );
}

interface ReviewPanelProps {
  architectureId: string;
  nodes: any[];
  edges: any[];
  onClose?: () => void;
}

export function ReviewPanel({ architectureId, nodes, edges, onClose }: ReviewPanelProps) {
  const [review, setReview] = useState<ArchitectureReview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runReview = async () => {
    setLoading(true);
    setError(null);
    try {
      // Transform ReactFlow nodes to flat NodeDto format the backend expects
      // ReactFlow structure: { id, type: "infraNode", data: { type, label, latencyMs, replicas } }
      // Backend NodeDto:     { id, type, label, latencyMs, replicas }
      const mappedNodes = nodes.map((node: any) => ({
        id: node.id,
        type: node.data?.type ?? node.type,
        label: node.data?.label ?? node.id,
        latencyMs: node.data?.latencyMs ?? 20,
        replicas: node.data?.replicas ?? 1,
      }));

      const mappedEdges = edges.map((edge: any) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
      }));

      const response = await fetch(`${API_URL}/review/${architectureId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: mappedNodes, edges: mappedEdges }),
      });
      
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server error ${response.status}: ${errText}`);
      }
      
      const data = await response.json();
      setReview(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An error occurred while generating the review.');
    }
    setLoading(false);
  };

  const SEVERITY_STYLES = {
    critical: 'border-red-400 bg-red-50 text-red-800',
    warning:  'border-yellow-400 bg-yellow-50 text-yellow-800',
    info:     'border-blue-400 bg-blue-50 text-blue-800',
  };

  return (
    <div className="p-6 space-y-4 w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[85vh] overflow-y-auto studio-scrollbar">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Architecture Review</h2>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
            <IconX className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {nodes.length === 0 && (
        <div className="p-3 text-sm text-yellow-800 bg-yellow-50 border border-yellow-300 rounded-lg">
          ⚠️ Your canvas is empty. Drag some components (API Gateway, Database, etc.) onto the canvas first, then click Review.
        </div>
      )}

      <button 
        onClick={runReview} 
        disabled={loading || nodes.length === 0} 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Analyzing Architecture...' : '🤖 Review Architecture'}
      </button>

      {error && (
        <div className="p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {review && (
        <div className="mt-6 space-y-6 animate-in fade-in">
          {/* Score ring */}
          <div className="flex items-center justify-center gap-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
            <ScoreRing score={review.score ?? 0} />
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {review.score !== undefined && review.score !== null ? review.score : '--'}
                <span className="text-lg text-gray-400">/100</span>
              </div>
              <div className="text-sm text-gray-500 font-medium">Architecture health score</div>
            </div>
          </div>

          {/* Issues */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-900 dark:text-white">
              Issues 
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                {review.issues?.length || 0}
              </span>
            </h3>
            {review.issues?.length === 0 ? (
              <p className="text-gray-500 italic text-sm">No issues found!</p>
            ) : (
              review.issues?.map((issue, i) => (
                <div key={i} className={`border rounded-lg p-3 ${SEVERITY_STYLES[issue.severity]}`}>
                  <div className="flex items-center gap-2 font-medium">
                    <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-white/50">{issue.severity}</span>
                    <span className="text-sm">{issue.component}</span>
                  </div>
                  <p className="text-sm mt-2 opacity-90">{issue.message}</p>
                </div>
              ))
            )}
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-900 dark:text-white">
              Recommendations
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                {review.recommendations?.length || 0}
              </span>
            </h3>
            {review.recommendations?.length === 0 ? (
               <p className="text-gray-500 italic text-sm">No recommendations at this time.</p>
            ) : (
              review.recommendations?.map((rec, i) => (
                <details key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 group">
                  <summary className="font-medium cursor-pointer text-sm text-gray-800 dark:text-gray-200 outline-none">
                    {rec.title}
                  </summary>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                    {rec.description}
                  </p>
                </details>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReviewPanel } from './ReviewPanel';

// Mock Tabler Icons to avoid ESM parsing issues in Jest
jest.mock('@tabler/icons-react', () => ({
  IconX: () => <span data-testid="icon-x">X</span>
}));

describe('ReviewPanel Component', () => {
  const mockNodes = [
    { id: '1', type: 'infraNode', data: { type: 'api-gateway', label: 'Gateway' } },
    { id: '2', type: 'infraNode', data: { type: 'database', label: 'DB' } }
  ];
  const mockEdges = [{ id: 'e1-2', source: '1', target: '2' }];

  it('renders correctly and shows warning when canvas is empty', () => {
    render(<ReviewPanel architectureId="local" nodes={[]} edges={[]} />);

    expect(screen.getByText(/Architecture Review/i)).toBeInTheDocument();
    expect(screen.getByText(/Your canvas is empty/i)).toBeInTheDocument();
    
    const button = screen.getByRole('button', { name: /Review Architecture/i });
    expect(button).toBeDisabled();
  });

  it('allows clicking review button and rendering results when nodes are present', async () => {
    const mockResponse = {
      score: 80,
      issues: [
        { severity: 'warning', component: 'database', message: 'No cache layer detected before database.' }
      ],
      recommendations: [
        { title: 'Add Redis', description: 'Consider adding Redis caching.' }
      ]
    };

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })
    ) as jest.Mock;

    render(<ReviewPanel architectureId="local" nodes={mockNodes} edges={mockEdges} />);

    const button = screen.getByRole('button', { name: /Review Architecture/i });
    expect(button).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('No cache layer detected before database.')).toBeInTheDocument();
    expect(screen.getByText('Add Redis')).toBeInTheDocument();
  });

  it('renders loading state during active API review request', async () => {
    // Delay resolve to test the loading state
    let resolvePromise: (value: any) => void = () => {};
    const delayPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    global.fetch = jest.fn().mockImplementation(() =>
      delayPromise.then(() => ({
        ok: true,
        json: () => Promise.resolve({ score: 90, issues: [], recommendations: [] })
      }))
    ) as jest.Mock;

    render(<ReviewPanel architectureId="local" nodes={mockNodes} edges={mockEdges} />);

    const button = screen.getByRole('button', { name: /Review Architecture/i });
    
    await act(async () => {
      fireEvent.click(button);
    });

    // Verify loading text is rendered on the button
    expect(screen.getByText(/Analyzing Architecture\.\.\./i)).toBeInTheDocument();

    // Resolve the API call
    await act(async () => {
      resolvePromise(null);
    });

    // Loading should be gone, score shown
    expect(screen.queryByText(/Analyzing Architecture\.\.\./i)).not.toBeInTheDocument();
    expect(screen.getByText('90')).toBeInTheDocument();
  });

  it('handles and displays error message if API fails', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Database connection failed')
      })
    ) as jest.Mock;

    render(<ReviewPanel architectureId="local" nodes={mockNodes} edges={mockEdges} />);

    const button = screen.getByRole('button', { name: /Review Architecture/i });
    
    await act(async () => {
      fireEvent.click(button);
    });

    // Verify error message is rendered in the error box
    expect(screen.getByText(/Database connection failed/i)).toBeInTheDocument();
    expect(screen.queryByText('80')).not.toBeInTheDocument();
  });
});

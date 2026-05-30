import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import React from 'react';

// getData HOC imports axiosConfig from '../../helper' barrel (named export)
// We must mock the helper barrel so the HOC picks up our mock
vi.mock('../helper/index', () => ({
  axiosConfig: { get: vi.fn() },
  chartColors: {}
}));

// Mock chart.js and react-chartjs-2 to avoid canvas issues in jsdom
vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
  SubTitle: vi.fn()
}));

vi.mock('react-chartjs-2', () => ({
  Bar: vi.fn(() => <canvas data-testid="bar-chart" />)
}));

// Import AFTER vi.mock declarations
import { axiosConfig } from '../helper/index';
import Award from '../components/pages/Award';

const mockGet = vi.mocked(axiosConfig.get);

const sampleAwardData = [
  { _id: 'aw1', name: 'Academy Award', length: 5 },
  { _id: 'aw2', name: 'Golden Globe', length: 3 }
];

describe('Award page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that the Award page renders without crashing.
   */
  it('should render without crashing', async () => {
    mockGet.mockResolvedValue({ data: sampleAwardData } as any);
    await act(async () => {
      render(<Award />);
    });
    expect(document.body).toBeTruthy();
  });

  /**
   * Verifies that the Award page calls the movie awards API endpoint.
   */
  it('should call the movie awards API endpoint', async () => {
    mockGet.mockResolvedValue({ data: sampleAwardData } as any);
    await act(async () => {
      render(<Award />);
    });
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/movieAwards'),
        expect.anything()
      );
    });
  });

  /**
   * Verifies that the Award page shows a loading state initially.
   */
  it('should show loading state while fetching data', () => {
    mockGet.mockReturnValue(new Promise(() => {}) as any);
    render(<Award />);
    expect(document.querySelector('[role="progressbar"]')).not.toBeNull();
  });

  /**
   * Verifies that the Award page handles an API error gracefully
   * without crashing the component.
   */
  it('should handle API error gracefully without crashing', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);
    expect(() => render(<Award />)).not.toThrow();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
  });

  /**
   * Verifies that the Award page shows an error message when fetch fails.
   */
  it('should show error message when fetch fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);
    await act(async () => {
      render(<Award />);
    });
    await waitFor(() => {
      expect(screen.getByText(/Failed to load data/i)).toBeInTheDocument();
    });
  });

  /**
   * Verifies that the Award page renders chart after successful data fetch.
   */
  it('should render chart after successful data fetch', async () => {
    mockGet.mockResolvedValue({ data: sampleAwardData } as any);
    await act(async () => {
      render(<Award />);
    });
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });
});

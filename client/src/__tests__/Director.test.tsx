import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// ─── Mock all dependencies ────────────────────────────────────────────────────────────────────
vi.mock('../helper/axiosConfig', () => ({
  default: { get: vi.fn() }
}));

vi.mock('../components/templates/ChartContainer', () => ({
  ChartContainer: vi.fn(({ data, title }: any) => (
    <div data-testid="chart-container">
      <span data-testid="chart-title">{title}</span>
      <span data-testid="chart-data">{JSON.stringify(data)}</span>
    </div>
  ))
}));

// ─── Import mocked modules AFTER vi.mock declarations ─────────────────────────
import axiosConfig from '../helper/axiosConfig';
import Director from '../components/pages/Director';

const mockGet = vi.mocked(axiosConfig.get);

const sampleDirectorData = [
  { _id: 'd1', name: 'Christopher Nolan', length: 10 },
  { _id: 'd2', name: 'Steven Spielberg', length: 8 }
];

describe('Director page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that the Director page renders the ChartContainer
   * after fetching data from the directors count API.
   */
  it('should render the ChartContainer after fetching data', async () => {
    mockGet.mockResolvedValue({ data: sampleDirectorData } as any);

    render(<Director />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  /**
   * Verifies that the Director page calls the directors count API endpoint.
   */
  it('should call the directors count API endpoint', async () => {
    mockGet.mockResolvedValue({ data: sampleDirectorData } as any);

    render(<Director />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/directorsCount'),
        expect.anything()
      );
    });
  });

  /**
   * Verifies that the Director page passes the correct title to ChartContainer.
   */
  it('should pass the correct title to ChartContainer', async () => {
    mockGet.mockResolvedValue({ data: sampleDirectorData } as any);

    render(<Director />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-title')).toHaveTextContent('Directors');
    });
  });

  /**
   * Verifies that the Director page handles an API error gracefully
   * without crashing the component.
   */
  it('should handle API error gracefully without crashing', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);

    expect(() => render(<Director />)).not.toThrow();
  });

  /**
   * Verifies that the Director page renders without crashing when
   * the API returns an empty array.
   */
  it('should render without crashing when API returns empty array', async () => {
    mockGet.mockResolvedValue({ data: [] } as any);

    render(<Director />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });
});

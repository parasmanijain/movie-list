import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// ─── Mock all dependencies ────────────────────────────────────────────────────────────────────
vi.mock('../helper/axiosConfig', () => ({
  default: { get: vi.fn() }
}));

// Mock ChartContainer to avoid rendering complexity
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
import Award from '../components/pages/Award';

const mockGet = vi.mocked(axiosConfig.get);

const sampleAwardData = [
  { _id: 'aw1', name: 'Academy Award', category: [{ name: 'Best Picture', length: 5 }] },
  { _id: 'aw2', name: 'Golden Globe', category: [{ name: 'Best Drama', length: 3 }] }
];

describe('Award page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that the Award page renders the ChartContainer
   * after fetching data from the movie awards API.
   */
  it('should render the ChartContainer after fetching data', async () => {
    mockGet.mockResolvedValue({ data: sampleAwardData } as any);

    render(<Award />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  /**
   * Verifies that the Award page calls the movie awards API endpoint.
   */
  it('should call the movie awards API endpoint', async () => {
    mockGet.mockResolvedValue({ data: sampleAwardData } as any);

    render(<Award />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/movieAwards'),
        expect.anything()
      );
    });
  });

  /**
   * Verifies that the Award page passes the correct title to ChartContainer.
   */
  it('should pass the correct title to ChartContainer', async () => {
    mockGet.mockResolvedValue({ data: sampleAwardData } as any);

    render(<Award />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-title')).toHaveTextContent('Movies');
    });
  });

  /**
   * Verifies that the Award page handles an API error gracefully
   * without crashing the component.
   */
  it('should handle API error gracefully without crashing', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);

    expect(() => render(<Award />)).not.toThrow();
  });

  /**
   * Verifies that the Award page renders without crashing when
   * the API returns an empty array.
   */
  it('should render without crashing when API returns empty array', async () => {
    mockGet.mockResolvedValue({ data: [] } as any);

    render(<Award />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });
});

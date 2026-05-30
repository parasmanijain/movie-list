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
import Franchise from '../components/pages/Franchise';

const mockGet = vi.mocked(axiosConfig.get);

const sampleFranchiseData = [
  { _id: 'f1', name: 'The Dark Knight', length: 3 },
  { _id: 'f2', name: 'Avengers', length: 4 }
];

describe('Franchise page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that the Franchise page renders the ChartContainer
   * after fetching data from the franchises count API.
   */
  it('should render the ChartContainer after fetching data', async () => {
    mockGet.mockResolvedValue({ data: sampleFranchiseData } as any);

    render(<Franchise />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  /**
   * Verifies that the Franchise page calls the franchises count API endpoint.
   */
  it('should call the franchises count API endpoint', async () => {
    mockGet.mockResolvedValue({ data: sampleFranchiseData } as any);

    render(<Franchise />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/franchisesCount'),
        expect.anything()
      );
    });
  });

  /**
   * Verifies that the Franchise page passes the correct title to ChartContainer.
   */
  it('should pass the correct title to ChartContainer', async () => {
    mockGet.mockResolvedValue({ data: sampleFranchiseData } as any);

    render(<Franchise />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-title')).toHaveTextContent('Franchises');
    });
  });

  /**
   * Verifies that the Franchise page handles an API error gracefully
   * without crashing the component.
   */
  it('should handle API error gracefully without crashing', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);

    expect(() => render(<Franchise />)).not.toThrow();
  });

  /**
   * Verifies that the Franchise page renders without crashing when
   * the API returns an empty array.
   */
  it('should render without crashing when API returns empty array', async () => {
    mockGet.mockResolvedValue({ data: [] } as any);

    render(<Franchise />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });
});

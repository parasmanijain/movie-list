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
import Universe from '../components/pages/Universe';

const mockGet = vi.mocked(axiosConfig.get);

const sampleUniverseData = [
  { _id: 'u1', name: 'Marvel Cinematic Universe', length: 30 },
  { _id: 'u2', name: 'DC Extended Universe', length: 15 }
];

describe('Universe page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that the Universe page renders the ChartContainer
   * after fetching data from the universes count API.
   */
  it('should render the ChartContainer after fetching data', async () => {
    mockGet.mockResolvedValue({ data: sampleUniverseData } as any);

    render(<Universe />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  /**
   * Verifies that the Universe page calls the universes count API endpoint.
   */
  it('should call the universes count API endpoint', async () => {
    mockGet.mockResolvedValue({ data: sampleUniverseData } as any);

    render(<Universe />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/universesCount'),
        expect.anything()
      );
    });
  });

  /**
   * Verifies that the Universe page passes the correct title to ChartContainer.
   */
  it('should pass the correct title to ChartContainer', async () => {
    mockGet.mockResolvedValue({ data: sampleUniverseData } as any);

    render(<Universe />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-title')).toHaveTextContent('Universes');
    });
  });

  /**
   * Verifies that the Universe page handles an API error gracefully
   * without crashing the component.
   */
  it('should handle API error gracefully without crashing', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);

    expect(() => render(<Universe />)).not.toThrow();
  });

  /**
   * Verifies that the Universe page renders without crashing when
   * the API returns an empty array.
   */
  it('should render without crashing when API returns empty array', async () => {
    mockGet.mockResolvedValue({ data: [] } as any);

    render(<Universe />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });
});

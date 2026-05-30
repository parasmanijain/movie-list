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
import Genre from '../components/pages/Genre';

const mockGet = vi.mocked(axiosConfig.get);

const sampleGenreData = [
  { _id: 'g1', name: 'Action', length: 15 },
  { _id: 'g2', name: 'Drama', length: 12 }
];

describe('Genre page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that the Genre page renders the ChartContainer
   * after fetching data from the genres count API.
   */
  it('should render the ChartContainer after fetching data', async () => {
    mockGet.mockResolvedValue({ data: sampleGenreData } as any);

    render(<Genre />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  /**
   * Verifies that the Genre page calls the genres count API endpoint.
   */
  it('should call the genres count API endpoint', async () => {
    mockGet.mockResolvedValue({ data: sampleGenreData } as any);

    render(<Genre />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/genresCount'),
        expect.anything()
      );
    });
  });

  /**
   * Verifies that the Genre page passes the correct title to ChartContainer.
   */
  it('should pass the correct title to ChartContainer', async () => {
    mockGet.mockResolvedValue({ data: sampleGenreData } as any);

    render(<Genre />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-title')).toHaveTextContent('Genres');
    });
  });

  /**
   * Verifies that the Genre page handles an API error gracefully
   * without crashing the component.
   */
  it('should handle API error gracefully without crashing', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);

    expect(() => render(<Genre />)).not.toThrow();
  });

  /**
   * Verifies that the Genre page renders without crashing when
   * the API returns an empty array.
   */
  it('should render without crashing when API returns empty array', async () => {
    mockGet.mockResolvedValue({ data: [] } as any);

    render(<Genre />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });
});

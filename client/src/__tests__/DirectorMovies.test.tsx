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
import DirectorMovies from '../components/pages/DirectorMovies';

const mockGet = vi.mocked(axiosConfig.get);

const sampleDirectorMoviesData = [
  { _id: 1, movie_count: 1, director_count: 5 },
  { _id: 2, movie_count: 2, director_count: 3 }
];

describe('DirectorMovies page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that the DirectorMovies page renders the ChartContainer
   * after fetching data from the movies count API.
   */
  it('should render the ChartContainer after fetching data', async () => {
    mockGet.mockResolvedValue({ data: sampleDirectorMoviesData } as any);

    render(<DirectorMovies />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  /**
   * Verifies that the DirectorMovies page calls the movies count API endpoint.
   */
  it('should call the movies count API endpoint', async () => {
    mockGet.mockResolvedValue({ data: sampleDirectorMoviesData } as any);

    render(<DirectorMovies />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/moviesCount'),
        expect.anything()
      );
    });
  });

  /**
   * Verifies that the DirectorMovies page passes the correct title to ChartContainer.
   */
  it('should pass the correct title to ChartContainer', async () => {
    mockGet.mockResolvedValue({ data: sampleDirectorMoviesData } as any);

    render(<DirectorMovies />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-title')).toHaveTextContent('Director Movies');
    });
  });

  /**
   * Verifies that the DirectorMovies page handles an API error gracefully
   * without crashing the component.
   */
  it('should handle API error gracefully without crashing', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);

    expect(() => render(<DirectorMovies />)).not.toThrow();
  });

  /**
   * Verifies that the DirectorMovies page renders without crashing when
   * the API returns an empty array.
   */
  it('should render without crashing when API returns empty array', async () => {
    mockGet.mockResolvedValue({ data: [] } as any);

    render(<DirectorMovies />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });
});

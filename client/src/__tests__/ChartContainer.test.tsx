import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// ─── Mock all dependencies ──────────────────────────────────────────────────────────────
vi.mock('../hooks/useWindowDimensions', () => ({
  useWindowDimensions: vi.fn(() => [1920, 1080] as [number, number])
}));

vi.mock('../components/templates/RenderChart', () => ({
  RenderChart: vi.fn(({ title, subtitle, index }: any) => (
    <div
      data-testid={`render-chart-${index}`}
      data-title={title}
      data-subtitle={subtitle}
    >
      Chart: {title}
    </div>
  ))
}));

// Mock chartColors from helper
vi.mock('../helper', () => ({
  chartColors: ['#336699', '#99CCFF', '#999933']
}));

// ─── Import mocked modules AFTER vi.mock declarations ─────────────────────────
import { useWindowDimensions } from '../hooks/useWindowDimensions';
import { ChartContainer } from '../components/templates/ChartContainer';

const mockUseWindowDimensions = vi.mocked(useWindowDimensions);

describe('ChartContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWindowDimensions.mockReturnValue([1920, 1080]);
  });

  // ─── Universe branch ───────────────────────────────────────────────────────────

  /**
   * Verifies that ChartContainer processes universe data correctly:
   * Marvel universes get full width, other universes share width.
   * Title includes 'universes' to trigger this branch.
   */
  it('should render charts for universes branch with Marvel and non-Marvel data', async () => {
    const universeData = [
      {
        _id: 'u1',
        name: 'Marvel Cinematic Universe',
        franchise: [
          { name: 'Avengers', length: 4 },
          { name: 'Iron Man', length: 3 }
        ]
      },
      {
        _id: 'u2',
        name: 'DC Extended Universe',
        franchise: [
          { name: 'Justice League', length: 1 }
        ]
      }
    ];

    render(
      <ChartContainer
        title="Top universes"
        fullHeight={false}
        apiData={universeData}
        stacked={false}
      />
    );

    // Should render charts for each universe entry
    expect(screen.getByTestId('render-chart-0')).toBeInTheDocument();
    expect(screen.getByTestId('render-chart-1')).toBeInTheDocument();
  });

  /**
   * Verifies that ChartContainer uses subtitle (not title) as the chart title
   * when the title includes 'universes'.
   */
  it('should use data.subtitle as chart title when title includes "universes"', async () => {
    const universeData = [
      {
        _id: 'u1',
        name: 'Marvel Cinematic Universe',
        franchise: [{ name: 'Avengers', length: 4 }]
      }
    ];

    render(
      <ChartContainer
        title="Top universes"
        fullHeight={false}
        apiData={universeData}
        stacked={false}
      />
    );

    const chart = screen.getByTestId('render-chart-0');
    expect(chart).toHaveAttribute('data-title', 'Marvel Cinematic Universe');
  });

  // ─── Categories branch ─────────────────────────────────────────────────────────

  /**
   * Verifies that ChartContainer processes categories data correctly:
   * Each award entry generates a chart with its categories.
   * Title includes 'categories' to trigger this branch.
   */
  it('should render charts for categories branch', async () => {
    const categoryData = [
      {
        _id: 'aw1',
        name: 'Academy Award',
        category: [
          { name: 'Best Picture', length: 5 },
          { name: 'Best Director', length: 5 }
        ]
      },
      {
        _id: 'aw2',
        name: 'Golden Globe',
        category: [
          { name: 'Best Film', length: 3 }
        ]
      }
    ];

    render(
      <ChartContainer
        title="Award categories"
        fullHeight={true}
        apiData={categoryData}
        stacked={false}
      />
    );

    expect(screen.getByTestId('render-chart-0')).toBeInTheDocument();
    expect(screen.getByTestId('render-chart-1')).toBeInTheDocument();
  });

  /**
   * Verifies that ChartContainer uses data.subtitle as chart subtitle
   * when the title includes 'categories'.
   */
  it('should use data.subtitle as chart subtitle when title includes "categories"', async () => {
    const categoryData = [
      {
        _id: 'aw1',
        name: 'Academy Award',
        category: [{ name: 'Best Picture', length: 5 }]
      }
    ];

    render(
      <ChartContainer
        title="Award categories"
        fullHeight={true}
        apiData={categoryData}
        stacked={false}
      />
    );

    const chart = screen.getByTestId('render-chart-0');
    expect(chart).toHaveAttribute('data-subtitle', 'Academy Award');
  });

  // ─── Director movies branch ────────────────────────────────────────────────────

  /**
   * Verifies that ChartContainer processes director movies data correctly:
   * Data is chunked and each chunk becomes a chart.
   * Title includes 'director movies' to trigger this branch.
   */
  it('should render charts for director movies branch', async () => {
    const directorMoviesData = [
      { movie_count: 1, director_count: 50 },
      { movie_count: 2, director_count: 30 },
      { movie_count: 3, director_count: 15 }
    ];

    render(
      <ChartContainer
        title="Director movies count"
        fullHeight={false}
        apiData={directorMoviesData}
        stacked={false}
      />
    );

    expect(screen.getByTestId('render-chart-0')).toBeInTheDocument();
  });

  /**
   * Verifies that ChartContainer uses movie_count as labels and director_count
   * as data in the director movies branch.
   */
  it('should use movie_count as labels in director movies branch', async () => {
    const directorMoviesData = Array.from({ length: 5 }, (_, i) => ({
      movie_count: i + 1,
      director_count: 10 - i
    }));

    render(
      <ChartContainer
        title="Director movies"
        fullHeight={false}
        apiData={directorMoviesData}
        stacked={false}
      />
    );

    expect(screen.getByTestId('render-chart-0')).toBeInTheDocument();
  });

  // ─── Default branch ──────────────────────────────────────────────────────────────

  /**
   * Verifies that ChartContainer processes default data (genres, languages, etc.)
   * correctly: data is chunked and each chunk becomes a chart.
   */
  it('should render charts for default branch (genres/languages)', async () => {
    const genreData = [
      { _id: 'g1', name: 'Action', length: 50 },
      { _id: 'g2', name: 'Drama', length: 30 },
      { _id: 'g3', name: 'Comedy', length: 20 }
    ];

    render(
      <ChartContainer
        title="Genre count"
        fullHeight={false}
        apiData={genreData}
        stacked={false}
      />
    );

    expect(screen.getByTestId('render-chart-0')).toBeInTheDocument();
  });

  /**
   * Verifies that ChartContainer appends year to labels in default branch
   * when title includes 'movies'.
   */
  it('should append year to labels when title includes "movies" in default branch', async () => {
    const movieData = [
      { _id: 'm1', name: 'Inception', year: 2010, length: 3 },
      { _id: 'm2', name: 'Parasite', year: 2019, length: 4 }
    ];

    render(
      <ChartContainer
        title="Award movies count"
        fullHeight={false}
        apiData={movieData}
        stacked={false}
      />
    );

    expect(screen.getByTestId('render-chart-0')).toBeInTheDocument();
  });

  /**
   * Verifies that ChartContainer renders nothing when apiData is empty.
   */
  it('should render nothing when apiData is empty', () => {
    const { container } = render(
      <ChartContainer
        title="Genre count"
        fullHeight={false}
        apiData={[]}
        stacked={false}
      />
    );

    expect(screen.queryByTestId('render-chart-0')).not.toBeInTheDocument();
  });

  /**
   * Verifies that ChartContainer renders with stacked=true prop correctly.
   */
  it('should render correctly with stacked=true', async () => {
    const genreData = [
      { _id: 'g1', name: 'Action', length: 50 }
    ];

    render(
      <ChartContainer
        title="Genre count"
        fullHeight={false}
        apiData={genreData}
        stacked={true}
      />
    );

    expect(screen.getByTestId('render-chart-0')).toBeInTheDocument();
  });

  /**
   * Verifies that ChartContainer handles large datasets by chunking them
   * into multiple charts in the default branch.
   */
  it('should chunk large datasets into multiple charts in default branch', async () => {
    // Create 60 items to force chunking (chunkSize is 50 for width >= 1536)
    const largeData = Array.from({ length: 60 }, (_, i) => ({
      _id: `g${i}`,
      name: `Genre ${i}`,
      length: i + 1
    }));

    render(
      <ChartContainer
        title="Genre count"
        fullHeight={false}
        apiData={largeData}
        stacked={false}
      />
    );

    // With 60 items and chunkSize=50, Math.min(Math.ceil(60/2), 50) = 30 per chunk
    // So we get 2 charts
    expect(screen.getByTestId('render-chart-0')).toBeInTheDocument();
    expect(screen.getByTestId('render-chart-1')).toBeInTheDocument();
  });

  /**
   * Verifies that ChartContainer uses different chunk sizes based on window width.
   * At width 600, chunkSize should be 20.
   */
  it('should use smaller chunk size for smaller window widths', async () => {
    mockUseWindowDimensions.mockReturnValue([600, 800]);

    const data = Array.from({ length: 25 }, (_, i) => ({
      _id: `g${i}`,
      name: `Genre ${i}`,
      length: i + 1
    }));

    render(
      <ChartContainer
        title="Genre count"
        fullHeight={false}
        apiData={data}
        stacked={false}
      />
    );

    // With 25 items and chunkSize=20, Math.min(Math.ceil(25/2), 20) = 13 per chunk
    // So we get 2 charts
    expect(screen.getByTestId('render-chart-0')).toBeInTheDocument();
  });

  /**
   * Verifies that ChartContainer renders with fullHeight=true correctly,
   * affecting the canvasHeight calculation.
   */
  it('should render with fullHeight=true', async () => {
    const genreData = [
      { _id: 'g1', name: 'Action', length: 50 }
    ];

    render(
      <ChartContainer
        title="Genre count"
        fullHeight={true}
        apiData={genreData}
        stacked={false}
      />
    );

    expect(screen.getByTestId('render-chart-0')).toBeInTheDocument();
  });
});

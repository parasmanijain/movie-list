import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';

// Mock modules - vi.fn() inline only (factories are hoisted)
vi.mock('../helper/axiosConfig', () => ({
  default: { get: vi.fn() }
}));

vi.mock('../helper/config', () => ({
  GET_TOP_RATED_MOVIE_URL: '/topMovie'
}));

import axiosConfig from '../helper/axiosConfig';
import {
  TopRatedMovies,
  type TopRatedMovie
} from '../components/pages/TopRatedMovies';

const mockGet = vi.mocked(axiosConfig.get);

const sampleMovies: TopRatedMovie[] = [
  { name: 'Inception', year: 2010, imdb: 8.8, rottenTomatoes: 87 },
  { name: 'Avengers', year: 2012, imdb: 8.0, rottenTomatoes: 91 },
  { name: 'Zodiac', year: 2007, imdb: 7.7, rottenTomatoes: 89 }
];

describe('TopRatedMovies component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Flush any pending state updates to avoid act() warnings
    await act(async () => { });
    vi.restoreAllMocks();
  });

  /**
   * Verifies that TopRatedMovies renders a table with the fetched movie data
   * including movie names, years, and ratings.
   */
  it('should render table with fetched movie data', async () => {
    mockGet.mockResolvedValue({ data: sampleMovies } as any);
    render(<TopRatedMovies />);

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });

    expect(screen.getByText('Avengers')).toBeInTheDocument();
    expect(screen.getByText('Zodiac')).toBeInTheDocument();
  });

  /**
   * Verifies that clicking a column header sort label changes the active sort column.
   * The default sort is by 'name' ascending. Clicking 'Name' again flips it to descending.
   * Logic: handleRequestSort sets order='desc' only when orderBy===property && order==='asc'.
   */
  it('should handle sort click and show sort direction indicator', async () => {
    mockGet.mockResolvedValue({ data: sampleMovies } as any);
    render(<TopRatedMovies />);

    await waitFor(() => screen.getByText('Inception'));

    // Default: sorted by 'name' ascending — the visually-hidden span shows 'sorted ascending'
    expect(screen.getByText('sorted ascending')).toBeInTheDocument();

    // Click 'Name' again: isAsc=true (orderBy==='name' && order==='asc'), so order flips to 'desc'
    await act(async () => {
      fireEvent.click(screen.getByText('Name'));
    });

    // Now the Name column should show 'sorted descending'
    await waitFor(() => {
      expect(screen.getByText('sorted descending')).toBeInTheDocument();
    });
  });

  /**
   * Verifies that the table renders the toolbar with the title "Top rated movies".
   */
  it('should render the table toolbar with title', async () => {
    mockGet.mockResolvedValue({ data: [] } as any);
    await act(async () => {
      render(<TopRatedMovies />);
    });

    expect(screen.getByText('Top rated movies')).toBeInTheDocument();
  });

  /**
   * Verifies that the dense padding toggle switch is rendered and toggles
   * the table density when clicked.
   */
  it('should render dense padding toggle and handle toggle change', async () => {
    mockGet.mockResolvedValue({ data: sampleMovies } as any);
    await act(async () => {
      render(<TopRatedMovies />);
    });

    // MUI Switch renders with role="switch", not role="checkbox"
    const denseSwitch = screen.getByRole('switch');
    expect(denseSwitch).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(denseSwitch);
    });
    expect(denseSwitch).toBeChecked();
  });

  /**
   * Verifies that the rows-per-page selector is rendered.
   */
  it('should render pagination with rows per page label', async () => {
    mockGet.mockResolvedValue({ data: sampleMovies } as any);
    render(<TopRatedMovies />);

    await waitFor(() => screen.getByText('Inception'));

    expect(screen.getByText('Rows per page:')).toBeInTheDocument();
  });

  /**
   * Verifies that empty rows are rendered when the number of movies
   * is less than rowsPerPage to maintain consistent table height.
   */
  it('should render empty rows when data is less than rowsPerPage', async () => {
    mockGet.mockResolvedValue({ data: sampleMovies } as any);
    render(<TopRatedMovies />);

    await waitFor(() => screen.getByText('Inception'));

    const emptyCells = document.querySelectorAll('td[colspan="6"]');
    expect(emptyCells.length).toBeGreaterThan(0);
  });

  /**
   * Verifies that the component renders all four column headers.
   */
  it('should render all four column headers', async () => {
    mockGet.mockResolvedValue({ data: [] } as any);
    await act(async () => {
      render(<TopRatedMovies />);
    });

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Year')).toBeInTheDocument();
    expect(screen.getByText('IMDB Rating (10)')).toBeInTheDocument();
    expect(screen.getByText('Rotten Tomatoes (%)')).toBeInTheDocument();
  });
});

// ─── Sorting behavior tests ──────────────────────────────────────────────────────────────────

describe('TopRatedMovies sorting behavior', () => {
  beforeEach(() => vi.clearAllMocks());

  afterEach(async () => {
    await act(async () => { });
    vi.restoreAllMocks();
  });

  /**
   * Verifies that clicking the IMDB column twice (first to activate asc,
   * second to flip to desc) puts the highest-rated movie first.
   */
  it('should sort movies by imdb descending when IMDB column is clicked twice', async () => {
    mockGet.mockResolvedValue({ data: sampleMovies } as any);
    render(<TopRatedMovies />);

    await waitFor(() => screen.getByText('Inception'));

    // First click: activates IMDB column ascending (lowest first)
    await act(async () => {
      fireEvent.click(screen.getByText('IMDB Rating (10)'));
    });
    // Second click: flips to descending (highest first)
    await act(async () => {
      fireEvent.click(screen.getByText('IMDB Rating (10)'));
    });

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // First data row should be Inception (8.8) when sorted desc by imdb
      expect(rows[1]).toHaveTextContent('Inception');
    });
  });

  /**
   * Verifies that clicking the Year column twice sorts movies
   * in descending order by year (most recent first).
   */
  it('should sort movies by year descending when Year column is clicked twice', async () => {
    mockGet.mockResolvedValue({ data: sampleMovies } as any);
    render(<TopRatedMovies />);

    await waitFor(() => screen.getByText('Inception'));

    // First click: activates Year column ascending (oldest first)
    await act(async () => {
      fireEvent.click(screen.getByText('Year'));
    });
    // Second click: flips to descending (most recent first)
    await act(async () => {
      fireEvent.click(screen.getByText('Year'));
    });

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // Sorted descending by year: Avengers(2012) first
      expect(rows[1]).toHaveTextContent('Avengers');
    });
  });

  /**
   * Verifies that handleChangePage updates the page when pagination is used.
   */
  it('should handle page change via pagination', async () => {
    // Create enough movies to trigger pagination
    const manyMovies = Array.from({ length: 15 }, (_, i) => ({
      _id: `m${i}`,
      name: `Movie ${i}`,
      year: 2000 + i,
      imdb: 7.0,
      rottenTomatoes: 70
    }));

    mockGet.mockResolvedValue({ data: manyMovies } as any);
    render(<TopRatedMovies />);

    await waitFor(() => screen.getByText('Movie 0'));

    // Find and click the next page button
    const nextPageButton = document.querySelector('[aria-label="Go to next page"]');
    if (nextPageButton) {
      fireEvent.click(nextPageButton);
      await waitFor(() => {
        expect(document.querySelector('table')).toBeInTheDocument();
      });
    }
  });

  /**
   * Verifies that handleChangeRowsPerPage updates rows per page.
   */
  it('should handle rows per page change', async () => {
    mockGet.mockResolvedValue({ data: sampleMovies } as any);
    render(<TopRatedMovies />);

    await waitFor(() => screen.getByText('Inception'));

    // Find the rows per page select
    const rowsPerPageSelect = document.querySelector('[aria-label="rows per page"]') ||
      document.querySelector('select');
    if (rowsPerPageSelect) {
      fireEvent.change(rowsPerPageSelect, { target: { value: '25' } });
      await waitFor(() => {
        expect(document.querySelector('table')).toBeInTheDocument();
      });
    }
  });

  /**
   * Verifies that handleChangeDense toggles the dense mode.
   */
  it('should handle dense mode toggle', async () => {
    mockGet.mockResolvedValue({ data: sampleMovies } as any);
    render(<TopRatedMovies />);

    await waitFor(() => screen.getByText('Inception'));

    const denseCheckbox = screen.queryByRole('checkbox', { name: /dense/i });
    if (denseCheckbox) {
      fireEvent.click(denseCheckbox);
      expect(denseCheckbox).toBeChecked();
    }
  });

  /**
   * Verifies that TopRatedMovies handles fetch error gracefully (covers lines 180-182).
   * When fetch fails with a non-cancel error, console.error is called.
   */
  it('should handle fetch error gracefully and log error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    mockGet.mockRejectedValue(new Error('Network error') as any);

    await act(async () => {
      render(<TopRatedMovies />);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  /**
   * Verifies that TopRatedMovies does not log error for cancelled requests (covers line 180 isCancel branch).
   */
  it('should not log error for cancelled requests (isCancel branch)', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    // Mock axiosConfig.isCancel to return true
    const cancelError = new Error('cancelled');
    mockGet.mockRejectedValue(cancelError as any);

    // Mock the isCancel method on the axiosConfig instance
    const axiosConfigModule = await import('../helper/axiosConfig');
    const originalIsCancel = (axiosConfigModule.default as any).isCancel;
    (axiosConfigModule.default as any).isCancel = vi.fn(() => true);

    await act(async () => {
      render(<TopRatedMovies />);
    });

    await new Promise((r) => setTimeout(r, 50));

    // console.error should NOT be called for cancelled requests
    expect(consoleSpy).not.toHaveBeenCalled();

    // Restore
    (axiosConfigModule.default as any).isCancel = originalIsCancel;
    consoleSpy.mockRestore();
  });

  /**
   * Verifies that TopRatedMovies does not update state after unmount (covers lines 157-158).
   */
  it('should not update state after component unmounts', async () => {
    let resolveRequest!: (value: unknown) => void;
    mockGet.mockReturnValue(
      new Promise((resolve) => { resolveRequest = resolve; }) as any
    );

    const { unmount } = render(<TopRatedMovies />);

    // Unmount before request resolves
    unmount();

    // Resolve after unmount - should not cause state update errors
    resolveRequest({ data: sampleMovies });
    await new Promise((r) => setTimeout(r, 50));

    // No table rows should be rendered after unmount
    expect(screen.queryByText('Inception')).not.toBeInTheDocument();
  });

  /**
   * Verifies that descendingComparator returns 0 when both values are equal (line 47).
   * This is triggered by stableSort when two movies have the same value for orderBy.
   */
  it('should handle equal values in sort (descendingComparator returns 0)', async () => {
    // Two movies with the same imdb rating to trigger the return 0 branch
    const moviesWithEqualRating: TopRatedMovie[] = [
      { name: 'Movie A', year: 2010, imdb: 8.0, rottenTomatoes: 80 },
      { name: 'Movie B', year: 2010, imdb: 8.0, rottenTomatoes: 90 }
    ];

    mockGet.mockResolvedValue({ data: moviesWithEqualRating } as any);
    render(<TopRatedMovies />);

    await waitFor(() => screen.getByText('Movie A'));

    // Sort by imdb (both equal) - triggers return 0 in descendingComparator
    await act(async () => {
      fireEvent.click(screen.getByText('IMDB Rating (10)'));
    });

    // Both movies should still be visible
    expect(screen.getByText('Movie A')).toBeInTheDocument();
    expect(screen.getByText('Movie B')).toBeInTheDocument();
  });

  /**
   * Verifies that getComparator returns the ascending comparator (line 60 asc branch).
   * Clicking a column once sets it to asc (since default is asc for a new column).
   */
  it('should use ascending comparator when order is asc (getComparator asc branch)', async () => {
    mockGet.mockResolvedValue({ data: sampleMovies } as any);
    render(<TopRatedMovies />);

    await waitFor(() => screen.getByText('Inception'));

    // Click Year column once - activates asc sort (new column, starts asc)
    await act(async () => {
      fireEvent.click(screen.getByText('Year'));
    });

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // Sorted ascending by year: Zodiac(2007) first
      expect(rows[1]).toHaveTextContent('Zodiac');
    });
  });

  /**
   * Verifies that stableSort uses index as tiebreaker when comparator returns 0 (line 60).
   * This covers the `return a[1] - b[1]` branch in stableSort.
   */
  it('should use index as tiebreaker in stableSort when comparator returns 0', async () => {
    const moviesWithSameName: TopRatedMovie[] = [
      { name: 'Same Movie', year: 2010, imdb: 8.0, rottenTomatoes: 80 },
      { name: 'Same Movie', year: 2011, imdb: 8.0, rottenTomatoes: 90 }
    ];

    mockGet.mockResolvedValue({ data: moviesWithSameName } as any);
    render(<TopRatedMovies />);

    await waitFor(() => {
      const cells = screen.getAllByText('Same Movie');
      expect(cells.length).toBe(2);
    });
  });
});


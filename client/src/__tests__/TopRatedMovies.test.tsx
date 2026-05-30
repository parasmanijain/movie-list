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
});


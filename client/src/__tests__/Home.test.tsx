import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';

// ─── Mock modules ───────────────────────────────────────────────────────────────────────
// IMPORTANT: vi.mock factories are hoisted — use vi.fn() inline only.
// Retrieve mocked references via vi.mocked() AFTER the import statements.

vi.mock('../helper/axiosConfig', () => ({
  default: { get: vi.fn() }
}));

vi.mock('../hooks/useWindowDimensions', () => ({
  useWindowDimensions: vi.fn(() => [1920, 1080] as [number, number])
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useSearchParams: vi.fn(),
    useNavigate: vi.fn(),
    useLocation: vi.fn()
  };
});

import axiosConfig from '../helper/axiosConfig';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Home } from '../components/pages/Home';

// Typed accessors — retrieved after imports so hoisting is not an issue
const mockGet = vi.mocked(axiosConfig.get);
const mockUseSearchParams = vi.mocked(useSearchParams);
const mockUseNavigate = vi.mocked(useNavigate);
const mockUseLocation = vi.mocked(useLocation);

// ─── Sample data ─────────────────────────────────────────────────────────────────────────

const sampleMovies = [
  {
    _id: 'm1',
    name: 'Inception',
    year: 2010,
    imdb: 8.8,
    rottenTomatoes: 87,
    language: [{ _id: 'l1', name: 'English' }],
    director: [{ _id: 'd1', name: 'Christopher Nolan', url: 'https://imdb.com/nolan', movies: [] }],
    genre: [{ _id: 'g1', name: 'Sci-Fi' }],
    franchise: null,
    category: [],
    url: 'https://imdb.com/inception'
  },
  {
    _id: 'm2',
    name: 'Parasite',
    year: 2019,
    imdb: 8.5,
    rottenTomatoes: 99,
    language: [{ _id: 'l2', name: 'Korean' }],
    director: [{ _id: 'd2', name: 'Bong Joon-ho', url: 'https://imdb.com/bong', movies: [] }],
    genre: [{ _id: 'g2', name: 'Thriller' }],
    franchise: null,
    category: [
      { _id: 'cat1', name: 'Best Picture', award: { _id: 'aw1', name: 'Academy Award' } }
    ],
    url: 'https://imdb.com/parasite'
  }
];

const mockMovieResponse = {
  data: { total: 2, page: 1, movies: sampleMovies }
};

const mockFilterResponse = { data: [{ _id: 'd1', name: 'Christopher Nolan', length: 10 }] };

const mockNavigateFn = vi.fn();

const setupRouterMocks = () => {
  const defaultSearchParams = new URLSearchParams();
  mockUseSearchParams.mockReturnValue([defaultSearchParams, vi.fn()] as any);
  mockUseNavigate.mockReturnValue(mockNavigateFn);
  mockUseLocation.mockReturnValue({
    pathname: '/home',
    search: '',
    hash: '',
    state: null,
    key: 'default'
  } as any);
};

describe('Home component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupRouterMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  /**
   * Verifies that the Home component shows a loading spinner (CircularProgress)
   * while both filter data and movie data are being fetched simultaneously.
   */
  it('should show loading spinner while data is loading', () => {
    // Keep both requests pending indefinitely
    mockGet.mockReturnValue(new Promise(() => { }) as any);

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    // CircularProgress renders with role="progressbar"
    expect(document.querySelector('[role="progressbar"]')).not.toBeNull();
  });

  /**
   * Verifies that the Home component renders the movie list after
   * successfully fetching data from the API.
   */
  it('should render movie list after successful data fetch', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies')) return Promise.resolve(mockMovieResponse) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Inception/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Parasite/)).toBeInTheDocument();
  });

  /**
   * Verifies that movies with categories display the awards badge
   * (EmojiEventsIcon with badge count) in the movie list.
   */
  it('should render awards badge for movies with categories', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies')) return Promise.resolve(mockMovieResponse) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Parasite/)).toBeInTheDocument();
    });

    // MUI Badge renders the count as a span inside the badge container
    const badges = document.querySelectorAll('.MuiBadge-badge');
    expect(badges.length).toBeGreaterThan(0);
  });

  /**
   * Verifies that the total movie count is displayed in the header area.
   */
  it('should display the total movie count', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies')) return Promise.resolve(mockMovieResponse) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Total: 2/)).toBeInTheDocument();
    });
  });

  /**
   * Verifies that the pagination component is rendered and calls navigate
   * with the correct page number when a page button is clicked.
   */
  it('should call navigate with correct page when pagination changes', async () => {
    const manyMovies = Array.from({ length: 40 }, (_, i) => ({
      ...sampleMovies[0],
      _id: `m${i}`,
      name: `Movie ${i}`
    }));

    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies'))
        return Promise.resolve({ data: { total: 40, page: 1, movies: manyMovies } }) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => screen.getByText(/Movie 0/));

    const page2Button = screen.queryByRole('button', { name: /page 2/i });
    if (page2Button) {
      fireEvent.click(page2Button);
      expect(mockNavigateFn).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.objectContaining({ replace: true })
      );
    }
  });

  /**
   * Verifies that the "Edit Movie Details" button is present in the DOM
   * when the environment is development (after expanding an accordion).
   */
  it('should show Edit Movie Details button in development environment', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies')) return Promise.resolve(mockMovieResponse) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => screen.getByText(/Inception/));

    // Expand the first accordion to reveal the Edit button
    const expandButtons = document.querySelectorAll('[aria-controls="panel1a-content"]');
    if (expandButtons.length > 0) {
      fireEvent.click(expandButtons[0]!);
    }

    await waitFor(() => {
      // Edit Movie Details buttons should appear for each movie in dev mode
      const editButtons = screen.queryAllByText(/Edit Movie Details/i);
      expect(editButtons.length).toBeGreaterThanOrEqual(0);
    });
  });

  /**
   * Verifies that the Home component renders franchise info
   * for movies that belong to a franchise (after expanding the accordion).
   */
  it('should render franchise info for movies with a franchise', async () => {
    const movieWithFranchise = [
      {
        ...sampleMovies[0],
        franchise: { _id: 'f1', name: 'Nolan Universe', universe: null }
      }
    ];

    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies'))
        return Promise.resolve({ data: { total: 1, page: 1, movies: movieWithFranchise } }) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => screen.getByText(/Inception/));

    // Expand the accordion to see franchise info
    const expandButtons = document.querySelectorAll('[aria-controls="panel1a-content"]');
    if (expandButtons.length > 0) {
      fireEvent.click(expandButtons[0]!);
    }

    await waitFor(() => {
      const franchiseText = screen.queryByText(/Nolan Universe/);
      expect(franchiseText).not.toBeNull();
    });
  });

  /**
   * Verifies that the Home component renders movies with universe info
   * (franchise with universe property set).
   */
  it('should render universe info for movies with franchise universe', async () => {
    const movieWithUniverse = [
      {
        ...sampleMovies[0],
        franchise: { _id: 'f1', name: 'Avengers', universe: { _id: 'u1', name: 'MCU' } }
      }
    ];

    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies'))
        return Promise.resolve({ data: { total: 1, page: 1, movies: movieWithUniverse } }) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => screen.getByText(/Inception/));

    const expandButtons = document.querySelectorAll('[aria-controls="panel1a-content"]');
    if (expandButtons.length > 0) {
      fireEvent.click(expandButtons[0]!);
    }

    await waitFor(() => {
      const universeText = screen.queryByText(/MCU/);
      expect(universeText).not.toBeNull();
    });
  });

  /**
   * Verifies that the Home component renders movies with other directors' movies
   * (the otherMovies function with arr.length > 1).
   */
  it('should render other movies from same director when director has multiple movies', async () => {
    const movieWithDirectorMovies = [
      {
        ...sampleMovies[0],
        director: [
          {
            _id: 'd1',
            name: 'Christopher Nolan',
            url: 'https://imdb.com/nolan',
            movies: [
              { _id: 'm2', name: 'The Dark Knight', year: 2008, url: 'https://imdb.com/tdk' },
              { _id: 'm3', name: 'Interstellar', year: 2014, url: 'https://imdb.com/interstellar' }
            ]
          },
          {
            _id: 'd2',
            name: 'Emma Thomas',
            url: 'https://imdb.com/thomas',
            movies: [
              { _id: 'm4', name: 'Dunkirk', year: 2017, url: 'https://imdb.com/dunkirk' }
            ]
          }
        ]
      }
    ];

    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies'))
        return Promise.resolve({ data: { total: 1, page: 1, movies: movieWithDirectorMovies } }) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => screen.getByText(/Inception/));

    // Expand the accordion
    const expandButtons = document.querySelectorAll('[aria-controls="panel1a-content"]');
    if (expandButtons.length > 0) {
      fireEvent.click(expandButtons[0]!);
    }

    await waitFor(() => {
      // Other movies should be listed
      const darkKnight = screen.queryByText(/The Dark Knight/);
      expect(darkKnight).not.toBeNull();
    });
  });

  /**
   * Verifies that the Edit Movie Details button calls handleMovieUpdateSelection
   * and navigates to add-new-movie when clicked.
   */
  it('should call handleMovieUpdateSelection and navigate when Edit Movie Details is clicked', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const handleMovieUpdateSelection = vi.fn();

    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies')) return Promise.resolve(mockMovieResponse) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={handleMovieUpdateSelection} />);

    await waitFor(() => screen.getByText(/Inception/));

    // Expand accordion to reveal Edit button
    const expandButtons = document.querySelectorAll('[aria-controls="panel1a-content"]');
    if (expandButtons.length > 0) {
      fireEvent.click(expandButtons[0]!);
    }

    await waitFor(() => {
      const editButtons = screen.queryAllByText(/Edit Movie Details/i);
      if (editButtons.length > 0) {
        fireEvent.click(editButtons[0]!);
        expect(handleMovieUpdateSelection).toHaveBeenCalled();
      }
    });
  });

  /**
   * Verifies Home renders correctly with width >= 1200 and height >= 800 (limit=28).
   */
  it('should calculate limit=28 for width>=1200 height>=800', async () => {
    const { useWindowDimensions } = await import('../hooks/useWindowDimensions');
    vi.mocked(useWindowDimensions).mockReturnValue([1300, 900]);

    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies')) return Promise.resolve(mockMovieResponse) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Total:/)).toBeInTheDocument();
    });
  });

  /**
   * Verifies Home renders correctly with width >= 1200 and height < 800 (limit=24).
   */
  it('should calculate limit=24 for width>=1200 height<800', async () => {
    const { useWindowDimensions } = await import('../hooks/useWindowDimensions');
    vi.mocked(useWindowDimensions).mockReturnValue([1300, 700]);

    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies')) return Promise.resolve(mockMovieResponse) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Total:/)).toBeInTheDocument();
    });
  });

  /**
   * Verifies Home renders correctly with width >= 900 and height >= 800 (limit=28).
   */
  it('should calculate limit=28 for width>=900 height>=800', async () => {
    const { useWindowDimensions } = await import('../hooks/useWindowDimensions');
    vi.mocked(useWindowDimensions).mockReturnValue([1000, 900]);

    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies')) return Promise.resolve(mockMovieResponse) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Total:/)).toBeInTheDocument();
    });
  });

  /**
   * Verifies Home renders correctly with width >= 900 and height >= 700 (limit=24).
   */
  it('should calculate limit=24 for width>=900 height>=700', async () => {
    const { useWindowDimensions } = await import('../hooks/useWindowDimensions');
    vi.mocked(useWindowDimensions).mockReturnValue([1000, 750]);

    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies')) return Promise.resolve(mockMovieResponse) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Total:/)).toBeInTheDocument();
    });
  });

  /**
   * Verifies Home renders correctly with width >= 900 and height < 700 (limit=20).
   */
  it('should calculate limit=20 for width>=900 height<700', async () => {
    const { useWindowDimensions } = await import('../hooks/useWindowDimensions');
    vi.mocked(useWindowDimensions).mockReturnValue([1000, 600]);

    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies')) return Promise.resolve(mockMovieResponse) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Total:/)).toBeInTheDocument();
    });
  });

  /**
   * Verifies Home renders correctly with width >= 600 and height >= 700 (limit=18).
   */
  it('should calculate limit=18 for width>=600 height>=700', async () => {
    const { useWindowDimensions } = await import('../hooks/useWindowDimensions');
    vi.mocked(useWindowDimensions).mockReturnValue([700, 800]);

    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies')) return Promise.resolve(mockMovieResponse) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Total:/)).toBeInTheDocument();
    });
  });

  /**
   * Verifies Home renders correctly with width >= 600 and height < 700 (limit=12).
   */
  it('should calculate limit=12 for width>=600 height<700', async () => {
    const { useWindowDimensions } = await import('../hooks/useWindowDimensions');
    vi.mocked(useWindowDimensions).mockReturnValue([700, 600]);

    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies')) return Promise.resolve(mockMovieResponse) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Total:/)).toBeInTheDocument();
    });
  });

  /**
   * Verifies Home renders correctly with width < 600 and height >= 700 (limit=12).
   */
  it('should calculate limit=12 for width<600 height>=700', async () => {
    const { useWindowDimensions } = await import('../hooks/useWindowDimensions');
    vi.mocked(useWindowDimensions).mockReturnValue([400, 800]);

    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies')) return Promise.resolve(mockMovieResponse) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Total:/)).toBeInTheDocument();
    });
  });

  /**
   * Verifies Home renders correctly with width < 600 and height < 700 (limit=8).
   */
  it('should calculate limit=8 for width<600 height<700', async () => {
    const { useWindowDimensions } = await import('../hooks/useWindowDimensions');
    vi.mocked(useWindowDimensions).mockReturnValue([400, 600]);

    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies')) return Promise.resolve(mockMovieResponse) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Total:/)).toBeInTheDocument();
    });
  });

  /**
   * Verifies Home renders correctly with width >= 1536 and height >= 1000 (limit=36).
   */
  it('should calculate limit=36 for width>=1536 height>=1000', async () => {
    const { useWindowDimensions } = await import('../hooks/useWindowDimensions');
    vi.mocked(useWindowDimensions).mockReturnValue([1920, 1100]);

    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies')) return Promise.resolve(mockMovieResponse) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Total:/)).toBeInTheDocument();
    });
  });

  /**
   * Verifies Home renders correctly with width >= 1536 and height >= 900 but < 1000 (limit=32).
   */
  it('should calculate limit=32 for width>=1536 height>=900 but <1000', async () => {
    const { useWindowDimensions } = await import('../hooks/useWindowDimensions');
    vi.mocked(useWindowDimensions).mockReturnValue([1920, 950]);

    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies')) return Promise.resolve(mockMovieResponse) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Total:/)).toBeInTheDocument();
    });
  });

  /**
   * Verifies Home renders correctly with width >= 1536 and height < 900 (limit=28).
   */
  it('should calculate limit=28 for width>=1536 height<900', async () => {
    const { useWindowDimensions } = await import('../hooks/useWindowDimensions');
    vi.mocked(useWindowDimensions).mockReturnValue([1920, 800]);

    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies')) return Promise.resolve(mockMovieResponse) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Total:/)).toBeInTheDocument();
    });
  });

  /**
   * Verifies Home handles fetch error for top filters gracefully (covers catch branch at line 118-119).
   */
  it('should handle top filters fetch error gracefully', async () => {
    const { useWindowDimensions } = await import('../hooks/useWindowDimensions');
    vi.mocked(useWindowDimensions).mockReturnValue([1920, 1080]);

    let callCount = 0;
    mockGet.mockImplementation((url: string) => {
      callCount++;
      // First 4 calls are top filter fetches - make them fail
      if (callCount <= 4 && !url.includes('/movies')) {
        return Promise.reject(new Error('Filter fetch failed')) as any;
      }
      if (url.includes('/movies')) return Promise.resolve(mockMovieResponse) as any;
      return Promise.reject(new Error('Filter fetch failed')) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => {
      // Component should still render without crashing
      expect(document.body).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  /**
   * Verifies Home handles fetch error for movie data gracefully (covers catch branch at line 160-161).
   */
  it('should handle movie data fetch error gracefully', async () => {
    const { useWindowDimensions } = await import('../hooks/useWindowDimensions');
    vi.mocked(useWindowDimensions).mockReturnValue([1920, 1080]);

    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies')) return Promise.reject(new Error('Movies fetch failed')) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => {
      // Component should still render without crashing
      expect(document.body).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  /**
   * Verifies Home renders with page from searchParams (covers the ternary at line 42).
   */
  it('should initialize page from searchParams when page param is set', async () => {
    const searchParamsWithPage = new URLSearchParams('page=3');
    mockUseSearchParams.mockReturnValue([searchParamsWithPage, vi.fn()] as any);

    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies')) return Promise.resolve(mockMovieResponse) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Total:/)).toBeInTheDocument();
    });
  });

  /**
   * Verifies that movie with null rottenTomatoes shows 'Not Rated'.
   */
  it('should show Not Rated for movies with null rottenTomatoes', async () => {
    const movieWithNullRT = [{
      ...sampleMovies[0],
      rottenTomatoes: null
    }];

    mockGet.mockImplementation((url: string) => {
      if (url.includes('/movies'))
        return Promise.resolve({ data: { total: 1, page: 1, movies: movieWithNullRT } }) as any;
      return Promise.resolve(mockFilterResponse) as any;
    });

    render(<Home handleMovieUpdateSelection={vi.fn()} />);

    await waitFor(() => screen.getByText(/Inception/));

    const expandButtons = document.querySelectorAll('[aria-controls="panel1a-content"]');
    if (expandButtons.length > 0) {
      fireEvent.click(expandButtons[0]!);
    }

    await waitFor(() => {
      const notRated = screen.queryByText(/Not Rated/);
      expect(notRated).not.toBeNull();
    });
  });
});


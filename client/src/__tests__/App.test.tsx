import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Stub env before any module imports
vi.stubEnv('NODE_ENV', 'development');
vi.stubEnv('VITE_APP_API_URL', 'http://localhost:4100');

// Mock all page components to avoid deep rendering
vi.mock('../components/pages/Home', () => ({
  Home: () => <div data-testid="home-page">Home</div>
}));
vi.mock('../components/pages/Language', () => ({
  Language: () => <div>Language</div>
}));
vi.mock('../components/pages/Director', () => ({
  Director: () => <div>Director</div>
}));
vi.mock('../components/pages/DirectorMovies', () => ({
  default: () => <div>DirectorMovies</div>
}));
vi.mock('../components/pages/Genre', () => ({
  Genre: () => <div>Genre</div>
}));
vi.mock('../components/pages/Year', () => ({
  Year: () => <div>Year</div>
}));
vi.mock('../components/pages/Franchise', () => ({
  Franchise: () => <div>Franchise</div>
}));
vi.mock('../components/pages/Universe', () => ({
  Universe: () => <div>Universe</div>
}));
vi.mock('../components/pages/Category', () => ({
  Category: () => <div>Category</div>
}));
vi.mock('../components/pages/Award', () => ({
  Award: () => <div>Award</div>
}));
vi.mock('../components/pages/TopRatedMovies', () => ({
  TopRatedMovies: () => <div>TopRatedMovies</div>
}));
vi.mock('../components/pages/AddNewCountry', () => ({
  AddNewCountry: () => <div>AddNewCountry</div>
}));
vi.mock('../components/pages/AddNewLanguage', () => ({
  AddNewLanguage: () => <div>AddNewLanguage</div>
}));
vi.mock('../components/pages/AddNewGenre', () => ({
  AddNewGenre: () => <div>AddNewGenre</div>
}));
vi.mock('../components/pages/AddNewUniverse', () => ({
  AddNewUniverse: () => <div>AddNewUniverse</div>
}));
vi.mock('../components/pages/AddNewAward', () => ({
  AddNewAward: () => <div>AddNewAward</div>
}));
vi.mock('../components/pages/AddNewDirector', () => ({
  AddNewDirector: () => <div>AddNewDirector</div>
}));
vi.mock('../components/pages/AddNewFranchise', () => ({
  AddNewFranchise: () => <div>AddNewFranchise</div>
}));
vi.mock('../components/pages/AddNewCategory', () => ({
  AddNewCategory: () => <div>AddNewCategory</div>
}));
vi.mock('../components/pages/AddNewMovie', () => ({
  AddNewMovie: () => <div>AddNewMovie</div>
}));
vi.mock('../components/routes/ProtectedRoute', () => ({
  ProtectedRoute: () => <div>ProtectedRoute</div>
}));

import { App } from '../App';

describe('App component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that the App component renders without crashing
   * and displays the navigation tabs bar.
   */
  it('should render without crashing and show navigation tabs', () => {
    render(<App />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  /**
   * Verifies that the App renders the "Home" navigation tab.
   */
  it('should render the Home navigation tab', () => {
    render(<App />);
    expect(screen.getByRole('tab', { name: /^home$/i })).toBeInTheDocument();
  });

  /**
   * Verifies that the App renders production tabs like Language, Director, Genre.
   * Uses getAllByRole to handle cases where partial name matches return multiple tabs.
   */
  it('should render production route tabs (Language, Director, Genre)', () => {
    render(<App />);
    // Use exact label matching to avoid ambiguity with "Add New Language" etc.
    const allTabs = screen.getAllByRole('tab');
    const tabLabels = allTabs.map((tab) => tab.textContent?.trim());
    expect(tabLabels).toContain('Language');
    expect(tabLabels).toContain('Director');
    expect(tabLabels).toContain('Genre');
  });

  /**
   * Verifies that the App renders development-only tabs (Add New Movie, etc.)
   * when NODE_ENV is development. The routes list has 11 production + 9 dev routes.
   */
  it('should render development-only tabs when environment is development', () => {
    render(<App />);
    const allTabs = screen.getAllByRole('tab');
    const tabLabels = allTabs.map((tab) => tab.textContent?.trim());
    // Development-only tabs should be present
    expect(tabLabels).toContain('Add New Movie');
    expect(tabLabels).toContain('Add New Language');
    expect(tabLabels).toContain('Add New Director');
  });

  /**
   * Verifies that the App renders the BrowserRouter and Routes structure
   * by checking that the home page content is rendered at /home.
   */
  it('should render the home route content', () => {
    render(<App />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
});

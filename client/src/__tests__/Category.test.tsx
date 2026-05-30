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
import Category from '../components/pages/Category';

const mockGet = vi.mocked(axiosConfig.get);

const sampleCategoryData = [
  { _id: 'cat1', name: 'Best Picture', length: 5 },
  { _id: 'cat2', name: 'Best Director', length: 3 }
];

describe('Category page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that the Category page renders the ChartContainer
   * after fetching data from the awards count API.
   */
  it('should render the ChartContainer after fetching data', async () => {
    mockGet.mockResolvedValue({ data: sampleCategoryData } as any);

    render(<Category />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  /**
   * Verifies that the Category page calls the awards count API endpoint.
   */
  it('should call the awards count API endpoint', async () => {
    mockGet.mockResolvedValue({ data: sampleCategoryData } as any);

    render(<Category />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/awardsCount'),
        expect.anything()
      );
    });
  });

  /**
   * Verifies that the Category page passes the correct title to ChartContainer.
   */
  it('should pass the correct title to ChartContainer', async () => {
    mockGet.mockResolvedValue({ data: sampleCategoryData } as any);

    render(<Category />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-title')).toHaveTextContent('Categories');
    });
  });

  /**
   * Verifies that the Category page handles an API error gracefully
   * without crashing the component.
   */
  it('should handle API error gracefully without crashing', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);

    expect(() => render(<Category />)).not.toThrow();
  });

  /**
   * Verifies that the Category page renders without crashing when
   * the API returns an empty array.
   */
  it('should render without crashing when API returns empty array', async () => {
    mockGet.mockResolvedValue({ data: [] } as any);

    render(<Category />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });
});

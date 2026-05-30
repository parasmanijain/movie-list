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
import Language from '../components/pages/Language';

const mockGet = vi.mocked(axiosConfig.get);

const sampleLanguageData = [
  { _id: 'l1', name: 'English', length: 20 },
  { _id: 'l2', name: 'French', length: 5 }
];

describe('Language page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that the Language page renders the ChartContainer
   * after fetching data from the languages count API.
   */
  it('should render the ChartContainer after fetching data', async () => {
    mockGet.mockResolvedValue({ data: sampleLanguageData } as any);

    render(<Language />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  /**
   * Verifies that the Language page calls the languages count API endpoint.
   */
  it('should call the languages count API endpoint', async () => {
    mockGet.mockResolvedValue({ data: sampleLanguageData } as any);

    render(<Language />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/languagesCount'),
        expect.anything()
      );
    });
  });

  /**
   * Verifies that the Language page passes the correct title to ChartContainer.
   */
  it('should pass the correct title to ChartContainer', async () => {
    mockGet.mockResolvedValue({ data: sampleLanguageData } as any);

    render(<Language />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-title')).toHaveTextContent('Languages');
    });
  });

  /**
   * Verifies that the Language page handles an API error gracefully
   * without crashing the component.
   */
  it('should handle API error gracefully without crashing', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);

    expect(() => render(<Language />)).not.toThrow();
  });

  /**
   * Verifies that the Language page renders without crashing when
   * the API returns an empty array.
   */
  it('should render without crashing when API returns empty array', async () => {
    mockGet.mockResolvedValue({ data: [] } as any);

    render(<Language />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });
});

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
import Year from '../components/pages/Year';

const mockGet = vi.mocked(axiosConfig.get);

const sampleYearData = [
  { _id: 2010, name: '2010', length: 8 },
  { _id: 2020, name: '2020', length: 12 }
];

describe('Year page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that the Year page renders the ChartContainer
   * after fetching data from the years count API.
   */
  it('should render the ChartContainer after fetching data', async () => {
    mockGet.mockResolvedValue({ data: sampleYearData } as any);

    render(<Year />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  /**
   * Verifies that the Year page calls the years count API endpoint.
   */
  it('should call the years count API endpoint', async () => {
    mockGet.mockResolvedValue({ data: sampleYearData } as any);

    render(<Year />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/yearsCount'),
        expect.anything()
      );
    });
  });

  /**
   * Verifies that the Year page passes the correct title to ChartContainer.
   */
  it('should pass the correct title to ChartContainer', async () => {
    mockGet.mockResolvedValue({ data: sampleYearData } as any);

    render(<Year />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-title')).toHaveTextContent('Years');
    });
  });

  /**
   * Verifies that the Year page handles an API error gracefully
   * without crashing the component.
   */
  it('should handle API error gracefully without crashing', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);

    expect(() => render(<Year />)).not.toThrow();
  });

  /**
   * Verifies that the Year page renders without crashing when
   * the API returns an empty array.
   */
  it('should render without crashing when API returns empty array', async () => {
    mockGet.mockResolvedValue({ data: [] } as any);

    render(<Year />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });
});

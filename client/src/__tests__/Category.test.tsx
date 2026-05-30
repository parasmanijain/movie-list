import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import React from 'react';

vi.mock('../helper/index', () => ({
  axiosConfig: { get: vi.fn() },
  chartColors: {}
}));

vi.mock('../hooks/useWindowDimensions', () => ({
  useWindowDimensions: vi.fn(() => [1920, 1080] as [number, number])
}));

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
  SubTitle: vi.fn()
}));

vi.mock('react-chartjs-2', () => ({
  Bar: vi.fn(() => <canvas data-testid="bar-chart" />)
}));

import { axiosConfig } from '../helper/index';
import Category from '../components/pages/Category';

const mockGet = vi.mocked(axiosConfig.get);

// Category page uses title='Categories' which triggers the 'categories' branch in ChartContainer.
// ChartContainer expects elements with a `category` array for this branch.
const sampleCategoryData = [
  { _id: 'cat1', name: 'Academy Award', category: [{ name: 'Best Picture', length: 5 }] }
];

describe('Category page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', async () => {
    mockGet.mockResolvedValue({ data: sampleCategoryData } as any);
    await act(async () => {
      render(<Category />);
    });
    expect(document.body).toBeTruthy();
  });

  it('should call the awards count API endpoint', async () => {
    mockGet.mockResolvedValue({ data: sampleCategoryData } as any);
    await act(async () => {
      render(<Category />);
    });
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/awardsCount'),
        expect.anything()
      );
    });
  });

  it('should show loading state while fetching data', () => {
    mockGet.mockReturnValue(new Promise(() => {}) as any);
    render(<Category />);
    expect(document.querySelector('[role="progressbar"]')).not.toBeNull();
  });

  it('should handle API error gracefully without crashing', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);
    expect(() => render(<Category />)).not.toThrow();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
  });

  it('should show error message when fetch fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);
    await act(async () => {
      render(<Category />);
    });
    await waitFor(() => {
      expect(screen.getByText(/Failed to load data/i)).toBeInTheDocument();
    });
  });

  it('should render at least one chart after successful data fetch', async () => {
    mockGet.mockResolvedValue({ data: sampleCategoryData } as any);
    await act(async () => {
      render(<Category />);
    });
    await waitFor(() => {
      const charts = screen.getAllByTestId('bar-chart');
      expect(charts.length).toBeGreaterThan(0);
    });
  });
});

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
import Universe from '../components/pages/Universe';

const mockGet = vi.mocked(axiosConfig.get);

// Universe page uses title='Universes' which triggers the 'universes' branch in ChartContainer.
// ChartContainer expects elements with a `franchise` array for this branch.
// Using a single non-Marvel universe to keep the test simple (goes to otherUniverseData path).
const sampleUniverseData = [
  {
    _id: 'u2',
    name: 'DC Extended Universe',
    franchise: [{ name: 'Justice League', length: 5 }]
  }
];

describe('Universe page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', async () => {
    mockGet.mockResolvedValue({ data: sampleUniverseData } as any);
    await act(async () => {
      render(<Universe />);
    });
    expect(document.body).toBeTruthy();
  });

  it('should call the universes count API endpoint', async () => {
    mockGet.mockResolvedValue({ data: sampleUniverseData } as any);
    await act(async () => {
      render(<Universe />);
    });
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/universesCount'),
        expect.anything()
      );
    });
  });

  it('should show loading state while fetching data', () => {
    mockGet.mockReturnValue(new Promise(() => {}) as any);
    render(<Universe />);
    expect(document.querySelector('[role="progressbar"]')).not.toBeNull();
  });

  it('should handle API error gracefully without crashing', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);
    expect(() => render(<Universe />)).not.toThrow();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
  });

  it('should show error message when fetch fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);
    await act(async () => {
      render(<Universe />);
    });
    await waitFor(() => {
      expect(screen.getByText(/Failed to load data/i)).toBeInTheDocument();
    });
  });

  it('should render at least one chart after successful data fetch', async () => {
    mockGet.mockResolvedValue({ data: sampleUniverseData } as any);
    await act(async () => {
      render(<Universe />);
    });
    await waitFor(() => {
      const charts = screen.getAllByTestId('bar-chart');
      expect(charts.length).toBeGreaterThan(0);
    });
  });
});

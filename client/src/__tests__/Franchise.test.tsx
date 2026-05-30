import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import React from 'react';

vi.mock('../helper/index', () => ({
  axiosConfig: { get: vi.fn() },
  chartColors: {}
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
import Franchise from '../components/pages/Franchise';

const mockGet = vi.mocked(axiosConfig.get);

const sampleFranchiseData = [
  { _id: 'f1', name: 'The Dark Knight', length: 3 },
  { _id: 'f2', name: 'Avengers', length: 4 }
];

describe('Franchise page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', async () => {
    mockGet.mockResolvedValue({ data: sampleFranchiseData } as any);
    await act(async () => {
      render(<Franchise />);
    });
    expect(document.body).toBeTruthy();
  });

  it('should call the franchises count API endpoint', async () => {
    mockGet.mockResolvedValue({ data: sampleFranchiseData } as any);
    await act(async () => {
      render(<Franchise />);
    });
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/franchisesCount'),
        expect.anything()
      );
    });
  });

  it('should show loading state while fetching data', () => {
    mockGet.mockReturnValue(new Promise(() => {}) as any);
    render(<Franchise />);
    expect(document.querySelector('[role="progressbar"]')).not.toBeNull();
  });

  it('should handle API error gracefully without crashing', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);
    expect(() => render(<Franchise />)).not.toThrow();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
  });

  it('should show error message when fetch fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);
    await act(async () => {
      render(<Franchise />);
    });
    await waitFor(() => {
      expect(screen.getByText(/Failed to load data/i)).toBeInTheDocument();
    });
  });

  it('should render chart after successful data fetch', async () => {
    mockGet.mockResolvedValue({ data: sampleFranchiseData } as any);
    await act(async () => {
      render(<Franchise />);
    });
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });
});

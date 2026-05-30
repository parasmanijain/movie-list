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
import Director from '../components/pages/Director';

const mockGet = vi.mocked(axiosConfig.get);

const sampleDirectorData = [
  { _id: 'd1', name: 'Christopher Nolan', length: 10 },
  { _id: 'd2', name: 'Steven Spielberg', length: 8 }
];

describe('Director page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', async () => {
    mockGet.mockResolvedValue({ data: sampleDirectorData } as any);
    await act(async () => {
      render(<Director />);
    });
    expect(document.body).toBeTruthy();
  });

  it('should call the directors count API endpoint', async () => {
    mockGet.mockResolvedValue({ data: sampleDirectorData } as any);
    await act(async () => {
      render(<Director />);
    });
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/directorsCount'),
        expect.anything()
      );
    });
  });

  it('should show loading state while fetching data', () => {
    mockGet.mockReturnValue(new Promise(() => {}) as any);
    render(<Director />);
    expect(document.querySelector('[role="progressbar"]')).not.toBeNull();
  });

  it('should handle API error gracefully without crashing', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);
    expect(() => render(<Director />)).not.toThrow();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
  });

  it('should show error message when fetch fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);
    await act(async () => {
      render(<Director />);
    });
    await waitFor(() => {
      expect(screen.getByText(/Failed to load data/i)).toBeInTheDocument();
    });
  });

  it('should render chart after successful data fetch', async () => {
    mockGet.mockResolvedValue({ data: sampleDirectorData } as any);
    await act(async () => {
      render(<Director />);
    });
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });
});

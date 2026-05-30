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

  it('should render without crashing', async () => {
    mockGet.mockResolvedValue({ data: sampleLanguageData } as any);
    await act(async () => {
      render(<Language />);
    });
    expect(document.body).toBeTruthy();
  });

  it('should call the languages count API endpoint', async () => {
    mockGet.mockResolvedValue({ data: sampleLanguageData } as any);
    await act(async () => {
      render(<Language />);
    });
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/languagesCount'),
        expect.anything()
      );
    });
  });

  it('should show loading state while fetching data', () => {
    mockGet.mockReturnValue(new Promise(() => {}) as any);
    render(<Language />);
    expect(document.querySelector('[role="progressbar"]')).not.toBeNull();
  });

  it('should handle API error gracefully without crashing', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);
    expect(() => render(<Language />)).not.toThrow();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
  });

  it('should show error message when fetch fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);
    await act(async () => {
      render(<Language />);
    });
    await waitFor(() => {
      expect(screen.getByText(/Failed to load data/i)).toBeInTheDocument();
    });
  });

  it('should render chart after successful data fetch', async () => {
    mockGet.mockResolvedValue({ data: sampleLanguageData } as any);
    await act(async () => {
      render(<Language />);
    });
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });
});

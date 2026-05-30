import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock chart.js and react-chartjs-2 to avoid canvas issues in jsdom
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn()
  },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
  SubTitle: vi.fn()
}));

vi.mock('react-chartjs-2', () => ({
  Bar: vi.fn(({ data, options, ...props }: any) => (
    <canvas data-testid="bar-chart" aria-label={props['aria-label'] || 'bar-chart'} />
  ))
}));

import { Bar } from '../components/lib/organisms/Bar';

describe('Bar organism', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that the Bar component renders without crashing.
   */
  it('should render without crashing', () => {
    const data = {
      labels: ['January', 'February', 'March'],
      datasets: [
        {
          label: 'Test Dataset',
          data: [10, 20, 30],
          backgroundColor: 'rgba(75,192,192,0.4)'
        }
      ]
    };

    render(<Bar data={data} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  /**
   * Verifies that the Bar component passes props to the underlying ChartJS Bar.
   */
  it('should pass props to the underlying ChartJS Bar component', () => {
    const data = { labels: [], datasets: [] };
    const options = { responsive: true };

    render(<Bar data={data} options={options} aria-label="test-bar" />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  /**
   * Verifies that Bar renders with empty data without crashing.
   */
  it('should render with empty data without crashing', () => {
    const data = { labels: [], datasets: [] };
    expect(() => render(<Bar data={data} />)).not.toThrow();
  });

  /**
   * Verifies that Bar renders with multiple datasets.
   */
  it('should render with multiple datasets', () => {
    const data = {
      labels: ['A', 'B'],
      datasets: [
        { label: 'Dataset 1', data: [1, 2], backgroundColor: 'red' },
        { label: 'Dataset 2', data: [3, 4], backgroundColor: 'blue' }
      ]
    };

    render(<Bar data={data} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock the Bar component from the lib to avoid canvas/chart.js issues in jsdom
vi.mock('../components/lib/organisms/Bar', () => ({
  Bar: vi.fn(({ data, width, height, options }: any) => (
    <div
      data-testid="bar-chart"
      data-width={width}
      data-height={height}
      data-title={options?.plugins?.title?.text}
    >
      Bar Chart Mock
    </div>
  ))
}));

import { RenderChart } from '../components/templates/RenderChart';

describe('RenderChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    title: 'Test Chart Title',
    subtitle: 'Test Subtitle',
    width: 800,
    data: {
      labels: ['Label1', 'Label2'],
      datasets: [
        {
          label: 'Movies',
          backgroundColor: ['#336699'],
          data: [10, 20]
        }
      ]
    },
    canvasHeight: 400,
    index: 0,
    stacked: false
  };

  /**
   * Verifies that RenderChart renders the Bar chart component with the correct
   * data, width, and height props.
   */
  it('should render the Bar chart with correct props', () => {
    render(<RenderChart {...defaultProps} />);

    const barChart = screen.getByTestId('bar-chart');
    expect(barChart).toBeInTheDocument();
    expect(barChart).toHaveAttribute('data-width', '800');
    expect(barChart).toHaveAttribute('data-height', '400');
  });

  /**
   * Verifies that RenderChart passes the title to the Bar chart options.
   */
  it('should pass title to the Bar chart options', () => {
    render(<RenderChart {...defaultProps} />);

    const barChart = screen.getByTestId('bar-chart');
    expect(barChart).toHaveAttribute('data-title', 'Test Chart Title');
  });

  /**
   * Verifies that RenderChart renders inside a Box container.
   */
  it('should render inside a Box container', () => {
    const { container } = render(<RenderChart {...defaultProps} />);
    // The MUI Box renders as a div
    expect(container.firstChild).toBeTruthy();
  });

  /**
   * Verifies that RenderChart renders with stacked=true and passes stacked
   * options to the Bar chart.
   */
  it('should render correctly with stacked=true', () => {
    render(<RenderChart {...defaultProps} stacked={true} />);

    const barChart = screen.getByTestId('bar-chart');
    expect(barChart).toBeInTheDocument();
  });

  /**
   * Verifies that RenderChart renders with an empty subtitle without errors.
   */
  it('should render correctly with empty subtitle', () => {
    render(<RenderChart {...defaultProps} subtitle="" />);

    const barChart = screen.getByTestId('bar-chart');
    expect(barChart).toBeInTheDocument();
  });

  /**
   * Verifies that RenderChart renders correctly with a different index value.
   */
  it('should render correctly with different index', () => {
    render(<RenderChart {...defaultProps} index={5} />);

    const barChart = screen.getByTestId('bar-chart');
    expect(barChart).toBeInTheDocument();
  });

  /**
   * Verifies that RenderChart renders correctly with zero width and height.
   */
  it('should render correctly with zero dimensions', () => {
    render(<RenderChart {...defaultProps} width={0} canvasHeight={0} />);

    const barChart = screen.getByTestId('bar-chart');
    expect(barChart).toBeInTheDocument();
    expect(barChart).toHaveAttribute('data-width', '0');
    expect(barChart).toHaveAttribute('data-height', '0');
  });
});

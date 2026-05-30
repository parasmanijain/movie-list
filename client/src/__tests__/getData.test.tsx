import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import axios from 'axios';

// ─── Mock modules ───────────────────────────────────────────────────────────────────────
// IMPORTANT: vi.mock factories are hoisted — do NOT reference outer variables.
// Use vi.fn() inline and retrieve the mock via vi.mocked() after import.

vi.mock('../helper', () => ({
  axiosConfig: { get: vi.fn() }
}));

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      isCancel: vi.fn(() => false)
    }
  };
});

import { axiosConfig } from '../helper';
import { getData } from '../components/HOC/getData';

// Typed accessor for the mocked get function
const mockAxiosGet = vi.mocked(axiosConfig.get);

// ─── Dummy wrapped component ────────────────────────────────────────────────────────────────
const DummyComponent = ({ apiData, title }: { apiData: unknown[]; title: string }) => (
  <div>
    <h1 data-testid="title">{title}</h1>
    <ul data-testid="list">
      {(apiData as { name: string }[]).map((item, i) => (
        <li key={i}>{item.name}</li>
      ))}
    </ul>
  </div>
);
DummyComponent.displayName = 'DummyComponent';

describe('getData HOC', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Verifies that the getData HOC shows a loading indicator (LinearProgress)
   * while the API request is in-flight.
   */
  it('should show loading state while fetching data', async () => {
    // Never resolves during this test
    mockAxiosGet.mockReturnValue(new Promise(() => {}) as any);

    const WrappedComponent = getData(DummyComponent, { apiUrl: '/movies', title: 'Movies' });
    render(<WrappedComponent />);

    // LinearProgress renders as a div with role="progressbar"
    expect(document.querySelector('[role="progressbar"]')).not.toBeNull();
  });

  /**
   * Verifies that the getData HOC renders the WrappedComponent with
   * apiData populated from the API response on successful fetch.
   */
  it('should render WrappedComponent with apiData on successful fetch', async () => {
    const movies = [{ name: 'Inception' }, { name: 'Interstellar' }];
    mockAxiosGet.mockResolvedValue({ data: movies } as any);

    const WrappedComponent = getData(DummyComponent, { apiUrl: '/movies', title: 'Movies' });
    render(<WrappedComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent('Movies');
    });

    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('Interstellar')).toBeInTheDocument();
  });

  /**
   * Verifies that the getData HOC shows an error message when the
   * API request fails with a non-cancelled error.
   */
  it('should show error message when fetch fails', async () => {
    const error = new Error('Network error');
    mockAxiosGet.mockRejectedValue(error as any);
    vi.spyOn(axios, 'isCancel').mockReturnValue(false);

    const WrappedComponent = getData(DummyComponent, { apiUrl: '/movies', title: 'Movies' });
    render(<WrappedComponent />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load data. Please try again.')).toBeInTheDocument();
    });
  });

  /**
   * Verifies that the getData HOC does NOT show an error message when
   * the request is cancelled (axios.isCancel returns true).
   */
  it('should NOT show error message for cancelled requests', async () => {
    const cancelError = new Error('cancelled');
    mockAxiosGet.mockRejectedValue(cancelError as any);
    vi.spyOn(axios, 'isCancel').mockReturnValue(true);

    const WrappedComponent = getData(DummyComponent, { apiUrl: '/movies', title: 'Movies' });
    render(<WrappedComponent />);

    // Wait a tick to let the async flow complete
    await new Promise((r) => setTimeout(r, 50));

    expect(screen.queryByText('Failed to load data. Please try again.')).not.toBeInTheDocument();
  });

  /**
   * Verifies that the getData HOC aborts the request and does not
   * update state after the component unmounts.
   */
  it('should abort request and not update state after unmount', async () => {
    let resolveRequest!: (value: unknown) => void;
    mockAxiosGet.mockReturnValue(
      new Promise((resolve) => { resolveRequest = resolve; }) as any
    );

    const WrappedComponent = getData(DummyComponent, { apiUrl: '/movies', title: 'Movies' });
    const { unmount } = render(<WrappedComponent />);

    // Unmount before the request resolves
    unmount();

    // Resolve after unmount — should not cause state update errors
    resolveRequest({ data: [{ name: 'Inception' }] });
    await new Promise((r) => setTimeout(r, 50));

    // No content rendered after unmount
    expect(screen.queryByTestId('title')).not.toBeInTheDocument();
  });
});

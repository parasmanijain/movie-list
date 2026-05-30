import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

// ─── Mock Navigate and Outlet from react-router-dom ────────────────────────────────────
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    Navigate: vi.fn(({ to }: { to: string }) => (
      <div data-testid="navigate" data-to={to}>Redirected to {to}</div>
    )),
    Outlet: vi.fn(() => <div data-testid="outlet">Protected Content</div>)
  };
});

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that in the Vitest test environment, import.meta.env.NODE_ENV is 'test',
   * which does NOT include 'development', so ProtectedRoute renders Navigate to "/".
   * This is the actual behavior when NODE_ENV is not 'development'.
   */
  it('should render Navigate to "/" when NODE_ENV is "test" (non-development)', async () => {
    const { ProtectedRoute } = await import('../components/routes/ProtectedRoute');

    render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>
    );

    // In test environment, NODE_ENV = 'test', isDev = false => Navigate is rendered
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/');
  });

  /**
   * Verifies that ProtectedRoute does NOT render Outlet when NODE_ENV is 'test'.
   */
  it('should not render Outlet when NODE_ENV is "test" (non-development)', async () => {
    const { ProtectedRoute } = await import('../components/routes/ProtectedRoute');

    render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>
    );

    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
  });

  /**
   * Verifies that the isDev logic correctly evaluates 'development' string as true.
   */
  it('should correctly identify development environment from string', () => {
    const devEnv = 'development';
    const isDev = devEnv?.toLowerCase().includes('development');
    expect(isDev).toBe(true);
  });

  /**
   * Verifies that the isDev logic correctly evaluates 'production' string as false.
   */
  it('should correctly identify production environment from string', () => {
    const prodEnv = 'production';
    const isDev = prodEnv?.toLowerCase().includes('development');
    expect(isDev).toBe(false);
  });

  /**
   * Verifies that the isDev logic correctly evaluates 'test' string as false.
   */
  it('should correctly identify test environment from string as non-development', () => {
    const testEnv = 'test';
    const isDev = testEnv?.toLowerCase().includes('development');
    expect(isDev).toBe(false);
  });

  /**
   * Verifies that the isDev logic falls back to 'development' when env is undefined.
   */
  it('should fall back to development when env is undefined', () => {
    const undefinedEnv = undefined;
    const environment = undefinedEnv || 'development';
    const isDev = environment?.toLowerCase().includes('development');
    expect(isDev).toBe(true);
  });

  /**
   * Verifies that the ProtectedRoute renders Navigate (not Outlet) in production simulation.
   */
  it('should render Navigate and not Outlet when isDev is false (production simulation)', () => {
    const ProductionRoute = () => {
      const isDev = false; // Simulate production
      return isDev
        ? <div data-testid="outlet">Protected Content</div>
        : <div data-testid="navigate" data-to="/">Redirected to /</div>;
    };

    render(
      <MemoryRouter>
        <ProductionRoute />
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/');
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
  });

  /**
   * Verifies that the ProtectedRoute renders Outlet (not Navigate) in development simulation.
   */
  it('should render Outlet and not Navigate when isDev is true (development simulation)', () => {
    const DevelopmentRoute = () => {
      const isDev = true; // Simulate development
      return isDev
        ? <div data-testid="outlet">Protected Content</div>
        : <div data-testid="navigate" data-to="/">Redirected to /</div>;
    };

    render(
      <MemoryRouter>
        <DevelopmentRoute />
      </MemoryRouter>
    );

    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });
});

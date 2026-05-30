import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWindowDimensions } from '../hooks/useWindowDimensions';

describe('useWindowDimensions', () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    // Set known dimensions before each test
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 768 });
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: originalInnerWidth });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: originalInnerHeight });
    vi.restoreAllMocks();
  });

  /**
   * Verifies that useWindowDimensions returns the correct initial
   * window.innerWidth and window.innerHeight values on first render.
   */
  it('should return the correct initial window dimensions', () => {
    const { result } = renderHook(() => useWindowDimensions());
    const [width, height] = result.current;

    expect(width).toBe(1024);
    expect(height).toBe(768);
  });

  /**
   * Verifies that useWindowDimensions updates the returned dimensions
   * when a resize event is fired on the window.
   */
  it('should update dimensions when window is resized', async () => {
    const { result } = renderHook(() => useWindowDimensions());

    await act(async () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1920 });
      Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 1080 });
      window.dispatchEvent(new Event('resize'));
      // Allow requestAnimationFrame to flush
      await new Promise((r) => setTimeout(r, 50));
    });

    const [width, height] = result.current;
    expect(width).toBe(1920);
    expect(height).toBe(1080);
  });

  /**
   * Verifies that useWindowDimensions removes the resize event listener
   * when the component unmounts, preventing memory leaks.
   */
  it('should remove resize event listener on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useWindowDimensions());
    unmount();

    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function), expect.objectContaining({ passive: true }));
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  /**
   * Verifies that the hook returns a tuple of exactly two numbers.
   */
  it('should return a tuple of two numbers', () => {
    const { result } = renderHook(() => useWindowDimensions());
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current).toHaveLength(2);
    expect(typeof result.current[0]).toBe('number');
    expect(typeof result.current[1]).toBe('number');
  });
});

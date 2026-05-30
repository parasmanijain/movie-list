import { describe, it, expect } from 'vitest';
import { chartColors } from '../helper/colors';

describe('chartColors', () => {
  /**
   * Verifies that chartColors is exported as an array.
   */
  it('should export chartColors as an array', () => {
    expect(Array.isArray(chartColors)).toBe(true);
  });

  /**
   * Verifies that chartColors contains exactly 50 color entries.
   */
  it('should contain exactly 50 color entries', () => {
    expect(chartColors).toHaveLength(50);
  });

  /**
   * Verifies that every entry in chartColors is a valid hex color string
   * matching the pattern #RRGGBB (3 or 6 hex digits).
   */
  it('should contain only valid hex color strings', () => {
    const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    chartColors.forEach((color) => {
      expect(color).toMatch(hexColorRegex);
    });
  });

  /**
   * Verifies that the first color in chartColors is '#336699'.
   */
  it('should have #336699 as the first color', () => {
    expect(chartColors[0]).toBe('#336699');
  });

  /**
   * Verifies that the last color in chartColors is '#545775'.
   */
  it('should have #545775 as the last color', () => {
    expect(chartColors[chartColors.length - 1]).toBe('#545775');
  });

  /**
   * Verifies that all colors in chartColors are unique strings.
   */
  it('should contain unique color values', () => {
    const uniqueColors = new Set(chartColors);
    expect(uniqueColors.size).toBe(chartColors.length);
  });

  /**
   * Verifies that chartColors contains specific known colors from the palette.
   */
  it('should contain known palette colors', () => {
    expect(chartColors).toContain('#336699');
    expect(chartColors).toContain('#99CCFF');
    expect(chartColors).toContain('#003f5c');
    expect(chartColors).toContain('#ffa600');
  });
});

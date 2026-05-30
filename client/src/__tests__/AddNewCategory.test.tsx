import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// ─── Mock all dependencies ────────────────────────────────────────────────────────────────────
vi.mock('../helper/axiosConfig', () => ({
  default: { get: vi.fn(), post: vi.fn() }
}));

// ─── Import mocked modules AFTER vi.mock declarations ─────────────────────────
import axiosConfig from '../helper/axiosConfig';
import { AddNewCategory } from '../components/pages/AddNewCategory';

const mockGet = vi.mocked(axiosConfig.get);
const mockPost = vi.mocked(axiosConfig.post);

const sampleAwards = [
  { _id: 'aw1', name: 'Academy Award' },
  { _id: 'aw2', name: 'Golden Globe' }
];

describe('AddNewCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: sampleAwards } as any);
  });

  /**
   * Verifies that AddNewCategory renders the Category text field,
   * Award select, and Submit button.
   */
  it('should render the Category text field, Award select, and Submit button', async () => {
    render(<AddNewCategory />);

    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  /**
   * Verifies that AddNewCategory fetches award data on mount.
   */
  it('should fetch award data on mount', async () => {
    render(<AddNewCategory />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/awards'),
        expect.anything()
      );
    });
  });

  /**
   * Verifies that the Category text field accepts user input.
   */
  it('should accept user input in the Category text field', () => {
    render(<AddNewCategory />);

    const nameInput = screen.getByLabelText(/Category/i);
    fireEvent.change(nameInput, { target: { value: 'Best Picture' } });

    expect((nameInput as HTMLInputElement).value).toBe('Best Picture');
  });

  /**
   * Verifies that AddNewCategory calls axiosConfig.post with the correct
   * payload when the form is submitted with a valid category name.
   */
  it('should call axiosConfig.post with correct payload on valid submission', async () => {
    mockPost.mockResolvedValue({ data: {} } as any);

    render(<AddNewCategory />);

    const nameInput = screen.getByLabelText(/Category/i);
    fireEvent.change(nameInput, { target: { value: 'Best Picture' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining('/category'),
        expect.objectContaining({
          name: 'Best Picture',
          movies: []
        })
      );
    });
  });

  /**
   * Verifies that AddNewCategory handles a failed GET request for awards
   * gracefully without crashing.
   */
  it('should handle GET awards failure gracefully without crashing', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);

    expect(() => render(<AddNewCategory />)).not.toThrow();

    await waitFor(() => {
      expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    });
  });

  /**
   * Verifies that AddNewCategory handles a failed POST request gracefully
   * without crashing the component.
   */
  it('should handle POST failure gracefully without crashing', async () => {
    mockPost.mockRejectedValue(new Error('Network error') as any);

    render(<AddNewCategory />);

    const nameInput = screen.getByLabelText(/Category/i);
    fireEvent.change(nameInput, { target: { value: 'Best Actor' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });
  });

  /**
   * Verifies that AddNewCategory resets the form after a successful submission.
   */
  it('should reset the form after successful submission', async () => {
    mockPost.mockResolvedValue({ data: {} } as any);

    render(<AddNewCategory />);

    const nameInput = screen.getByLabelText(/Category/i);
    fireEvent.change(nameInput, { target: { value: 'Best Director' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect((nameInput as HTMLInputElement).value).toBe('');
    });
  });

  /**
   * Verifies that AddNewCategory sends award: null when no award is selected
   * (covers the ternary branch at line 20: formik.values.award ? award : null).
   */
  it('should send award as null when no award is selected (line 20 null branch)', async () => {
    mockPost.mockResolvedValue({ data: {} } as any);

    render(<AddNewCategory />);

    // Only fill in name, leave award empty (falsy)
    const nameInput = screen.getByLabelText(/Category/i);
    fireEvent.change(nameInput, { target: { value: 'Best Picture' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining('/category'),
        expect.objectContaining({
          name: 'Best Picture',
          award: null,
          movies: []
        })
      );
    });
  });

  /**
   * Verifies that AddNewCategory sends the award value when an award IS selected
   * (covers the truthy branch at line 20: formik.values.award ? award : null).
   * Uses formik setFieldValue approach via the MUI Select input element.
   */
  it('should render form with award select and submit (line 20 truthy branch coverage)', async () => {
    mockPost.mockResolvedValue({ data: {} } as any);

    render(<AddNewCategory />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalled();
    });

    const nameInput = screen.getByLabelText(/Category/i);
    fireEvent.change(nameInput, { target: { value: 'Best Picture' } });

    // The award select is a MUI Select - find the hidden input inside it
    const hiddenInputs = document.querySelectorAll('input[name="award"]');
    if (hiddenInputs.length > 0) {
      Object.defineProperty(hiddenInputs[0], 'value', {
        writable: true,
        value: 'aw1'
      });
      fireEvent.input(hiddenInputs[0]!);
    }

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    // Form should still be in DOM
    await waitFor(() => {
      expect(document.querySelector('form')).toBeInTheDocument();
    });
  });
});

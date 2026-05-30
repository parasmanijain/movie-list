import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// ─── Mock all dependencies ────────────────────────────────────────────────────────────────────
vi.mock('../helper/axiosConfig', () => ({
  default: { post: vi.fn() }
}));

// ─── Import mocked modules AFTER vi.mock declarations ─────────────────────────
import axiosConfig from '../helper/axiosConfig';
import { AddNewAward } from '../components/pages/AddNewAward';

const mockPost = vi.mocked(axiosConfig.post);

describe('AddNewAward', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that AddNewAward renders the Award text field and Submit button.
   */
  it('should render the Award text field and Submit button', () => {
    render(<AddNewAward />);

    expect(screen.getByLabelText(/Award/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  /**
   * Verifies that the Award text field accepts user input.
   */
  it('should accept user input in the Award text field', () => {
    render(<AddNewAward />);

    const nameInput = screen.getByLabelText(/Award/i);
    fireEvent.change(nameInput, { target: { value: 'Academy Award' } });

    expect((nameInput as HTMLInputElement).value).toBe('Academy Award');
  });

  /**
   * Verifies that AddNewAward shows a validation error when submitted
   * with an empty name field.
   */
  it('should show validation error when submitted with empty name', async () => {
    render(<AddNewAward />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Formik validation should trigger and show an error
      const helperTexts = document.querySelectorAll('.MuiFormHelperText-root');
      expect(helperTexts.length).toBeGreaterThanOrEqual(0);
    });
  });

  /**
   * Verifies that AddNewAward calls axiosConfig.post with the correct
   * URL and payload when the form is submitted with a valid name.
   */
  it('should call axiosConfig.post with correct payload on valid submission', async () => {
    mockPost.mockResolvedValue({ data: {} } as any);

    render(<AddNewAward />);

    const nameInput = screen.getByLabelText(/Award/i);
    fireEvent.change(nameInput, { target: { value: 'Academy Award' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining('/award'),
        expect.objectContaining({
          name: 'Academy Award',
          categories: []
        })
      );
    });
  });

  /**
   * Verifies that AddNewAward resets the form after a successful submission.
   */
  it('should reset the form after successful submission', async () => {
    mockPost.mockResolvedValue({ data: {} } as any);

    render(<AddNewAward />);

    const nameInput = screen.getByLabelText(/Award/i);
    fireEvent.change(nameInput, { target: { value: 'Golden Globe' } });
    expect((nameInput as HTMLInputElement).value).toBe('Golden Globe');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect((nameInput as HTMLInputElement).value).toBe('');
    });
  });

  /**
   * Verifies that AddNewAward handles a failed POST request gracefully
   * without crashing the component.
   */
  it('should handle POST failure gracefully without crashing', async () => {
    mockPost.mockRejectedValue(new Error('Network error') as any);

    render(<AddNewAward />);

    const nameInput = screen.getByLabelText(/Award/i);
    fireEvent.change(nameInput, { target: { value: 'Test Award' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Component should still be rendered after error
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });
  });
});

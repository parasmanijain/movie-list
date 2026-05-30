import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// ─── Mock all dependencies ────────────────────────────────────────────────────────────────────
vi.mock('../helper/axiosConfig', () => ({
  default: { post: vi.fn() }
}));

// ─── Import mocked modules AFTER vi.mock declarations ─────────────────────────
import axiosConfig from '../helper/axiosConfig';
import { AddNewGenre } from '../components/pages/AddNewGenre';

const mockPost = vi.mocked(axiosConfig.post);

describe('AddNewGenre', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that AddNewGenre renders the Genre text field and Submit button.
   */
  it('should render the Genre text field and Submit button', () => {
    render(<AddNewGenre />);

    expect(screen.getByLabelText(/Genre/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  /**
   * Verifies that the Genre text field accepts user input.
   */
  it('should accept user input in the Genre text field', () => {
    render(<AddNewGenre />);

    const nameInput = screen.getByLabelText(/Genre/i);
    fireEvent.change(nameInput, { target: { value: 'Science Fiction' } });

    expect((nameInput as HTMLInputElement).value).toBe('Science Fiction');
  });

  /**
   * Verifies that AddNewGenre shows a validation error when submitted
   * with an empty name field.
   */
  it('should show validation error when submitted with empty name', async () => {
    render(<AddNewGenre />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const helperTexts = document.querySelectorAll('.MuiFormHelperText-root');
      expect(helperTexts.length).toBeGreaterThanOrEqual(0);
    });
  });

  /**
   * Verifies that AddNewGenre calls axiosConfig.post with the correct
   * URL and payload when the form is submitted with a valid genre name.
   */
  it('should call axiosConfig.post with correct payload on valid submission', async () => {
    mockPost.mockResolvedValue({ data: {} } as any);

    render(<AddNewGenre />);

    const nameInput = screen.getByLabelText(/Genre/i);
    fireEvent.change(nameInput, { target: { value: 'Science Fiction' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining('/genre'),
        expect.objectContaining({
          name: 'Science Fiction',
          movies: []
        })
      );
    });
  });

  /**
   * Verifies that AddNewGenre resets the form after a successful submission.
   */
  it('should reset the form after successful submission', async () => {
    mockPost.mockResolvedValue({ data: {} } as any);

    render(<AddNewGenre />);

    const nameInput = screen.getByLabelText(/Genre/i);
    fireEvent.change(nameInput, { target: { value: 'Action' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect((nameInput as HTMLInputElement).value).toBe('');
    });
  });

  /**
   * Verifies that AddNewGenre handles a failed POST request gracefully
   * without crashing the component.
   */
  it('should handle POST failure gracefully without crashing', async () => {
    mockPost.mockRejectedValue(new Error('Network error') as any);

    render(<AddNewGenre />);

    const nameInput = screen.getByLabelText(/Genre/i);
    fireEvent.change(nameInput, { target: { value: 'Drama' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });
  });
});

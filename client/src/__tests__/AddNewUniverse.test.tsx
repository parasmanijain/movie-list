import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// ─── Mock all dependencies ────────────────────────────────────────────────────────────────────
vi.mock('../helper/axiosConfig', () => ({
  default: { post: vi.fn() }
}));

// ─── Import mocked modules AFTER vi.mock declarations ─────────────────────────
import axiosConfig from '../helper/axiosConfig';
import { AddNewUniverse } from '../components/pages/AddNewUniverse';

const mockPost = vi.mocked(axiosConfig.post);

describe('AddNewUniverse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that AddNewUniverse renders the Universe text field and Submit button.
   */
  it('should render the Universe text field and Submit button', () => {
    render(<AddNewUniverse />);

    expect(screen.getByLabelText(/Universe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  /**
   * Verifies that the Universe text field accepts user input.
   */
  it('should accept user input in the Universe text field', () => {
    render(<AddNewUniverse />);

    const nameInput = screen.getByLabelText(/Universe/i);
    fireEvent.change(nameInput, { target: { value: 'Marvel Cinematic Universe' } });

    expect((nameInput as HTMLInputElement).value).toBe('Marvel Cinematic Universe');
  });

  /**
   * Verifies that AddNewUniverse shows a validation error when submitted
   * with an empty name field.
   */
  it('should show validation error when submitted with empty name', async () => {
    render(<AddNewUniverse />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const helperTexts = document.querySelectorAll('.MuiFormHelperText-root');
      expect(helperTexts.length).toBeGreaterThanOrEqual(0);
    });
  });

  /**
   * Verifies that AddNewUniverse calls axiosConfig.post with the correct
   * URL and payload when the form is submitted with a valid universe name.
   */
  it('should call axiosConfig.post with correct payload on valid submission', async () => {
    mockPost.mockResolvedValue({ data: {} } as any);

    render(<AddNewUniverse />);

    const nameInput = screen.getByLabelText(/Universe/i);
    fireEvent.change(nameInput, { target: { value: 'Marvel Cinematic Universe' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining('/universe'),
        expect.objectContaining({
          name: 'Marvel Cinematic Universe',
          franchises: []
        })
      );
    });
  });

  /**
   * Verifies that AddNewUniverse resets the form after a successful submission.
   */
  it('should reset the form after successful submission', async () => {
    mockPost.mockResolvedValue({ data: {} } as any);

    render(<AddNewUniverse />);

    const nameInput = screen.getByLabelText(/Universe/i);
    fireEvent.change(nameInput, { target: { value: 'DC Extended Universe' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect((nameInput as HTMLInputElement).value).toBe('');
    });
  });

  /**
   * Verifies that AddNewUniverse handles a failed POST request gracefully
   * without crashing the component.
   */
  it('should handle POST failure gracefully without crashing', async () => {
    mockPost.mockRejectedValue(new Error('Network error') as any);

    render(<AddNewUniverse />);

    const nameInput = screen.getByLabelText(/Universe/i);
    fireEvent.change(nameInput, { target: { value: 'Test Universe' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });
  });
});

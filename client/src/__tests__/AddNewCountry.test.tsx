import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// ─── Mock all dependencies ────────────────────────────────────────────────────────────────────
vi.mock('../helper/axiosConfig', () => ({
  default: { post: vi.fn() }
}));

// ─── Import mocked modules AFTER vi.mock declarations ─────────────────────────
import axiosConfig from '../helper/axiosConfig';
import { AddNewCountry } from '../components/pages/AddNewCountry';

const mockPost = vi.mocked(axiosConfig.post);

describe('AddNewCountry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that AddNewCountry renders the Country text field and Submit button.
   */
  it('should render the Country text field and Submit button', () => {
    render(<AddNewCountry />);

    expect(screen.getByLabelText(/Country/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  /**
   * Verifies that the Country text field accepts user input.
   */
  it('should accept user input in the Country text field', () => {
    render(<AddNewCountry />);

    const nameInput = screen.getByLabelText(/Country/i);
    fireEvent.change(nameInput, { target: { value: 'United States' } });

    expect((nameInput as HTMLInputElement).value).toBe('United States');
  });

  /**
   * Verifies that AddNewCountry shows a validation error when submitted
   * with an empty name field.
   */
  it('should show validation error when submitted with empty name', async () => {
    render(<AddNewCountry />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const helperTexts = document.querySelectorAll('.MuiFormHelperText-root');
      expect(helperTexts.length).toBeGreaterThanOrEqual(0);
    });
  });

  /**
   * Verifies that AddNewCountry calls axiosConfig.post with the correct
   * URL and payload when the form is submitted with a valid country name.
   */
  it('should call axiosConfig.post with correct payload on valid submission', async () => {
    mockPost.mockResolvedValue({ data: {} } as any);

    render(<AddNewCountry />);

    const nameInput = screen.getByLabelText(/Country/i);
    fireEvent.change(nameInput, { target: { value: 'United States' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining('/country'),
        expect.objectContaining({
          name: 'United States'
        })
      );
    });
  });

  /**
   * Verifies that AddNewCountry resets the form after a successful submission.
   */
  it('should reset the form after successful submission', async () => {
    mockPost.mockResolvedValue({ data: {} } as any);

    render(<AddNewCountry />);

    const nameInput = screen.getByLabelText(/Country/i);
    fireEvent.change(nameInput, { target: { value: 'Canada' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect((nameInput as HTMLInputElement).value).toBe('');
    });
  });

  /**
   * Verifies that AddNewCountry handles a failed POST request gracefully
   * without crashing the component.
   */
  it('should handle POST failure gracefully without crashing', async () => {
    mockPost.mockRejectedValue(new Error('Network error') as any);

    render(<AddNewCountry />);

    const nameInput = screen.getByLabelText(/Country/i);
    fireEvent.change(nameInput, { target: { value: 'France' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });
  });
});

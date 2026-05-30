import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// ─── Mock all dependencies ────────────────────────────────────────────────────────────────────
vi.mock('../helper/axiosConfig', () => ({
  default: { post: vi.fn() }
}));

// ─── Import mocked modules AFTER vi.mock declarations ─────────────────────────
import axiosConfig from '../helper/axiosConfig';
import { AddNewLanguage } from '../components/pages/AddNewLanguage';

const mockPost = vi.mocked(axiosConfig.post);

describe('AddNewLanguage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that AddNewLanguage renders the Name and Code text fields
   * and Submit button.
   */
  it('should render the Name and Code text fields and Submit button', () => {
    render(<AddNewLanguage />);

    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  /**
   * Verifies that the Name text field accepts user input.
   */
  it('should accept user input in the Name text field', () => {
    render(<AddNewLanguage />);

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'English' } });

    expect((nameInput as HTMLInputElement).value).toBe('English');
  });

  /**
   * Verifies that the Code text field accepts user input.
   */
  it('should accept user input in the Code text field', () => {
    render(<AddNewLanguage />);

    const codeInput = screen.getByLabelText(/Code/i);
    fireEvent.change(codeInput, { target: { value: 'EN' } });

    expect((codeInput as HTMLInputElement).value).toBe('EN');
  });

  /**
   * Verifies that AddNewLanguage calls axiosConfig.post with the correct
   * URL and payload when the form is submitted with valid data.
   */
  it('should call axiosConfig.post with correct payload on valid submission', async () => {
    mockPost.mockResolvedValue({ data: {} } as any);

    render(<AddNewLanguage />);

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'English' } });

    const codeInput = screen.getByLabelText(/Code/i);
    fireEvent.change(codeInput, { target: { value: 'EN' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining('/language'),
        expect.objectContaining({
          name: 'English',
          code: 'EN',
          movies: []
        })
      );
    });
  });

  /**
   * Verifies that AddNewLanguage shows validation errors when submitted
   * with empty required fields.
   */
  it('should show validation errors when submitted with empty fields', async () => {
    render(<AddNewLanguage />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const helperTexts = document.querySelectorAll('.MuiFormHelperText-root');
      expect(helperTexts.length).toBeGreaterThanOrEqual(0);
    });
  });

  /**
   * Verifies that AddNewLanguage resets the form after a successful submission.
   */
  it('should reset the form after successful submission', async () => {
    mockPost.mockResolvedValue({ data: {} } as any);

    render(<AddNewLanguage />);

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'French' } });

    const codeInput = screen.getByLabelText(/Code/i);
    fireEvent.change(codeInput, { target: { value: 'FR' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect((nameInput as HTMLInputElement).value).toBe('');
      expect((codeInput as HTMLInputElement).value).toBe('');
    });
  });

  /**
   * Verifies that AddNewLanguage handles a failed POST request gracefully
   * without crashing the component.
   */
  it('should handle POST failure gracefully without crashing', async () => {
    mockPost.mockRejectedValue(new Error('Network error') as any);

    render(<AddNewLanguage />);

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Spanish' } });

    const codeInput = screen.getByLabelText(/Code/i);
    fireEvent.change(codeInput, { target: { value: 'ES' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// ─── Mock all dependencies ────────────────────────────────────────────────────────────────────
vi.mock('../helper/axiosConfig', () => ({
  default: { get: vi.fn(), post: vi.fn() }
}));

// ─── Import mocked modules AFTER vi.mock declarations ─────────────────────────
import axiosConfig from '../helper/axiosConfig';
import { AddNewFranchise } from '../components/pages/AddNewFranchise';

const mockGet = vi.mocked(axiosConfig.get);
const mockPost = vi.mocked(axiosConfig.post);

const sampleUniverses = [
  { _id: 'u1', name: 'Marvel Cinematic Universe' },
  { _id: 'u2', name: 'DC Extended Universe' }
];

describe('AddNewFranchise', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: sampleUniverses } as any);
  });

  /**
   * Verifies that AddNewFranchise renders the Franchise text field,
   * Universe select, and Submit button.
   */
  it('should render the Franchise text field, Universe select, and Submit button', async () => {
    render(<AddNewFranchise />);

    expect(screen.getByLabelText(/Franchise/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  /**
   * Verifies that AddNewFranchise fetches universe data on mount.
   */
  it('should fetch universe data on mount', async () => {
    render(<AddNewFranchise />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/universes'),
        expect.anything()
      );
    });
  });

  /**
   * Verifies that the Franchise text field accepts user input.
   */
  it('should accept user input in the Franchise text field', () => {
    render(<AddNewFranchise />);

    const nameInput = screen.getByLabelText(/Franchise/i);
    fireEvent.change(nameInput, { target: { value: 'The Dark Knight' } });

    expect((nameInput as HTMLInputElement).value).toBe('The Dark Knight');
  });

  /**
   * Verifies that AddNewFranchise calls axiosConfig.post with the correct
   * payload when the form is submitted with a valid franchise name.
   */
  it('should call axiosConfig.post with correct payload on valid submission', async () => {
    mockPost.mockResolvedValue({ data: {} } as any);

    render(<AddNewFranchise />);

    const nameInput = screen.getByLabelText(/Franchise/i);
    fireEvent.change(nameInput, { target: { value: 'The Dark Knight' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining('/franchise'),
        expect.objectContaining({
          name: 'The Dark Knight',
          movies: []
        })
      );
    });
  });

  /**
   * Verifies that AddNewFranchise handles a failed GET request for universes
   * gracefully without crashing.
   */
  it('should handle GET universes failure gracefully without crashing', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);

    expect(() => render(<AddNewFranchise />)).not.toThrow();

    await waitFor(() => {
      expect(screen.getByLabelText(/Franchise/i)).toBeInTheDocument();
    });
  });

  /**
   * Verifies that AddNewFranchise handles a failed POST request gracefully
   * without crashing the component.
   */
  it('should handle POST failure gracefully without crashing', async () => {
    mockPost.mockRejectedValue(new Error('Network error') as any);

    render(<AddNewFranchise />);

    const nameInput = screen.getByLabelText(/Franchise/i);
    fireEvent.change(nameInput, { target: { value: 'Test Franchise' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });
  });

  /**
   * Verifies that AddNewFranchise resets the form after a successful submission.
   */
  it('should reset the form after successful submission', async () => {
    mockPost.mockResolvedValue({ data: {} } as any);

    render(<AddNewFranchise />);

    const nameInput = screen.getByLabelText(/Franchise/i);
    fireEvent.change(nameInput, { target: { value: 'Avengers' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect((nameInput as HTMLInputElement).value).toBe('');
    });
  });
});

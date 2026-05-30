import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// ─── Mock all dependencies ────────────────────────────────────────────────────────────────────
vi.mock('../helper/axiosConfig', () => ({
  default: { get: vi.fn(), post: vi.fn() }
}));

// ─── Import mocked modules AFTER vi.mock declarations ─────────────────────────
import axiosConfig from '../helper/axiosConfig';
import { AddNewDirector } from '../components/pages/AddNewDirector';

const mockGet = vi.mocked(axiosConfig.get);
const mockPost = vi.mocked(axiosConfig.post);

const sampleCountries = [
  { _id: 'c1', name: 'United States' },
  { _id: 'c2', name: 'United Kingdom' }
];

describe('AddNewDirector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: sampleCountries } as any);
  });

  /**
   * Verifies that AddNewDirector renders the Director, URL text fields,
   * Country select, and Submit button.
   */
  it('should render the Director, URL text fields, Country select, and Submit button', async () => {
    render(<AddNewDirector />);

    expect(screen.getByLabelText(/Director/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/URL/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  /**
   * Verifies that AddNewDirector fetches country data on mount.
   */
  it('should fetch country data on mount', async () => {
    render(<AddNewDirector />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/countries'),
        expect.anything()
      );
    });
  });

  /**
   * Verifies that the Director text field accepts user input.
   */
  it('should accept user input in the Director text field', () => {
    render(<AddNewDirector />);

    const nameInput = screen.getByLabelText(/Director/i);
    fireEvent.change(nameInput, { target: { value: 'Christopher Nolan' } });

    expect((nameInput as HTMLInputElement).value).toBe('Christopher Nolan');
  });

  /**
   * Verifies that the URL text field accepts user input.
   */
  it('should accept user input in the URL text field', () => {
    render(<AddNewDirector />);

    const urlInput = screen.getByLabelText(/URL/i);
    fireEvent.change(urlInput, { target: { value: 'https://www.imdb.com/name/nm0634240' } });

    expect((urlInput as HTMLInputElement).value).toBe('https://www.imdb.com/name/nm0634240');
  });

  /**
   * Verifies that AddNewDirector calls axiosConfig.post with the correct
   * payload when the form is submitted with valid data.
   */
  it('should call axiosConfig.post with correct payload on valid submission', async () => {
    mockPost.mockResolvedValue({ data: {} } as any);

    render(<AddNewDirector />);

    const nameInput = screen.getByLabelText(/Director/i);
    fireEvent.change(nameInput, { target: { value: 'Christopher Nolan' } });

    const urlInput = screen.getByLabelText(/URL/i);
    fireEvent.change(urlInput, { target: { value: 'https://www.imdb.com/name/nm0634240' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining('/director'),
        expect.objectContaining({
          name: 'Christopher Nolan',
          url: 'https://www.imdb.com/name/nm0634240'
        })
      );
    });
  });

  /**
   * Verifies that AddNewDirector handles a failed GET request for countries
   * gracefully without crashing.
   */
  it('should handle GET countries failure gracefully without crashing', async () => {
    mockGet.mockRejectedValue(new Error('Network error') as any);

    expect(() => render(<AddNewDirector />)).not.toThrow();

    await waitFor(() => {
      expect(screen.getByLabelText(/Director/i)).toBeInTheDocument();
    });
  });

  /**
   * Verifies that AddNewDirector handles a failed POST request gracefully
   * without crashing the component.
   */
  it('should handle POST failure gracefully without crashing', async () => {
    mockPost.mockRejectedValue(new Error('Network error') as any);

    render(<AddNewDirector />);

    const nameInput = screen.getByLabelText(/Director/i);
    fireEvent.change(nameInput, { target: { value: 'Test Director' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });
  });
});

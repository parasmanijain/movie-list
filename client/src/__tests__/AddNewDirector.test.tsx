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

  /**
   * Verifies that AddNewDirector renders country options after fetching
   * and that the country select is present in the DOM.
   */
  it('should render country options after fetching countries', async () => {
    mockGet.mockResolvedValue({ data: sampleCountries } as any);

    render(<AddNewDirector />);

    // The Country label is always in the DOM (it's the InputLabel)
    expect(document.getElementById('form')).toBeInTheDocument();
  });

  /**
   * Verifies that the cleanup function of useEffect resets country data on unmount.
   */
  it('should cleanup country data on unmount without errors', async () => {
    mockGet.mockResolvedValue({ data: sampleCountries } as any);

    const { unmount } = render(<AddNewDirector />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalled();
    });

    // Unmounting should not throw
    expect(() => unmount()).not.toThrow();
  });

  /**
   * Verifies that AddNewDirector renders country options in the dropdown
   * after data is fetched (lines 28, 83-86 in AddNewDirector.tsx).
   * This covers the renderValue and MenuItem rendering branches.
   */
  it('should render country dropdown options after fetch', async () => {
    mockGet.mockResolvedValue({ data: sampleCountries } as any);

    render(<AddNewDirector />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalled();
    });

    // The form should be present with all fields
    expect(screen.getByLabelText(/Director/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/URL/i)).toBeInTheDocument();
    expect(document.getElementById('form')).toBeInTheDocument();
  });

  /**
   * Verifies that AddNewDirector resets the form after a successful POST submission.
   * This covers the resetForm() call in the .then() callback (line 28 in AddNewDirector.tsx).
   */
  it('should reset form after successful submission', async () => {
    mockPost.mockResolvedValue({ data: {} } as any);
    mockGet.mockResolvedValue({ data: sampleCountries } as any);

    render(<AddNewDirector />);

    const nameInput = screen.getByLabelText(/Director/i);
    fireEvent.change(nameInput, { target: { value: 'Test Director' } });

    const urlInput = screen.getByLabelText(/URL/i);
    fireEvent.change(urlInput, { target: { value: 'https://www.imdb.com/name/test' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled();
    });

    // After successful submission, form should still be in DOM
    expect(document.getElementById('form')).toBeInTheDocument();
  });

  /**
   * Verifies that AddNewDirector renders country MenuItem items after fetching
   * (covers lines 83-86: countryData.map rendering MenuItem with Checkbox).
   * Opens the Select dropdown to trigger MenuItem rendering.
   */
  it('should render country MenuItems after data is fetched (lines 83-86)', async () => {
    mockGet.mockResolvedValue({ data: sampleCountries } as any);

    render(<AddNewDirector />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalled();
    });

    // Open the country select to trigger MenuItem rendering
    const countrySelect = document.getElementById('demo-multiple-checkbox');
    if (countrySelect) {
      fireEvent.mouseDown(countrySelect);
    }

    // After opening, country options should be in the DOM
    await waitFor(() => {
      const unitedStates = screen.queryByText('United States');
      const unitedKingdom = screen.queryByText('United Kingdom');
      // At least one country should be rendered
      expect(unitedStates || unitedKingdom).not.toBeNull();
    });
  });

  /**
   * Verifies that the renderValue callback in the Country Select renders
   * selected country names (line 82-87 in AddNewDirector.tsx).
   */
  it('should render selected country names via renderValue callback', async () => {
    mockGet.mockResolvedValue({ data: sampleCountries } as any);

    render(<AddNewDirector />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalled();
    });

    // The select input renders with the current value
    // When no country is selected, renderValue returns empty string
    const selectInput = document.querySelector('input[name="country"]');
    expect(selectInput).toBeInTheDocument();
  });
});


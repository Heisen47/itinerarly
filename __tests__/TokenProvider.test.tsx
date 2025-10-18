import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TokenProvider, useToken } from '@/lib/TokenProvider';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));

// Test component that uses the token context
const TestComponent = () => {
  const { token, isLoading, error, isTokenAvailable } = useToken();
  
  return (
    <div>
      <div data-testid="token-count">{token}</div>
      <div data-testid="is-loading">{isLoading.toString()}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="is-available">{isTokenAvailable.toString()}</div>
    </div>
  );
};

describe('TokenProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides token context to child components', async () => {
    require('js-cookie').get.mockReturnValue('mock-auth-token');

    mockedAxios.get.mockResolvedValue({
      data: { remainingTokens: 5 }
    });

    render(
      <TokenProvider>
        <TestComponent />
      </TokenProvider>
    );

    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');

    await waitFor(() => {
      expect(screen.getByTestId('token-count')).toHaveTextContent('5');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
      expect(screen.getByTestId('is-available')).toHaveTextContent('true');
    });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/tokens/remaining',
      { withCredentials: true }
    );
  });

  it('handles unauthenticated user', async () => {
  // Mock unauthenticated user (return undefined so auth check treats as absent)
  require('js-cookie').get.mockReturnValue(undefined);
  mockedAxios.get.mockReset();

    render(
      <TokenProvider>
        <TestComponent />
      </TokenProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('token-count')).toHaveTextContent('0');
      expect(screen.getByTestId('is-available')).toHaveTextContent('false');
    });

    // Should not call API when not authenticated
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    mockedAxios.get.mockRejectedValue(new Error('API Error'));

    // Mock authenticated user
    require('js-cookie').get.mockReturnValue('mock-auth-token');

    render(
      <TokenProvider>
        <TestComponent />
      </TokenProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('token-count')).toHaveTextContent('0');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to fetch tokens');
      expect(screen.getByTestId('is-available')).toHaveTextContent('false');
    });
  });
});

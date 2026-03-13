import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useUniAuth } from '@55387.ai/uniauth-react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LocaleProvider } from '@/components/providers/locale-provider';
import zhMessages from '@/i18n/messages/zh.json';

// Mock useUniAuth
vi.mock('@55387.ai/uniauth-react', () => ({
  useUniAuth: vi.fn(),
}));

describe('ProtectedRoute pending & banned states', () => {
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <LocaleProvider initialLocale="zh" initialMessages={zhMessages}>
        {ui}
      </LocaleProvider>
    );
  };

  it('renders pending approval screen and handles switch account', async () => {
    vi.mocked(useUniAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      login: mockLogin,
      logout: mockLogout,
      user: { id: 'test-id', email: 'test@example.com' },
      getToken: vi.fn(),
      session: null,
      error: null
    } as any);

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ role: 'pending' }),
    });

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Wait for sync to finish and text to appear
    await waitFor(() => {
      expect(screen.getByText('等待审核')).toBeInTheDocument();
    });

    // Check switch account button
    const switchButton = screen.getByRole('button', { name: /切换账号/i });
    expect(switchButton).toBeInTheDocument();

    // Click switch account
    fireEvent.click(switchButton);
    expect(mockLogout).toHaveBeenCalled();
  });

  it('renders banned screen and handles switch account', async () => {
    vi.mocked(useUniAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      login: mockLogin,
      logout: mockLogout,
      user: { id: 'test-id-banned', email: 'banned@example.com' },
      getToken: vi.fn(),
      session: null,
      error: null
    } as any);

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ role: 'banned' }),
    });

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('拒绝访问')).toBeInTheDocument();
    });

    const switchButton = screen.getByRole('button', { name: /切换账号/i });
    expect(switchButton).toBeInTheDocument();

    fireEvent.click(switchButton);
    expect(mockLogout).toHaveBeenCalled();
  });
});

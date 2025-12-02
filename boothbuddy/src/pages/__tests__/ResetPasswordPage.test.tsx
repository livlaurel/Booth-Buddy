import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { act } from '@testing-library/react'
import ResetPasswordPage from '../ResetPasswordPage'

// Mock dependencies
vi.mock('../../components/header', () => ({
  default: () => <div data-testid="header">Header</div>
}))

vi.mock('../../components/footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}))

vi.mock('firebase/auth', () => ({
  confirmPasswordReset: vi.fn(),
}))

vi.mock('../firebaseConfig', () => ({
  auth: {},
}))

vi.mock('../utils/validators', () => ({
  isPasswordValid: vi.fn((password: string) => {
    return password.length >= 8 && 
           /\d/.test(password) && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[!@#$%^&*]/.test(password)
  }),
  getPasswordChecklist: vi.fn((password: string) => ({
    length: password.length >= 8,
    number: /\d/.test(password),
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    special: /[!@#$%^&*]/.test(password),
  })),
}))

describe('ResetPasswordPage Component', () => {
  beforeEach(() => {
    vi.useRealTimers() // Use real timers for async operations
    vi.clearAllMocks()
    global.console.error = vi.fn()
  })

  it('should render Header and Footer', () => {
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    )

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('should render Reset Password heading', () => {
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument()
  })

  it('should render new password input', () => {
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    )

    const passwordInput = screen.getByPlaceholderText(/^Enter new password$/i)
    expect(passwordInput).toBeInTheDocument()
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('should render confirm password input', () => {
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    )

    const confirmInput = screen.getByPlaceholderText(/re-enter new password/i)
    expect(confirmInput).toBeInTheDocument()
    expect(confirmInput).toHaveAttribute('type', 'password')
  })

  it('should render Reset Password button', () => {
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument()
  })

  it('should show error when fields are empty', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    )

    const resetButton = screen.getByRole('button', { name: /reset password/i })
    await user.click(resetButton)

    await waitFor(() => {
      expect(screen.getByText(/please fill out both fields/i)).toBeInTheDocument()
    })
  })

  it('should show error when passwords do not match', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    )

    const passwordInput = screen.getByPlaceholderText(/^Enter new password$/i)
    const confirmInput = screen.getByPlaceholderText(/^Re-enter new password$/i)
    const resetButton = screen.getByRole('button', { name: /reset password/i })

    await user.type(passwordInput, 'Test123!')
    await user.type(confirmInput, 'Different123!')
    await user.click(resetButton)

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('should show error when password is invalid', async () => {
    const user = userEvent.setup({ delay: null })
    // The validators are already mocked at the top, so we can't override per test
    // Instead, test with a password that fails validation
    const weakPassword = 'weak'

    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    )

    const passwordInput = screen.getByPlaceholderText(/^Enter new password$/i)
    const confirmInput = screen.getByPlaceholderText(/^Re-enter new password$/i)
    const resetButton = screen.getByRole('button', { name: /reset password/i })

    await user.type(passwordInput, 'weak')
    await user.type(confirmInput, 'weak')
    await user.click(resetButton)

    await waitFor(() => {
      expect(screen.getByText(/password does not meet the required criteria/i)).toBeInTheDocument()
    })
  })

  it('should show password checklist when password is entered', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    )

    const passwordInput = screen.getByPlaceholderText(/^Enter new password$/i)
    await user.type(passwordInput, 'Test123!')

    await waitFor(() => {
      expect(screen.getByText(/between 6–8 characters/i)).toBeInTheDocument()
    })
  })

  it('should handle successful password reset', async () => {
    const user = userEvent.setup({ delay: null })
    const { confirmPasswordReset } = await import('firebase/auth')
    
    vi.mocked(confirmPasswordReset).mockResolvedValueOnce(undefined)

    render(
      <MemoryRouter initialEntries={['/?oobCode=test-code']}>
        <ResetPasswordPage />
      </MemoryRouter>
    )

    const passwordInput = screen.getByPlaceholderText(/^Enter new password$/i)
    const confirmInput = screen.getByPlaceholderText(/^Re-enter new password$/i)
    const resetButton = screen.getByRole('button', { name: /reset password/i })

    await user.type(passwordInput, 'Test123!')
    await user.type(confirmInput, 'Test123!')
    await user.click(resetButton)

    await waitFor(() => {
      expect(confirmPasswordReset).toHaveBeenCalled()
    })
  })
})


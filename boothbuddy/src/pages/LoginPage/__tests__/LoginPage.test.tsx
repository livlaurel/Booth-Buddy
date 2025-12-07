import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from '../LoginPage'

// Mock dependencies
vi.mock('../../components/header', async () => {
  const React = await import('react')
  return {
    default: () => React.createElement('div', { 'data-testid': 'header' }, 'Header')
  }
})

vi.mock('../../components/footer', async () => {
  const React = await import('react')
  return {
    default: () => React.createElement('div', { 'data-testid': 'footer' }, 'Footer')
  }
})

vi.mock('react-icons/fa', () => ({
  FaEye: () => <div data-testid="eye-icon">Eye</div>,
  FaEyeSlash: () => <div data-testid="eye-slash-icon">EyeSlash</div>,
  FaUserAlt: () => <div data-testid="user-icon">UserIcon</div>
}))

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}))

vi.mock('../../firebaseConfig', () => ({
  auth: {},
}))

vi.mock('../../utils/errorMessages', () => ({
  errorMessage: (code: string) => `Error: ${code}`,
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.useRealTimers() // Use real timers for async operations
    vi.clearAllMocks()
    global.console.error = vi.fn()
  })

  it('should render Header and Footer', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    // Header renders as a <main> element with nav, so check for that structure
    const headerNav = document.querySelector('main nav')
    expect(headerNav).toBeInTheDocument()
    
    // Footer renders as a <footer> element
    const footer = document.querySelector('footer')
    expect(footer).toBeInTheDocument()
  })

  it('should render Login heading', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
  })

  it('should render email input', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const emailInput = screen.getByPlaceholderText(/enter email/i)
    expect(emailInput).toBeInTheDocument()
    expect(emailInput).toHaveAttribute('type', 'text')
  })

  it('should render password input', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const passwordInput = screen.getByPlaceholderText(/enter password/i)
    expect(passwordInput).toBeInTheDocument()
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('should toggle password visibility', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const passwordInput = screen.getByPlaceholderText(/enter password/i)
    const toggleButton = screen.getByRole('button', { name: /eye/i })

    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(toggleButton)

    await waitFor(() => {
      expect(passwordInput).toHaveAttribute('type', 'text')
    })
  })

  it('should render Forgot Password link', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    expect(screen.getByText(/forgot password/i)).toBeInTheDocument()
  })

  it('should render Login button', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('should render Sign Up link', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const signupLink = screen.getByRole('link', { name: /sign up/i })
    expect(signupLink).toBeInTheDocument()
    expect(signupLink).toHaveAttribute('href', '/signup')
  })

  it('should update email input value', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const emailInput = screen.getByPlaceholderText(/enter email/i)
    await user.type(emailInput, 'test@example.com')

    expect(emailInput).toHaveValue('test@example.com')
  })

  it('should update password input value', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const passwordInput = screen.getByPlaceholderText(/enter password/i)
    await user.type(passwordInput, 'password123')

    expect(passwordInput).toHaveValue('password123')
  })

  it('should show error message when login fails', async () => {
    const user = userEvent.setup({ delay: null })
    const { signInWithEmailAndPassword } = await import('firebase/auth')
    
    vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce({
      code: 'auth/invalid-credential',
    })

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const emailInput = screen.getByPlaceholderText(/enter email/i)
    const passwordInput = screen.getByPlaceholderText(/enter password/i)
    const loginButton = screen.getByRole('button', { name: /login/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(loginButton)

    // Wait for setTimeout (1200ms) + async operation + state update
    await waitFor(() => {
      // The error message for auth/invalid-credential is "Invalid email or password. Please try again."
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should handle forgot password click', async () => {
    const user = userEvent.setup({ delay: null })
    const { sendPasswordResetEmail } = await import('firebase/auth')
    
    vi.mocked(sendPasswordResetEmail).mockResolvedValueOnce(undefined)

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const emailInput = screen.getByPlaceholderText(/enter email/i)
    await user.type(emailInput, 'test@example.com')

    const forgotPasswordLink = screen.getByText(/forgot password/i)
    await user.click(forgotPasswordLink)

    await waitFor(() => {
      expect(sendPasswordResetEmail).toHaveBeenCalled()
    })
  })

  it('should show error when forgot password clicked without email', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const forgotPasswordLink = screen.getByText(/forgot password/i)
    await user.click(forgotPasswordLink)

    await waitFor(() => {
      expect(screen.getByText(/please enter your email first/i)).toBeInTheDocument()
    })
  })
})


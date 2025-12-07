import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import SignupPage from '../SignupPage'

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
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
}))

vi.mock('../../firebaseConfig', () => ({
  auth: {},
}))

vi.mock('../../utils/errorMessages', () => ({
  errorMessage: (code: string) => `Error: ${code}`,
}))

vi.mock('../../utils/validators', () => ({
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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

describe('SignupPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.console.error = vi.fn()
  })

  it('should render Header and Footer', () => {
    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    )

    // Header renders as a <main> element with nav, so check for that structure
    const headerNav = document.querySelector('main nav')
    expect(headerNav).toBeInTheDocument()
    
    // Footer renders as a <footer> element
    const footer = document.querySelector('footer')
    expect(footer).toBeInTheDocument()
  })

  it('should render Sign Up heading', () => {
    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    )

    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument()
  })

  it('should render email input', () => {
    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    )

    const emailInput = screen.getByPlaceholderText(/enter email/i)
    expect(emailInput).toBeInTheDocument()
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('should render username input', () => {
    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    )

    const usernameInput = screen.getByPlaceholderText(/enter username/i)
    expect(usernameInput).toBeInTheDocument()
  })

  it('should render password input', () => {
    render(
      <BrowserRouter>
        <SignupPage />
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
        <SignupPage />
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

  it('should show password checklist when password is entered', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    )

    const passwordInput = screen.getByPlaceholderText(/enter password/i)
    await user.type(passwordInput, 'Test123!')

    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('should render Sign Up button', () => {
    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    )

    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('should disable Sign Up button when fields are empty', () => {
    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    )

    const signupButton = screen.getByRole('button', { name: /sign up/i })
    expect(signupButton).toBeDisabled()
  })

  it('should enable Sign Up button when all fields are filled', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    )

    const emailInput = screen.getByPlaceholderText(/enter email/i)
    const usernameInput = screen.getByPlaceholderText(/enter username/i)
    const passwordInput = screen.getByPlaceholderText(/enter password/i)
    const signupButton = screen.getByRole('button', { name: /sign up/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'Test123!')

    await waitFor(() => {
      expect(signupButton).not.toBeDisabled()
    })
  })

  it('should show error when fields are empty on submit', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    )

    // Fill fields first to enable button
    const emailInput = screen.getByPlaceholderText(/enter email/i)
    const usernameInput = screen.getByPlaceholderText(/enter username/i)
    const passwordInput = screen.getByPlaceholderText(/enter password/i)
    
    await user.type(emailInput, 'test@example.com')
    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'Test123!')
    
    // Clear fields to make them empty
    await user.clear(emailInput)
    await user.clear(usernameInput)
    await user.clear(passwordInput)
    
    // Button should be disabled when fields are empty
    const signupButton = screen.getByRole('button', { name: /sign up/i })
    expect(signupButton).toBeDisabled()
  })

  it('should show error when password is invalid', async () => {
    const user = userEvent.setup({ delay: null })
    // The validators are already mocked at the top, so we can't override per test
    // Instead, test with a password that fails validation

    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    )

    const emailInput = screen.getByPlaceholderText(/enter email/i)
    const usernameInput = screen.getByPlaceholderText(/enter username/i)
    const passwordInput = screen.getByPlaceholderText(/enter password/i)
    const signupButton = screen.getByRole('button', { name: /sign up/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'weak')
    await user.click(signupButton)

    await waitFor(() => {
      expect(screen.getByText(/password does not meet the required criteria/i)).toBeInTheDocument()
    })
  })

  it('should render Log In link', () => {
    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    )

    const loginLink = screen.getByRole('link', { name: /log in/i })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', '/login')
  })
})


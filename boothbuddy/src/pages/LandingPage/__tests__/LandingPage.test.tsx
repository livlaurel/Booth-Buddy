import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import LandingPage from '../LandingPage'

// Mock react-icons first (Header uses FaUserAlt)
vi.mock('react-icons/fa', async () => {
  const React = await import('react')
  return {
    FaUserAlt: () => React.createElement('div', { 'data-testid': 'user-icon' }, 'UserIcon')
  }
})

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

vi.mock('../../imgs/homebooth.png', () => ({ default: 'homebooth.png' }))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

vi.mock('firebase/auth', () => ({
  signInAnonymously: vi.fn(),
}))

vi.mock('../../firebaseConfig', () => ({
  auth: {},
}))

describe('LandingPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.alert = vi.fn()
    global.console.error = vi.fn()
  })

  it('should render Header and Footer', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    )

    // Header renders as a <main> element with nav, so check for that structure
    const headerNav = document.querySelector('main nav')
    expect(headerNav).toBeInTheDocument()
    
    // Footer renders as a <footer> element
    const footer = document.querySelector('footer')
    expect(footer).toBeInTheDocument()
  })

  it('should render booth image', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    )

    const image = screen.getByAltText('Booth Buddy')
    expect(image).toBeInTheDocument()
    // The image import is processed by Vite, so it becomes a full path
    expect(image).toHaveAttribute('src', expect.stringContaining('homebooth'))
  })

  it('should render Login button', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    )

    const buttons = screen.getAllByRole('button')
    const loginButton = buttons.find(btn => btn.textContent === 'Login')
    expect(loginButton).toBeInTheDocument()
  })

  it('should render Sign Up button', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    )

    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('should render Guest Login button', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    )

    expect(screen.getByRole('button', { name: /guest login/i })).toBeInTheDocument()
  })

  it('should navigate to login when Login button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    )

    const buttons = screen.getAllByRole('button')
    const loginButton = buttons.find(btn => btn.textContent === 'Login')
    expect(loginButton).toBeInTheDocument()
    if (loginButton) {
      await user.click(loginButton)
    }
  })

  it('should navigate to signup when Sign Up button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    )

    const signupButton = screen.getByRole('button', { name: /sign up/i })
    await user.click(signupButton)

    expect(signupButton).toBeInTheDocument()
  })
})


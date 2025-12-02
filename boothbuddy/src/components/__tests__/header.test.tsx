import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Header from '../header'

// Mock images
vi.mock('../../imgs/boothbuddy_logo.png', () => ({ default: 'logo.png' }))

// Mock react-icons
vi.mock('react-icons/fa', () => ({
  FaUserAlt: () => <div data-testid="user-icon">UserIcon</div>
}))

describe('Header Component', () => {
  it('should render the header component', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )

    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('should render logo image', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )

    const logo = screen.getByAltText('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', 'logo.png')
  })

  it('should render user profile link', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )

    const userLink = screen.getByRole('link', { name: /user/i })
    expect(userLink).toBeInTheDocument()
    expect(userLink).toHaveAttribute('href', '#/profile')
  })

  it('should render user icon', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )

    expect(screen.getByTestId('user-icon')).toBeInTheDocument()
  })

  it('should have correct navigation structure', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )

    const nav = document.querySelector('nav')
    expect(nav).toBeInTheDocument()
  })

  it('should have home link with logo', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )

    const homeLink = screen.getByRole('link', { name: /logo/i })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })
})


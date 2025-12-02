import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Download from '../download'

// Mock child components
vi.mock('../../components/header', () => ({
  default: () => <div data-testid="header">Header</div>
}))

vi.mock('../../components/footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}))

describe('Download Component', () => {
  it('should render Header and Footer', () => {
    render(
      <BrowserRouter>
        <Download />
      </BrowserRouter>
    )

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('should render the component without errors', () => {
    expect(() => {
      render(
        <BrowserRouter>
          <Download />
        </BrowserRouter>
      )
    }).not.toThrow()
  })
})


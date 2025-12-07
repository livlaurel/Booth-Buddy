import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '../footer'

describe('Footer Component', () => {
  it('should render the footer component', () => {
    render(<Footer />)

    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('should display copyright text', () => {
    render(<Footer />)

    expect(screen.getByText(/Created by: Booth Buddy Studio/i)).toBeInTheDocument()
  })

  it('should have correct footer structure', () => {
    render(<Footer />)

    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
    expect(footer.tagName).toBe('FOOTER')
  })

  it('should have correct styling classes', () => {
    render(<Footer />)

    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveClass('bg-[#fffefd]', 'w-full', 'fixed', 'bottom-0', 'left-0')
  })
})


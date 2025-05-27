import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Footer } from './Footer'

describe('Footer', () => {
  it('renders copyright text', () => {
    render(<Footer />)
    
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(`© ${currentYear} GS Portfolio. All rights reserved.`)).toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    render(<Footer />)
    
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
  })

  it('applies correct styling', () => {
    render(<Footer />)
    
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveClass('border-t', 'bg-background', 'py-6')
  })

  it('has centered content', () => {
    render(<Footer />)
    
    const container = screen.getByRole('contentinfo').firstChild
    expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'text-center')
  })

  it('has muted text color', () => {
    render(<Footer />)
    
    const text = screen.getByText(/© \d{4} GS Portfolio/)
    expect(text).toHaveClass('text-muted-foreground')
  })
}) 
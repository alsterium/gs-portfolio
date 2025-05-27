import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Header } from './Header'

describe('Header', () => {
  it('renders site title', () => {
    render(<Header />)
    
    expect(screen.getByText('GS Portfolio')).toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    render(<Header />)
    
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
  })

  it('applies correct styling', () => {
    render(<Header />)
    
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('border-b', 'bg-background')
  })

  it('contains navigation elements', () => {
    render(<Header />)
    
    // ナビゲーションが存在することを確認
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })

  it('has responsive container', () => {
    render(<Header />)
    
    const container = screen.getByRole('banner').firstChild
    expect(container).toHaveClass('container', 'mx-auto', 'px-4')
  })
}) 
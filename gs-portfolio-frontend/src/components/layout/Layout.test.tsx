import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Layout } from './Layout'

describe('Layout', () => {
  it('renders children content', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders header and footer', () => {
    render(
      <Layout>
        <div>Main Content</div>
      </Layout>
    )
    
    // ヘッダーとフッターが存在することを確認
    expect(screen.getByRole('banner')).toBeInTheDocument() // header
    expect(screen.getByRole('contentinfo')).toBeInTheDocument() // footer
  })

  it('has proper semantic structure', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    // セマンティックな構造を確認
    const header = screen.getByRole('banner')
    const main = screen.getByRole('main')
    const footer = screen.getByRole('contentinfo')
    
    expect(header).toBeInTheDocument()
    expect(main).toBeInTheDocument()
    expect(footer).toBeInTheDocument()
    
    // mainにchildrenが含まれていることを確認
    expect(main).toContainElement(screen.getByText('Content'))
  })

  it('applies correct CSS classes for layout', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    const container = screen.getByRole('banner').parentElement
    expect(container).toHaveClass('min-h-screen', 'flex', 'flex-col')
  })

  it('main content area has proper styling', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    const main = screen.getByRole('main')
    expect(main).toHaveClass('flex-1')
  })
}) 
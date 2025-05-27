import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Header } from './Header'

describe('Header', () => {
  it('ヘッダーが正しく表示される', () => {
    render(<Header />)
    
    expect(screen.getByText('GS Portfolio')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('ナビゲーションリンクが正しく設定される', () => {
    render(<Header />)
    
    const homeLink = screen.getByText('Home')
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('カスタムクラス名が適用される', () => {
    const { container } = render(<Header className="custom-header" />)
    
    const header = container.querySelector('header')
    expect(header).toHaveClass('custom-header')
  })

  it('統一されたデザインシステムが適用されている', () => {
    const { container } = render(<Header />)
    
    const header = container.querySelector('header')
    
    // GSカラーパレットとスタイリングが適用されている
    expect(header).toHaveClass('border-b')
    expect(header).toHaveClass('bg-gradient-to-r')
    expect(header).toHaveClass('shadow-sm')
  })

  it('ブランドロゴのスタイリングが適用されている', () => {
    render(<Header />)
    
    const brandTitle = screen.getByText('GS Portfolio')
    
    // GSカラーパレットが適用されている（グラデーション効果）
    expect(brandTitle).toHaveClass('bg-gradient-to-r')
    expect(brandTitle).toHaveClass('font-bold')
  })

  it('ナビゲーションリンクのホバー効果が適用されている', () => {
    render(<Header />)
    
    const homeLink = screen.getByText('Home')
    
    // ホバー効果が適用されている
    expect(homeLink).toHaveClass('hover:text-gs-primary')
    expect(homeLink).toHaveClass('transition-all')
  })

  it('has proper semantic structure', () => {
    render(<Header />)
    
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
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
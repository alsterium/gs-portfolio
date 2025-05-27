import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('renders page title', () => {
    render(<HomePage />)
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Gaussian Splatting Portfolio')
  })

  it('renders page description', () => {
    render(<HomePage />)
    
    expect(screen.getByText(/3Dモデルのコレクション/)).toBeInTheDocument()
  })

  it('has proper page structure', () => {
    render(<HomePage />)
    
    // ページコンテナが存在することを確認
    const container = screen.getByRole('heading', { level: 1 }).closest('div')?.parentElement
    expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'py-8')
  })

  it('renders GSFileGrid component placeholder', () => {
    render(<HomePage />)
    
    // GSFileGridコンポーネントのプレースホルダーが表示されることを確認
    expect(screen.getByText('GSファイル一覧がここに表示されます')).toBeInTheDocument()
  })

  it('has responsive layout', () => {
    render(<HomePage />)
    
    const title = screen.getByRole('heading', { level: 1 })
    expect(title).toHaveClass('text-3xl', 'font-bold', 'text-center', 'mb-4')
  })
}) 
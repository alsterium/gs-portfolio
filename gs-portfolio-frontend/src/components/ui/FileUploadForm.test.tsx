import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileUploadForm } from './FileUploadForm';
import { apiClient } from '@/lib/api';

// APIクライアントをモック
vi.mock('@/lib/api', () => ({
  apiClient: {
    uploadFile: vi.fn(),
  },
}));

describe('FileUploadForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常にレンダリングされる', () => {
    render(<FileUploadForm onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    expect(screen.getByText('ファイルアップロード')).toBeInTheDocument();
    expect(screen.getByLabelText('表示名 *')).toBeInTheDocument();
    expect(screen.getByLabelText('説明')).toBeInTheDocument();
    expect(screen.getByText('Gaussian Splattingファイル *')).toBeInTheDocument();
    expect(screen.getByText('サムネイル画像（オプション）')).toBeInTheDocument();
  });

  it('表示名が必須であることを検証する', async () => {
    render(<FileUploadForm onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    const submitButton = screen.getByRole('button', { name: 'アップロード' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('表示名は必須です')).toBeInTheDocument();
    });
  });

  it('GSファイルが必須であることを検証する', async () => {
    render(<FileUploadForm onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    const displayNameInput = screen.getByLabelText('表示名 *');
    fireEvent.change(displayNameInput, { target: { value: 'テストファイル' } });

    const submitButton = screen.getByRole('button', { name: 'アップロード' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Gaussian Splattingファイルは必須です')).toBeInTheDocument();
    });
  });

  it('正常なファイルアップロードが成功する', async () => {
    const mockResponse = { success: true };
    (apiClient.uploadFile as any).mockResolvedValue(mockResponse);

    render(<FileUploadForm onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    // 表示名を入力
    const displayNameInput = screen.getByLabelText('表示名 *');
    fireEvent.change(displayNameInput, { target: { value: 'テストファイル' } });

    // 説明を入力
    const descriptionInput = screen.getByLabelText('説明');
    fireEvent.change(descriptionInput, { target: { value: 'テスト用のファイルです' } });

    // GSファイルをドロップ（react-dropzoneのonDropコールバックを直接呼び出し）
    const gsFile = new File(['test content'], 'test.splat', { type: 'application/octet-stream' });
    const gsDropzone = screen.getByText('ファイルをドラッグ&ドロップ').closest('div');
    
    const gsInput = gsDropzone?.querySelector('input[type="file"]');
    if (gsInput) {
      fireEvent.change(gsInput, { target: { files: [gsFile] } });
    }

    // ファイルが選択されるまで待機
    await waitFor(() => {
      expect(screen.getByText('test.splat')).toBeInTheDocument();
    });

    // フォーム送信
    const submitButton = screen.getByRole('button', { name: 'アップロード' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(apiClient.uploadFile).toHaveBeenCalledWith('/admin/gs-files', expect.any(FormData));
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('アップロードエラーが正しく処理される', async () => {
    const mockError = new Error('アップロードに失敗しました');
    (apiClient.uploadFile as any).mockRejectedValue(mockError);

    render(<FileUploadForm onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    // 表示名を入力
    const displayNameInput = screen.getByLabelText('表示名 *');
    fireEvent.change(displayNameInput, { target: { value: 'テストファイル' } });

    // GSファイルをドロップ
    const gsFile = new File(['test content'], 'test.splat', { type: 'application/octet-stream' });
    const gsDropzone = screen.getByText('ファイルをドラッグ&ドロップ').closest('div');
    
    const gsInput = gsDropzone?.querySelector('input[type="file"]');
    if (gsInput) {
      fireEvent.change(gsInput, { target: { files: [gsFile] } });
    }

    // ファイルが選択されるまで待機
    await waitFor(() => {
      expect(screen.getByText('test.splat')).toBeInTheDocument();
    });

    // フォーム送信
    const submitButton = screen.getByRole('button', { name: 'アップロード' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('アップロードに失敗しました')).toBeInTheDocument();
      expect(mockOnError).toHaveBeenCalledWith('アップロードに失敗しました');
    });
  });

  it('無効なファイル形式が拒否される', async () => {
    render(<FileUploadForm onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    // 無効なファイル形式をドロップ
    const invalidFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const gsDropzone = screen.getByText('ファイルをドラッグ&ドロップ').closest('div');
    
    const gsInput = gsDropzone?.querySelector('input[type="file"]');
    if (gsInput) {
      fireEvent.change(gsInput, { target: { files: [invalidFile] } });
    }

    await waitFor(() => {
      expect(screen.getByText(/サポートされていないファイル形式です/)).toBeInTheDocument();
    });
  });

  it('ファイルサイズ制限が正しく動作する', async () => {
    render(<FileUploadForm onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    // 大きすぎるファイルを作成（100MB超）
    const largeContent = new Array(101 * 1024 * 1024).fill('x').join('');
    const largeFile = new File([largeContent], 'large.splat', { type: 'application/octet-stream' });
    const gsDropzone = screen.getByText('ファイルをドラッグ&ドロップ').closest('div');
    
    const gsInput = gsDropzone?.querySelector('input[type="file"]');
    if (gsInput) {
      fireEvent.change(gsInput, { target: { files: [largeFile] } });
    }

    await waitFor(() => {
      expect(screen.getByText(/ファイルサイズが大きすぎます/)).toBeInTheDocument();
    });
  });
}); 
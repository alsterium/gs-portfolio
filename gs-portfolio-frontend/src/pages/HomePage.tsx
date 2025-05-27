import { useState, useEffect } from 'react';
import { GSFileGrid } from '@/components/ui/GSFileGrid';
import type { GSFile } from '@/types';

export function HomePage() {
  const [files, setFiles] = useState<GSFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    // TODO: 実際のAPI呼び出しに置き換える
    const fetchFiles = async () => {
      try {
        setLoading(true);
        // モックデータで一時的に対応
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒待機
        
        const mockFiles: GSFile[] = [
          {
            id: 'sample-1',
            displayName: 'サンプルGSファイル1',
            originalName: 'sample1.splat',
            fileSize: 15728640, // 15MB
            filePath: '/files/sample1.splat',
            thumbnailPath: '/thumbnails/sample1.jpg',
            uploadDate: '2024-01-15T10:30:00Z',
            updatedDate: '2024-01-15T10:30:00Z',
            description: 'これはサンプルのGaussian Splattingファイルです。美しい3Dシーンを表現しています。',
          },
          {
            id: 'sample-2',
            displayName: 'サンプルGSファイル2',
            originalName: 'sample2.splat',
            fileSize: 23068672, // 22MB
            filePath: '/files/sample2.splat',
            uploadDate: '2024-01-16T14:20:00Z',
            updatedDate: '2024-01-16T14:20:00Z',
            description: 'もう一つのサンプルファイルです。',
          },
        ];
        
        setFiles(mockFiles);
      } catch (err) {
        setError('ファイルの読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-center mb-4">
          Gaussian Splatting Portfolio
        </h1>
        <p className="text-lg text-gray-600">
          3Dモデルのコレクションをご覧ください
        </p>
      </div>
      
      <div className="mt-8">
        <GSFileGrid 
          files={files}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
} 
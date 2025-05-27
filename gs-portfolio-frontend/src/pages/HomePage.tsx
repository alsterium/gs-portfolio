import { useState, useEffect } from 'react';
import { GSFileGrid } from '@/components/ui/GSFileGrid';
import { getGSFiles } from '@/lib/gsFiles';
import type { GSFile } from '@/types';

export function HomePage() {
  const [files, setFiles] = useState<GSFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const response = await getGSFiles(1, 20);
        setFiles(response.data);
      } catch (err) {
        console.error('ファイル取得エラー:', err);
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
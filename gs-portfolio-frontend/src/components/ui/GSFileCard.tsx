import { Link } from 'react-router';
import { Box, Calendar, HardDrive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getGSFileThumbnailUrl } from '@/lib/gsFiles';
import type { GSFile } from '@/types';

interface GSFileCardProps {
  file: GSFile;
  className?: string;
}

export function GSFileCard({ file, className }: GSFileCardProps) {
  const formatFileSize = (bytes: number): string => {
    if (typeof bytes !== 'number' || bytes < 0) {
      return '0 B';
    }
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Link
      to={`/view/${file.id}`}
      className={cn(
        'group block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md',
        className
      )}
    >
      {/* サムネイル */}
      <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-gray-100">
        {file.thumbnail_path ? (
          <img
            src={getGSFileThumbnailUrl(file.id)}
            alt={`${file.display_name}のサムネイル`}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Box className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* ファイル情報 */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
          {file.display_name}
        </h3>
        
        {file.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {file.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <HardDrive className="h-3 w-3" />
            <span>{formatFileSize(file.file_size)}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(file.upload_date)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
} 
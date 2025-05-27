import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className = '' }: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // 全ページを表示
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 省略記号を使用
      if (currentPage <= 3) {
        // 最初の方のページ
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // 最後の方のページ
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 中間のページ
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        前へ
      </Button>

      {getPageNumbers().map((page, index) => (
        <div key={index}>
          {page === '...' ? (
            <span className="px-3 py-2 text-gray-500">...</span>
          ) : (
            <Button
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className="min-w-[40px]"
            >
              {page}
            </Button>
          )}
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center"
      >
        次へ
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
} 
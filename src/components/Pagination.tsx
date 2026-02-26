
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  postsPerPage?: number;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    // If we have 5 or fewer pages, show all of them
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    // Always include the first page, last page, current page,
    // and one page on either side of the current page if possible
    const pageSet = new Set<number>([1, totalPages, currentPage]);
    
    if (currentPage > 1) {
      pageSet.add(currentPage - 1);
    }
    
    if (currentPage < totalPages) {
      pageSet.add(currentPage + 1);
    }
    
    // Add additional pages if we still have room
    let i = 1;
    while (pageSet.size < maxPagesToShow && i <= totalPages) {
      if (!pageSet.has(i) && i < currentPage - 1) {
        pageSet.add(i);
      }
      if (!pageSet.has(totalPages - i + 1) && totalPages - i + 1 > currentPage + 1) {
        pageSet.add(totalPages - i + 1);
      }
      i++;
    }
    
    return Array.from(pageSet).sort((a, b) => a - b);
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div className="flex items-center justify-center space-x-2">
      <button 
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-md border disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      
      {pageNumbers.map((page, index) => {
        // Add ellipsis if there's a gap in the sequence
        const showEllipsisBefore = index > 0 && pageNumbers[index - 1] !== page - 1;
        const isCurrentPage = page === currentPage;
        
        return (
          <React.Fragment key={page}>
            {showEllipsisBefore && (
              <span className="w-10 h-10 flex items-center justify-center">...</span>
            )}
            <button 
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 flex items-center justify-center rounded-md ${
                isCurrentPage 
                  ? 'bg-khabar-600 text-white' 
                  : 'border hover:bg-muted transition-colors'
              }`}
            >
              {page}
            </button>
          </React.Fragment>
        );
      })}
      
      <button 
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-md border disabled:opacity-50"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Pagination;

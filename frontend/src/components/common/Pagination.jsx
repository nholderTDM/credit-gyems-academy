import React from 'react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  maxVisiblePages = 5,
  showFirstLast = true,
  className = ''
}) => {
  // Don't render if there's only one page or no pages
  if (totalPages <= 1) return null;

  // Calculate which page numbers to show
  const getVisiblePages = () => {
    const pages = [];
    const half = Math.floor(maxVisiblePages / 2);
    
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    // Adjust start if we're near the end
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  const showLeftEllipsis = visiblePages[0] > 2;
  const showRightEllipsis = visiblePages[visiblePages.length - 1] < totalPages - 1;

  // Button component for pagination items
  const PaginationButton = ({ 
    page, 
    isActive = false, 
    isDisabled = false, 
    children, 
    onClick 
  }) => {
    const baseClasses = `
      inline-flex items-center justify-center
      min-w-[40px] h-10 px-3
      text-sm font-medium
      border border-slate-300
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1
    `;
    
    const activeClasses = isActive 
      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-800 border-yellow-400 shadow-md' 
      : 'bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400';
    
    const disabledClasses = isDisabled 
      ? 'opacity-50 cursor-not-allowed' 
      : 'cursor-pointer';

    return (
      <button
        onClick={() => !isDisabled && onClick && onClick(page)}
        disabled={isDisabled}
        className={`${baseClasses} ${activeClasses} ${disabledClasses}`.replace(/\s+/g, ' ').trim()}
        aria-label={`Go to page ${page}`}
        aria-current={isActive ? 'page' : undefined}
      >
        {children || page}
      </button>
    );
  };

  // Ellipsis component
  const Ellipsis = () => (
    <span className="inline-flex items-center justify-center min-w-[40px] h-10 px-3 text-slate-400">
      ...
    </span>
  );

  return (
    <nav 
      className={`flex items-center justify-center space-x-1 ${className}`}
      aria-label="Pagination Navigation"
    >
      {/* First page button */}
      {showFirstLast && currentPage > 1 && (
        <PaginationButton
          page={1}
          onClick={onPageChange}
          isDisabled={currentPage === 1}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </PaginationButton>
      )}

      {/* Previous page button */}
      <PaginationButton
        page={currentPage - 1}
        onClick={onPageChange}
        isDisabled={currentPage === 1}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </PaginationButton>

      {/* First page number if not in visible range */}
      {showLeftEllipsis && (
        <>
          <PaginationButton page={1} onClick={onPageChange}>
            1
          </PaginationButton>
          <Ellipsis />
        </>
      )}

      {/* Visible page numbers */}
      {visiblePages.map(page => (
        <PaginationButton
          key={page}
          page={page}
          isActive={page === currentPage}
          onClick={onPageChange}
        >
          {page}
        </PaginationButton>
      ))}

      {/* Last page number if not in visible range */}
      {showRightEllipsis && (
        <>
          <Ellipsis />
          <PaginationButton page={totalPages} onClick={onPageChange}>
            {totalPages}
          </PaginationButton>
        </>
      )}

      {/* Next page button */}
      <PaginationButton
        page={currentPage + 1}
        onClick={onPageChange}
        isDisabled={currentPage === totalPages}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </PaginationButton>

      {/* Last page button */}
      {showFirstLast && currentPage < totalPages && (
        <PaginationButton
          page={totalPages}
          onClick={onPageChange}
          isDisabled={currentPage === totalPages}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </PaginationButton>
      )}
    </nav>
  );
};

export default Pagination;
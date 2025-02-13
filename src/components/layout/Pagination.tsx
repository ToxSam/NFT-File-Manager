import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPrevious,
  onNext
}) => {
  const buttonClasses = [
    "!bg-[#1a1a1a]",
    "!text-gray-300",
    "hover:!bg-[#252525]",
    "!px-3",
    "!py-1.5",
    "!rounded-md",
    "!text-sm",
    "!font-medium",
    "disabled:!opacity-50",
    "disabled:!cursor-not-allowed",
    "!border-0",
    "!outline-none",
    "!shadow-none",
    "![background:_#1a1a1a_!important]",  // Nuclear option
    "![color:_#d1d5db_!important]"        // Nuclear option
  ].join(" ");

  return (
    <div className="flex gap-2 items-center [&>button]:!bg-[#1a1a1a] [&>button]:!border-0">
      <button 
        onClick={onPrevious}
        disabled={currentPage === 1}
        className={buttonClasses}
        style={{ background: '#1a1a1a', border: 'none' }} // Triple nuclear option
      >
        Previous
      </button>
      <span className="text-sm text-gray-400">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className={buttonClasses}
        style={{ background: '#1a1a1a', border: 'none' }} // Triple nuclear option
      >
        Next
      </button>
    </div>
  );
}; 
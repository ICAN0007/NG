import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 10;
    
    let start = Math.max(1, currentPage - 5);
    const end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`relative flex h-10 w-10 items-center justify-center text-sm sm:text-base font-bold transition-all duration-300 ${
            currentPage === i
              ? "text-white"
              : "text-white/40 hover:text-white"
          }`}
        >
          {currentPage === i && (
            <motion.div 
              layoutId="pagination-active"
              className="absolute inset-0 border border-white/20 rounded-full"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          {i}
        </button>
      );
    }

    return pages;
  };


  return (
    <div className="flex flex-col items-center gap-10 py-16 select-none bg-black">
      <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="text-[11px] sm:text-xs font-black tracking-[0.2em] text-white/40 hover:text-white disabled:opacity-5 transition-colors px-2 uppercase"
        >
          First
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="text-white/40 hover:text-white disabled:opacity-5 transition-colors p-2"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-2 sm:gap-6">
          {renderPageNumbers()}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="text-white/40 hover:text-white disabled:opacity-5 transition-colors p-2"
        >
          <ChevronRight className="h-6 w-6" strokeWidth={1.5} />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="text-[11px] sm:text-xs font-black tracking-[0.2em] text-white/40 hover:text-white disabled:opacity-5 transition-colors px-2 uppercase"
        >
          Last
        </button>
      </div>
    </div>
  );
};

export default Pagination;

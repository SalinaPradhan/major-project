import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  hasNextPage,
  hasPrevPage,
  nextPage,
  prevPage,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-sm text-muted-foreground">
        {totalItems} item{totalItems !== 1 ? "s" : ""} · Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={prevPage} disabled={!hasPrevPage}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={nextPage} disabled={!hasNextPage}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

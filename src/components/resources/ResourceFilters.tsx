import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterOption {
  value: string;
  label: string;
}

interface ResourceFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  statusOptions?: FilterOption[];
  statusLabel?: string;
  typeFilter?: string;
  onTypeFilterChange?: (value: string) => void;
  typeOptions?: FilterOption[];
  typeLabel?: string;
}

export function ResourceFilters({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  statusLabel = "Status",
  typeFilter,
  onTypeFilterChange,
  typeOptions,
  typeLabel = "Type",
}: ResourceFiltersProps) {
  const hasActiveFilters = searchValue || (statusFilter && statusFilter !== "all") || (typeFilter && typeFilter !== "all");

  const clearFilters = () => {
    onSearchChange("");
    onStatusFilterChange?.("all");
    onTypeFilterChange?.("all");
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-secondary/50 border-border"
        />
      </div>

      {statusOptions && onStatusFilterChange && (
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[150px] bg-secondary/50 border-border">
            <SelectValue placeholder={statusLabel} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {statusLabel}</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {typeOptions && onTypeFilterChange && (
        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="w-[150px] bg-secondary/50 border-border">
            <SelectValue placeholder={typeLabel} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {typeLabel}</SelectItem>
            {typeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}

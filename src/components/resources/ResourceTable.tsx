import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface ResourceTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
}

export function ResourceTable<T extends { id?: string }>({
  data,
  columns,
  onRowClick
}: ResourceTableProps<T>) {
  return (
    <div className="glass-card rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            {columns.map(col => (
              <TableHead key={col.key} className={cn("text-muted-foreground", col.className)}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={item.id || index}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "cursor-pointer transition-colors duration-200",
                "hover:bg-secondary/30 border-border",
                "animate-slide-up"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {columns.map(col => (
                <TableCell key={col.key} className={col.className}>
                  {col.render
                    ? col.render(item)
                    : (item as any)[col.key]
                  }
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

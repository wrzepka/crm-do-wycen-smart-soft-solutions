'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  paramName?: string;
}

export function DataTablePagination({
  currentPage,
  totalPages,
  paramName = 'page',
}: DataTablePaginationProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Create new url without appending old filters (e.g. search)
  const createPageLink = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, page.toString());
    return `${pathname}?${params.toString()}`;
  };

  // Generate pages
  const renderPageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink href={createPageLink(i)} isActive={currentPage === i}>
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }
    return pages;
  };

  // If there is too few pages, do not render pagination module
  if (totalPages <= 1) return null;

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous button */}
        <PaginationItem>
          <PaginationPrevious
            href={createPageLink(Math.max(1, currentPage - 1))}
            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>

        {/* Start of the list: first elem ... */}
        {currentPage > 2 && (
          <>
            <PaginationItem>
              <PaginationLink href={createPageLink(1)}>1</PaginationLink>
            </PaginationItem>
            {currentPage > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </>
        )}

        {/* Render neighbour pages */}
        {renderPageNumbers()}

        {/* End of the list: ... last elem */}
        {currentPage < totalPages - 1 && (
          <>
            {currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink href={createPageLink(totalPages)}>{totalPages}</PaginationLink>
            </PaginationItem>
          </>
        )}

        {/* Next button */}
        <PaginationItem>
          <PaginationNext
            href={createPageLink(Math.min(totalPages, currentPage + 1))}
            className={
              currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

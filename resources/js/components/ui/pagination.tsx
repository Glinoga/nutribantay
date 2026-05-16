import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type PaginationData = {
    current_page: number
    last_page: number
    from: number | null
    to: number | null
    total: number
}

type PaginationProps = {
    pagination: PaginationData
    onPageChange: (page: number) => void
}

function getPageNumbers(current_page: number, last_page: number): (number | string)[] {
    const pages: (number | string)[] = []
    const delta = 2

    if (last_page <= 7) {
        for (let i = 1; i <= last_page; i++) pages.push(i)
    } else {
        pages.push(1)
        if (current_page > delta + 2) pages.push('...')
        const start = Math.max(2, current_page - delta)
        const end = Math.min(last_page - 1, current_page + delta)
        for (let i = start; i <= end; i++) if (!pages.includes(i)) pages.push(i)
        if (current_page < last_page - delta - 1) pages.push('...')
        if (!pages.includes(last_page)) pages.push(last_page)
    }
    return pages
}

function Pagination({ pagination, onPageChange }: PaginationProps) {
    const { current_page, last_page } = pagination
    if (last_page <= 1) return null

    const pages = getPageNumbers(current_page, last_page)

    return (
        <div className="flex items-center justify-center gap-1.5 pt-4 pb-8">
            <button
                onClick={() => onPageChange(current_page - 1)}
                disabled={current_page === 1}
                className={cn(
                    'flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium',
                    'border-gray-200 bg-white text-gray-700',
                    'hover:bg-gray-50',
                    'transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'page-btn',
                )}
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Prev</span>
            </button>

            <div className="hidden sm:flex items-center gap-1">
                {pages.map((page, idx) =>
                    typeof page === 'number' ? (
                        <button
                            key={idx}
                            onClick={() => onPageChange(page)}
                            className={cn(
                                'rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200',
                                'page-btn',
                                page === current_page
                                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm'
                                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300',
                            )}
                            aria-label={`Go to page ${page}`}
                            aria-current={page === current_page ? 'page' : undefined}
                        >
                            {page}
                        </button>
                    ) : (
                        <span key={idx} className="px-2 py-1.5 text-sm text-gray-400 select-none">
                            ...
                        </span>
                    ),
                )}
            </div>

            <span className="sm:hidden text-sm text-gray-500">
                Page {current_page} of {last_page}
            </span>

            <button
                onClick={() => onPageChange(current_page + 1)}
                disabled={current_page === last_page}
                className={cn(
                    'flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium',
                    'border-gray-200 bg-white text-gray-700',
                    'hover:bg-gray-50',
                    'transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'page-btn',
                )}
                aria-label="Next page"
            >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    )
}

export { Pagination }
export type { PaginationData }

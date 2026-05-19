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
        <div className="flex items-center justify-center pt-4 pb-8">
            <div className="inline-flex items-center gap-1 rounded-md bg-white/70 px-2 py-2 shadow-lg backdrop-blur-sm border border-white/30 sm:px-3 dark:bg-gray-800/70 dark:border-gray-700/50">
                <button
                    onClick={() => onPageChange(current_page - 1)}
                    disabled={current_page === 1}
                    className={cn(
                        'flex cursor-pointer items-center gap-1 rounded-md border px-2 py-2 text-sm font-medium sm:px-3',
                        'border-teal-200 bg-white text-teal-700',
                        'transition-all duration-200',
                        'hover:bg-teal-50 hover:border-teal-300',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'dark:border-teal-800 dark:bg-gray-800 dark:text-teal-300',
                        'dark:hover:bg-teal-900/30 dark:hover:border-teal-700',
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
                                    'cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200',
                                    page === current_page
                                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm'
                                        : 'border border-teal-200 bg-white text-teal-700 hover:bg-teal-50 hover:border-teal-300 dark:border-teal-800 dark:bg-gray-800 dark:text-teal-300 dark:hover:bg-teal-900/30 dark:hover:border-teal-700',
                                )}
                                aria-label={`Go to page ${page}`}
                                aria-current={page === current_page ? 'page' : undefined}
                            >
                                {page}
                            </button>
                        ) : (
                            <span key={idx} className="cursor-default px-2 py-1.5 text-sm text-teal-400 select-none dark:text-teal-500">
                                ...
                            </span>
                        ),
                    )}
                </div>

                <span className="sm:hidden text-sm text-teal-600 font-medium px-2 dark:text-teal-400">
                    Page {current_page} of {last_page}
                </span>

                <button
                    onClick={() => onPageChange(current_page + 1)}
                    disabled={current_page === last_page}
                    className={cn(
                        'flex cursor-pointer items-center gap-1 rounded-md border px-2 py-2 text-sm font-medium sm:px-3',
                        'border-teal-200 bg-white text-teal-700',
                        'transition-all duration-200',
                        'hover:bg-teal-50 hover:border-teal-300',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'dark:border-teal-800 dark:bg-gray-800 dark:text-teal-300',
                        'dark:hover:bg-teal-900/30 dark:hover:border-teal-700',
                    )}
                    aria-label="Next page"
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}

export { Pagination }
export type { PaginationData }

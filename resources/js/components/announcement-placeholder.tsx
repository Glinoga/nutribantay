import { ImageOff } from 'lucide-react';

interface AnnouncementPlaceholderProps {
    className?: string;
}

export default function AnnouncementPlaceholder({ className = '' }: AnnouncementPlaceholderProps) {
    return (
        <div
            className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-[var(--bg)] dark:to-[var(--bg)] ${className}`}
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100/60 dark:bg-[var(--bg-light)]/60">
                <ImageOff className="h-6 w-6 text-teal-400 dark:text-[var(--text-muted)]" />
            </div>
            <span className="text-xs font-medium text-teal-400 dark:text-[var(--text-muted)]">No image</span>
        </div>
    );
}

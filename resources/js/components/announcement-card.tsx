import { Badge } from '@/components/ui/badge';
import { Calendar, Check, Share2, User } from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    color: string;
    description?: string;
}

export interface AnnouncementData {
    id: number;
    slug?: string;
    title: string;
    date: string;
    end_date?: string;
    category_id: number;
    category: Category;
    author?: string;
    summary: string;
    content: string;
    image?: string;
    image_url?: string | null;
    is_expired?: boolean;
}

interface AnnouncementCardProps {
    announcement: AnnouncementData;
    renderActions: () => React.ReactNode;
    variant?: 'default' | 'admin';
    showAuthor?: boolean;
    lineClamp?: number;
    className?: string;
    style?: React.CSSProperties;
    onShare?: (announcement: AnnouncementData) => void;
}

export default function AnnouncementCard({
    announcement,
    renderActions,
    variant = 'default',
    showAuthor = false,
    lineClamp = 3,
    className = '',
    style,
    onShare,
}: AnnouncementCardProps) {
    const isAdmin = variant === 'admin';
    const [copied, setCopied] = useState(false);
    const [imgError, setImgError] = useState(false);

    const handleShare = () => {
        if (onShare) {
            onShare(announcement);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const cardClasses = isAdmin
        ? 'group flex h-full flex-col relative overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-xl dark:bg-[var(--bg-light)]'
        : 'group flex h-full flex-col relative overflow-hidden rounded-2xl bg-white/80 shadow-md backdrop-blur-sm transition-all hover:shadow-xl dark:bg-[var(--bg)]/80';

    return (
        <div className={`${cardClasses} ${className}`} style={style}>
            <div
                className="absolute inset-x-0 top-0 z-10"
                style={{
                    height: isAdmin ? '6px' : '8px',
                    backgroundColor: `var(--${announcement.category.color || 'primary'})`,
                }}
            />

            <div className="relative h-48 shrink-0 overflow-hidden">
                {announcement.image_url && !imgError ? (
                    <img
                        src={announcement.image_url}
                        alt={announcement.title}
                        width="400"
                        height="192"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-[var(--bg)] dark:to-[var(--bg)]" />
                )}
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex flex-wrap gap-2">
                    <Badge
                        className="font-semibold shadow-sm"
                        style={{
                            backgroundColor: `var(--${announcement.category.color || 'primary'})`,
                            color: 'white',
                        }}
                    >
                        {announcement.category.name}
                    </Badge>
                    {announcement.is_expired && <Badge className="bg-red-500 font-semibold text-white shadow-sm">Expired</Badge>}
                </div>

                <h3 className="mb-3 text-lg font-bold text-gray-900 transition-colors group-hover:text-teal-600 dark:text-[var(--text)] dark:group-hover:text-[var(--primary)]">
                    {announcement.title}
                </h3>

                <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-[var(--text-muted)]">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span>{announcement.date}</span>
                    </div>
                    {showAuthor && announcement.author && (
                        <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4 shrink-0" />
                            <span>{announcement.author}</span>
                        </div>
                    )}
                </div>

                <div className="mb-3 h-px shrink-0 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-[var(--border-muted)]" />

                <p
                    className="mb-5 flex-1 text-sm text-gray-700 dark:text-[var(--text-muted)]"
                    style={{
                        display: '-webkit-box',
                        WebkitLineClamp: lineClamp,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {announcement.summary}
                </p>

                <div className="mt-auto shrink-0">
                    <div className="flex items-center gap-2">
                        {!isAdmin && onShare && (
                            <button
                                onClick={handleShare}
                                className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-teal-600 dark:text-[var(--text-muted)] dark:hover:text-[var(--primary)]"
                            >
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
                                <span className={copied ? 'text-green-500' : ''}>{copied ? 'Copied!' : 'Share'}</span>
                            </button>
                        )}
                        <div className={!isAdmin && onShare ? 'ml-auto' : ''}>{renderActions()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

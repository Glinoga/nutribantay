import { cn } from '@/lib/utils';

interface IllustrationProps {
    className?: string;
}

function IllustrationWrapper({ className, children }: React.PropsWithChildren<IllustrationProps>) {
    return <div className={cn('mx-auto', className)}>{children}</div>;
}

export function BadRequestIllustration({ className }: IllustrationProps) {
    return (
        <IllustrationWrapper className={className}>
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bad request">
                <title>Bad Request</title>
                <circle cx="60" cy="60" r="50" stroke="var(--warning, #a68a3e)" strokeWidth="3" fill="none" opacity="0.3" />
                <circle cx="60" cy="60" r="40" stroke="var(--warning, #a68a3e)" strokeWidth="2" fill="none" opacity="0.2" />
                <path d="M60 40V60" stroke="var(--warning, #a68a3e)" strokeWidth="4" strokeLinecap="round" />
                <circle cx="60" cy="72" r="3" fill="var(--warning, #a68a3e)" />
                <path
                    d="M40 45L48 40L52 50"
                    stroke="var(--warning, #a68a3e)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.5"
                />
                <path
                    d="M80 45L72 40L68 50"
                    stroke="var(--warning, #a68a3e)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.5"
                />
            </svg>
        </IllustrationWrapper>
    );
}

export function UnauthorizedIllustration({ className }: IllustrationProps) {
    return (
        <IllustrationWrapper className={className}>
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Unauthorized">
                <title>Unauthorized</title>
                <rect x="35" y="20" width="50" height="40" rx="8" stroke="var(--warning, #a68a3e)" strokeWidth="3" fill="none" />
                <rect x="40" y="25" width="40" height="30" rx="4" stroke="var(--warning, #a68a3e)" strokeWidth="2" fill="none" opacity="0.3" />
                <circle cx="60" cy="48" r="3" fill="var(--warning, #a68a3e)" />
                <rect x="54" y="56" width="12" height="4" rx="2" fill="var(--warning, #a68a3e)" />
                <path d="M60 70V90" stroke="var(--warning, #a68a3e)" strokeWidth="4" strokeLinecap="round" />
                <path d="M45 95H75" stroke="var(--warning, #a68a3e)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
                <path
                    d="M50 75L60 85L70 75"
                    stroke="var(--warning, #a68a3e)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.4"
                />
            </svg>
        </IllustrationWrapper>
    );
}

export function ForbiddenIllustration({ className }: IllustrationProps) {
    return (
        <IllustrationWrapper className={className}>
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Forbidden">
                <title>Forbidden</title>
                <path d="M60 20L95 55L95 80L60 100L25 80L25 55L60 20Z" stroke="var(--destructive, #c14646)" strokeWidth="3" fill="none" />
                <path d="M45 60H75" stroke="var(--destructive, #c14646)" strokeWidth="5" strokeLinecap="round" />
                <circle cx="60" cy="50" r="3" fill="var(--destructive, #c14646)" />
                <path d="M60 55V70" stroke="var(--destructive, #c14646)" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                <path d="M50 85H70" stroke="var(--destructive, #c14646)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            </svg>
        </IllustrationWrapper>
    );
}

export function NotFoundIllustration({ className }: IllustrationProps) {
    return (
        <IllustrationWrapper className={className}>
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Not found">
                <title>Not Found</title>
                <circle cx="52" cy="52" r="22" stroke="var(--info, #5a7db0)" strokeWidth="3" fill="none" />
                <circle cx="52" cy="52" r="14" stroke="var(--info, #5a7db0)" strokeWidth="2" fill="none" opacity="0.4" />
                <path d="M68 68L95 95" stroke="var(--info, #5a7db0)" strokeWidth="4" strokeLinecap="round" />
                <path
                    d="M52 42V52L60 58"
                    stroke="var(--info, #5a7db0)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.6"
                />
                <path d="M35 30L28 25" stroke="var(--info, #5a7db0)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
                <path d="M30 35L22 32" stroke="var(--info, #5a7db0)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
                <path d="M75 30L82 25" stroke="var(--info, #5a7db0)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
            </svg>
        </IllustrationWrapper>
    );
}

export function ExpiredIllustration({ className }: IllustrationProps) {
    return (
        <IllustrationWrapper className={className}>
            <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Session expired"
            >
                <title>Session Expired</title>
                <circle cx="60" cy="60" r="45" stroke="var(--warning, #a68a3e)" strokeWidth="3" fill="none" />
                <path d="M60 35V60L75 70" stroke="var(--warning, #a68a3e)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="60" cy="35" r="3" fill="var(--warning, #a68a3e)" />
                <path d="M40 45C35 35 40 25 50 22" stroke="var(--warning, #a68a3e)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                <path d="M80 45C85 35 80 25 70 22" stroke="var(--warning, #a68a3e)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                <path d="M55 82H65" stroke="var(--warning, #a68a3e)" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
                <path d="M50 88H70" stroke="var(--warning, #a68a3e)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
            </svg>
        </IllustrationWrapper>
    );
}

export function RateLimitIllustration({ className }: IllustrationProps) {
    return (
        <IllustrationWrapper className={className}>
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Rate limited">
                <title>Too Many Requests</title>
                <rect x="25" y="20" width="70" height="25" rx="6" stroke="var(--warning, #a68a3e)" strokeWidth="3" fill="none" />
                <rect x="25" y="50" width="70" height="25" rx="6" stroke="var(--warning, #a68a3e)" strokeWidth="2" fill="none" opacity="0.4" />
                <rect x="25" y="80" width="70" height="25" rx="6" stroke="var(--warning, #a68a3e)" strokeWidth="2" fill="none" opacity="0.2" />
                <rect x="55" y="26" width="34" height="13" rx="3" fill="var(--warning, #a68a3e)" opacity="0.6" />
                <circle cx="42" cy="32" r="3" fill="var(--warning, #a68a3e)" />
                <path d="M90 105L95 95" stroke="var(--warning, #a68a3e)" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
                <path d="M95 105L90 95" stroke="var(--warning, #a68a3e)" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
            </svg>
        </IllustrationWrapper>
    );
}

export function ServerErrorIllustration({ className }: IllustrationProps) {
    return (
        <IllustrationWrapper className={className}>
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Server error">
                <title>Server Error</title>
                <rect x="30" y="25" width="60" height="70" rx="8" stroke="var(--destructive, #c14646)" strokeWidth="3" fill="none" />
                <rect x="38" y="32" width="44" height="8" rx="2" stroke="var(--destructive, #c14646)" strokeWidth="2" fill="none" opacity="0.4" />
                <circle cx="60" cy="55" r="3" fill="var(--destructive, #c14646)" />
                <rect x="50" y="65" width="20" height="4" rx="2" fill="var(--destructive, #c14646)" opacity="0.7" />
                <path
                    d="M55 75L60 80L65 75"
                    stroke="var(--destructive, #c14646)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.5"
                />
                <path d="M45 90H75" stroke="var(--destructive, #c14646)" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
                <path d="M35 18L30 12" stroke="var(--destructive, #c14646)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
                <path d="M85 18L90 12" stroke="var(--destructive, #c14646)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
                <path d="M60 15V8" stroke="var(--destructive, #c14646)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
            </svg>
        </IllustrationWrapper>
    );
}

export function UnavailableIllustration({ className }: IllustrationProps) {
    return (
        <IllustrationWrapper className={className}>
            <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Service unavailable"
            >
                <title>Service Unavailable</title>
                <circle cx="60" cy="60" r="45" stroke="var(--info, #5a7db0)" strokeWidth="3" fill="none" />
                <path d="M40 55C42 48 48 42 55 40" stroke="var(--info, #5a7db0)" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
                <path d="M80 55C78 48 72 42 65 40" stroke="var(--info, #5a7db0)" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
                <path d="M45 75C50 80 55 83 60 83C65 83 70 80 75 75" stroke="var(--info, #5a7db0)" strokeWidth="3" strokeLinecap="round" />
                <rect x="52" y="55" width="16" height="10" rx="3" fill="var(--info, #5a7db0)" opacity="0.5" />
                <path d="M60 65V75" stroke="var(--info, #5a7db0)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
                <circle cx="60" cy="80" r="2" fill="var(--info, #5a7db0)" opacity="0.7" />
                <path d="M50 92L55 85" stroke="var(--info, #5a7db0)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
                <path d="M70 92L65 85" stroke="var(--info, #5a7db0)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
            </svg>
        </IllustrationWrapper>
    );
}

export const errorIllustrations: Record<number, React.FC<IllustrationProps>> = {
    400: BadRequestIllustration,
    401: UnauthorizedIllustration,
    403: ForbiddenIllustration,
    404: NotFoundIllustration,
    419: ExpiredIllustration,
    429: RateLimitIllustration,
    500: ServerErrorIllustration,
    503: UnavailableIllustration,
};

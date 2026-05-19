import { ServerErrorIllustration } from '@/components/error-illustrations';
import { Button } from '@/components/ui/button';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
                    <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
                        <ServerErrorIllustration className="mx-auto mb-6 h-32 w-32" />
                        <div className="mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-7xl font-extrabold text-transparent">
                            500
                        </div>
                        <h1 className="mb-2 text-2xl font-bold text-foreground">Something went wrong</h1>
                        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
                            An unexpected error occurred. Our team has been notified and we're working on a fix. Please try reloading the page.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Button onClick={() => window.location.reload()}>Reload Page</Button>
                            <Button variant="outline" onClick={() => (window.location.href = '/')}>
                                Go Back Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

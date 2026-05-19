import { ForbiddenIllustration } from '@/components/error-illustrations';
import { Button } from '@/components/ui/button';
import { errorConfigs } from '@/pages/errors/index';
import { Link } from '@inertiajs/react';
import ErrorLayout from './ErrorLayout';

export default function Forbidden() {
    const config = errorConfigs[403];
    return (
        <ErrorLayout title={config.title}>
            <div className="error-animate mx-auto w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
                <div className="error-float mx-auto mb-6 flex justify-center">
                    <ForbiddenIllustration className="h-32 w-32" />
                </div>
                <div className="mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-8xl leading-none font-extrabold tracking-tighter text-transparent">
                    {config.code}
                </div>
                <h1 className="mb-3 text-2xl font-bold text-foreground">{config.title}</h1>
                <p className="mx-auto mb-8 max-w-sm text-sm leading-relaxed text-muted-foreground">{config.description}</p>
                <div className="flex flex-wrap justify-center gap-3">
                    <Link href="/dashboard">
                        <Button>Go to Dashboard</Button>
                    </Link>
                    <a href="mailto:nutribantay@gmail.com">
                        <Button variant="outline">Contact Support</Button>
                    </a>
                </div>
            </div>
        </ErrorLayout>
    );
}

import { UnavailableIllustration } from '@/components/error-illustrations';
import { Button } from '@/components/ui/button';
import { errorConfigs } from '@/pages/errors/index';
import ErrorLayout from './ErrorLayout';

export default function ServiceUnavailable() {
    const config = errorConfigs[503];
    return (
        <ErrorLayout title={config.title}>
            <div className="error-animate mx-auto w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
                <div className="error-float mx-auto mb-6 flex justify-center">
                    <UnavailableIllustration className="h-32 w-32" />
                </div>
                <div className="mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-8xl font-extrabold leading-none tracking-tighter text-transparent">
                    {config.code}
                </div>
                <h1 className="mb-3 text-2xl font-bold text-foreground">{config.title}</h1>
                <p className="mx-auto mb-8 max-w-sm text-sm leading-relaxed text-muted-foreground">{config.description}</p>
                <div className="flex flex-wrap justify-center gap-3">
                    <Button onClick={() => window.location.reload()}>Refresh Page</Button>
                    <a href="mailto:nutribantay@gmail.com">
                        <Button variant="outline">Contact Support</Button>
                    </a>
                </div>
            </div>
        </ErrorLayout>
    );
}

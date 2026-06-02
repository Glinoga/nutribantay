import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';

export function useForceLightMode() {
    useLayoutEffect(() => {
        const html = document.documentElement;
        const wasDark = html.classList.contains('dark');
        const prevColorScheme = html.style.colorScheme;
        const prevDataTheme = html.getAttribute('data-theme');

        html.classList.remove('dark');
        html.style.colorScheme = 'light';
        html.setAttribute('data-theme', 'light');

        return () => {
            if (wasDark) html.classList.add('dark');
            html.style.colorScheme = prevColorScheme;
            if (prevDataTheme) {
                html.setAttribute('data-theme', prevDataTheme);
            } else {
                html.removeAttribute('data-theme');
            }
        };
    }, []);
}

function useCanvasProxy(id: string): string | null {
    const [imgSrc, setImgSrc] = useState<string | null>(null);

    useEffect(() => {
        let rafId: number;
        let attempts = 0;
        const maxAttempts = 30;

        const check = () => {
            attempts++;
            const wrapper = document.querySelector(`[data-chart-id="${id}"]`);
            if (!wrapper) {
                if (attempts < maxAttempts) {
                    rafId = requestAnimationFrame(check);
                }
                return;
            }
            const canvas = wrapper.querySelector('canvas');
            if (canvas) {
                try {
                    const dataUrl = (canvas as HTMLCanvasElement).toDataURL();
                    if (dataUrl.length > 200) {
                        setImgSrc(dataUrl);
                        return;
                    }
                } catch {
                    /* canvas not ready or tainted */
                }
            }
            rafId = requestAnimationFrame(check);
        };

        rafId = requestAnimationFrame(check);
        return () => cancelAnimationFrame(rafId);
    }, [id]);

    return imgSrc;
}

export function ChartWithPrintFallback({ id, children }: { id: string; children: ReactNode }) {
    const imgSrc = useCanvasProxy(id);

    return (
        <div data-chart-id={id}>
            <div className="chart-print-canvas">{children}</div>
            {imgSrc && <img src={imgSrc} alt="" className="chart-print-image" style={{ width: '100%', height: 'auto' }} />}
        </div>
    );
}

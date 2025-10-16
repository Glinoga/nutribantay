import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx');
        
        // Try to find the exact page first
        const exactPath = `./pages/${name}.tsx`;
        if (pages[exactPath]) {
            return resolvePageComponent(exactPath, pages);
        }
        
        // If exact match is not found, try case-insensitive search
        const lowerCasePath = exactPath.toLowerCase();
        const matchingPath = Object.keys(pages).find(
            path => path.toLowerCase() === lowerCasePath
        );
        
        if (matchingPath) {
            return resolvePageComponent(matchingPath, pages);
        }
        
        throw new Error(`Page not found: ${exactPath}`);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

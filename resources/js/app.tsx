import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

// Import axios setup for global interceptors
import './lib/axios-setup';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Global error handler for Inertia requests
router.on('error', (event) => {
    const response = event.detail.response;

    // Check if it's a maintenance mode error
    if (response?.status === 503) {
        alert('⚠️ System is under maintenance. Your session has been logged out. Please try again later.');
        window.location.href = '/';
        event.preventDefault(); // Prevent default error handling
    }
});

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
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

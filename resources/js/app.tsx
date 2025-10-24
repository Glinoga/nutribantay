import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { Toaster } from 'react-hot-toast';

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
        root.render(
            <>
                <App {...props} />
                <Toaster 
                    position="top-right"
                    containerStyle={{
                        top: 24,
                        right: 24,
                    }}
                    toastOptions={{
                        duration: 4000, // Default duration - will be overridden by custom toast functions
                        style: {
                            background: '#ffffff',
                            color: '#0a0a0a',
                            border: '2px solid #e5e7eb',
                            borderRadius: '15px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            fontFamily: 'Montserrat, sans-serif',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            padding: '12px 16px',
                            maxWidth: '400px',
                            backdropFilter: 'blur(8px)',
                        },
                        success: {
                            duration: 3000, // Will be overridden by custom function
                            style: {
                                background: '#ffffff',
                                color: '#065f46',
                                border: '2px solid #10b981',
                                borderRadius: '15px',
                                boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.2), 0 4px 6px -2px rgba(16, 185, 129, 0.1)',
                            },
                            iconTheme: {
                                primary: '#10b981',
                                secondary: '#ffffff',
                            },
                        },
                        error: {
                            duration: 5000, // Will be overridden by custom function
                            style: {
                                background: '#ffffff',
                                color: '#7f1d1d',
                                border: '2px solid #dc2626',
                                borderRadius: '15px',
                                boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.2), 0 4px 6px -2px rgba(220, 38, 38, 0.1)',
                            },
                            iconTheme: {
                                primary: '#dc2626',
                                secondary: '#ffffff',
                            },
                        },
                        loading: {
                            duration: Infinity, // Loading toasts should persist until dismissed
                            style: {
                                background: '#ffffff',
                                color: '#374151',
                                border: '2px solid #3b82f6',
                                borderRadius: '15px',
                                boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.1)',
                            },
                            iconTheme: {
                                primary: '#3b82f6',
                                secondary: '#ffffff',
                            },
                        },
                    }}
                />
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

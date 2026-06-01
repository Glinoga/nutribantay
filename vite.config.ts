import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
        // wayfinder() - disabled to avoid build errors without DB connection
        // wayfinder({
        //     formVariants: true,
        // }),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
                        return 'vendor-react';
                    }
                    if (id.includes('node_modules/chart.js') || id.includes('node_modules/react-chartjs-2')) {
                        return 'vendor-chartjs';
                    }
                    if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) {
                        return 'vendor-leaflet';
                    }
                    if (id.includes('node_modules/lucide-react')) {
                        return 'vendor-icons';
                    }
                },
            },
        },
    },
    esbuild: {
        jsx: 'automatic',
    },
});

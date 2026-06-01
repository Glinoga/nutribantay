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
                    if (id.includes('/node_modules/sweetalert2/')) return 'vendor-swal';
                    if (id.includes('/node_modules/chart.js/')) return 'vendor-chartjs';
                    if (id.includes('/node_modules/leaflet/')) return 'vendor-leaflet';
                },
            },
        },
    },
    esbuild: {
        jsx: 'automatic',
    },
});

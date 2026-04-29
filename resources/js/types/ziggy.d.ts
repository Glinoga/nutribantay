declare global {
    interface Window {
        Ziggy: Record<string, string | number | boolean>;
    }
}

export {};

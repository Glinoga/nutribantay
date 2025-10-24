import toast from 'react-hot-toast';

/**
 * Smart toast notifications with dynamic duration based on content length
 * Provides better UX by giving users adequate time to read messages
 */
export const smartToast = {
    /**
     * Success toast with optimized duration for positive feedback
     * @param message - The success message to display
     * @returns toast instance
     */
    success: (message: string) => {
        const baseTime = 2500; // Base time for short messages
        const readingTime = Math.max(message.length * 45, baseTime); // 45ms per character
        const duration = Math.min(readingTime, 6000); // Cap at 6 seconds
        return toast.success(message, { duration });
    },
    
    /**
     * Error toast with longer duration for important error messages
     * @param message - The error message to display
     * @returns toast instance
     */
    error: (message: string) => {
        const baseTime = 4000; // Longer base time for errors
        const readingTime = Math.max(message.length * 60, baseTime); // 60ms per character
        const duration = Math.min(readingTime, 10000); // Cap at 10 seconds
        return toast.error(message, { duration });
    },
    
    /**
     * Loading toast that persists until manually dismissed
     * @param message - The loading message to display
     * @returns toast instance
     */
    loading: (message: string) => {
        return toast.loading(message, { duration: Infinity });
    },
    
    /**
     * Default toast with dynamic duration
     * @param message - The message to display
     * @returns toast instance
     */
    show: (message: string) => {
        const baseTime = 2000;
        const readingTime = Math.max(message.length * 50, baseTime); // 50ms per character
        const duration = Math.min(readingTime, 8000); // Cap at 8 seconds
        return toast(message, { duration });
    },

    /**
     * Info toast for informational messages
     * @param message - The info message to display
     * @returns toast instance
     */
    info: (message: string) => {
        const baseTime = 3000;
        const readingTime = Math.max(message.length * 50, baseTime);
        const duration = Math.min(readingTime, 7000);
        return toast(message, { 
            duration,
            icon: 'ℹ️',
        });
    },

    /**
     * Promise-based toast for async operations
     * @param promise - The promise to track
     * @param messages - Loading, success, and error messages
     * @returns toast promise
     */
    promise: <T>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: any) => string);
        }
    ) => {
        return toast.promise(promise, {
            loading: messages.loading,
            success: (data) => {
                const message = typeof messages.success === 'function' 
                    ? messages.success(data) 
                    : messages.success;
                
                // Use setTimeout to apply dynamic duration after toast is created
                setTimeout(() => {
                    const baseTime = 2500;
                    const readingTime = Math.max(message.length * 45, baseTime);
                    const duration = Math.min(readingTime, 6000);
                    // Note: react-hot-toast doesn't support updating duration after creation
                    // This is a limitation of the library
                }, 0);
                
                return message;
            },
            error: (error) => {
                const message = typeof messages.error === 'function' 
                    ? messages.error(error) 
                    : messages.error;
                
                // Use setTimeout to apply dynamic duration after toast is created
                setTimeout(() => {
                    const baseTime = 4000;
                    const readingTime = Math.max(message.length * 60, baseTime);
                    const duration = Math.min(readingTime, 10000);
                    // Note: react-hot-toast doesn't support updating duration after creation
                    // This is a limitation of the library
                }, 0);
                
                return message;
            },
        });
    },

    /**
     * Enhanced promise toast with manual duration control
     * @param promise - The promise to track
     * @param messages - Loading, success, and error messages
     * @returns toast promise with proper duration handling
     */
    smartPromise: async <T>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: any) => string);
        }
    ) => {
        const loadingToast = toast.loading(messages.loading);
        
        try {
            const result = await promise;
            const successMessage = typeof messages.success === 'function' 
                ? messages.success(result) 
                : messages.success;
            
            toast.dismiss(loadingToast);
            smartToast.success(successMessage);
            return result;
        } catch (error) {
            const errorMessage = typeof messages.error === 'function' 
                ? messages.error(error) 
                : messages.error;
            
            toast.dismiss(loadingToast);
            smartToast.error(errorMessage);
            throw error;
        }
    }
};

// Utility function to calculate reading time
export const calculateReadingTime = (text: string, wordsPerMinute: number = 200): number => {
    const words = text.trim().split(/\s+/).length;
    const readingTimeMinutes = words / wordsPerMinute;
    return Math.max(readingTimeMinutes * 60 * 1000, 2000); // Convert to ms, minimum 2 seconds
};

// Export default for convenience
export default smartToast;
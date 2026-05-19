export interface ErrorConfig {
    code: number;
    title: string;
    description: string;
}

export const errorConfigs: Record<number, ErrorConfig> = {
    400: {
        code: 400,
        title: 'Bad Request',
        description: 'The request could not be understood by the server due to malformed syntax. Please check your request and try again.',
    },
    401: {
        code: 401,
        title: 'Unauthorized',
        description: 'You need to log in to access this page. Please sign in with your account to continue.',
    },
    403: {
        code: 403,
        title: 'Forbidden',
        description: "You don't have permission to access this page. If you believe this is a mistake, please contact your administrator.",
    },
    404: {
        code: 404,
        title: 'Page Not Found',
        description: "The page you're looking for doesn't exist or has been moved. Please check the URL or navigate back to a known page.",
    },
    419: {
        code: 419,
        title: 'Session Expired',
        description: 'Your session has expired due to inactivity. Please refresh the page and try again to continue where you left off.',
    },
    429: {
        code: 429,
        title: 'Too Many Requests',
        description: "You've made too many requests in a short period. Please wait a moment before trying again.",
    },
    500: {
        code: 500,
        title: 'Server Error',
        description: "Something went wrong on our end. We've been notified and are working to fix the issue. Please try again later.",
    },
    503: {
        code: 503,
        title: 'Service Unavailable',
        description: "We're currently undergoing maintenance to improve your experience. Please check back shortly.",
    },
};

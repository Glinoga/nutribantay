// Create this file: resources/js/lib/axios-setup.ts

import axios from 'axios';
import { showMaintenanceAlert } from './maintenance-alert';

// Setup axios interceptor to handle maintenance mode
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check if it's a maintenance mode error
        if (error.response?.status === 503 && error.response?.data?.maintenance) {
            // Get the message from server or use default
            const serverMessage = error.response.data.message;

            // Default user-friendly message in Tagalog
            const message =
                serverMessage || 'Ang sistema ay kasalukuyang nag-maintenance. Ang iyong aksyon ay hindi natapos. Ikaw ay awtomatikong ma-logout.';

            // Show nice modal instead of browser alert
            showMaintenanceAlert(message);

            // Return a rejected promise to prevent further error handling
            return Promise.reject(new Error('Maintenance mode active'));
        }

        return Promise.reject(error);
    },
);

export default axios;

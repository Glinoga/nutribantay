// Create this file: resources/js/hooks/use-maintenance-check.ts

import axios from 'axios';
import { useEffect } from 'react';

export function useMaintenanceCheck(userRoles: string[] = []) {
    useEffect(() => {
        // Only check for non-admin users
        const isAdmin = userRoles.some((role) => role.toLowerCase() === 'admin');

        if (isAdmin) {
            return; // Admins don't need to be checked
        }

        // Check immediately on mount
        checkMaintenance();

        // Then check every 10 seconds for faster detection
        const interval = setInterval(checkMaintenance, 10000);

        async function checkMaintenance() {
            try {
                const response = await axios.get('/maintenance/status');

                if (response.data.status === true) {
                    // Show alert before redirect
                    alert('⚠️ System is under maintenance. You will be logged out now.');

                    // Reload the page to trigger middleware
                    window.location.reload();
                }
            } catch (error: any) {
                // If we get a 503 error, maintenance mode is on
                if (error.response?.status === 503) {
                    alert('⚠️ System is under maintenance. You will be logged out now.');
                    window.location.reload();
                }
            }
        }

        return () => clearInterval(interval);
    }, [userRoles]);
}

// Create: resources/js/lib/maintenance-alert.ts

/**
 * Shows a user-friendly maintenance mode message
 * This is better than browser alert() for non-tech users
 */
export function showMaintenanceAlert(message?: string) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 12px;
        max-width: 450px;
        width: 90%;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease-out;
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateY(-50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    const defaultMessage =
        message || 'Ang sistema ay kasalukuyang nag-maintenance. Ang iyong aksyon ay hindi natapos. Ikaw ay awtomatikong ma-logout.';

    modal.innerHTML = `
        <div style="font-size: 64px; margin-bottom: 20px;">🔧</div>
        <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">
            System Maintenance
        </h2>
        <p style="color: #666; margin: 0 0 25px 0; font-size: 16px; line-height: 1.6;">
            ${defaultMessage}
        </p>
        <button id="maintenanceOkBtn" style="
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 40px;
            font-size: 16px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.2s;
        ">
            OK, Naiintindihan Ko
        </button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Add hover effect to button
    const button = document.getElementById('maintenanceOkBtn');
    if (button) {
        button.addEventListener('mouseenter', () => {
            button.style.background = '#5568d3';
        });
        button.addEventListener('mouseleave', () => {
            button.style.background = '#667eea';
        });
        button.addEventListener('click', () => {
            window.location.reload();
        });
    }

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            window.location.reload();
        }
    });
}

export function route(name: string, params?: Record<string, string | number>): string {
    const routes: Record<string, string> = {
        // Home
        home: '/',

        // Guest
        'guest.announcements': '/guest/announcements',
        'guest.announcements.show': '/guest/announcements/{announcement}',
        'guest.contact': '/guest/contact',
        'guest.contact.send': '/guest/contact',

        // Auth
        login: '/login',
        register: '/register',
        'register.store': '/register',
        'password.request': '/forgot-password',
        'password.email': '/forgot-password',
        'password.reset': '/reset-password/{token}',
        'password.store': '/reset-password',
        'verification.notice': '/verify-email',
        'verification.verify': '/verify-email/{id}/{hash}',
        'verification.send': '/email/verification-notification',
        'password.confirm': '/confirm-password',
        logout: '/logout',

        // Dashboard
        dashboard: '/dashboard',
        'dashboard.export': '/dashboard/export',
        'dashboard.print': '/dashboard/print',

        // Children
        'children.index': '/children',
        'children.create': '/children/create',
        'children.store': '/children',
        'children.show': '/children/{child}',
        'children.edit': '/children/{child}/edit',
        'children.update': '/children/{child}',
        'children.destroy': '/children/{child}',
        'children.archived': '/children-archived',
        'children.restore': '/children/{id}/restore',
        'children.forceDelete': '/children/{id}/force-delete',
        'children.export': '/children/export',
        'children.print': '/children/print',
        'children.import': '/children/import',
        'children.show.print': '/children/{child}/print',
        'children.export.single': '/children/{child}/export',

        // Children Notes
        'children.notes.store': '/children/{child}/notes',
        'children.notes.destroy': '/children/{child}/notes/{note}',

        // Health Logs
        'children.healthlogs.create': '/children/{child}/healthlogs/create',
        'children.healthlogs.store': '/children/{child}/healthlogs',
        'healthlogs.edit': '/healthlogs/{healthlog}/edit',
        'healthlogs.update': '/healthlogs/{healthlog}',
        'healthlogs.destroy': '/healthlogs/{healthlog}',
        'healthlogs.archived': '/healthlogs-archived',
        'healthlogs.restore': '/healthlogs/{id}/restore',
        'healthlogs.forceDelete': '/healthlogs/{id}/force-delete',

        // Vaccines
        'vaccines.index': '/vaccines',
        'vaccines.create': '/vaccines/create',
        'vaccines.store': '/vaccines',
        'vaccines.edit': '/vaccines/{vaccine}/edit',
        'vaccines.update': '/vaccines/{vaccine}',
        'vaccines.destroy': '/vaccines/{vaccine}',

        // Child Vaccines
        'children.vaccines.index': '/children/{child}/vaccines',
        'children.vaccines.store': '/children/{child}/vaccines',
        'children.vaccines.destroy': '/children/{child}/vaccines/{childVaccine}',
        'children.vaccines.doses.store': '/children/{child}/vaccines/{childVaccine}/doses',
        'children.vaccines.doses.update': '/children/{child}/vaccines/{childVaccine}/doses/{dose}',
        'children.vaccines.doses.destroy': '/children/{child}/vaccines/{childVaccine}/doses/{dose}',

        // Announcements (Admin)
        'announcements.index': '/admin/announcements',
        'announcements.create': '/admin/announcements/create',
        'announcements.store': '/admin/announcements/store',
        'announcements.edit': '/admin/announcements/{announcement}/edit',
        'announcements.update': '/admin/announcements/{announcement}',
        'announcements.destroy': '/admin/announcements/{announcement}',
        'announcements.archived': '/admin/announcements-archived',
        'announcements.restore': '/admin/announcements/{id}/restore',
        'announcements.forceDelete': '/admin/announcements/{id}/force-delete',

        // SMS
        'sms.index': '/admin/sendsms',
        'sms.send': '/admin/sendsms',

        // Users
        'users.index': '/users',
        'users.create': '/users/create',
        'users.store': '/users',
        'users.show': '/users/{user}',
        'users.edit': '/users/{user}/edit',
        'users.update': '/users/{user}',
        'users.destroy': '/users/{user}',
        'users.archived': '/users/archived',
        'users.restore': '/users/{id}/restore',
        'users.forceDelete': '/users/{id}/force-delete',
        'users.updateRole': '/users/{id}/update-role',
        'users.approve': '/users/{id}/approve',
        'users.reject': '/users/{id}/reject',
        'users.storeBulk': '/users/store-bulk',

        // Admin Database
        'admin.database.index': '/admin/database',
        'admin.database.backup': '/admin/database/backup',
        'admin.database.list': '/admin/database/list',
        'admin.database.restore': '/admin/database/restore',
        'admin.database.delete': '/admin/database/delete',

        // Audit Logs
        'audit-logs.index': '/audit-logs',
        'audit-logs.export': '/audit-logs/export',
        'audit-logs.show': '/audit-logs/{auditLog}',

        // Categories
        'categories.index': '/categories',
        'categories.create': '/categories/create',
        'categories.store': '/categories',
        'categories.show': '/categories/{category}',
        'categories.edit': '/categories/{category}/edit',
        'categories.update': '/categories/{category}',
        'categories.destroy': '/categories/{category}',

        // Recommendations
        'recommendations.generate': '/recommendations',

        // Settings
        'profile.edit': '/settings/profile',
        'profile.update': '/settings/profile',
        'profile.destroy': '/settings/profile',
        'password.edit': '/settings/password',
        'password.update': '/settings/password',
        appearance: '/settings/appearance',
    };

    const path = routes[name];
    if (!path) {
        console.warn(`Route "${name}" not found in routes mapping`);
        return '/';
    }

    if (params && path.includes('{')) {
        return Object.entries(params).reduce((p, [key, value]) => {
            return p.replace(`{${key}}`, value.toString());
        }, path);
    }

    return path;
}

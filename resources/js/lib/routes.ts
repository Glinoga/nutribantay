export function route(name: string, params?: Record<string, any>): string {
  // Direct route mapping
  const routes: Record<string, string> = {
    // Announcement routes
    'announcements.create': '/admin/announcements/create',
    'announcements.store': '/admin/announcements/store',
    'announcements.index': '/admin/announcements',
    'announcements.update': '/admin/announcements/{announcement}',
    'announcements.edit': '/admin/announcements/{announcement}/edit',
    'announcements.destroy': '/admin/announcements/{announcement}',
    'dashboard': '/admin/dashboard',


    'home': '/',
    // Guest routes
    'guest.contact': '/guest/contact',
    'guest.contact.send': '/guest/contact',
    'guest.announcements': '/guest/announcements',

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
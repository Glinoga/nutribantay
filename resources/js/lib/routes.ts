export function route(name: string, params?: Record<string, any>): string {
  // Direct route mapping
  const routes: Record<string, string> = {
    'announcements.create': '/admin/announcements/create',
    'announcements.store': '/admin/announcements/store',
    'announcements.index': '/admin/announcements',
    // Add other routes as needed
  };
  
  const path = routes[name];
  if (!path) {
    console.warn(`Route "${name}" not found in routes mapping`);
    return '/';
  }
  
  return path;
}
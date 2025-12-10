import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Boxes, Folder, HeartPulse, LayoutGrid, UserCog, UserPen } from 'lucide-react';
import AppLogo from './app-logo';

// Expanded type definition to catch roles wherever they might be attached
type AuthProps = {
    auth?: {
        user?: {
            id: number;
            name: string;
            email: string;
            roles?: string[]; // Check if roles are attached to user
        };
        roles?: string[]; // Check if roles are at root of auth
    };
};

export function AppSidebar() {
    const { auth } = usePage<AuthProps>().props;

    // 1. Consolidate roles from both potential locations (auth.roles or auth.user.roles)
    const userRoles = auth?.roles ?? auth?.user?.roles ?? [];

    // 2. Debugging: Uncomment this to see exactly what roles are coming from the backend
    // console.log('Current User Roles:', userRoles);

    // 3. Helper to check roles case-insensitively and normalize format
    const hasRole = (roleToCheck: string) => {
        return userRoles.some((r) => {
            // Normalize: remove spaces and underscores, make lowercase
            const normalizedUserRole = r.toLowerCase().replace(/[\s_]/g, '');
            const normalizedCheck = roleToCheck.toLowerCase();
            return normalizedUserRole === normalizedCheck;
        });
    };

    const isAdmin = hasRole('admin');
    const isHealthworker = hasRole('healthworker');

    // Base menu items available to everyone
    const mainNavItems: NavItem[] = [
        { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
        { title: 'Child Profiles', href: '/children', icon: UserPen },
    ];

    // Admin-only menu
    if (isAdmin) {
        mainNavItems.push({ title: 'User Management', href: '/users', icon: UserCog });
    }

    // Healthworker-only menu
    if (isHealthworker) {
        mainNavItems.push(
            { title: 'Healthlog Management', href: '/healthlogs', icon: HeartPulse },
            { title: 'Stocks Management', href: '/stocks', icon: Boxes },
        );
    }
    // Healthlog Management
    // Logic updated: Allow if user is Healthworker OR Admin (Admins should usually see everything)
    if (isHealthworker || isAdmin) {
        mainNavItems.push({ title: 'Healthlog Management', href: '/healthlogs', icon: HeartPulse });
    }

    // Footer items (static)
    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: Folder,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { route } from '@/lib/routes';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Boxes, Database, FileTextIcon, LayoutGrid, Megaphone, MessageSquare, ShieldCheck, UserCog, UserPen } from 'lucide-react';
import AppLogo from './app-logo';

// Expanded type definition to catch roles wherever they might be attached
type AuthProps = {
    auth?: {
        user?: {
            id: number;
            name: string;
            email: string;
            roles?: string[];
        };
        roles?: string[];
    };
};

export function AppSidebar() {
    const { auth } = usePage<AuthProps>().props;

    // 1. Consolidate roles from both potential locations (auth.roles or auth.user.roles)
    const userRoles = auth?.roles ?? auth?.user?.roles ?? [];

    // 2. Helper to check roles case-insensitively and normalize format
    const hasRole = (roleToCheck: string) => {
        return userRoles.some((r) => {
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
        { title: 'Vaccines', href: route('vaccines.index'), icon: ShieldCheck },
        { title: 'Announcements', href: route('announcements.index'), icon: Megaphone },
        { title: 'Send SMS', href: route('sms.index'), icon: MessageSquare },
    ];

    // Admin-only menu items
    const adminNavItems: NavItem[] = isAdmin
        ? [
              { title: 'User Management', href: '/users', icon: UserCog },
              { title: 'Data Management', href: '/admin/database', icon: Database },
              { title: 'Audit Logs', href: '/audit-logs', icon: FileTextIcon },
          ]
        : [];

    // Healthworker menu items
    const healthworkerNavItems: NavItem[] = isHealthworker ? [{ title: 'Stocks Management', href: '/stocks', icon: Boxes }] : [];

    // Footer items (static)
    const footerNavItems: NavItem[] = [];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="transition-all duration-200 hover:bg-sidebar-accent">
                            <Link href={dashboard()} prefetch className="flex items-center gap-2">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-1">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-semibold tracking-wider text-sidebar-foreground/60 uppercase">Main</SidebarGroupLabel>
                    <NavMain items={mainNavItems} />
                </SidebarGroup>

                {adminNavItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-xs font-semibold tracking-wider text-sidebar-foreground/60 uppercase">
                            Administration
                        </SidebarGroupLabel>
                        <NavMain items={adminNavItems} />
                    </SidebarGroup>
                )}

                {healthworkerNavItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-xs font-semibold tracking-wider text-sidebar-foreground/60 uppercase">
                            Health Worker
                        </SidebarGroupLabel>
                        <NavMain items={healthworkerNavItems} />
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter className="mt-auto">
                <NavFooter items={footerNavItems} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

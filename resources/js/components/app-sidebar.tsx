import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Boxes, Folder, HeartPulse, LayoutGrid, UserCog, UserPen } from 'lucide-react';
import AppLogo from './app-logo';

type AuthProps = {
    auth?: {
        user?: { id: number; name: string; email: string };
        roles?: string[];
    };
};

export function AppSidebar() {
    const { auth } = usePage<AuthProps>().props;

    const isAdmin = (auth?.roles ?? []).some((r) => r.toLowerCase() === 'admin');
    const isHealthworker = (auth?.roles ?? []).some((r) => r.toLowerCase() === 'healthworker');

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

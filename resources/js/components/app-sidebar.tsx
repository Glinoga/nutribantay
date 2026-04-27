import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Boxes, FileTextIcon, HeartPulse, LayoutGrid, MessageSquare, Mic2, ShieldCheck, Stethoscope } from 'lucide-react';
import { route } from '@/lib/routes';
import AppLogo from './app-logo';

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

    const userRoles = auth?.roles ?? auth?.user?.roles ?? [];

    const hasRole = (roleToCheck: string) => {
        return userRoles.some((r) => {
            const normalizedUserRole = r.toLowerCase().replace(/[\s_]/g, '');
            const normalizedCheck = roleToCheck.toLowerCase();
            return normalizedUserRole === normalizedCheck;
        });
    };

    const isAdmin = hasRole('admin');
    const isHealthworker = hasRole('healthworker');

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Child Profiles',
            href: '/children',
            icon: Stethoscope,
        },
        {
            title: 'Announcements',
            href: route('announcements.index'),
            icon: Mic2,
        },
    ];

    if (isAdmin) {
        mainNavItems.push(
            { title: 'User Management', href: '/users', icon: ShieldCheck },
            { title: 'Send SMS', href: route('sms.index'), icon: MessageSquare },
            { title: 'Data Management', href: '/admin/database', icon: Boxes },
            { title: 'Audit Logs', href: '/audit-logs', icon: FileTextIcon },
        );
    }

    if (isHealthworker) {
        mainNavItems.push(
            { title: 'Stocks Management', href: '/stocks', icon: Boxes },
            { title: 'Health Logs', href: '/healthlogs', icon: HeartPulse },
        );
    }

    return (
        <Sidebar
            collapsible="icon"
            className="border-r border-teal-100 dark:border-teal-900/50"
            style={{
                background: 'linear-gradient(180deg, hsl(180 100% 98%) 0%, hsl(160 96% 96%) 100%)',
            }}
        >
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
                <NavFooter items={[]} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
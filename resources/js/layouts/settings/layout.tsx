import Heading from '@/components/heading';
import { Separator } from '@/components/ui/separator';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { appearance } from '@/routes';
import { edit as editPassword } from '@/routes/password';
import { edit } from '@/routes/profile';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { Cog, Key, Monitor } from 'lucide-react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: Cog,
    },
    {
        title: 'Password',
        href: editPassword(),
        icon: Key,
    },
    {
        title: 'Appearance',
        href: appearance(),
        icon: Monitor,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const page = usePage();

    return (
        <div className="flex min-h-svh">
            <Sidebar variant="sidebar" collapsible="none" className="hidden lg:flex">
                <SidebarContent>
                    <div className="p-6">
                        <Heading title="Settings" description="Manage your profile and account settings" />
                    </div>
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider px-2">
                            Account Settings
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            {sidebarNavItems.map((item) => (
                                <SidebarMenuItem key={typeof item.href === 'string' ? item.href : item.href.url}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={page.url.startsWith(typeof item.href === 'string' ? item.href : item.href.url)}
                                        tooltip={{ children: item.title }}
                                        className="cursor-pointer transition-all duration-200"
                                    >
                                        <Link href={item.href} prefetch className="flex items-center gap-2 w-full">
                                            {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>

            <main className="flex-1 overflow-y-auto">
                <div className="px-4 py-6 lg:px-8">
                    <div className="lg:hidden mb-6">
                        <Heading title="Settings" description="Manage your profile and account settings" />
                    </div>

                    <div className="flex flex-col lg:flex-row lg:space-x-12">
                        <div className="lg:hidden w-full mb-6">
                            <nav className="flex flex-col space-y-1">
                                {sidebarNavItems.map((item, index) => (
                                    <Link
                                        key={`${typeof item.href === 'string' ? item.href : item.href.url}-${index}`}
                                        href={item.href}
                                        prefetch
                                        className={cn(
                                            'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-all duration-200',
                                            page.url.startsWith(typeof item.href === 'string' ? item.href : item.href.url)
                                                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                                                : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                        )}
                                    >
                                        {item.icon && <item.icon className="h-4 w-4" />}
                                        {item.title}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        <Separator className="my-6 lg:hidden" />

                        <div className="flex-1 md:max-w-2xl">
                            <section className="max-w-xl space-y-12">{children}</section>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

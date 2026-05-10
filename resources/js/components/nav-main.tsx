import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarMenu>
            {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                        asChild
                        isActive={page.url.startsWith(typeof item.href === 'string' ? item.href : item.href.url)}
                        tooltip={{ children: item.title }}
                        className="cursor-pointer transition-all duration-200 hover:translate-x-0.5"
                    >
                        <Link href={item.href} prefetch className="flex w-full items-center gap-2">
                            {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                            <span className="truncate">{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    );
}

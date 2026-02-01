import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Files, Upload, Settings } from 'lucide-react';
import { cn } from '@/lib/utils'; // utils should exist from shadcn init

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Files, label: 'Documents', href: '/documents' },
    { icon: Upload, label: 'Upload', href: '/upload' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export const Sidebar = () => {
    // We need to use usePathname in a client component?
    // Start with static link for now, or make it 'use client' if needed.
    // For layout components, usually better to be client if using hooks.

    return (
        <aside className="w-64 border-r bg-muted/20 min-h-[calc(100vh-4rem)] p-4">
            <div className="space-y-1">
                {sidebarItems.map((item) => (
                    <Button
                        key={item.href}
                        variant="ghost"
                        className="w-full justify-start"
                        asChild
                    >
                        <Link href={item.href}>
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                        </Link>
                    </Button>
                ))}
            </div>
        </aside>
    );
};

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Files, Upload, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authService } from '@/services/auth.service';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Files, label: 'Documents', href: '/documents' },
    { icon: Upload, label: 'Upload', href: '/upload' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export const Sidebar = () => {
    const pathname = usePathname();

    // Hide Sidebar on login/register pages
    if (pathname === '/login' || pathname === '/register') return null;

    return (
        <aside className="w-64 border-r bg-muted/20 min-h-[calc(100vh-4rem)] p-4">
            <div className="space-y-1">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Button
                            key={item.href}
                            variant={isActive ? "secondary" : "ghost"}
                            className={cn(
                                "w-full justify-start",
                                isActive && "bg-secondary font-medium"
                            )}
                            asChild
                        >
                            <Link href={item.href}>
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.label}
                            </Link>
                        </Button>
                    );
                })}
            </div>
        </aside>
    );
};

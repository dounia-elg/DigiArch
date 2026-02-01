"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileText, LogOut } from 'lucide-react';
import { authService } from '@/services/auth.service';

export const Navbar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        setUser(authService.getCurrentUser());
    }, [pathname]);

    const handleLogout = () => {
        authService.logout();
        router.push('/login');
    };

    if (pathname === '/login' || pathname === '/register') return null;

    return (
        <nav className="border-b bg-background h-16 flex items-center px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl mr-8">
                <div className="bg-primary text-primary-foreground p-1 rounded">
                    <FileText size={20} />
                </div>
                DigiArch
            </Link>

            <div className="ml-auto flex items-center gap-4">
                {user ? (
                    <>
                        <div className="flex flex-col items-end mr-2">
                            <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
                            <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </>
                ) : (
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                )}
            </div>
        </nav>
    );
};

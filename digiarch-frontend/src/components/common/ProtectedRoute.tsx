"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/auth.service';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const publicPaths = ['/login', '/register'];
        const isPublicPath = publicPaths.includes(pathname);

        if (!authService.isAuthenticated() && !isPublicPath) {
            router.push('/login');
        } else if (authService.isAuthenticated() && isPublicPath) {
            router.push('/dashboard');
        } else {
            setIsChecking(false);
        }
    }, [pathname, router]);

    if (isChecking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-muted-foreground">Checking authentication...</div>
            </div>
        );
    }

    return <>{children}</>;
}

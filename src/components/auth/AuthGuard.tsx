'use client';

import { ReactNode, useEffect } from 'react';
import { Spin } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

interface AuthGuardProps {
    children: ReactNode;
}

export default function AuthGuard({
    children,
}: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();

    const isAuthenticated = authService.isAuthenticated();

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace(
                `/login?redirect=${encodeURIComponent(pathname)}`
            );
        }
    }, [isAuthenticated, pathname, router]);

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
                <Spin size="large" />
            </div>
        );
    }

    return <>{children}</>;
}
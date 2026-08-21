'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Spin } from 'antd';
import { usePathname, useRouter } from 'next/navigation';

interface AuthGuardProps {
    children: ReactNode;
}

export default function AuthGuard({
    children,
}: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [checking, setChecking] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');

        if (!token) {
            router.replace(
                `/login?redirect=${encodeURIComponent(pathname)}`
            );

            return;
        }

        setAuthenticated(true);
        setChecking(false);
    }, [pathname, router]);

    if (checking) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    if (!authenticated) {
        return null;
    }

    return <>{children}</>;
}
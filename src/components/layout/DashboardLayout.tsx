'use client';

import {
    BarChartOutlined,
    FileAddOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    LogoutOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Dropdown,
    Layout,
    Menu,
    type MenuProps,
} from 'antd';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { authService } from '@/services/auth.service';

const { Header, Sider, Content } = Layout;

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [collapsed, setCollapsed] = useState(false);

    const user = authService.getUser();

    const userName = user?.name || 'Admin';
    const userRole = user?.role || 'Admin';

    const menuItems: MenuProps['items'] = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/test-creation',
            icon: <FileAddOutlined />,
            label: 'Test Creation',
        },
        {
            key: '/test-tracking',
            icon: <BarChartOutlined />,
            label: 'Test Tracking',
        },
    ];

    const selectedKey = useMemo(() => {
        if (pathname.startsWith('/test-creation')) {
            return '/test-creation';
        }

        if (pathname.startsWith('/test-tracking')) {
            return '/test-tracking';
        }

        return '/dashboard';
    }, [pathname]);

    const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
        router.push(key);
    };

    const handleLogout = () => {
        authService.logout();
    };

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Profile',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            danger: true,
            icon: <LogoutOutlined />,
            label: 'Logout',
        },
    ];

    const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
        if (key === 'logout') {
            handleLogout();
        }
    };

    return (
        <Layout className="min-h-screen">

            {/* =====================================================
          SIDEBAR
      ====================================================== */}
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={250}
                collapsedWidth={80}
                className="!bg-white"
                theme="light"
            >
                {/* Logo */}
                <div
                    className={`flex h-[72px] items-center border-b border-[#EAECF0] ${collapsed ? 'justify-center px-3' : 'px-6'
                        }`}
                >
                    {collapsed ? (
                        <Image
                            src="/logo.svg"
                            alt="Test Management"
                            width={42}
                            height={42}
                            className="h-9 w-9 object-contain"
                        />
                    ) : (
                        <Image
                            src="/logo.svg"
                            alt="Test Management"
                            width={150}
                            height={50}
                            className="h-auto w-auto max-w-[150px]"
                        />
                    )}
                </div>

                {/* Navigation */}
                <div className="px-3 pt-5">
                    <p
                        className={`mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#98A2B3] ${collapsed ? 'hidden' : ''
                            }`}
                    >
                        Main Menu
                    </p>

                    <Menu
                        mode="inline"
                        selectedKeys={[selectedKey]}
                        items={menuItems}
                        onClick={handleMenuClick}
                        className="!border-0"
                    />
                </div>
            </Sider>

            {/* =====================================================
          MAIN AREA
      ====================================================== */}
            <Layout className="!bg-[#F8FAFC]">

                {/* Header */}
                <Header className="!flex !h-[72px] !items-center !justify-between !border-b !border-[#EAECF0] !bg-white !px-5 sm:!px-8">

                    {/* Left */}
                    <div className="flex items-center gap-4">
                        <Button
                            type="text"
                            icon={
                                collapsed ? (
                                    <MenuUnfoldOutlined />
                                ) : (
                                    <MenuFoldOutlined />
                                )
                            }
                            onClick={() => setCollapsed(!collapsed)}
                            className="!flex !h-10 !w-10 !items-center !justify-center !text-[18px] !text-[#475467]"
                        />

                        <div className="hidden sm:block">
                            <p className="text-[14px] font-medium text-[#667085]">
                                Test Management System
                            </p>
                        </div>
                    </div>

                    {/* Right */}
                    <Dropdown
                        menu={{
                            items: userMenuItems,
                            onClick: handleUserMenuClick,
                        }}
                        placement="bottomRight"
                        trigger={['click']}
                    >
                        <button className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#F2F4F7]">
                            <Avatar
                                size={40}
                                className="!bg-[#EAF3FF] !font-semibold !text-[#1677FF]"
                            >
                                {userName.charAt(0).toUpperCase()}
                            </Avatar>

                            <div className="hidden text-left sm:block">
                                <p className="text-[14px] font-semibold leading-5 text-[#344054]">
                                    {userName}
                                </p>

                                <p className="text-[12px] capitalize leading-4 text-[#98A2B3]">
                                    {userRole}
                                </p>
                            </div>
                        </button>
                    </Dropdown>
                </Header>

                {/* Page Content */}
                <Content className="min-h-[calc(100vh-72px)] !bg-[#F8FAFC]">
                    {children}
                </Content>

            </Layout>
        </Layout>
    );
}
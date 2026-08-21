'use client';

import {
    FileTextOutlined,
    PlusOutlined,
    QuestionCircleOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    BarChartOutlined,
    ArrowRightOutlined,
    MoreOutlined,
} from '@ant-design/icons';
import { Button, Progress, Tag } from 'antd';
import { authService } from '@/services/auth.service';

const stats = [
    {
        title: 'Total Tests',
        value: 24,
        icon: <FileTextOutlined />,
        description: 'All created tests',
    },
    {
        title: 'Published Tests',
        value: 16,
        icon: <CheckCircleOutlined />,
        description: 'Currently published',
    },
    {
        title: 'Draft Tests',
        value: 8,
        icon: <ClockCircleOutlined />,
        description: 'Tests in progress',
    },
    {
        title: 'Total Questions',
        value: 186,
        icon: <QuestionCircleOutlined />,
        description: 'Across all tests',
    },
];

const recentTests = [
    {
        id: 1,
        name: 'JavaScript Fundamentals',
        questions: 25,
        status: 'Published',
        updated: 'Today, 10:30 AM',
    },
    {
        id: 2,
        name: 'React Advanced Assessment',
        questions: 30,
        status: 'Published',
        updated: 'Yesterday, 4:15 PM',
    },
    {
        id: 3,
        name: 'Frontend Development Test',
        questions: 20,
        status: 'Draft',
        updated: 'Aug 19, 2026',
    },
    {
        id: 4,
        name: 'TypeScript Evaluation',
        questions: 35,
        status: 'Published',
        updated: 'Aug 18, 2026',
    },
];

export default function DashboardPage() {
    const user = authService.getUser();

    const userName = user?.name || 'Admin';

    return (
        <div className="min-h-screen bg-[#F8FAFC]">

            {/* =====================================================
          MAIN
      ====================================================== */}
            <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">

                {/* Welcome */}
                <section className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div>
                        <p className="mb-1 text-[14px] font-medium text-[#667085]">
                            Dashboard
                        </p>

                        <h1 className="text-[28px] font-bold tracking-[-0.025em] text-[#101828] sm:text-[32px]">
                            Welcome back, {userName.split(' ')[0]}!
                        </h1>

                        <p className="mt-2 text-[14px] text-[#667085]">
                            Manage your tests, questions and assessments from here.
                        </p>
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        className="!h-[44px] !rounded-[8px] !bg-[#1677FF] !font-semibold"
                    >
                        Create New Test
                    </Button>
                </section>

                {/* =====================================================
            STATISTICS
        ====================================================== */}
                <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => (
                        <div
                            key={stat.title}
                            className="rounded-[10px] border border-[#EAECF0] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[13px] font-medium text-[#667085]">
                                        {stat.title}
                                    </p>

                                    <p className="mt-2 text-[28px] font-bold tracking-[-0.02em] text-[#101828]">
                                        {stat.value}
                                    </p>
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#EAF3FF] text-[18px] text-[#1677FF]">
                                    {stat.icon}
                                </div>
                            </div>

                            <p className="mt-3 text-[12px] text-[#98A2B3]">
                                {stat.description}
                            </p>
                        </div>
                    ))}
                </section>

                {/* =====================================================
            CONTENT GRID
        ====================================================== */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_350px]">

                    {/* Recent Tests */}
                    <section className="rounded-[10px] border border-[#EAECF0] bg-white">

                        <div className="flex items-center justify-between border-b border-[#EAECF0] px-5 py-4">
                            <div>
                                <h2 className="text-[16px] font-semibold text-[#101828]">
                                    Recent Tests
                                </h2>

                                <p className="mt-1 text-[13px] text-[#667085]">
                                    Recently created and updated tests
                                </p>
                            </div>

                            <button className="flex items-center gap-1 text-[13px] font-semibold text-[#1677FF] hover:text-[#0958D9]">
                                View all
                                <ArrowRightOutlined />
                            </button>
                        </div>

                        <div className="divide-y divide-[#EAECF0]">
                            {recentTests.map((test) => (
                                <div
                                    key={test.id}
                                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[#F8FAFC]"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#F2F4F7] text-[#667085]">
                                            <FileTextOutlined />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-[14px] font-semibold text-[#344054]">
                                                {test.name}
                                            </p>

                                            <p className="mt-1 text-[12px] text-[#98A2B3]">
                                                {test.questions} questions · {test.updated}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-3">
                                        <Tag
                                            color={
                                                test.status === 'Published'
                                                    ? 'success'
                                                    : 'default'
                                            }
                                            variant="filled"
                                            className="!rounded-full !px-3"
                                        >
                                            {test.status}
                                        </Tag>

                                        <button className="text-[#98A2B3] hover:text-[#344054]">
                                            <MoreOutlined />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* =================================================
              QUICK ACTIONS
          ================================================== */}
                    <section className="rounded-[10px] border border-[#EAECF0] bg-white">

                        <div className="border-b border-[#EAECF0] px-5 py-4">
                            <h2 className="text-[16px] font-semibold text-[#101828]">
                                Quick Actions
                            </h2>

                            <p className="mt-1 text-[13px] text-[#667085]">
                                Commonly used actions
                            </p>
                        </div>

                        <div className="space-y-3 p-5">

                            <button className="group flex w-full items-center gap-4 rounded-[8px] border border-[#EAECF0] p-4 text-left transition-all hover:border-[#B2DDFF] hover:bg-[#F5FAFF]">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#EAF3FF] text-[#1677FF]">
                                    <PlusOutlined />
                                </div>

                                <div className="flex-1">
                                    <p className="text-[14px] font-semibold text-[#344054]">
                                        Create Test
                                    </p>
                                    <p className="mt-1 text-[12px] text-[#98A2B3]">
                                        Create a new assessment
                                    </p>
                                </div>

                                <ArrowRightOutlined className="text-[#98A2B3] transition-transform group-hover:translate-x-1" />
                            </button>

                            <button className="group flex w-full items-center gap-4 rounded-[8px] border border-[#EAECF0] p-4 text-left transition-all hover:border-[#B2DDFF] hover:bg-[#F5FAFF]">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#EAF3FF] text-[#1677FF]">
                                    <QuestionCircleOutlined />
                                </div>

                                <div className="flex-1">
                                    <p className="text-[14px] font-semibold text-[#344054]">
                                        Manage Questions
                                    </p>
                                    <p className="mt-1 text-[12px] text-[#98A2B3]">
                                        Add or edit questions
                                    </p>
                                </div>

                                <ArrowRightOutlined className="text-[#98A2B3] transition-transform group-hover:translate-x-1" />
                            </button>

                            <button className="group flex w-full items-center gap-4 rounded-[8px] border border-[#EAECF0] p-4 text-left transition-all hover:border-[#B2DDFF] hover:bg-[#F5FAFF]">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#EAF3FF] text-[#1677FF]">
                                    <BarChartOutlined />
                                </div>

                                <div className="flex-1">
                                    <p className="text-[14px] font-semibold text-[#344054]">
                                        View Reports
                                    </p>
                                    <p className="mt-1 text-[12px] text-[#98A2B3]">
                                        Check assessment results
                                    </p>
                                </div>

                                <ArrowRightOutlined className="text-[#98A2B3] transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </section>
                </div>

                {/* =====================================================
            OVERVIEW
        ====================================================== */}
                <section className="mt-6 rounded-[10px] border border-[#EAECF0] bg-white p-5">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-[16px] font-semibold text-[#101828]">
                                Test Overview
                            </h2>

                            <p className="mt-1 text-[13px] text-[#667085]">
                                Current test completion status
                            </p>
                        </div>

                        <BarChartOutlined className="text-[20px] text-[#98A2B3]" />
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

                        <div>
                            <div className="mb-2 flex justify-between">
                                <span className="text-[13px] font-medium text-[#475467]">
                                    Published
                                </span>

                                <span className="text-[13px] font-semibold text-[#344054]">
                                    67%
                                </span>
                            </div>

                            <Progress
                                percent={67}
                                showInfo={false}
                                strokeColor="#1677FF"
                                trailColor="#EAECF0"
                            />
                        </div>

                        <div>
                            <div className="mb-2 flex justify-between">
                                <span className="text-[13px] font-medium text-[#475467]">
                                    Draft
                                </span>

                                <span className="text-[13px] font-semibold text-[#344054]">
                                    33%
                                </span>
                            </div>

                            <Progress
                                percent={33}
                                showInfo={false}
                                strokeColor="#98A2B3"
                                trailColor="#EAECF0"
                            />
                        </div>

                        <div>
                            <div className="mb-2 flex justify-between">
                                <span className="text-[13px] font-medium text-[#475467]">
                                    Questions Added
                                </span>

                                <span className="text-[13px] font-semibold text-[#344054]">
                                    82%
                                </span>
                            </div>

                            <Progress
                                percent={82}
                                showInfo={false}
                                strokeColor="#52C41A"
                                trailColor="#EAECF0"
                            />
                        </div>

                    </div>
                </section>

            </main>
        </div>
    );
}
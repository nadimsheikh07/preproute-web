'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Empty,
    Input,
    Space,
    Spin,
    Table,
    Tag,
    Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import { EditOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import { testService } from '@/services/test.service';
import {
    Test,
    TestStatus,
} from '@/types/test';

const { Text } = Typography;

export default function TestTable() {
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [search, setSearch] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await testService.getTests({
                    page: 1,
                    limit: 100,
                    search
                });

                setTests(data);
            } catch (error) {
                console.error('Failed to fetch tests:', error);

                setError(
                    error instanceof Error
                        ? error.message
                        : 'Unable to load tests.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTests();
    }, []);

    /**
     * Filter tests
     */
    const filteredTests = useMemo(() => {
        const value = search.trim().toLowerCase();

        if (!value) {
            return tests;
        }

        return tests.filter((test) => {
            return (
                test.name.toLowerCase().includes(value) ||
                test.subject.toLowerCase().includes(value) ||
                test.topics.some((topic) =>
                    topic.toLowerCase().includes(value)
                )
            );
        });
    }, [tests, search]);

    /**
     * Reset pagination when search changes
     */
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    /**
     * Status tag
     */
    const getStatusTag = (status: TestStatus) => {
        if (status === 'published') {
            return (
                <Tag
                    color="success"
                    variant="filled"
                    className="!rounded-full !px-3 !capitalize"
                >
                    Published
                </Tag>
            );
        }

        return (
            <Tag
                color="default"
                variant="filled"
                className="!rounded-full !px-3 !capitalize"
            >
                Draft
            </Tag>
        );
    };

    /**
     * Columns
     */
    const columns: ColumnsType<Test> = [
        {
            title: 'Test Name',
            dataIndex: 'name',
            key: 'name',
            width: 260,
            render: (name: string) => (
                <Text
                    strong
                    className="!text-[14px] !text-[#344054]"
                >
                    {name}
                </Text>
            ),
        },

        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
            width: 180,
            render: (subject: string) => (
                <span className="text-[14px] text-[#475467]">
                    {subject}
                </span>
            ),
        },

        {
            title: 'Topics',
            dataIndex: 'topics',
            key: 'topics',
            render: (topics: string[]) => (
                <Space size={[4, 4]} wrap>
                    {topics.map((topic) => (
                        <Tag
                            key={topic}
                            className="!m-0 !rounded-md !border-[#EAECF0] !bg-[#F9FAFB] !text-[#475467]"
                        >
                            {topic}
                        </Tag>
                    ))}
                </Space>
            ),
        },

        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 130,
            render: (status: TestStatus) =>
                getStatusTag(status),
        },

        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
            render: (date: string) => (
                <span className="text-[13px] text-[#667085]">
                    {new Intl.DateTimeFormat('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                    }).format(new Date(date))}
                </span>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => router.push(`/tests/${record.id}`)}
                    className="!px-0"
                >
                    Edit
                </Button>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                type="error"
                showIcon
                message="Unable to load tests"
                description={error}
            />
        );
    }

    return (
        <div className="rounded-[10px] border border-[#EAECF0] bg-white">

            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-[#EAECF0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h2 className="text-[16px] font-semibold text-[#101828]">
                        Tests
                    </h2>

                    <p className="mt-1 text-[13px] text-[#667085]">
                        Manage all your tests
                    </p>
                </div>

                <Input
                    allowClear
                    prefix={
                        <SearchOutlined className="text-[#98A2B3]" />
                    }
                    placeholder="Search tests..."
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                    className="!h-[40px] !w-full !rounded-[8px] sm:!w-[260px]"
                />
            </div>

            {/* Table */}
            <Table<Test>
                rowKey="id"
                columns={columns}
                dataSource={filteredTests}
                scroll={{
                    x: 900,
                }}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,

                    // Page size options
                    pageSizeOptions: [5, 10, 20, 50],

                    // Allow changing page size
                    showSizeChanger: true,

                    // Show total records
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} tests`,

                    // Handle page change
                    onChange: (page, newPageSize) => {
                        setCurrentPage(page);

                        if (newPageSize !== pageSize) {
                            setPageSize(newPageSize);
                            setCurrentPage(1);
                        }
                    },
                }}
                locale={{
                    emptyText: (
                        <Empty
                            description={
                                search
                                    ? 'No tests found'
                                    : 'No tests available'
                            }
                        />
                    ),
                }}
            />
        </div>
    );
}
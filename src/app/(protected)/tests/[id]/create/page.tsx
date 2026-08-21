"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    Alert,
    Button,
    Card,
    Col,
    Input,
    InputNumber,
    Row,
    Select,
    Space,
    Typography,
    message,
} from "antd";
import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    SaveOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

import api from "@/lib/axios";
import SubjectSelect from "@/components/tests/SubjectSelect";
import TopicSelect from "@/components/tests/TopicSelect";
import SubTopicSelect from "@/components/tests/SubTopicSelect";
import DifficultySelect from "@/components/tests/DifficultySelect";

const { Title, Text } = Typography;


type CreateTestForm = {
    name: string;
    type: string;
    subject: string;
    topics: string[];
    sub_topics: string[];
    difficulty: string;
    correct_marks: number;
    wrong_marks: number;
    unattempt_marks: number;
    total_time: number;
    total_marks: number;
    total_questions: number;
};

type ApiResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
};

export default function CreateTestPage() {
    const router = useRouter();
    const [messageApi, contextHolder] = message.useMessage();

    const [saving, setSaving] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreateTestForm>({
        defaultValues: {
            name: "",
            type: "",
            subject: "",
            topics: [],
            sub_topics: [],
            difficulty: "medium",
            correct_marks: 4,
            wrong_marks: -1,
            unattempt_marks: 0,
            total_time: 60,
            total_marks: 250,
            total_questions: 50,
        },
    });

    const selectedSubject = watch("subject");
    const selectedTopics = watch("topics");


    /**
     * Save test
     */
    const onSubmit = async (
        values: CreateTestForm,
        status: "draft",
    ) => {
        try {
            setSaving(true);

            const payload = {
                name: values.name,
                type: values.type,
                subject: values.subject,
                topics: values.topics,
                sub_topics: values.sub_topics,
                correct_marks: values.correct_marks,
                wrong_marks: values.wrong_marks,
                unattempt_marks: values.unattempt_marks,
                difficulty: values.difficulty,
                total_time: values.total_time,
                total_marks: values.total_marks,
                total_questions: values.total_questions,
                status,
            };

            const response = await api.post<ApiResponse<any>>(
                "/tests",
                payload,
            );

            // API returns HTTP 201 for successful creation
            if (response.status === 201) {
                messageApi.success(
                    response.data.message || "Test created successfully",
                );

                const testId = response.data.data.id;
                const subjectId = response.data.data.subject;

                if (!testId || !subjectId) {
                    messageApi.error("Test ID or Subject ID is missing");
                    return;
                }

                router.push(`/questions/${testId}/${subjectId}`);
                return;
            }

            // Unexpected successful HTTP status
            messageApi.error(
                response.data.message || "Unable to save test",
            );
        } catch (error: any) {
            const response = error?.response;
            const data = response?.data;

            // Server validation errors
            if (data?.errors && Array.isArray(data.errors)) {
                data.errors.forEach(
                    (validationError: {
                        type?: string;
                        value?: unknown;
                        msg?: string;
                        path?: string;
                        location?: string;
                    }) => {
                        if (validationError.msg) {
                            messageApi.error(validationError.msg);
                        }
                    },
                );

                return;
            }

            // General API error
            messageApi.error(
                data?.message || "Unable to save test",
            );
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDraft = handleSubmit((values) =>
        onSubmit(values, "draft"),
    );

    const handleNext = handleSubmit((values) => onSubmit(values, "draft"));

    return (
        <>
            {contextHolder}

            <div className="min-h-screen bg-gray-50 p-4 md:p-6">
                <div className="mx-auto max-w-6xl">
                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <Space align="center">
                                <Button
                                    type="text"
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => router.push("/tests")}
                                />

                                <div>
                                    <Title level={3} className="!mb-0">
                                        Create Test
                                    </Title>

                                    <Text type="secondary">
                                        Create test details and configure the marking scheme
                                    </Text>
                                </div>
                            </Space>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                icon={<SaveOutlined />}
                                loading={saving}
                                onClick={handleSaveDraft}
                            >
                                Save Draft
                            </Button>

                            <Button
                                type="primary"
                                icon={<ArrowRightOutlined />}
                                iconPosition="end"
                                loading={saving}
                                onClick={handleNext}
                            >
                                Next: Add Questions
                            </Button>
                        </div>
                    </div>

                    {/* Progress */}
                    <Card className="mb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                                1
                            </div>

                            <div className="h-[2px] flex-1 bg-gray-200" />

                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-500">
                                2
                            </div>

                            <div className="h-[2px] flex-1 bg-gray-200" />

                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-500">
                                3
                            </div>
                        </div>

                        <div className="mt-2 flex justify-between text-xs text-gray-500">
                            <span>Test Details</span>
                            <span>Add Questions</span>
                            <span>Preview & Publish</span>
                        </div>
                    </Card>

                    <form onSubmit={handleSubmit((values) => onSubmit(values, "draft"))}>
                        {/* Basic Details */}
                        <Card
                            title="Basic Test Details"
                            className="mb-6"
                            styles={{
                                header: {
                                    fontWeight: 600,
                                },
                            }}
                        >
                            <Row gutter={[20, 20]}>
                                {/* Test Name */}
                                <Col xs={24} md={12}>
                                    <Controller
                                        name="name"
                                        control={control}
                                        rules={{
                                            required: "Test name is required",
                                            minLength: {
                                                value: 3,
                                                message: "Test name must be at least 3 characters",
                                            },
                                        }}
                                        render={({ field }) => (
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Test Name <span className="text-red-500">*</span>
                                                </label>

                                                <Input
                                                    {...field}
                                                    size="large"
                                                    placeholder="Enter test name"
                                                    status={errors.name ? "error" : ""}
                                                />

                                                {errors.name && (
                                                    <div className="mt-1 text-xs text-red-500">
                                                        {errors.name.message}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    />
                                </Col>

                                {/* Test Type */}
                                <Col xs={24} md={12}>
                                    <Controller
                                        name="type"
                                        control={control}
                                        rules={{
                                            required: "Test type is required",
                                        }}
                                        render={({ field }) => (
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Test Type <span className="text-red-500">*</span>
                                                </label>

                                                <Select
                                                    {...field}
                                                    size="large"
                                                    className="w-full"
                                                    placeholder="Select test type"
                                                    status={errors.type ? "error" : ""}
                                                    options={[
                                                        {
                                                            label: "Chapter Wise",
                                                            value: "chapterwise",
                                                        },
                                                        {
                                                            label: "Subject Wise",
                                                            value: "subjectwise",
                                                        },
                                                        {
                                                            label: "Full Length",
                                                            value: "full_length",
                                                        },
                                                        {
                                                            label: "Mock Test",
                                                            value: "mock",
                                                        },
                                                    ]}
                                                />

                                                {errors.type && (
                                                    <div className="mt-1 text-xs text-red-500">
                                                        {errors.type.message}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    />
                                </Col>

                                {/* Subject */}
                                <Col xs={24} md={12}>
                                    <Controller
                                        name="subject"
                                        control={control}
                                        rules={{
                                            required: "Subject is required",
                                        }}
                                        render={({ field }) => (
                                            <SubjectSelect
                                                value={field.value}
                                                onChange={(value) => {
                                                    field.onChange(value);

                                                    // Subject changed → clear dependent fields
                                                    setValue("topics", []);
                                                    setValue("sub_topics", []);
                                                }}
                                                error={!!errors.subject}
                                            />
                                        )}
                                    />
                                </Col>

                                {/* Difficulty */}
                                <Col xs={24} md={12}>
                                    <Controller
                                        name="difficulty"
                                        control={control}
                                        rules={{
                                            required: "Difficulty is required",
                                        }}
                                        render={({ field }) => (
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Difficulty{" "}
                                                    <span className="text-red-500">*</span>
                                                </label>

                                                <DifficultySelect
                                                    value={field.value as "easy" | "medium" | "hard"}
                                                    onChange={field.onChange}
                                                    error={!!errors.difficulty}
                                                />
                                            </div>
                                        )}
                                    />
                                </Col>

                                {/* Topics */}
                                <Col xs={24} md={12}>
                                    <Controller
                                        name="topics"
                                        control={control}
                                        render={({ field }) => (
                                            <TopicSelect
                                                label="Topics"
                                                subjectId={selectedSubject}
                                                value={field.value}
                                                onChange={(value) => {
                                                    field.onChange(value);

                                                    // Topics changed → clear sub-topics
                                                    setValue("sub_topics", []);
                                                }}
                                                error={!!errors.topics}
                                            />
                                        )}
                                    />
                                </Col>

                                {/* Sub Topics */}
                                <Col xs={24} md={12}>
                                    <Controller
                                        name="sub_topics"
                                        control={control}
                                        render={({ field }) => (
                                            <SubTopicSelect
                                                topicIds={selectedTopics}
                                                value={field.value}
                                                onChange={field.onChange}
                                                error={!!errors.sub_topics}
                                            />
                                        )}
                                    />
                                </Col>
                            </Row>
                        </Card>

                        {/* Marking Scheme */}
                        <Card
                            title="Marking Scheme"
                            className="mb-6"
                            extra={
                                <Text type="secondary">
                                    Configure marks for each response type
                                </Text>
                            }
                        >
                            <Row gutter={[20, 20]}>
                                <Col xs={24} sm={8}>
                                    <Controller
                                        name="correct_marks"
                                        control={control}
                                        rules={{
                                            required: "Required",
                                        }}
                                        render={({ field }) => (
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Correct Answer
                                                </label>

                                                <InputNumber
                                                    {...field}
                                                    size="large"
                                                    className="w-full"
                                                    placeholder="4"
                                                    min={0}
                                                />
                                            </div>
                                        )}
                                    />
                                </Col>

                                <Col xs={24} sm={8}>
                                    <Controller
                                        name="wrong_marks"
                                        control={control}
                                        render={({ field }) => (
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Wrong Answer
                                                </label>

                                                <InputNumber
                                                    {...field}
                                                    size="large"
                                                    className="w-full"
                                                    placeholder="-1"
                                                    max={0}
                                                />
                                            </div>
                                        )}
                                    />
                                </Col>

                                <Col xs={24} sm={8}>
                                    <Controller
                                        name="unattempt_marks"
                                        control={control}
                                        render={({ field }) => (
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Unattempted
                                                </label>

                                                <InputNumber
                                                    {...field}
                                                    size="large"
                                                    className="w-full"
                                                    placeholder="0"
                                                    min={0}
                                                />
                                            </div>
                                        )}
                                    />
                                </Col>
                            </Row>
                        </Card>

                        {/* Test Configuration */}
                        <Card
                            title="Test Configuration"
                            className="mb-6"
                        >
                            <Row gutter={[20, 20]}>
                                <Col xs={24} sm={8}>
                                    <Controller
                                        name="total_time"
                                        control={control}
                                        rules={{
                                            required: "Required",
                                            min: {
                                                value: 1,
                                                message: "Time must be greater than 0",
                                            },
                                        }}
                                        render={({ field }) => (
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Total Time
                                                </label>

                                                <InputNumber
                                                    {...field}
                                                    size="large"
                                                    className="w-full"
                                                    min={1}
                                                    addonAfter="Minutes"
                                                />
                                            </div>
                                        )}
                                    />
                                </Col>

                                <Col xs={24} sm={8}>
                                    <Controller
                                        name="total_questions"
                                        control={control}
                                        rules={{
                                            required: "Required",
                                            min: {
                                                value: 1,
                                                message: "At least 1 question is required",
                                            },
                                        }}
                                        render={({ field }) => (
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Total Questions
                                                </label>

                                                <InputNumber
                                                    {...field}
                                                    size="large"
                                                    className="w-full"
                                                    min={1}
                                                />
                                            </div>
                                        )}
                                    />
                                </Col>

                                <Col xs={24} sm={8}>
                                    <Controller
                                        name="total_marks"
                                        control={control}
                                        rules={{
                                            required: "Required",
                                            min: {
                                                value: 1,
                                                message: "Total marks must be greater than 0",
                                            },
                                        }}
                                        render={({ field }) => (
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Total Marks
                                                </label>

                                                <InputNumber
                                                    {...field}
                                                    size="large"
                                                    className="w-full"
                                                    min={1}
                                                />
                                            </div>
                                        )}
                                    />
                                </Col>
                            </Row>
                        </Card>

                        {/* Information */}
                        <Alert
                            className="mb-6"
                            type="info"
                            showIcon
                            message="What's next?"
                            description="After saving the test details, you will be taken to the question creation page where you can add MCQ questions and their answers."
                        />

                        {/* Bottom Actions */}
                        <Card>
                            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                                <Button
                                    size="large"
                                    onClick={() => router.push("/tests")}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    size="large"
                                    icon={<SaveOutlined />}
                                    loading={saving}
                                    onClick={handleSaveDraft}
                                >
                                    Save Draft
                                </Button>

                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<ArrowRightOutlined />}
                                    iconPosition="end"
                                    loading={saving}
                                    onClick={handleNext}
                                >
                                    Next: Add Questions
                                </Button>
                            </div>
                        </Card>
                    </form>
                </div>
            </div>
        </>
    );
}
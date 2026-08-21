"use client";

import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
    Alert,
    Button,
    Card,
    Col,
    Input,
    Radio,
    Row,
    Select,
    Space,
    Typography,
    message,
} from "antd";
import {
    ArrowLeftOutlined,
    DeleteOutlined,
    PlusOutlined,
    SaveOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";

import api from "@/lib/axios";

const { Title, Text } = Typography;
const { TextArea } = Input;

type QuestionType = "mcq";
type Difficulty = "easy" | "medium" | "hard";

type QuestionFormData = {
    questions: {
        type: QuestionType;
        subject: string;
        question: string;
        option1: string;
        option2: string;
        option3: string;
        option4: string;
        correct_option: string;
        explanation: string;
        difficulty: Difficulty;
    }[];
};

type ApiResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
};

type ValidationError = {
    type?: string;
    value?: unknown;
    msg?: string;
    path?: string;
    location?: string;
};

export default function QuestionsPage() {
    const router = useRouter();

    const params = useParams<{
        testId: string;
        subjectId: string;
    }>();

    const testId = params.testId;
    const subjectId = params.subjectId;

    const [messageApi, contextHolder] = message.useMessage();
    const [saving, setSaving] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<QuestionFormData>({
        defaultValues: {
            questions: [
                {
                    type: "mcq",
                    subject: subjectId,
                    question: "",
                    option1: "",
                    option2: "",
                    option3: "",
                    option4: "",
                    correct_option: "option1",
                    explanation: "",
                    difficulty: "medium",
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "questions",
    });

    const createEmptyQuestion = (): QuestionFormData["questions"][number] => ({
        type: "mcq",
        subject: subjectId,
        question: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        correct_option: "option1",
        explanation: "",
        difficulty: "medium",
    });

    const handleAddQuestion = () => {
        append(createEmptyQuestion());
    };

    const onSubmit = async (values: QuestionFormData) => {
        try {
            setSaving(true);

            const payload = {
                questions: values.questions.map((question) => ({
                    type: question.type,
                    question: question.question,
                    option1: question.option1,
                    option2: question.option2,
                    option3: question.option3,
                    option4: question.option4,
                    correct_option: question.correct_option,
                    explanation: question.explanation,
                    difficulty: question.difficulty,

                    // IDs from route
                    test_id: testId,
                    subject: subjectId,
                })),
            };

            const response = await api.post<ApiResponse<any[]>>(
                "/questions/bulk",
                payload
            );

            if (response.status === 201) {
                messageApi.success(
                    response.data.message ||
                        `Successfully created ${values.questions.length} questions`
                );

                // router.push(`/tests/${testId}`);

                return;
            }

            messageApi.error(
                response.data.message || "Unable to create questions"
            );
        } catch (error: any) {
            const data = error?.response?.data;

            if (Array.isArray(data?.errors)) {
                const errorsByPath = new Map<string, string>();

                data.errors.forEach(
                    (validationError: ValidationError) => {
                        if (
                            validationError.path &&
                            validationError.msg &&
                            !errorsByPath.has(validationError.path)
                        ) {
                            errorsByPath.set(
                                validationError.path,
                                validationError.msg
                            );
                        }
                    }
                );

                errorsByPath.forEach((msg, path) => {
                    messageApi.error(`${path}: ${msg}`);
                });

                return;
            }

            messageApi.error(
                data?.message || "Unable to create questions"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            {contextHolder}

            <div className="min-h-screen bg-gray-50 p-4 md:p-6">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <Space align="center">
                            <Button
                                type="text"
                                icon={<ArrowLeftOutlined />}
                                onClick={() =>
                                    router.push(`/tests/${testId}`)
                                }
                            />

                            <div>
                                <Title level={3} className="!mb-0">
                                    Add Questions
                                </Title>

                                <Text type="secondary">
                                    Add MCQ questions to your test
                                </Text>
                            </div>
                        </Space>

                        <div className="flex gap-2">
                            <Button
                                icon={<PlusOutlined />}
                                onClick={handleAddQuestion}
                                disabled={saving}
                            >
                                Add Question
                            </Button>

                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                loading={saving}
                                onClick={handleSubmit(onSubmit)}
                            >
                                Save Questions
                            </Button>
                        </div>
                    </div>

                    <Card className="mb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white">
                                ✓
                            </div>

                            <div className="h-[2px] flex-1 bg-green-600" />

                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
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

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {fields.map((field, index) => {
                            const questionErrors =
                                errors.questions?.[index];

                            return (
                                <Card
                                    key={field.id}
                                    className="mb-6"
                                    title={`Question ${index + 1}`}
                                    extra={
                                        fields.length > 1 ? (
                                            <Button
                                                danger
                                                type="text"
                                                icon={<DeleteOutlined />}
                                                onClick={() =>
                                                    remove(index)
                                                }
                                            >
                                                Remove
                                            </Button>
                                        ) : null
                                    }
                                >
                                    <Row gutter={[20, 20]}>
                                        {/* Question Type */}
                                        <Col xs={24} md={12}>
                                            <Controller
                                                name={`questions.${index}.type`}
                                                control={control}
                                                rules={{
                                                    required:
                                                        "Question type is required",
                                                }}
                                                render={({ field }) => (
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">
                                                            Question Type{" "}
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </label>

                                                        <Select
                                                            {...field}
                                                            size="large"
                                                            className="w-full"
                                                            options={[
                                                                {
                                                                    label: "Multiple Choice Question",
                                                                    value: "mcq",
                                                                },
                                                            ]}
                                                            status={
                                                                questionErrors?.type
                                                                    ? "error"
                                                                    : undefined
                                                            }
                                                        />

                                                        {questionErrors?.type && (
                                                            <div className="mt-1 text-xs text-red-500">
                                                                {
                                                                    questionErrors.type.message
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                        </Col>

                                        {/* Difficulty */}
                                        <Col xs={24} md={12}>
                                            <Controller
                                                name={`questions.${index}.difficulty`}
                                                control={control}
                                                rules={{
                                                    required:
                                                        "Difficulty is required",
                                                }}
                                                render={({ field }) => (
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">
                                                            Difficulty{" "}
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </label>

                                                        <Radio.Group
                                                            {...field}
                                                            size="large"
                                                            options={[
                                                                {
                                                                    label: "Easy",
                                                                    value: "easy",
                                                                },
                                                                {
                                                                    label: "Medium",
                                                                    value: "medium",
                                                                },
                                                                {
                                                                    label: "Hard",
                                                                    value: "hard",
                                                                },
                                                            ]}
                                                        />

                                                        {questionErrors?.difficulty && (
                                                            <div className="mt-1 text-xs text-red-500">
                                                                {
                                                                    questionErrors.difficulty.message
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                        </Col>

                                        {/* Question */}
                                        <Col xs={24}>
                                            <Controller
                                                name={`questions.${index}.question`}
                                                control={control}
                                                rules={{
                                                    required:
                                                        "Question is required",
                                                    minLength: {
                                                        value: 3,
                                                        message:
                                                            "Question must be at least 3 characters",
                                                    },
                                                }}
                                                render={({ field }) => (
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">
                                                            Question{" "}
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </label>

                                                        <TextArea
                                                            {...field}
                                                            rows={4}
                                                            placeholder="Enter your question"
                                                            status={
                                                                questionErrors?.question
                                                                    ? "error"
                                                                    : undefined
                                                            }
                                                        />

                                                        {questionErrors?.question && (
                                                            <div className="mt-1 text-xs text-red-500">
                                                                {
                                                                    questionErrors.question.message
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                        </Col>
                                    </Row>

                                    {/* Options */}
                                    <div className="mt-6">
                                        <label className="mb-3 block text-sm font-semibold">
                                            Answer Options{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <Row gutter={[20, 20]}>
                                            {(
                                                [
                                                    "option1",
                                                    "option2",
                                                    "option3",
                                                    "option4",
                                                ] as const
                                            ).map(
                                                (
                                                    option,
                                                    optionIndex
                                                ) => (
                                                    <Col
                                                        key={option}
                                                        xs={24}
                                                        md={12}
                                                    >
                                                        <Controller
                                                            name={`questions.${index}.${option}`}
                                                            control={control}
                                                            rules={{
                                                                required: `Option ${
                                                                    optionIndex +
                                                                    1
                                                                } is required`,
                                                            }}
                                                            render={({
                                                                field,
                                                            }) => (
                                                                <div>
                                                                    <label className="mb-2 block text-sm font-medium">
                                                                        Option{" "}
                                                                        {optionIndex +
                                                                            1}
                                                                    </label>

                                                                    <Input
                                                                        {...field}
                                                                        size="large"
                                                                        placeholder={`Enter option ${
                                                                            optionIndex +
                                                                            1
                                                                        }`}
                                                                        status={
                                                                            questionErrors?.[
                                                                                option
                                                                            ]
                                                                                ? "error"
                                                                                : undefined
                                                                        }
                                                                    />

                                                                    {questionErrors?.[
                                                                        option
                                                                    ] && (
                                                                        <div className="mt-1 text-xs text-red-500">
                                                                            {
                                                                                questionErrors[
                                                                                    option
                                                                                ]
                                                                                    ?.message
                                                                            }
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        />
                                                    </Col>
                                                )
                                            )}
                                        </Row>
                                    </div>

                                    {/* Correct Answer */}
                                    <div className="mt-6">
                                        <Controller
                                            name={`questions.${index}.correct_option`}
                                            control={control}
                                            rules={{
                                                required:
                                                    "Correct option is required",
                                            }}
                                            render={({ field }) => (
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium">
                                                        Correct Answer{" "}
                                                        <span className="text-red-500">
                                                            *
                                                        </span>
                                                    </label>

                                                    <Radio.Group
                                                        {...field}
                                                        className="w-full"
                                                    >
                                                        <Space direction="vertical">
                                                            <Radio value="option1">
                                                                Option 1
                                                            </Radio>
                                                            <Radio value="option2">
                                                                Option 2
                                                            </Radio>
                                                            <Radio value="option3">
                                                                Option 3
                                                            </Radio>
                                                            <Radio value="option4">
                                                                Option 4
                                                            </Radio>
                                                        </Space>
                                                    </Radio.Group>

                                                    {questionErrors?.correct_option && (
                                                        <div className="mt-1 text-xs text-red-500">
                                                            {
                                                                questionErrors.correct_option.message
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        />
                                    </div>

                                    {/* Explanation */}
                                    <div className="mt-6">
                                        <Controller
                                            name={`questions.${index}.explanation`}
                                            control={control}
                                            rules={{
                                                required:
                                                    "Explanation is required",
                                            }}
                                            render={({ field }) => (
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium">
                                                        Explanation{" "}
                                                        <span className="text-red-500">
                                                            *
                                                        </span>
                                                    </label>

                                                    <TextArea
                                                        {...field}
                                                        rows={3}
                                                        placeholder="Explain why this answer is correct"
                                                        status={
                                                            questionErrors?.explanation
                                                                ? "error"
                                                                : undefined
                                                        }
                                                    />

                                                    {questionErrors?.explanation && (
                                                        <div className="mt-1 text-xs text-red-500">
                                                            {
                                                                questionErrors.explanation.message
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        />
                                    </div>
                                </Card>
                            );
                        })}

                        <Button
                            type="dashed"
                            size="large"
                            block
                            icon={<PlusOutlined />}
                            onClick={handleAddQuestion}
                            className="mb-6"
                        >
                            Add Another Question
                        </Button>

                        <Alert
                            className="mb-6"
                            type="info"
                            showIcon
                            message="Bulk Question Creation"
                            description={`You are adding ${
                                fields.length
                            } question${
                                fields.length > 1 ? "s" : ""
                            }. All questions will be submitted together.`}
                        />

                        <Card>
                            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                                <Button
                                    size="large"
                                    onClick={() =>
                                        router.push(`/tests/${testId}`)
                                    }
                                >
                                    Cancel
                                </Button>

                                <Button
                                    size="large"
                                    icon={<PlusOutlined />}
                                    onClick={handleAddQuestion}
                                    disabled={saving}
                                >
                                    Add Question
                                </Button>

                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<SaveOutlined />}
                                    loading={saving}
                                    htmlType="submit"
                                >
                                    Save {fields.length} Question
                                    {fields.length > 1 ? "s" : ""}
                                </Button>
                            </div>
                        </Card>
                    </form>
                </div>
            </div>
        </>
    );
}
"use client";

import { useEffect, useState } from "react";
import {
    Controller,
    useFieldArray,
    useForm,
} from "react-hook-form";
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
    Spin,
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

type Question = {
    id?: string;
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
};

type QuestionFormData = {
    questions: Question[];
};

type ApiResponse<T> = {
    status?: string;
    success?: boolean;
    data: T;
    message?: string;
};

type TestResponse = {
    id: string;
    name: string;
    type: string;
    subject: string;
    topics: string[];
    sub_topics: string[];
    questions: string[];
    correct_marks: number;
    unattempt_marks: number;
    wrong_marks: number;
    difficulty: Difficulty;
    total_marks: number;
    total_time: number;
    total_questions: number;
    slot: unknown;
    hidden_from_moderator: unknown;
    created_by: number;
    created_at: string;
    updated_by: number;
    updated_at: string;
    paragraph_question: unknown;
    status: string;
    scheduled_date: string | null;
    expiry_date: string | null;
    original_files: unknown[];
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
        id: string;
        subjectId: string;
    }>();

    const testId = params.id;
    const subjectId = params.subjectId;

    const [messageApi, contextHolder] =
        message.useMessage();

    const [saving, setSaving] = useState(false);
    const [loadingQuestions, setLoadingQuestions] =
        useState(true);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<QuestionFormData>({
        defaultValues: {
            questions: [],
        },
    });

    const { fields, append, remove } =
        useFieldArray({
            control,
            name: "questions",
        });

    /**
     * Create empty question
     */
    const createEmptyQuestion = (): Question => ({
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

    /**
     * Map API question to form question
     */
    const mapQuestionToForm = (
        question: any,
    ): Question => ({
        id: question?.id,

        type:
            question?.type === "mcq"
                ? "mcq"
                : "mcq",

        subject:
            question?.subject ||
            subjectId,

        question:
            question?.question || "",

        option1:
            question?.option1 || "",

        option2:
            question?.option2 || "",

        option3:
            question?.option3 || "",

        option4:
            question?.option4 || "",

        correct_option:
            question?.correct_option ||
            "option1",

        explanation:
            question?.explanation || "",

        difficulty:
            question?.difficulty === "easy" ||
            question?.difficulty === "hard"
                ? question.difficulty
                : "medium",
    });

    /**
     * Load questions
     *
     * 1. GET /tests/:id
     *
     * 2. Read test.questions
     *
     * 3. POST /questions/fetchBulk
     *
     * 4. Populate form
     */
    useEffect(() => {
        if (!testId || !subjectId) {
            setLoadingQuestions(false);
            return;
        }

        const fetchQuestions = async () => {
            try {
                setLoadingQuestions(true);

                /**
                 * --------------------------------------------------
                 * STEP 1
                 * Fetch test details
                 * --------------------------------------------------
                 */
                const testResponse =
                    await api.get<
                        ApiResponse<TestResponse>
                    >(`/tests/${testId}`);

                const test =
                    testResponse.data?.data;

                if (!test) {
                    throw new Error(
                        "Unable to fetch test details",
                    );
                }

                /**
                 * Question IDs from test
                 */
                const questionIds =
                    Array.isArray(test.questions)
                        ? test.questions
                        : [];

                /**
                 * --------------------------------------------------
                 * STEP 2
                 * No questions
                 * --------------------------------------------------
                 */
                if (
                    questionIds.length === 0
                ) {
                    reset({
                        questions: [
                            createEmptyQuestion(),
                        ],
                    });

                    return;
                }

                /**
                 * --------------------------------------------------
                 * STEP 3
                 * Fetch questions in bulk
                 *
                 * POST /questions/fetchBulk
                 * --------------------------------------------------
                 */
                const bulkResponse =
                    await api.post<
                        ApiResponse<any[]>
                    >(
                        "/questions/fetchBulk",
                        {
                            question_ids:
                                questionIds,
                        },
                    );

                const questions =
                    bulkResponse.data?.data;

                if (
                    !Array.isArray(
                        questions,
                    ) ||
                    questions.length === 0
                ) {
                    reset({
                        questions: [
                            createEmptyQuestion(),
                        ],
                    });

                    return;
                }

                /**
                 * --------------------------------------------------
                 * STEP 4
                 * Preserve original question order
                 *
                 * API fetchBulk may not guarantee the same
                 * order as test.questions.
                 * --------------------------------------------------
                 */
                const questionMap =
                    new Map<
                        string,
                        any
                    >();

                questions.forEach(
                    (question) => {
                        if (question?.id) {
                            questionMap.set(
                                question.id,
                                question,
                            );
                        }
                    },
                );

                const orderedQuestions =
                    questionIds
                        .map(
                            (questionId) =>
                                questionMap.get(
                                    questionId,
                                ),
                        )
                        .filter(Boolean);

                /**
                 * --------------------------------------------------
                 * STEP 5
                 * Populate react-hook-form
                 * --------------------------------------------------
                 */
                if (
                    orderedQuestions.length >
                    0
                ) {
                    reset({
                        questions:
                            orderedQuestions.map(
                                mapQuestionToForm,
                            ),
                    });
                } else {
                    reset({
                        questions: [
                            createEmptyQuestion(),
                        ],
                    });
                }
            } catch (error: any) {
                console.error(
                    "Unable to load questions:",
                    error,
                );

                const data =
                    error?.response?.data;

                messageApi.error(
                    data?.message ||
                        error?.message ||
                        "Unable to load questions",
                );

                reset({
                    questions: [
                        createEmptyQuestion(),
                    ],
                });
            } finally {
                setLoadingQuestions(false);
            }
        };

        fetchQuestions();
    }, [
        testId,
        subjectId,
        reset,
        messageApi,
    ]);

    /**
     * Add question
     */
    const handleAddQuestion = () => {
        append(createEmptyQuestion());
    };

    /**
     * Submit questions
     */
    const onSubmit = async (
        values: QuestionFormData,
    ) => {
        if (
            !values.questions ||
            values.questions.length === 0
        ) {
            messageApi.error(
                "Please add at least one question",
            );

            return;
        }

        try {
            setSaving(true);

            /**
             * Separate existing and new questions
             */
            const existingQuestions =
                values.questions.filter(
                    (question) =>
                        Boolean(question.id),
                );

            const newQuestions =
                values.questions.filter(
                    (question) =>
                        !question.id,
                );

            /**
             * --------------------------------------------------
             * CREATE NEW QUESTIONS
             *
             * POST /questions/bulk
             * --------------------------------------------------
             */
            if (newQuestions.length > 0) {
                const createPayload = {
                    questions:
                        newQuestions.map(
                            (question) => ({
                                type:
                                    question.type,

                                question:
                                    question.question,

                                option1:
                                    question.option1,

                                option2:
                                    question.option2,

                                option3:
                                    question.option3,

                                option4:
                                    question.option4,

                                correct_option:
                                    question.correct_option,

                                explanation:
                                    question.explanation,

                                difficulty:
                                    question.difficulty,

                                test_id:
                                    testId,

                                subject:
                                    subjectId,
                            }),
                        ),
                };

                await api.post<
                    ApiResponse<any[]>
                >(
                    "/questions/bulk",
                    createPayload,
                );
            }

            /**
             * --------------------------------------------------
             * UPDATE EXISTING QUESTIONS
             *
             * PUT /questions/:id
             * --------------------------------------------------
             */
            if (
                existingQuestions.length >
                0
            ) {
                await Promise.all(
                    existingQuestions.map(
                        (question) =>
                            api.put(
                                `/questions/${question.id}`,
                                {
                                    type:
                                        question.type,

                                    question:
                                        question.question,

                                    option1:
                                        question.option1,

                                    option2:
                                        question.option2,

                                    option3:
                                        question.option3,

                                    option4:
                                        question.option4,

                                    correct_option:
                                        question.correct_option,

                                    explanation:
                                        question.explanation,

                                    difficulty:
                                        question.difficulty,

                                    test_id:
                                        testId,

                                    subject:
                                        subjectId,
                                },
                            ),
                    ),
                );
            }

            /**
             * Success
             */
            messageApi.success(
                `Successfully saved ${
                    values.questions.length
                } question${
                    values.questions.length !==
                    1
                        ? "s"
                        : ""
                }`,
            );

            /**
             * Go to publish page
             */
            router.push(
                `/tests/${testId}/publish`,
            );
        } catch (error: any) {
            console.error(
                "Unable to save questions:",
                error,
            );

            const data =
                error?.response?.data;

            /**
             * Server validation errors
             */
            if (
                Array.isArray(data?.errors)
            ) {
                const errorsByPath =
                    new Map<
                        string,
                        string
                    >();

                data.errors.forEach(
                    (
                        validationError: ValidationError,
                    ) => {
                        if (
                            validationError.path &&
                            validationError.msg &&
                            !errorsByPath.has(
                                validationError.path,
                            )
                        ) {
                            errorsByPath.set(
                                validationError.path,
                                validationError.msg,
                            );
                        }
                    },
                );

                if (
                    errorsByPath.size > 0
                ) {
                    errorsByPath.forEach(
                        (
                            validationMessage,
                            path,
                        ) => {
                            messageApi.error(
                                `${path}: ${validationMessage}`,
                            );
                        },
                    );
                } else {
                    messageApi.error(
                        data?.message ||
                            "Validation failed",
                    );
                }

                return;
            }

            messageApi.error(
                data?.message ||
                    error?.message ||
                    "Unable to save questions",
            );
        } finally {
            setSaving(false);
        }
    };

    /**
     * Loading state
     */
    if (loadingQuestions) {
        return (
            <>
                {contextHolder}

                <div className="flex min-h-screen items-center justify-center bg-gray-50">
                    <Space
                        direction="vertical"
                        align="center"
                    >
                        <Spin size="large" />

                        <Text type="secondary">
                            Loading questions...
                        </Text>
                    </Space>
                </div>
            </>
        );
    }

    return (
        <>
            {contextHolder}

            <div className="min-h-screen bg-gray-50 p-4 md:p-6">
                <div className="mx-auto max-w-6xl">

                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <Space align="center">
                            <Button
                                type="text"
                                icon={
                                    <ArrowLeftOutlined />
                                }
                                onClick={() =>
                                    router.push(
                                        `/tests/${testId}`,
                                    )
                                }
                            />

                            <div>
                                <Title
                                    level={3}
                                    className="!mb-0"
                                >
                                    Add Questions
                                </Title>

                                <Text type="secondary">
                                    Add or update MCQ
                                    questions for your
                                    test
                                </Text>
                            </div>
                        </Space>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                icon={
                                    <PlusOutlined />
                                }
                                onClick={
                                    handleAddQuestion
                                }
                                disabled={saving}
                            >
                                Add Question
                            </Button>

                            <Button
                                type="primary"
                                icon={
                                    <SaveOutlined />
                                }
                                loading={saving}
                                onClick={handleSubmit(
                                    onSubmit,
                                )}
                            >
                                Save Questions
                            </Button>
                        </div>
                    </div>

                    {/* Progress */}
                    <Card className="mb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white">
                                ✓
                            </div>

                            <div className="h-[2px] flex-1 bg-green-600" />

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                                2
                            </div>

                            <div className="h-[2px] flex-1 bg-gray-200" />

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-500">
                                3
                            </div>
                        </div>

                        <div className="mt-2 flex justify-between text-xs text-gray-500">
                            <span>
                                Test Details
                            </span>

                            <span>
                                Add Questions
                            </span>

                            <span>
                                Preview & Publish
                            </span>
                        </div>
                    </Card>

                    <form
                        onSubmit={handleSubmit(
                            onSubmit,
                        )}
                    >
                        {fields.map(
                            (field, index) => {
                                const questionErrors =
                                    errors.questions?.[
                                        index
                                    ];

                                return (
                                    <Card
                                        key={field.id}
                                        className="mb-6"
                                        title={`Question ${
                                            index + 1
                                        }`}
                                        extra={
                                            fields.length >
                                                1 ? (
                                                <Button
                                                    danger
                                                    type="text"
                                                    icon={
                                                        <DeleteOutlined />
                                                    }
                                                    onClick={() =>
                                                        remove(
                                                            index,
                                                        )
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                >
                                                    Remove
                                                </Button>
                                            ) : null
                                        }
                                    >
                                        <Row
                                            gutter={[
                                                20,
                                                20,
                                            ]}
                                        >
                                            {/* Question Type */}
                                            <Col
                                                xs={24}
                                                md={12}
                                            >
                                                <Controller
                                                    name={`questions.${index}.type`}
                                                    control={
                                                        control
                                                    }
                                                    rules={{
                                                        required:
                                                            "Question type is required",
                                                    }}
                                                    render={({
                                                        field,
                                                    }) => (
                                                        <div>
                                                            <label className="mb-2 block text-sm font-medium">
                                                                Question
                                                                Type{" "}
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
                                                                        questionErrors
                                                                            .type
                                                                            .message
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                />
                                            </Col>

                                            {/* Difficulty */}
                                            <Col
                                                xs={24}
                                                md={12}
                                            >
                                                <Controller
                                                    name={`questions.${index}.difficulty`}
                                                    control={
                                                        control
                                                    }
                                                    rules={{
                                                        required:
                                                            "Difficulty is required",
                                                    }}
                                                    render={({
                                                        field,
                                                    }) => (
                                                        <div>
                                                            <label className="mb-2 block text-sm font-medium">
                                                                Difficulty{" "}
                                                                <span className="text-red-500">
                                                                    *
                                                                </span>
                                                            </label>

                                                            <Radio.Group
                                                                {...field}
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
                                                                        questionErrors
                                                                            .difficulty
                                                                            .message
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
                                                    control={
                                                        control
                                                    }
                                                    rules={{
                                                        required:
                                                            "Question is required",
                                                        minLength:
                                                            {
                                                                value: 3,
                                                                message:
                                                                    "Question must be at least 3 characters",
                                                            },
                                                    }}
                                                    render={({
                                                        field,
                                                    }) => (
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
                                                                        questionErrors
                                                                            .question
                                                                            .message
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
                                                Answer
                                                Options{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>

                                            <Row
                                                gutter={[
                                                    20,
                                                    20,
                                                ]}
                                            >
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
                                                        optionIndex,
                                                    ) => (
                                                        <Col
                                                            key={
                                                                option
                                                            }
                                                            xs={
                                                                24
                                                            }
                                                            md={
                                                                12
                                                            }
                                                        >
                                                            <Controller
                                                                name={`questions.${index}.${option}`}
                                                                control={
                                                                    control
                                                                }
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
                                                                                    ]?.message
                                                                                }
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            />
                                                        </Col>
                                                    ),
                                                )}
                                            </Row>
                                        </div>

                                        {/* Correct Answer */}
                                        <div className="mt-6">
                                            <Controller
                                                name={`questions.${index}.correct_option`}
                                                control={
                                                    control
                                                }
                                                rules={{
                                                    required:
                                                        "Correct option is required",
                                                }}
                                                render={({
                                                    field,
                                                }) => (
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">
                                                            Correct
                                                            Answer{" "}
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
                                                                    Option
                                                                    1
                                                                </Radio>

                                                                <Radio value="option2">
                                                                    Option
                                                                    2
                                                                </Radio>

                                                                <Radio value="option3">
                                                                    Option
                                                                    3
                                                                </Radio>

                                                                <Radio value="option4">
                                                                    Option
                                                                    4
                                                                </Radio>
                                                            </Space>
                                                        </Radio.Group>

                                                        {questionErrors?.correct_option && (
                                                            <div className="mt-1 text-xs text-red-500">
                                                                {
                                                                    questionErrors
                                                                        .correct_option
                                                                        .message
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
                                                control={
                                                    control
                                                }
                                                rules={{
                                                    required:
                                                        "Explanation is required",
                                                }}
                                                render={({
                                                    field,
                                                }) => (
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
                                                                    questionErrors
                                                                        .explanation
                                                                        .message
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </Card>
                                );
                            },
                        )}

                        {/* Add Question */}
                        <Button
                            type="dashed"
                            size="large"
                            block
                            icon={
                                <PlusOutlined />
                            }
                            onClick={
                                handleAddQuestion
                            }
                            className="mb-6"
                            disabled={saving}
                        >
                            Add Another Question
                        </Button>

                        {/* Information */}
                        <Alert
                            className="mb-6"
                            type="info"
                            showIcon
                            message="Question Management"
                            description={`You have ${
                                fields.length
                            } question${
                                fields.length !== 1
                                    ? "s"
                                    : ""
                            }. Existing questions will be updated and new questions will be created.`}
                        />

                        {/* Bottom Actions */}
                        <Card>
                            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                                <Button
                                    size="large"
                                    onClick={() =>
                                        router.push(
                                            `/tests/${testId}`,
                                        )
                                    }
                                >
                                    Cancel
                                </Button>

                                <Button
                                    size="large"
                                    icon={
                                        <PlusOutlined />
                                    }
                                    onClick={
                                        handleAddQuestion
                                    }
                                    disabled={saving}
                                >
                                    Add Question
                                </Button>

                                <Button
                                    type="primary"
                                    size="large"
                                    icon={
                                        <SaveOutlined />
                                    }
                                    loading={saving}
                                    htmlType="submit"
                                >
                                    Save{" "}
                                    {fields.length}{" "}
                                    Question
                                    {fields.length !==
                                    1
                                        ? "s"
                                        : ""}
                                </Button>
                            </div>
                        </Card>
                    </form>
                </div>
            </div>
        </>
    );
}
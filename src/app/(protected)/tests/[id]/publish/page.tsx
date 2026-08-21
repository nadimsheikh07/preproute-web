"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Button,
    Card,
    DatePicker,
    Form,
    Radio,
    Space,
    Tabs,
    TimePicker,
    Typography,
    message,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import api from "@/lib/axios";

const { Title, Text } = Typography;

type PublishMode = "now" | "schedule";

type LiveUntil =
    | "always"
    | "1_week"
    | "2_weeks"
    | "3_weeks"
    | "1_month"
    | "custom";

type FormValues = {
    liveUntil: LiveUntil;
    endDate?: Dayjs;
    endDateTime?: Dayjs;
    scheduledDateTime?: Dayjs;
};

type TestResponse = {
    id: string;
    status: string;
    scheduled_date: string | null;
    expiry_date: string | null;
};

const LIVE_UNTIL_OPTIONS = [
    {
        label: "Always Available",
        value: "always",
    },
    {
        label: "1 Week",
        value: "1_week",
    },
    {
        label: "2 Weeks",
        value: "2_weeks",
    },
    {
        label: "3 Weeks",
        value: "3_weeks",
    },
    {
        label: "1 Month",
        value: "1_month",
    },
    {
        label: "Custom Duration",
        value: "custom",
    },
];

export default function PublishTestPage() {
    const params = useParams();
    const router = useRouter();

    const testId = params.id as string;

    const [mode, setMode] = useState<PublishMode>("now");
    const [loading, setLoading] = useState(false);

    const [form] = Form.useForm<FormValues>();

    const liveUntil = Form.useWatch("liveUntil", form);
    const scheduledDateTime = Form.useWatch(
        "scheduledDateTime",
        form
    );

    /**
     * Calculate expiry date based on selected duration.
     */
    const calculatedExpiryDate = useMemo(() => {
        if (!liveUntil || liveUntil === "always" || liveUntil === "custom") {
            return null;
        }

        const baseDate =
            mode === "schedule"
                ? scheduledDateTime
                : dayjs();

        if (!baseDate) {
            return null;
        }

        switch (liveUntil) {
            case "1_week":
                return baseDate.add(1, "week");

            case "2_weeks":
                return baseDate.add(2, "week");

            case "3_weeks":
                return baseDate.add(3, "week");

            case "1_month":
                return baseDate.add(1, "month");

            default:
                return null;
        }
    }, [liveUntil, mode, scheduledDateTime]);

    /**
     * Set calculated expiry date in form.
     */
    useEffect(() => {
        if (!calculatedExpiryDate) {
            return;
        }

        form.setFieldValue("endDateTime", calculatedExpiryDate);
        form.setFieldValue("endDate", calculatedExpiryDate);
    }, [calculatedExpiryDate, form]);

    /**
     * Handle tab change.
     */
    const handleModeChange = (key: string) => {
        const newMode = key as PublishMode;

        setMode(newMode);

        form.resetFields([
            "liveUntil",
            "endDate",
            "endDateTime",
            "scheduledDateTime",
        ]);

        form.setFieldValue("liveUntil", "always");
    };

    /**
     * Build expiry date.
     */
    const getExpiryDate = (values: FormValues) => {
        if (values.liveUntil === "always") {
            return null;
        }

        if (values.liveUntil === "custom") {
            if (!values.endDateTime) {
                return null;
            }

            return values.endDateTime.toISOString();
        }

        const baseDate =
            mode === "schedule"
                ? values.scheduledDateTime
                : dayjs();

        if (!baseDate) {
            return null;
        }

        switch (values.liveUntil) {
            case "1_week":
                return baseDate.add(1, "week").toISOString();

            case "2_weeks":
                return baseDate.add(2, "week").toISOString();

            case "3_weeks":
                return baseDate.add(3, "week").toISOString();

            case "1_month":
                return baseDate.add(1, "month").toISOString();

            default:
                return null;
        }
    };

    /**
     * Submit form.
     */
    const handleSubmit = async (values: FormValues) => {
        try {
            setLoading(true);

            const expiryDate = getExpiryDate(values);

            const payload = {
                status: mode === "now" ? "live" : "scheduled",

                scheduled_date:
                    mode === "schedule"
                        ? values.scheduledDateTime?.toISOString() ?? null
                        : null,

                expiry_date: expiryDate,
            };

            await api.put(`/tests/${testId}`, payload);

            message.success(
                mode === "now"
                    ? "Test published successfully"
                    : "Test scheduled successfully"
            );

            router.push("/tests");
        } catch (error: any) {
            console.error(error);

            message.error(
                error?.response?.data?.message ||
                "Failed to publish test"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                maxWidth: 800,
                margin: "0 auto",
                padding: "24px 16px",
            }}
        >
            <Card>
                <Space
                    direction="vertical"
                    size={4}
                    style={{
                        width: "100%",
                        marginBottom: 24,
                    }}
                >
                    <Title level={3} style={{ margin: 0 }}>
                        Publish Test
                    </Title>

                    <Text type="secondary">
                        Choose when this test should become available.
                    </Text>
                </Space>

                <Tabs
                    activeKey={mode}
                    onChange={handleModeChange}
                    items={[
                        {
                            key: "now",
                            label: "Publish Now",
                        },
                        {
                            key: "schedule",
                            label: "Schedule Publish",
                        },
                    ]}
                />

                <Form<FormValues>
                    form={form}
                    layout="vertical"
                    initialValues={{
                        liveUntil: "always",
                    }}
                    onFinish={handleSubmit}
                >
                    {/* Schedule Date & Time */}
                    {mode === "schedule" && (
                        <Form.Item
                            label="Schedule Date & Time"
                            name="scheduledDateTime"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        "Please select schedule date and time",
                                },
                                {
                                    validator: (_, value) => {
                                        if (!value) {
                                            return Promise.resolve();
                                        }

                                        if (
                                            value.isBefore(dayjs())
                                        ) {
                                            return Promise.reject(
                                                new Error(
                                                    "Schedule date and time must be in the future"
                                                )
                                            );
                                        }

                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <DatePicker
                                showTime
                                style={{ width: "100%" }}
                                format="DD/MM/YYYY hh:mm A"
                                disabledDate={(current) =>
                                    current &&
                                    current < dayjs().startOf("day")
                                }
                            />
                        </Form.Item>
                    )}

                    {/* Live Until */}
                    <Form.Item
                        label="Live Until"
                        name="liveUntil"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please select how long the test should remain live",
                            },
                        ]}
                    >
                        <Radio.Group>
                            <Space
                                direction="vertical"
                                size="middle"
                            >
                                {LIVE_UNTIL_OPTIONS.map((option) => (
                                    <Radio
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </Radio>
                                ))}
                            </Space>
                        </Radio.Group>
                    </Form.Item>

                    {/* Calculated Expiry */}
                    {liveUntil &&
                        liveUntil !== "always" &&
                        liveUntil !== "custom" && (
                            <Card
                                size="small"
                                style={{
                                    marginBottom: 24,
                                }}
                            >
                                <Space
                                    direction="vertical"
                                    size={4}
                                >
                                    <Text type="secondary">
                                        Test will be available until
                                    </Text>

                                    <Text strong>
                                        {calculatedExpiryDate
                                            ? calculatedExpiryDate.format(
                                                "DD MMM YYYY, hh:mm A"
                                            )
                                            : "Select schedule date"}
                                    </Text>
                                </Space>
                            </Card>
                        )}

                    {/* Custom End Date */}
                    {liveUntil === "custom" && (
                        <>
                            <Form.Item
                                label="End Date"
                                name="endDate"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please select end date",
                                    },
                                ]}
                            >
                                <DatePicker
                                    style={{
                                        width: "100%",
                                    }}
                                    format="DD/MM/YYYY"
                                    disabledDate={(current) => {
                                        const minimumDate =
                                            mode === "schedule"
                                                ? scheduledDateTime
                                                : dayjs();

                                        return (
                                            current &&
                                            current <
                                            minimumDate
                                                ?.startOf("day")
                                        );
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="End Date & Time"
                                name="endDateTime"
                                dependencies={[
                                    "scheduledDateTime",
                                ]}
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please select end date and time",
                                    },
                                    {
                                        validator: (_, value) => {
                                            if (!value) {
                                                return Promise.resolve();
                                            }

                                            const startDate =
                                                mode === "schedule"
                                                    ? form.getFieldValue(
                                                        "scheduledDateTime"
                                                    )
                                                    : dayjs();

                                            if (
                                                startDate &&
                                                value.isBefore(
                                                    startDate
                                                )
                                            ) {
                                                return Promise.reject(
                                                    new Error(
                                                        "End date must be after publish date"
                                                    )
                                                );
                                            }

                                            return Promise.resolve();
                                        },
                                    },
                                ]}
                            >
                                <DatePicker
                                    showTime
                                    style={{
                                        width: "100%",
                                    }}
                                    format="DD/MM/YYYY hh:mm A"
                                />
                            </Form.Item>
                        </>
                    )}

                    {/* Buttons */}
                    <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
                        <Space>
                            <Button
                                onClick={() =>
                                    router.push("/tests")
                                }
                                disabled={loading}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                            >
                                {mode === "now"
                                    ? "Publish Now"
                                    : "Schedule Publish"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
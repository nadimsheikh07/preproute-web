"use client";

import { useEffect, useState } from "react";
import { Select } from "antd";

import api from "@/lib/axios";

export type SelectOption = {
    label: string;
    value: string;
};

type Topic = {
    id: string;
    name: string;
    subject_id: string;
};

type ApiResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
};

type TopicSelectProps = {
    subjectId?: string;
    value?: string[];
    onChange?: (value: string[]) => void;
    error?: boolean;
};

export default function TopicSelect({
    subjectId,
    value = [],
    onChange,
    error = false,
}: TopicSelectProps) {
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!subjectId) {
            return;
        }

        let cancelled = false;

        const fetchTopics = async () => {
            setLoading(true);

            try {
                const response = await api.get<ApiResponse<Topic[]>>(
                    `/topics/subject/${subjectId}`,
                );

                if (cancelled) {
                    return;
                }

                const topicOptions = response.data.data.map((topic) => ({
                    label: topic.name,
                    value: topic.id,
                }));

                setOptions(topicOptions);
            } catch (error) {
                if (!cancelled) {
                    console.error("Failed to fetch topics:", error);
                    setOptions([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchTopics();

        return () => {
            cancelled = true;
        };
    }, [subjectId]);

    const disabled = !subjectId;

    return (
        <Select
            mode="multiple"
            value={disabled ? [] : value}
            onChange={onChange}
            size="large"
            className="w-full"
            placeholder={
                disabled
                    ? "Select subject first"
                    : "Select topics"
            }
            disabled={disabled}
            loading={loading}
            options={disabled ? [] : options}
            maxTagCount="responsive"
            status={error ? "error" : undefined}
            allowClear
        />
    );
}
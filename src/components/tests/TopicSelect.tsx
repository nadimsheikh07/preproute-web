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
            setOptions([]);
            onChange?.([]);
            return;
        }

        const fetchTopics = async () => {
            try {
                setLoading(true);

                const response = await api.get<ApiResponse<Topic[]>>(
                    `/topics/subject/${subjectId}`,
                );

                setOptions(
                    response.data.data.map((topic) => ({
                        label: topic.name,
                        value: topic.id,
                    })),
                );
            } catch (error) {
                console.error("Failed to fetch topics:", error);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTopics();
    }, [subjectId]);

    return (
        <Select
            mode="multiple"
            value={value}
            onChange={onChange}
            size="large"
            className="w-full"
            placeholder={
                subjectId ? "Select topics" : "Select subject first"
            }
            disabled={!subjectId}
            loading={loading}
            options={options}
            maxTagCount="responsive"
            status={error ? "error" : ""}
            allowClear
        />
    );
}
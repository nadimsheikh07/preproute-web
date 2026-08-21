"use client";

import { useEffect, useState } from "react";
import { Select } from "antd";

import api from "@/lib/axios";

export type SelectOption = {
    label: string;
    value: string;
};

type SubTopic = {
    id: string;
    name: string;
    topic_id: string;
};

type ApiResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
};

type SubTopicSelectProps = {
    topicIds?: string[];
    value?: string[];
    onChange?: (value: string[]) => void;
    error?: boolean;
};

export default function SubTopicSelect({
    topicIds = [],
    value = [],
    onChange,
    error = false,
}: SubTopicSelectProps) {
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(false);

    const hasTopics = topicIds.length > 0;

    useEffect(() => {
        if (!hasTopics) {
            return;
        }

        let cancelled = false;

        const fetchSubTopics = async () => {
            setLoading(true);

            try {
                const response = await api.post<ApiResponse<SubTopic[]>>(
                    "/sub-topics/multi-topics",
                    {
                        topicIds,
                    },
                );

                if (cancelled) {
                    return;
                }

                setOptions(
                    response.data.data.map((subTopic) => ({
                        label: subTopic.name,
                        value: subTopic.id,
                    })),
                );
            } catch (error) {
                if (!cancelled) {
                    console.error(
                        "Failed to fetch sub-topics:",
                        error,
                    );

                    setOptions([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchSubTopics();

        return () => {
            cancelled = true;
        };
    }, [hasTopics, topicIds]);

    return (
        <Select
            mode="multiple"
            value={hasTopics ? value : []}
            onChange={onChange}
            size="large"
            className="w-full"
            placeholder={
                hasTopics
                    ? "Select sub-topics"
                    : "Select topics first"
            }
            disabled={!hasTopics}
            loading={loading}
            options={hasTopics ? options : []}
            maxTagCount="responsive"
            allowClear
            status={error ? "error" : undefined}
        />
    );
}
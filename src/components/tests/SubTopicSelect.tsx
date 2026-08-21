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
};

export default function SubTopicSelect({
    topicIds = [],
    value = [],
    onChange,
}: SubTopicSelectProps) {
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!topicIds.length) {
            setOptions([]);
            onChange?.([]);
            return;
        }

        const fetchSubTopics = async () => {
            try {
                setLoading(true);

                const response = await api.post<ApiResponse<SubTopic[]>>(
                    "/sub-topics/multi-topics",
                    {
                        topicIds,
                    },
                );

                setOptions(
                    response.data.data.map((subTopic) => ({
                        label: subTopic.name,
                        value: subTopic.id,
                    })),
                );
            } catch (error) {
                console.error("Failed to fetch sub-topics:", error);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSubTopics();
    }, [topicIds]);

    return (
        <Select
            mode="multiple"
            value={value}
            onChange={onChange}
            size="large"
            className="w-full"
            placeholder={
                topicIds.length
                    ? "Select sub-topics"
                    : "Select topics first"
            }
            disabled={!topicIds.length}
            loading={loading}
            options={options}
            maxTagCount="responsive"
            allowClear
        />
    );
}
"use client";

import { useEffect, useState } from "react";
import { Select } from "antd";

import api from "@/lib/axios";

export type SelectOption = {
    label: string;
    value: string;
};

type Subject = {
    id: string;
    name: string;
};

type ApiResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
};

type SubjectSelectProps = {
    value?: string;
    onChange?: (value: string) => void;
    error?: boolean;
};

export default function SubjectSelect({
    value,
    onChange,
    error = false,
}: SubjectSelectProps) {
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                setLoading(true);

                const response = await api.get<ApiResponse<Subject[]>>(
                    "/subjects",
                );

                setOptions(
                    response.data.data.map((subject) => ({
                        label: subject.name,
                        value: subject.id,
                    })),
                );
            } catch (error) {
                console.error("Failed to fetch subjects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, []);

    return (
        <Select
            value={value}
            onChange={onChange}
            size="large"
            className="w-full"
            showSearch
            loading={loading}
            placeholder="Select subject"
            optionFilterProp="label"
            status={error ? "error" : ""}
            options={options}
            allowClear
        />
    );
}
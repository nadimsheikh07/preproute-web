"use client";

import { Radio } from "antd";

export type DifficultyValue = "easy" | "medium" | "hard";

type DifficultySelectProps = {
    value?: DifficultyValue;
    onChange?: (value: DifficultyValue) => void;
    error?: boolean;
};

const options: {
    label: string;
    value: DifficultyValue;
}[] = [
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
    ];

export default function DifficultySelect({
    value,
    onChange,
    error = false,
}: DifficultySelectProps) {
    return (
        <div>
            <Radio.Group
                value={value}
                onChange={(event) => onChange?.(event.target.value)}
                className="w-full"
            >
                <div className="flex flex-wrap gap-3">
                    {options.map((option) => (
                        <Radio
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </Radio>
                    ))}
                </div>
            </Radio.Group>

            {error && (
                <div className="mt-1 text-xs text-red-500">
                    Difficulty is required
                </div>
            )}
        </div>
    );
}
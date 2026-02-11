import React from 'react';

interface CircularProgressProps {
    value: number;
    size?: number;
    strokeWidth?: number;
    trackColor?: string;
    progressColor?: string;
    textColor?: string;
    showLabel?: boolean;
    label?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
    value,
    size = 100,
    strokeWidth = 8,
    trackColor = "stroke-stone-100 dark:stroke-stone-800",
    progressColor = "stroke-gold-400",
    textColor = "text-stone-800 dark:text-stone-100",
    showLabel = true,
    label
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-90"
            >
                {/* Track Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                    className={`${trackColor} transition-colors duration-300`}
                />

                {/* Progress Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`${progressColor} transition-all duration-1000 ease-out`}
                />
            </svg>

            {/* Center Label */}
            {showLabel && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xl font-bold ${textColor}`}>
                        {label || `${Math.round(value)}%`}
                    </span>
                </div>
            )}
        </div>
    );
};

export default CircularProgress;

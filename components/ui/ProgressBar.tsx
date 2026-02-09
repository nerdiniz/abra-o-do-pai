import React from 'react';

interface ProgressBarProps {
    current: number;
    total: number;
    color?: string;
    className?: string;
    showLabel?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    current,
    total,
    color = "bg-gold-400",
    className = "",
    showLabel = false
}) => {
    const percentage = Math.min(100, Math.max(0, (current / total) * 100));

    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Progresso</span>
                    <span className="text-xs font-bold text-gold-600 dark:text-gold-500">{Math.round(percentage)}%</span>
                </div>
            )}
            <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                <div
                    className={`${color} h-full rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;

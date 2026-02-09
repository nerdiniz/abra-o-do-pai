import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glass?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick, glass = false }) => {
  const baseStyles = "bg-white dark:bg-stone-900 overflow-hidden transition-all duration-300";
  const glassStyles = "glass-panel bg-white/90 dark:bg-stone-900/40 backdrop-blur-md";
  const borderStyles = "border border-stone-100 dark:border-stone-800 rounded-2xl";
  const hoverStyles = onClick ? "cursor-pointer hover:border-gold-200 dark:hover:border-gold-500/50 hover:shadow-md" : "";

  return (
    <div 
      onClick={onClick}
      className={`
        ${baseStyles} 
        ${glass ? glassStyles : ''} 
        ${borderStyles} 
        ${hoverStyles} 
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;

import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  onClick?: () => void;
  key?: React.Key;
}

export default function GlassCard({ children, className = "", id, onClick }: GlassCardProps) {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-sm rounded-3xl transition-all duration-300 ${
        onClick ? "cursor-pointer hover:scale-[1.01] hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-600" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

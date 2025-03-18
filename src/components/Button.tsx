
import React from "react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ButtonProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "primary" | "outline" | "secondary";
  icon?: React.ReactNode;
}

const ButtonVip = ({ 
  children, 
  className, 
  onClick, 
  variant = "primary",
  icon 
}: ButtonProps) => {
  return (
    <ShadcnButton
      className={`
        ${variant === "primary" 
          ? "bg-indigo-500 hover:bg-indigo-600 text-white hover:shadow-lg hover:shadow-indigo-500/20 dark:hover:shadow-indigo-500/10" 
          : variant === "outline" 
          ? "border-2 border-indigo-500 bg-transparent text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-600 dark:hover:bg-indigo-900/20" 
          : "bg-gray-100 hover:bg-gray-200 text-gray-900 hover:text-gray-950 hover:shadow-sm"}
        w-full flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
        ${className || ""}
      `}
      onClick={onClick}
    >
      {children || "Bắt đầu khóa học"}
      {icon || <ArrowRight className="h-4 w-4" />}
    </ShadcnButton>
  );
};

export default ButtonVip;

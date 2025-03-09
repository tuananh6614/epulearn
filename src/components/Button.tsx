import React from "react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ButtonProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Buttonvip = ({ children, className, onClick }: ButtonProps) => {
  return (
    <ShadcnButton
      className={`bg-indigo-500 hover:bg-indigo-600 text-white w-full flex items-center justify-center gap-2 ${className || ""}`}
      onClick={onClick}
    >
      {children || "Bắt đầu khóa học"}
      <ArrowRight className="h-4 w-4" />
    </ShadcnButton>
  );
};

export default Buttonvip;

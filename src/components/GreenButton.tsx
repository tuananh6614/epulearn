
import React from "react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ButtonProps as ShadcnButtonProps } from "@/components/ui/button";

interface GreenButtonProps extends ShadcnButtonProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
}

const GreenButton = ({ 
  children, 
  className, 
  icon,
  ...props
}: GreenButtonProps) => {
  return (
    <ShadcnButton
      className={cn(
        "bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 dark:hover:shadow-green-500/10 hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      {...props}
    >
      {children}
      {icon && icon}
    </ShadcnButton>
  );
};

export default GreenButton;

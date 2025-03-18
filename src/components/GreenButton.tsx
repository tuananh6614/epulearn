
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
        "bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2",
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

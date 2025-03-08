
import React from 'react';
import { Link } from "react-router-dom";
import { Button as ShadcnButton } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Button = () => {
  return (
    <ShadcnButton className="bg-indigo-500 hover:bg-indigo-600 text-white w-full flex items-center justify-center gap-2">
      Bắt đầu khóa học
      <ArrowRight className="h-4 w-4" />
    </ShadcnButton>
  );
};

export default Button;

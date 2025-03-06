
import React from 'react';
import { Code, CheckCircle, BookOpen, Award } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-epu-green" />,
      title: "Interactive Lessons",
      description: "Learn programming concepts through engaging interactive lessons with real-time code examples."
    },
    {
      icon: <Code className="h-8 w-8 text-epu-blue" />,
      title: "Hands-on Practice",
      description: "Apply what you've learned with guided coding exercises and projects."
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-epu-green" />,
      title: "Chapter Quizzes",
      description: "Test your knowledge after each chapter with comprehensive quizzes to reinforce learning."
    },
    {
      icon: <Award className="h-8 w-8 text-epu-blue" />,
      title: "Earn Certificates",
      description: "Receive certificates upon completion to showcase your programming skills."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-epu-dark mb-4">How EPU Learn Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Our platform makes learning to code engaging, effective, and fun with a proven methodology.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className="mb-6 p-4 bg-gray-50 rounded-full group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-epu-dark">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;


import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    content: "EPU Learn completely changed how I approach coding. The interactive exercises made the learning process fun and engaging.",
    name: "Minh Anh",
    title: "Computer Science Student",
    avatar: "/placeholder.svg"
  },
  {
    id: 2,
    content: "As someone with no prior programming experience, EPU Learn made it easy to understand complex concepts through step-by-step lessons.",
    name: "Van Linh",
    title: "Self-taught Developer",
    avatar: "/placeholder.svg"
  },
  {
    id: 3,
    content: "The chapter quizzes helped reinforce what I learned. I feel confident in my programming skills after completing the courses.",
    name: "Quoc Tuan",
    title: "IT Professional",
    avatar: "/placeholder.svg"
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-epu-dark mb-4">What Our Students Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Join thousands of satisfied learners who have transformed their coding skills with EPU Learn.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-white overflow-hidden">
              <CardContent className="p-6 relative">
                <Quote className="absolute top-6 right-6 h-10 w-10 text-gray-100 z-0" />
                <div className="relative z-10">
                  <p className="text-gray-600 mb-6 italic">{testimonial.content}</p>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback className="bg-epu-green/20 text-epu-green">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-epu-dark">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.title}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

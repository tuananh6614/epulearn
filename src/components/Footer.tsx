
import React from 'react';
import { Link } from "react-router-dom";
import { Code, Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-epu-dark text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gradient-to-r from-epu-green to-epu-blue">
                <Code className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-xl">EPU<span className="text-epu-green">Learn</span></span>
            </Link>
            <p className="text-gray-400 mb-6">
              The premier platform for learning programming languages through interactive lessons and chapter quizzes.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-4">Courses</h3>
            <ul className="space-y-3">
              <li><Link to="/courses/web-development" className="text-gray-400 hover:text-white transition-colors">Web Development</Link></li>
              <li><Link to="/courses/python" className="text-gray-400 hover:text-white transition-colors">Python</Link></li>
              <li><Link to="/courses/javascript" className="text-gray-400 hover:text-white transition-colors">JavaScript</Link></li>
              <li><Link to="/courses/java" className="text-gray-400 hover:text-white transition-colors">Java</Link></li>
              <li><Link to="/courses/c-plus-plus" className="text-gray-400 hover:text-white transition-colors">C++</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/tutorials" className="text-gray-400 hover:text-white transition-colors">Tutorials</Link></li>
              <li><Link to="/documentation" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/community" className="text-gray-400 hover:text-white transition-colors">Community</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">© 2023 EPU Learn. All rights reserved.</p>
          <div className="flex items-center mt-4 md:mt-0">
            <Mail className="h-5 w-5 mr-2 text-gray-400" />
            <a href="mailto:contact@epulearn.com" className="text-gray-400 hover:text-white transition-colors">contact@epulearn.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

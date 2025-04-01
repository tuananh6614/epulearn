
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  link?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  homeLink?: string;
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  items, 
  homeLink = '/', 
  className = '' 
}) => {
  return (
    <nav className={`flex items-center text-sm ${className}`}>
      <ol className="flex items-center space-x-2">
        <li>
          <Link 
            to={homeLink} 
            className="text-muted-foreground hover:text-primary transition-colors flex items-center"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>
        
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <li className="flex items-center">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </li>
            <li>
              {item.link ? (
                <Link 
                  to={item.link} 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium">{item.label}</span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

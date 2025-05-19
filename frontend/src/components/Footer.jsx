import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <Link to="/" className="flex items-center">
                <img src="/logo.png" alt="Credit Gyems Academy Logo" className="h-10 w-auto mr-3" />
                <span className="font-bold text-lg text-slate-800">Credit Gyems Academy</span>
              </Link>
            </div>
            
            <p className="text-slate-600 mb-6 pr-8">
              Transforming credit journeys and building lasting financial freedom through expert guidance, education, and proven strategies.
            </p>
            
            <div className="flex gap-4 mb-6">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary-light hover:text-primary transition-colors"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary-light hover:text-primary transition-colors"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer" 
                className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary-light hover:text-primary transition-colors"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary-light hover:text-primary transition-colors"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-800 mb-6">Services</h4>
            <ul className="space-y-4">
              <li><Link to="/services/credit-repair" className="text-slate-600 hover:text-primary transition-colors">Credit Repair</Link></li>
              <li><Link to="/services/credit-coaching" className="text-slate-600 hover:text-primary transition-colors">Credit Coaching</Link></li>
              <li><Link to="/services/financial-planning" className="text-slate-600 hover:text-primary transition-colors">Financial Planning</Link></li>
              <li><Link to="/booking" className="text-slate-600 hover:text-primary transition-colors">Consultation</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-800 mb-6">Products</h4>
            <ul className="space-y-4">
              <li><Link to="/products?category=ebooks" className="text-slate-600 hover:text-primary transition-colors">E-Books</Link></li>
              <li><Link to="/products?category=masterclasses" className="text-slate-600 hover:text-primary transition-colors">Masterclasses</Link></li>
              <li><Link to="/blog/resources" className="text-slate-600 hover:text-primary transition-colors">Resources</Link></li>
              <li><Link to="/community" className="text-slate-600 hover:text-primary transition-colors">Community</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-800 mb-6">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-slate-600 hover:text-primary transition-colors">About</Link></li>
              <li><Link to="/blog" className="text-slate-600 hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/about#testimonials" className="text-slate-600 hover:text-primary transition-colors">Testimonials</Link></li>
              <li><Link to="/contact" className="text-slate-600 hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <hr className="my-10 border-slate-200" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Credit Gyems Academy, LLC. All rights reserved.
          </p>
          
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/privacy-policy" className="text-slate-500 hover:text-primary transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-slate-500 hover:text-primary transition-colors text-sm">
              Terms of Service
            </Link>
            <Link to="/disclaimer" className="text-slate-500 hover:text-primary transition-colors text-sm">
              Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
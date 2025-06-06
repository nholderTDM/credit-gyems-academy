import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const socialLinks = [
    { 
      name: 'Facebook', 
      href: '#', 
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.77 7.46H15.5v-1.9c0-.9.6-1.1 1-1.1h2.2V2.2h-3c-2.5 0-4.1 1.9-4.1 4.6v1.6h-2.2v2.6h2.2v7h3.5v-7h2.9l.4-2.6z" />
        </svg>
      )
    },
    { 
      name: 'Instagram', 
      href: '#', 
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.02 2.9c2.72 0 3.05.01 4.13.06 1.02.05 1.58.22 1.95.37.49.19.84.41 1.21.78.37.37.59.72.78 1.21.15.37.32.93.37 1.95.05 1.08.06 1.41.06 4.13s-.01 3.05-.06 4.13c-.05 1.02-.22 1.58-.37 1.95-.19.49-.41.84-.78 1.21-.37.37-.72.59-1.21.78-.37.15-.93.32-1.95.37-1.08.05-1.41.06-4.13.06s-3.05-.01-4.13-.06c-1.02-.05-1.58-.22-1.95-.37-.49-.19-.84-.41-1.21-.78-.37-.37-.59-.72-.78-1.21-.15-.37-.32-.93-.37-1.95-.05-1.08-.06-1.41-.06-4.13s.01-3.05.06-4.13c.05-1.02.22-1.58.37-1.95.19-.49.41-.84.78-1.21.37-.37.72-.59 1.21-.78.37-.15.93-.32 1.95-.37 1.08-.05 1.41-.06 4.13-.06zm0-2.67c-2.78 0-3.12.01-4.21.06-1.09.05-1.84.22-2.49.47-.68.26-1.26.61-1.84 1.19-.58.58-.93 1.16-1.19 1.84-.25.65-.42 1.4-.47 2.49-.05 1.09-.06 1.43-.06 4.21s.01 3.12.06 4.21c.05 1.09.22 1.84.47 2.49.26.68.61 1.26 1.19 1.84.58.58 1.16.93 1.84 1.19.65.25 1.4.42 2.49.47 1.09.05 1.43.06 4.21.06s3.12-.01 4.21-.06c1.09-.05 1.84-.22 2.49-.47.68-.26 1.26-.61 1.84-1.19.58-.58.93-1.16 1.19-1.84.25-.65.42-1.4.47-2.49.05-1.09.06-1.43.06-4.21s-.01-3.12-.06-4.21c-.05-1.09-.22-1.84-.47-2.49-.26-.68-.61-1.26-1.19-1.84-.58-.58-1.16-.93-1.84-1.19-.65-.25-1.4-.42-2.49-.47-1.09-.05-1.43-.06-4.21-.06z" />
        </svg>
      )
    },
    { 
      name: 'LinkedIn', 
      href: '#', 
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.44 20.44h-3.82v-5.98c0-1.43-.03-3.27-1.99-3.27-1.99 0-2.3 1.56-2.3 3.16v6.09h-3.82V9.1h3.67v1.56h.05c.51-.97 1.76-1.99 3.63-1.99 3.88 0 4.59 2.55 4.59 5.87v6.9zM5.34 7.53c-1.23 0-2.22-.99-2.22-2.22s.99-2.22 2.22-2.22 2.22.99 2.22 2.22-.99 2.22-2.22 2.22zM7.25 20.44H3.43V9.1h3.82v11.34z" />
        </svg>
      )
    },
    { 
      name: 'YouTube', 
      href: '#', 
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.44 6.12c-.27-1.01-1.06-1.8-2.07-2.07C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.37.55c-1.01.27-1.8 1.06-2.07 2.07C0 7.89 0 12 0 12s0 4.11.56 5.88c.27 1.01 1.06 1.8 2.07 2.07C4.4 20.5 12 20.5 12 20.5s7.6 0 9.37-.55c1.01-.27 1.8-1.06 2.07-2.07C24 16.11 24 12 24 12s0-4.11-.56-5.88zM9.75 15.54V8.46L15.83 12l-6.08 3.54z" />
        </svg>
      )
    }
  ];

  const serviceLinks = ['Credit Repair', 'Credit Coaching', 'Financial Planning', 'Free Consultation'];
  const productLinks = ['E-Books', 'Masterclasses', 'Free Resources', 'Community Access'];
  const companyLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Success Stories', href: '/about#testimonials' },
    { name: 'Contact', href: '/contact' }
  ];
  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Disclaimer', href: '/disclaimer' }
  ];

  return (
    <footer className="bg-white pt-16 pb-8 border-t border-slate-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mr-3">
                <span className="text-slate-800 font-bold text-lg">CG</span>
              </div>
              <span className="font-bold text-lg text-slate-800">Credit Gyems Academy</span>
            </div>
            
            <p className="text-slate-600 mb-6 pr-8">
              Transforming credit journeys and building lasting financial freedom through expert guidance, education, and proven strategies.
            </p>
            
            <div className="flex gap-4 mb-6">
              {socialLinks.map((social) => (
                <a 
                  key={social.name} 
                  href={social.href} 
                  className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-slate-800 transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-800 mb-6">Services</h4>
            <ul className="space-y-4">
              {serviceLinks.map((item) => (
                <li key={item}>
                  <Link to={`/services/${item.toLowerCase().replace(' ', '-')}`} className="text-slate-600 hover:text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-800 mb-6">Products</h4>
            <ul className="space-y-4">
              {productLinks.map((item) => (
                <li key={item}>
                  <Link to={`/products?category=${item.toLowerCase()}`} className="text-slate-600 hover:text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-800 mb-6">Company</h4>
            <ul className="space-y-4">
              {companyLinks.map((item) => (
                <li key={item.name}>
                  <Link to={item.href} className="text-slate-600 hover:text-primary transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <hr className="my-10 border-slate-200" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Credit Gyems Academy, LLC. All rights reserved.
          </p>
          
          <div className="flex gap-6 mt-4 md:mt-0">
            {legalLinks.map((item) => (
              <Link key={item.name} to={item.href} className="text-slate-500 hover:text-primary transition-colors text-sm">
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
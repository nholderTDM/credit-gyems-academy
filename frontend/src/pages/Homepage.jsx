import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { auth } from '../config/firebase';

// Component for animated counter
const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    const incrementTime = (2000 / end) * 1000;
    
    if (end > 0) {
      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start >= end) clearInterval(timer);
      }, incrementTime);

      return () => {
        clearInterval(timer);
      };
    }
  }, [value]);

  return <span>{count}</span>;
};

// Services data
const services = [
  {
    icon: "credit-card",
    title: "Credit Repair",
    description: "Professional dispute resolution and credit rebuilding strategies that deliver measurable results. We address errors, negative items, and provide actionable improvements.",
    color: "#FFD700",
    buttonText: "Discover Credit Repair",
    link: "/services/credit-repair"
  },
  {
    icon: "academic-cap",
    title: "Credit Coaching",
    description: "Personalized coaching sessions that provide education and accountability. Learn the insider secrets to maintaining excellent credit and making smart financial decisions.",
    color: "#FF0000",
    buttonText: "Explore Coaching",
    link: "/services/credit-coaching"
  },
  {
    icon: "currency-dollar",
    title: "Financial Planning",
    description: "Comprehensive planning for your financial future. From debt elimination to wealth building, create a roadmap to achieve your financial goals and secure lasting freedom.",
    color: "#26A69A",
    buttonText: "Plan Your Future",
    link: "/services/financial-planning"
  }
];

// Testimonials data - needed for the testimonials section
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    position: "Small Business Owner",
    avatar: "/testimonials/user1.jpg",
    content: "Working with DorTae completely transformed my financial situation. My credit score jumped 120 points in just 3 months!",
    rating: 5,
    type: "text"
  },
  {
    id: 2,
    name: "Marcus Williams",
    position: "Real Estate Investor",
    avatar: "/testimonials/user2.jpg",
    content: "Credit Gyems Academy helped me qualify for my first investment property loan. The strategies DorTae taught me were invaluable.",
    rating: 5,
    type: "video",
    thumbnail: "/testimonials/video-thumb.jpg"
  },
  {
    id: 3,
    name: "Alicia Rodriguez",
    position: "Homebuyer",
    avatar: "/testimonials/user3.jpg",
    content: "I went from a 580 to a 720 credit score and finally bought my dream home! The e-books and coaching were life-changing.",
    rating: 5,
    type: "text",
    image: "/testimonials/before-after.jpg"
  }
];

// Products data - needed for the products section
const products = [
  {
    id: 1,
    title: "Credit Repair Mastery",
    description: "A comprehensive guide to understanding and improving your credit score through proven dispute strategies and credit-building techniques.",
    image: "/products/ebook1.jpg",
    price: 47,
    popular: true
  },
  {
    id: 2,
    title: "Financial Freedom Blueprint",
    description: "Step-by-step strategies to eliminate debt, build wealth, and secure your financial future through smart money management practices.",
    image: "/products/ebook2.jpg",
    price: 47,
    popular: false
  },
  {
    id: 3,
    title: "Credit Secrets Revealed",
    description: "Insider knowledge from industry experts on maximizing your credit potential and accessing better rates, terms, and financial opportunities.",
    image: "/products/ebook3.jpg",
    price: 47,
    popular: false
  },
  {
    id: 4,
    title: "Wealth Building Fundamentals",
    description: "Essential principles for creating sustainable wealth and financial security through strategic investments and passive income streams.",
    image: "/products/ebook4.jpg",
    price: 47,
    popular: false
  }
];

const Homepage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  useEffect(() => {
    console.log('🔥 Firebase Auth loaded:', auth);
    console.log('🔧 Environment check:', {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Found' : '❌ Missing',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Found' : '❌ Missing',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Found' : '❌ Missing'
    });
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      // Send to API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          source: "free_guide",
          interests: ["credit_repair"]
        }),
      });
      
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setEmail('');
          setSuccess(false);
        }, 3000);
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <span
        key={i}
        className={`text-lg ${i < rating ? 'text-primary' : 'text-slate-200'}`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-28 md:pt-32 pb-16 md:pb-24 relative overflow-hidden bg-gradient-to-br from-yellow-50 to-red-50">
        {/* Decorative elements */}
        <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-yellow-300/20 to-yellow-300/0 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-gradient-to-br from-red-300/10 to-red-300/0 blur-3xl"></div>
        
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-accent-teal bg-clip-text text-transparent">
                Transform Your Credit Journey
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 mb-8">
                Expert credit repair, coaching, and financial planning with DorTae Freeman
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link to="/booking" className="bg-gradient-to-r from-primary to-yellow-400 hover:from-yellow-400 hover:to-primary text-slate-800 font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all text-center">
                  Get Your Free Credit Assessment
                </Link>
                <Link to="/services" className="border-2 border-primary text-slate-700 font-semibold px-6 py-3 rounded-full hover:bg-yellow-50 transition-all text-center">
                  Learn More About Our Services
                </Link>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-slate-500 font-medium">As featured in</span>
                <div className="h-px bg-slate-200 flex-grow"></div>
              </div>
              
              <div className="flex gap-6 flex-wrap">
                {['CNBC', 'Forbes', 'Financial Times'].map((item, index) => (
                  <div 
                    key={index}
                    className="h-8 bg-slate-200 px-4 flex items-center justify-center rounded text-sm text-slate-500 font-medium"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute -top-4 -left-4 right-6 bottom-6 bg-gradient-to-br from-yellow-200/30 to-red-200/30 rounded-lg -z-10"></div>
                <div className="bg-white/90 backdrop-blur border border-yellow-300/30 rounded-lg p-6 shadow-xl">
                  <img 
                    src="/hero-image.jpg" 
                    alt="Credit transformation journey" 
                    className="w-full rounded-lg mb-6"
                  />
                  
                  <h3 className="text-xl font-semibold mb-4 text-slate-800">
                    Your Path to Financial Freedom
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-yellow-100 border border-yellow-400 text-slate-700 inline-flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Credit Repair
                    </span>
                    <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-red-100 border border-red-400 text-slate-700 inline-flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                      Financial Education
                    </span>
                    <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-teal-100 border border-teal-400 text-slate-700 inline-flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Wealth Building
                    </span>
                  </div>
                  
                  <Link to="/about#success-stories" className="w-full bg-gradient-to-r from-primary to-yellow-400 text-slate-800 rounded-full py-3 font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center">
                    Watch Success Story
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* About DorTae Freeman Section */}
      <div className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-5/12">
              <div className="relative">
                <div className="absolute top-5 -left-5 w-full h-full rounded-full bg-gradient-to-br from-yellow-300/30 to-red-300/30 -z-10"></div>
                <img
                  src="/dortae-freeman.jpg"
                  alt="DorTae Freeman"
                  className="rounded-full w-72 h-72 md:w-96 md:h-96 object-cover border-6 border-white shadow-xl"
                />
              </div>
            </div>
            
            <div className="md:w-7/12">
              <span className="uppercase tracking-wider text-primary font-semibold text-sm">Meet Your Credit Guru</span>
              
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6 text-slate-800">
                DorTae Freeman
              </h2>
              
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                As the founder of Credit Gyems Academy, DorTae Freeman has transformed thousands of lives through expert credit repair, coaching, and financial planning. With her unique methodology and passionate approach, she helps clients rebuild their credit and create lasting financial freedom.
              </p>
              
              <div className="mb-8">
                <p className="text-slate-600 text-lg leading-relaxed mb-4">
                  DorTae's journey began when she personally overcame significant credit challenges, rebuilding her score from the bottom up. This experience ignited her passion for helping others achieve financial transformation through education and personalized strategies.
                </p>
                
                <Link 
                  to="/about"
                  className="text-primary font-medium flex items-center hover:text-yellow-600 transition-colors"
                >
                  Read DorTae's Full Story
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {[
                  { figure: "2500", label: "Clients Helped" },
                  { figure: "150", label: "Credit Score Average Increase" },
                  { figure: "95", label: "Success Rate" }
                ].map((stat, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-slate-200 text-center shadow-sm">
                    <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1">
                      <AnimatedCounter value={stat.figure} />
                      {index === 0 || index === 1 ? "+" : "%"}
                    </div>
                    <div className="text-sm text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Services Section */}
      <div className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="uppercase tracking-wider text-primary font-semibold text-sm">Our Expertise</span>
            
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-slate-800">
              Comprehensive Credit Solutions
            </h2>
            
            <p className="text-slate-600 text-lg max-w-3xl mx-auto">
              At Credit Gyems Academy, we offer a full spectrum of services designed to transform your credit and build lasting financial success.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index}>
                <div className="bg-white rounded-xl shadow-lg h-full flex flex-col relative overflow-hidden border border-slate-100 hover:translate-y-[-5px] transition-all duration-300 hover:shadow-xl">
                  <div className="h-1.5 w-full" style={{ backgroundColor: service.color }}></div>
                  <div className="p-8">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                      style={{ backgroundColor: `${service.color}20` }}
                    >
                      {service.icon === 'credit-card' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" style={{ color: service.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      )}
                      
                      {service.icon === 'academic-cap' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" style={{ color: service.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                      )}
                      
                      {service.icon === 'currency-dollar' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" style={{ color: service.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4 text-slate-800">{service.title}</h3>
                    
                    <p className="text-slate-600 mb-8 flex-grow">{service.description}</p>
                    
                    <Link 
                      to={service.link}
                      className="inline-flex items-center font-medium rounded-full px-4 py-2 transition-all border"
                      style={{ 
                        borderColor: service.color,
                        color: service.color,
                      }}
                    >
                      {service.buttonText}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Lead Magnet Section */}
      <div className="py-16 md:py-24 bg-slate-900 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-0 w-96 h-96 rounded-full bg-gradient-to-br from-yellow-400/10 to-yellow-400/0 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-gradient-to-br from-red-400/5 to-red-400/0 blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <span className="uppercase tracking-wider text-primary font-semibold text-sm">Free Credit Guide</span>
              
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6 text-white">
                Unlock Your Credit Potential
              </h2>
              
              <p className="text-slate-300 text-lg leading-relaxed mb-8">
                Download our free guide "7 Steps to Boost Your Credit Score by 100+ Points" and start transforming your financial future today. Learn proven strategies that have helped thousands improve their credit.
              </p>
              
              <div className="flex flex-col gap-4 mb-8">
                {[
                  "Identify and dispute inaccuracies on your credit report",
                  "Optimize your credit utilization for maximum impact",
                  "Build positive credit history with strategic accounts",
                  "Create a personalized roadmap to your credit goals"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <svg className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleLeadSubmit} className="max-w-lg">
                <div className="bg-white/90 backdrop-blur rounded-full p-1 flex items-center">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-grow px-4 py-3 bg-transparent focus:outline-none text-slate-800 rounded-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  
                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="bg-gradient-to-r from-primary to-yellow-400 text-slate-800 font-semibold rounded-full px-6 py-3 min-w-[140px] disabled:opacity-70 flex justify-center"
                  >
                    {loading ? (
                      <div className="h-6 w-6 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
                    ) : success ? (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      "Get Free Guide"
                    )}
                  </button>
                </div>
                
                <p className="text-slate-400 text-sm mt-3">
                  We respect your privacy. Your information will never be shared or sold.
                </p>
              </form>
            </div>
            
            <div className="md:w-1/2">
              <div className="relative mx-auto max-w-xs">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-secondary/40 blur-3xl -z-10"></div>
                <img
                  src="/credit-guide.jpg"
                  alt="Credit Guide Preview"
                  className="w-full rounded-lg shadow-2xl border border-white/20"
                />
                
                <div className="absolute top-[10%] right-[10%] bg-white rounded-full p-4 shadow-lg z-10">
                  <span className="text-2xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    FREE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="uppercase tracking-wider text-primary font-semibold text-sm">Client Success</span>
            
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-slate-800">
              Transformational Results
            </h2>
            
            <p className="text-slate-600 text-lg max-w-3xl mx-auto">
              Hear from clients who have experienced remarkable credit transformations through Credit Gyems Academy's proven methods.
            </p>
          </div>
          
          <div className="relative my-8 h-96 md:h-80 lg:h-64">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`transition-opacity duration-500 absolute inset-0 ${
                  activeTestimonial === index ? 'opacity-100 z-10' : 'opacity-0 -z-10'
                }`}
                style={{ display: activeTestimonial === index ? 'block' : 'none' }}
              >
                <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl p-6 md:p-10 h-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
                    {testimonial.type === "video" && (
                      <div className="rounded-lg overflow-hidden relative">
                        <div className="pb-[56.25%] relative">
                          <img
                            src={testimonial.thumbnail}
                            alt={`${testimonial.name} video testimonial`}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform">
                            <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {testimonial.type === "text" && testimonial.image && (
                      <div>
                        <img
                          src={testimonial.image}
                          alt={`${testimonial.name} result`}
                          className="w-full rounded-lg shadow-lg"
                        />
                      </div>
                    )}
                    
                    <div className={testimonial.type === "text" && !testimonial.image ? "col-span-2" : ""}>
                      <div className="relative">
                        <svg className="absolute -top-10 -left-6 h-20 w-20 text-yellow-200" fill="currentColor" viewBox="0 0 32 32">
                          <path d="M10 8c-2.667 0-5 1.333-7 4 0.667-0.667 1.667-1 3-1 2 0 3.667 1.667 3.667 3.667 0 2.667-2 4.667-4.667 4.667-3.333 0-5-2.333-5-7 0-7.333 4.333-10.333 10-11.333v3c-2.333 0.667-4 1.333-5 3 1-0.333 2.333-0.667 3.667-0.667 2.333 0 4.333 1.333 4.333 3.667 0 2.667-2.333 4.667-5 4.667-3.333 0-5-2.333-5-7 0-7.333 4.333-10.333 10-11.333v3c-2.333 0.667-4 1.333-5 3 0.667-0.333 1.667-0.667 2.333-0.667z"></path>
                        </svg>
                        
                        <p className="text-2xl md:text-3xl font-serif italic mb-8 pl-4">
                          {testimonial.content}
                        </p>
                        
                        <div className="flex items-center mb-3">
                          <img
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            className="w-12 h-12 rounded-full mr-4"
                          />
                          
                          <div>
                            <h4 className="font-bold text-slate-800">{testimonial.name}</h4>
                            <p className="text-slate-500 text-sm">{testimonial.position}</p>
                          </div>
                        </div>
                        
                        <div>
                          {renderStars(testimonial.rating)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  activeTestimonial === index ? 'bg-primary w-6' : 'bg-slate-300'
                }`}
                onClick={() => setActiveTestimonial(index)}
              />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/about#testimonials" className="bg-gradient-to-r from-primary to-yellow-400 text-slate-800 font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all inline-flex items-center">
              View More Success Stories
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Products Preview Section */}
      <div className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="uppercase tracking-wider text-primary font-semibold text-sm">Digital Products</span>
            
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-slate-800">
              Transform Your Credit Journey
            </h2>
            
            <p className="text-slate-600 text-lg max-w-3xl mx-auto">
              Comprehensive guides and resources designed to help you master your credit and build lasting financial freedom.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id}>
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 h-full flex flex-col relative overflow-hidden">
                  {product.popular && (
                    <div className="absolute -right-10 top-6 bg-secondary text-white px-10 py-1 transform rotate-45 z-10 text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="h-64 overflow-hidden rounded-t-2xl">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-3">{product.title}</h3>
                    
                    <p className="text-slate-600 text-sm mb-4 flex-grow">{product.description}</p>
                    
                    <div className="text-primary font-bold mb-4">
                      Price: ${product.price}
                    </div>
                    
                    <Link to={`/products/${product.id}`} className="bg-gradient-to-r from-primary to-yellow-400 text-slate-800 font-semibold rounded-full py-2 w-full inline-flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/products" className="bg-gradient-to-r from-secondary to-red-600 text-white font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all inline-flex items-center">
              View All Products
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Final CTA Section */}
      <div className="py-20 md:py-28 bg-slate-900 text-white relative">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: 'url(/cta-bg.jpg)' }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Begin Your Credit Transformation Today
            </h2>
            
            <p className="text-xl text-slate-300 mb-10">
              Join thousands of successful clients who have rebuilt their credit and secured their financial future with Credit Gyems Academy.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/booking" className="bg-gradient-to-r from-primary to-yellow-400 text-slate-800 font-semibold px-8 py-4 rounded-full text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Get Your Free Assessment
              </Link>
              
              <Link to="/contact" className="border-2 border-white text-white font-semibold px-8 py-4 rounded-full text-lg hover:bg-white/10 transition-all">
                Schedule a Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Homepage;
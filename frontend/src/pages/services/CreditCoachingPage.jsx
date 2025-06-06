import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Star,
  CheckCircle,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  DollarSign,
  ArrowRight,
  Play,
  Download,
  Phone,
  Mail,
  MessageSquare,
  Award,
  Target,
  BookOpen,
  Video,
  ChevronDown,
  ChevronUp,
  Loader2,
  Shield,
  Zap,
  BarChart3,
  FileText,
  User,
  Quote
} from 'lucide-react';

const CreditCoachingPage = () => {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentScore: '',
    goals: '',
    packageType: 'premium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  // Coaching packages data
  const packages = [
    {
      id: 'basic',
      name: 'Basic Coaching',
      price: 297,
      duration: '1 Month',
      features: [
        '4 One-on-One Coaching Sessions',
        'Credit Report Analysis',
        'Personalized Action Plan',
        'Email Support',
        'Resource Library Access',
        'Progress Tracking Dashboard'
      ],
      highlighted: false
    },
    {
      id: 'premium',
      name: 'Premium Coaching',
      price: 597,
      duration: '3 Months',
      features: [
        '12 One-on-One Coaching Sessions',
        'Complete Credit Report Analysis',
        'Custom Credit Repair Strategy',
        'Priority Email & Chat Support',
        'Resource Library Access',
        'Progress Tracking Dashboard',
        'Dispute Letter Templates',
        'Creditor Negotiation Scripts',
        'Weekly Check-ins',
        'Lifetime Community Access'
      ],
      highlighted: true,
      popular: true
    },
    {
      id: 'elite',
      name: 'Elite Transformation',
      price: 997,
      duration: '6 Months',
      features: [
        '24 One-on-One Coaching Sessions',
        'Complete Credit Overhaul',
        'Done-With-You Credit Repair',
        '24/7 Priority Support',
        'Resource Library Access',
        'Advanced Tracking Dashboard',
        'Custom Dispute Letters',
        'Direct Creditor Negotiations',
        'Daily Check-ins Available',
        'Lifetime Community Access',
        'Financial Planning Sessions',
        'Wealth Building Strategies',
        'Success Guarantee*'
      ],
      highlighted: false
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: "How quickly can I see results?",
      answer: "Most clients see initial improvements within 30-45 days. However, significant credit score increases typically occur within 3-6 months depending on your starting point and commitment to the process."
    },
    {
      question: "What makes Credit Gyems coaching different?",
      answer: "Our personalized approach combines education, practical strategies, and ongoing support. We don't just tell you what to do – we guide you through every step, ensuring you understand the 'why' behind each action."
    },
    {
      question: "Do you guarantee specific score increases?",
      answer: "While we can't guarantee specific point increases due to individual circumstances, our Elite package includes a success guarantee. If you don't see improvement after following our program, we'll continue working with you at no additional cost."
    },
    {
      question: "Can I upgrade my package later?",
      answer: "Absolutely! You can upgrade your package at any time and we'll credit what you've already paid toward the higher tier."
    },
    {
      question: "What if I need help outside of scheduled sessions?",
      answer: "All packages include email support. Premium and Elite members get priority response times, and Elite members have access to 24/7 support through our dedicated hotline."
    },
    {
      question: "Do you work with all credit situations?",
      answer: "Yes! Whether you're recovering from bankruptcy, dealing with collections, or just want to optimize your credit, we have strategies tailored to your specific situation."
    }
  ];

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      // Simulated testimonials for demo
      const demoTestimonials = [
        {
          id: 1,
          name: "Sarah Johnson",
          location: "Atlanta, GA",
          score: { before: 520, after: 718 },
          text: "DorTae's coaching changed my life! I went from being denied for everything to qualifying for my dream home.",
          rating: 5,
          image: null
        },
        {
          id: 2,
          name: "Marcus Williams",
          location: "Houston, TX",
          score: { before: 580, after: 745 },
          text: "The personalized strategy and constant support made all the difference. Worth every penny!",
          rating: 5,
          image: null
        },
        {
          id: 3,
          name: "Ashley Chen",
          location: "Los Angeles, CA",
          score: { before: 490, after: 680 },
          text: "I was skeptical at first, but the results speak for themselves. The education I received will benefit me for life.",
          rating: 5,
          image: null
        }
      ];
      setTestimonials(demoTestimonials);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/coaching/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowThankYou(true);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          currentScore: '',
          goals: '',
          packageType: 'premium'
        });
        
        // Redirect to booking page after 2 seconds
        setTimeout(() => {
          navigate('/booking?service=credit-coaching');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-[#FFD700]/20 rounded-full mb-6">
                <Zap className="h-4 w-4 text-[#FFD700] mr-2" />
                <span className="text-sm font-medium text-[#FFD700]">Transform Your Credit Score</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                Expert Credit Coaching That 
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FF0000]">
                  Gets Results
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8">
                Join hundreds of clients who've increased their credit scores by 100+ points with personalized guidance from DorTae Freeman.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => document.getElementById('packages').scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button className="px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Success Stories
                </button>
              </div>
              
              <div className="flex items-center gap-8">
                <div>
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="h-10 w-10 rounded-full bg-gray-400 border-2 border-gray-900" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">500+ Happy Clients</p>
                </div>
                <div className="h-12 w-px bg-gray-700" />
                <div>
                  <div className="flex items-center">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="h-5 w-5 text-[#FFD700] fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">4.9/5 Average Rating</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-r from-[#FFD700]/20 to-[#FF0000]/20 rounded-2xl p-8 backdrop-blur">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-[#FFD700] mx-auto mb-3" />
                    <div className="text-3xl font-bold mb-1">147</div>
                    <div className="text-sm text-gray-400">Avg. Point Increase</div>
                  </div>
                  <div className="text-center">
                    <Clock className="h-12 w-12 text-[#FFD700] mx-auto mb-3" />
                    <div className="text-3xl font-bold mb-1">45</div>
                    <div className="text-sm text-gray-400">Days to First Results</div>
                  </div>
                  <div className="text-center">
                    <Users className="h-12 w-12 text-[#FFD700] mx-auto mb-3" />
                    <div className="text-3xl font-bold mb-1">500+</div>
                    <div className="text-sm text-gray-400">Success Stories</div>
                  </div>
                  <div className="text-center">
                    <Award className="h-12 w-12 text-[#FFD700] mx-auto mb-3" />
                    <div className="text-3xl font-bold mb-1">98%</div>
                    <div className="text-sm text-gray-400">Client Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your Path to Credit Excellence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our proven 4-step process has helped hundreds achieve their credit goals
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: "Credit Analysis",
                description: "We perform a comprehensive review of your credit reports to identify opportunities",
                icon: BarChart3
              },
              {
                step: 2,
                title: "Custom Strategy",
                description: "Develop a personalized action plan tailored to your specific situation and goals",
                icon: Target
              },
              {
                step: 3,
                title: "Implementation",
                description: "Work together to execute your strategy with ongoing support and guidance",
                icon: Zap
              },
              {
                step: 4,
                title: "Monitor & Optimize",
                description: "Track progress and adjust strategies to maximize your credit improvement",
                icon: TrendingUp
              }
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="h-16 w-16 bg-gradient-to-r from-[#FFD700] to-[#FF0000] rounded-full flex items-center justify-center mb-4">
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-gray-500 mb-2">Step {item.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {item.step < 4 && (
                  <ArrowRight className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 h-8 w-8 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Coaching Package
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select the perfect plan to accelerate your credit transformation journey
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-2xl p-8 transition-all ${
                  pkg.highlighted 
                    ? 'bg-gradient-to-br from-gray-900 to-black text-white shadow-2xl scale-105' 
                    : 'bg-white border-2 border-gray-200 hover:border-[#FFD700]'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white px-4 py-1 rounded-full text-sm font-semibold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-4xl font-bold">${pkg.price}</span>
                    <span className={`ml-2 ${pkg.highlighted ? 'text-gray-300' : 'text-gray-500'}`}>
                      /{pkg.duration}
                    </span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className={`h-5 w-5 mr-3 flex-shrink-0 ${
                        pkg.highlighted ? 'text-[#FFD700]' : 'text-green-500'
                      }`} />
                      <span className={pkg.highlighted ? 'text-gray-200' : 'text-gray-600'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, packageType: pkg.id }));
                    document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    pkg.highlighted
                      ? 'bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white hover:opacity-90'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              <Shield className="inline h-5 w-5 mr-2 text-green-500" />
              30-Day Money Back Guarantee on All Packages
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Real Results from Real People
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it – see what our clients have achieved
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-xl p-8 shadow-lg">
                <div className="flex items-center mb-4">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="h-5 w-5 text-[#FFD700] fill-current" />
                  ))}
                </div>
                
                <Quote className="h-8 w-8 text-gray-300 mb-4" />
                
                <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Credit Score</p>
                      <p className="font-bold">
                        <span className="text-red-500">{testimonial.score.before}</span>
                        <ArrowRight className="inline h-4 w-4 mx-1" />
                        <span className="text-green-500">{testimonial.score.after}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Credit?
            </h2>
            <p className="text-xl text-gray-600">
              Schedule your free consultation and take the first step
            </p>
          </div>
          
          {showThankYou ? (
            <div className="bg-green-50 rounded-xl p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-gray-600">
                We've received your request and will contact you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-8">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Credit Score (Estimate)
                  </label>
                  <select
                    name="currentScore"
                    value={formData.currentScore}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                  >
                    <option value="">Select Range</option>
                    <option value="300-499">300-499 (Poor)</option>
                    <option value="500-599">500-599 (Fair)</option>
                    <option value="600-699">600-699 (Good)</option>
                    <option value="700-799">700-799 (Very Good)</option>
                    <option value="800+">800+ (Excellent)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Package
                  </label>
                  <select
                    name="packageType"
                    value={formData.packageType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                  >
                    <option value="basic">Basic Coaching</option>
                    <option value="premium">Premium Coaching</option>
                    <option value="elite">Elite Transformation</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What are your credit goals?
                </label>
                <textarea
                  name="goals"
                  value={formData.goals}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                  placeholder="Tell us about your credit goals and what you hope to achieve..."
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Get Your Free Consultation
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Get answers to common questions about our credit coaching services
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Your Credit Transformation Starts Today
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds who've already transformed their credit and their lives
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => document.getElementById('packages').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              View Packages
            </button>
            <a
              href="tel:1-800-CREDIT"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-colors flex items-center justify-center"
            >
              <Phone className="mr-2 h-5 w-5" />
              Call 1-800-CREDIT
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreditCoachingPage;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield,
  CheckCircle,
  XCircle,
  TrendingUp,
  FileText,
  Clock,
  DollarSign,
  ArrowRight,
  AlertCircle,
  Zap,
  RefreshCw,
  Award,
  BarChart3,
  Send,
  Phone,
  Mail,
  MessageSquare,
  Users,
  Star,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Building2,
  CreditCard,
  Home,
  Car,
  GraduationCap,
  Briefcase,
  Heart,
  Target,
  Quote,
  Search
} from 'lucide-react';

const CreditRepairPage = () => {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [successStories, setSuccessStories] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    creditIssues: [],
    urgency: '',
    serviceType: 'comprehensive'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [creditScore, setCreditScore] = useState('');
  const [estimatedResults, setEstimatedResults] = useState(null);

  // Credit repair services
  const services = [
    {
      id: 'basic',
      name: 'Basic Credit Repair',
      price: 149,
      duration: 'per month',
      description: 'Essential credit repair for minor issues',
      features: [
        'Credit report analysis from all 3 bureaus',
        'Dispute up to 5 negative items per month',
        'Monthly progress reports',
        'Email support',
        'Credit monitoring alerts',
        'Basic dispute letters'
      ],
      timeline: '3-6 months',
      highlighted: false
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Repair',
      price: 249,
      duration: 'per month',
      description: 'Complete credit restoration solution',
      features: [
        'Full credit report analysis & audit',
        'Unlimited dispute submissions',
        'Weekly progress updates',
        'Priority phone & email support',
        'Advanced credit monitoring',
        'Custom dispute letters',
        'Creditor interventions',
        'Goodwill letter campaigns',
        'Identity theft protection',
        'Score improvement guarantee'
      ],
      timeline: '2-4 months',
      highlighted: true,
      popular: true
    },
    {
      id: 'accelerated',
      name: 'Accelerated Recovery',
      price: 449,
      duration: 'per month',
      description: 'Fast-track credit repair with legal support',
      features: [
        'Everything in Comprehensive',
        'Legal team consultation',
        'Expedited dispute processing',
        'Daily progress monitoring',
        '24/7 dedicated support',
        'Cease & desist letters',
        'Settlement negotiations',
        'Court document preparation',
        'Credit attorney access',
        'Rapid results guarantee',
        'Post-repair credit building'
      ],
      timeline: '1-3 months',
      highlighted: false
    }
  ];

  // Credit issues options
  const creditIssues = [
    { id: 'collections', label: 'Collections', icon: Building2 },
    { id: 'late_payments', label: 'Late Payments', icon: Clock },
    { id: 'charge_offs', label: 'Charge-offs', icon: XCircle },
    { id: 'bankruptcies', label: 'Bankruptcies', icon: FileText },
    { id: 'repossessions', label: 'Repossessions', icon: Car },
    { id: 'foreclosures', label: 'Foreclosures', icon: Home },
    { id: 'student_loans', label: 'Student Loans', icon: GraduationCap },
    { id: 'medical_bills', label: 'Medical Bills', icon: Heart },
    { id: 'identity_theft', label: 'Identity Theft', icon: Shield },
    { id: 'inquiries', label: 'Hard Inquiries', icon: Search }
  ];

  // FAQ data
  const faqs = [
    {
      question: "How long does credit repair take?",
      answer: "Credit repair timelines vary based on your specific situation. Simple issues may resolve in 30-60 days, while complex cases can take 3-6 months. Our accelerated program typically shows results within 30 days."
    },
    {
      question: "Is credit repair legal?",
      answer: "Yes! Credit repair is 100% legal and protected by federal law under the Credit Repair Organizations Act (CROA) and Fair Credit Reporting Act (FCRA). We use these laws to help remove inaccurate, unverifiable, or unfair negative items."
    },
    {
      question: "What items can be removed?",
      answer: "We can challenge any negative item including collections, late payments, charge-offs, bankruptcies, repossessions, foreclosures, inquiries, and more. If an item cannot be verified or is reported incorrectly, it must be removed by law."
    },
    {
      question: "Do you guarantee specific results?",
      answer: "While we cannot guarantee specific point increases, we do guarantee our work. If we don't improve your credit report within 180 days, we'll work for free until we do or provide a full refund."
    },
    {
      question: "Will this hurt my credit?",
      answer: "No, the credit repair process itself does not hurt your credit. In fact, as negative items are removed, your score typically improves. We also provide guidance on positive credit-building activities."
    },
    {
      question: "How is this different from DIY credit repair?",
      answer: "While you can dispute items yourself, our expertise, established relationships with credit bureaus, and proven dispute strategies typically achieve faster and more comprehensive results. We handle all the complex paperwork and follow-ups."
    }
  ];

  useEffect(() => {
    fetchSuccessStories();
  }, []);

  const fetchSuccessStories = async () => {
    try {
      // Simulated success stories for demo
      const demoStories = [
        {
          id: 1,
          name: "Michael Thompson",
          location: "Dallas, TX",
          removed: "7 Collections, 3 Late Payments",
          scoreIncrease: 187,
          timeframe: "4 months",
          story: "I thought buying a home was impossible with my credit. Credit Gyems removed all my collections and now I'm a homeowner!",
          image: null
        },
        {
          id: 2,
          name: "Jennifer Martinez",
          location: "Phoenix, AZ",
          removed: "Bankruptcy, 5 Charge-offs",
          scoreIncrease: 223,
          timeframe: "6 months",
          story: "After my divorce, my credit was destroyed. The team at Credit Gyems gave me a fresh start and hope for the future.",
          image: null
        },
        {
          id: 3,
          name: "David Kim",
          location: "Seattle, WA",
          removed: "12 Medical Collections",
          scoreIncrease: 156,
          timeframe: "3 months",
          story: "Medical bills from an emergency ruined my credit. Credit Gyems removed every single one. I can't thank them enough!",
          image: null
        }
      ];
      setSuccessStories(demoStories);
    } catch (error) {
      console.error('Error fetching success stories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/credit-repair/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowThankYou(true);
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          creditIssues: [],
          urgency: '',
          serviceType: 'comprehensive'
        });
        
        // Redirect to booking page after 2 seconds
        setTimeout(() => {
          navigate('/booking?service=credit-repair');
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

  const handleIssueToggle = (issueId) => {
    setFormData(prev => ({
      ...prev,
      creditIssues: prev.creditIssues.includes(issueId)
        ? prev.creditIssues.filter(id => id !== issueId)
        : [...prev.creditIssues, issueId]
    }));
  };

  const calculateEstimate = () => {
    if (!creditScore || formData.creditIssues.length === 0) {
      alert('Please enter your credit score and select at least one issue');
      return;
    }

    // Simulated calculation
    const baseIncrease = formData.creditIssues.length * 15;
    const scoreMultiplier = creditScore < 500 ? 1.5 : creditScore < 600 ? 1.3 : 1.1;
    const estimatedIncrease = Math.round(baseIncrease * scoreMultiplier);
    
    setEstimatedResults({
      currentScore: parseInt(creditScore),
      estimatedScore: parseInt(creditScore) + estimatedIncrease,
      increase: estimatedIncrease,
      timeframe: formData.serviceType === 'accelerated' ? '1-2 months' : 
                 formData.serviceType === 'comprehensive' ? '2-4 months' : '3-6 months'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/20 to-[#FF0000]/20"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFD700] to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-[#FF0000]/20 rounded-full mb-6">
                <Shield className="h-4 w-4 text-[#FF0000] mr-2" />
                <span className="text-sm font-medium text-[#FF0000]">Legally Remove Negative Items</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                Professional Credit Repair That
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FF0000]">
                  Delivers Results
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8">
                Remove collections, charge-offs, late payments, and more. Join thousands who've restored their credit with our proven legal strategies.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button 
                  onClick={() => document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
                >
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Free Credit Analysis
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-[#FFD700]">15K+</div>
                  <div className="text-sm text-gray-400">Items Removed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#FFD700]">92%</div>
                  <div className="text-sm text-gray-400">Success Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#FFD700]">A+</div>
                  <div className="text-sm text-gray-400">BBB Rating</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: XCircle, label: "Collections Removed", stat: "3,847" },
                  { icon: Clock, label: "Late Payments Cleared", stat: "2,156" },
                  { icon: FileText, label: "Bankruptcies Deleted", stat: "489" },
                  { icon: Shield, label: "Identities Protected", stat: "1,200+" }
                ].map((item, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
                    <item.icon className="h-10 w-10 text-[#FFD700] mb-3" />
                    <div className="text-2xl font-bold mb-1">{item.stat}</div>
                    <div className="text-sm text-gray-300">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Remove Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What We Can Remove from Your Credit Report
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our legal experts challenge and remove these negative items using federal consumer protection laws
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creditIssues.map((issue) => (
              <div key={issue.id} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start">
                  <div className="h-12 w-12 bg-[#FFD700]/10 rounded-lg flex items-center justify-center mr-4">
                    <issue.icon className="h-6 w-6 text-[#FFD700]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{issue.label}</h3>
                    <p className="text-sm text-gray-600">
                      Successfully removed from thousands of credit reports
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Credit Repair Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional credit repair services tailored to your specific needs and timeline
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className={`relative rounded-2xl p-8 transition-all ${
                  service.highlighted 
                    ? 'bg-gradient-to-br from-gray-900 to-black text-white shadow-2xl scale-105' 
                    : 'bg-white border-2 border-gray-200 hover:border-[#FFD700]'
                }`}
              >
                {service.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white px-4 py-1 rounded-full text-sm font-semibold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{service.name}</h3>
                  <p className={`text-sm mb-4 ${service.highlighted ? 'text-gray-300' : 'text-gray-600'}`}>
                    {service.description}
                  </p>
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-4xl font-bold">${service.price}</span>
                    <span className={`ml-2 ${service.highlighted ? 'text-gray-300' : 'text-gray-500'}`}>
                      /{service.duration}
                    </span>
                  </div>
                  <p className={`text-sm ${service.highlighted ? 'text-[#FFD700]' : 'text-[#FF0000]'}`}>
                    Results in {service.timeline}
                  </p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className={`h-5 w-5 mr-3 flex-shrink-0 ${
                        service.highlighted ? 'text-[#FFD700]' : 'text-green-500'
                      }`} />
                      <span className={`text-sm ${service.highlighted ? 'text-gray-200' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, serviceType: service.id }));
                    document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    service.highlighted
                      ? 'bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white hover:opacity-90'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  Start Repair Process
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculator" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Estimate Your Credit Score Improvement
            </h2>
            <p className="text-xl text-gray-600">
              See how much we could potentially improve your credit score
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Credit Score
              </label>
              <input
                type="number"
                value={creditScore}
                onChange={(e) => setCreditScore(e.target.value)}
                placeholder="Enter your current score"
                min="300"
                max="850"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Select Your Credit Issues
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {creditIssues.map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => handleIssueToggle(issue.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.creditIssues.includes(issue.id)
                        ? 'border-[#FFD700] bg-[#FFD700]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <issue.icon className={`h-5 w-5 mx-auto mb-1 ${
                      formData.creditIssues.includes(issue.id) ? 'text-[#FFD700]' : 'text-gray-400'
                    }`} />
                    <span className="text-xs">{issue.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={calculateEstimate}
              className="w-full py-3 bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Calculate Potential Improvement
            </button>
            
            {estimatedResults && (
              <div className="mt-8 p-6 bg-gradient-to-r from-[#FFD700]/10 to-[#FF0000]/10 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Estimated Results</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-red-500">{estimatedResults.currentScore}</div>
                    <div className="text-sm text-gray-600">Current Score</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#FFD700]">+{estimatedResults.increase}</div>
                    <div className="text-sm text-gray-600">Point Increase</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-500">{estimatedResults.estimatedScore}</div>
                    <div className="text-sm text-gray-600">Potential Score</div>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-600 mt-4">
                  Estimated timeframe: {estimatedResults.timeframe}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Real People, Real Results
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how our credit repair services have transformed lives
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story) => (
              <div key={story.id} className="bg-gray-50 rounded-xl p-8">
                <div className="flex items-center mb-4">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="h-5 w-5 text-[#FFD700] fill-current" />
                  ))}
                </div>
                
                <Quote className="h-8 w-8 text-gray-300 mb-4" />
                
                <p className="text-gray-600 mb-6 italic">"{story.story}"</p>
                
                <div className="border-t pt-6">
                  <p className="font-semibold text-gray-900">{story.name}</p>
                  <p className="text-sm text-gray-500 mb-4">{story.location}</p>
                  
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Items Removed:</p>
                    <p className="text-sm text-[#FF0000] font-semibold mb-3">{story.removed}</p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Score Increase</p>
                        <p className="text-xl font-bold text-green-500">+{story.scoreIncrease}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Time Frame</p>
                        <p className="text-sm font-semibold">{story.timeframe}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Start Your Credit Repair Today
            </h2>
            <p className="text-xl text-gray-600">
              Get your free credit analysis and consultation
            </p>
          </div>
          
          {showThankYou ? (
            <div className="bg-green-50 rounded-xl p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-gray-600">
                We've received your request and will contact you within 24 hours with your free credit analysis.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
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
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  What credit issues are you facing? *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {creditIssues.slice(0, 6).map((issue) => (
                    <label
                      key={issue.id}
                      className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.creditIssues.includes(issue.id)
                          ? 'border-[#FFD700] bg-[#FFD700]/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.creditIssues.includes(issue.id)}
                        onChange={() => handleIssueToggle(issue.id)}
                        className="sr-only"
                      />
                      <issue.icon className={`h-5 w-5 mr-2 ${
                        formData.creditIssues.includes(issue.id) ? 'text-[#FFD700]' : 'text-gray-400'
                      }`} />
                      <span className="text-sm">{issue.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How urgent is your need?
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                  >
                    <option value="">Select urgency</option>
                    <option value="asap">ASAP - Need results fast</option>
                    <option value="1-3months">Within 1-3 months</option>
                    <option value="3-6months">Within 3-6 months</option>
                    <option value="planning">Just planning ahead</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Service
                  </label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                  >
                    <option value="basic">Basic Credit Repair</option>
                    <option value="comprehensive">Comprehensive Repair</option>
                    <option value="accelerated">Accelerated Recovery</option>
                  </select>
                </div>
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
                    Get Your Free Credit Analysis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                <Shield className="inline h-4 w-4 mr-1" />
                Your information is secure and will never be shared
              </p>
            </form>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about credit repair
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg shadow-md">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
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
            Don't Let Bad Credit Hold You Back
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start your credit repair journey today and unlock your financial future
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              View Services
            </button>
            <a
              href="tel:1-800-CREDIT"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-colors flex items-center justify-center"
            >
              <Phone className="mr-2 h-5 w-5" />
              Call 1-800-CREDIT
            </a>
          </div>
          <p className="text-sm mt-8 opacity-75">
            <AlertCircle className="inline h-4 w-4 mr-1" />
            Free consultation • No obligation • 100% confidential
          </p>
        </div>
      </section>
    </div>
  );
};

export default CreditRepairPage;
import React, { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, PiggyBank, Check, Star, Calendar, ArrowRight, Users, Award, Target, Clock } from 'lucide-react';

const ServicesPage = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const services = [
    {
      id: 'credit-repair',
      icon: CreditCard,
      title: 'Credit Repair',
      subtitle: 'Transform Your Credit Score',
      description: 'Professional credit repair services to help you remove negative items, dispute inaccuracies, and rebuild your credit profile.',
      features: [
        'Comprehensive credit report analysis',
        'Dispute letter creation and submission',
        'Negative item removal strategies',
        'Credit bureau communication',
        'Monthly progress tracking',
        'Personalized action plans'
      ],
      pricing: {
        basic: {
          name: 'Essential',
          price: 99,
          period: 'month',
          features: [
            'Credit report analysis',
            'Up to 10 disputes per month',
            'Email support',
            'Monthly progress report'
          ]
        },
        premium: {
          name: 'Professional',
          price: 149,
          period: 'month',
          popular: true,
          features: [
            'Everything in Essential',
            'Unlimited disputes',
            'Priority phone support',
            'Weekly progress updates',
            'Creditor negotiations',
            'Identity theft protection'
          ]
        },
        enterprise: {
          name: 'Elite',
          price: 249,
          period: 'month',
          features: [
            'Everything in Professional',
            'Dedicated account manager',
            'Daily monitoring',
            'Legal team consultation',
            'Expedited processing',
            'Financial planning session'
          ]
        }
      },
      testimonials: [
        {
          name: 'Sarah Johnson',
          score: 'Increased score by 142 points',
          text: 'DorTae and his team helped me go from a 520 to 662 credit score in just 6 months. Life-changing!',
          rating: 5
        },
        {
          name: 'Michael Chen',
          score: 'Removed 8 negative items',
          text: 'Professional, thorough, and results-driven. They removed collections I thought would haunt me forever.',
          rating: 5
        }
      ]
    },
    {
      id: 'credit-coaching',
      icon: TrendingUp,
      title: 'Credit Coaching',
      subtitle: 'Master Your Financial Future',
      description: 'One-on-one coaching sessions to educate you on credit management, help you develop healthy financial habits, and achieve your goals.',
      features: [
        'Personalized coaching sessions',
        'Credit education curriculum',
        'Goal setting and tracking',
        'Budget creation and optimization',
        'Debt management strategies',
        'Long-term financial planning'
      ],
      pricing: {
        basic: {
          name: 'Starter',
          price: 79,
          period: 'session',
          features: [
            '60-minute coaching session',
            'Credit report review',
            'Action plan creation',
            'Email follow-up support'
          ]
        },
        premium: {
          name: 'Growth',
          price: 299,
          period: 'month',
          popular: true,
          features: [
            'Weekly 45-minute sessions',
            'Unlimited email support',
            'Custom curriculum',
            'Progress tracking dashboard',
            'Resource library access',
            'Workshop invitations'
          ]
        },
        enterprise: {
          name: 'Transformation',
          price: 799,
          period: '3 months',
          features: [
            'Bi-weekly 60-minute sessions',
            '24/7 priority support',
            'Complete financial makeover',
            'Accountability partner',
            'VIP workshop access',
            'Bonus strategy sessions'
          ]
        }
      },
      testimonials: [
        {
          name: 'David Martinez',
          score: 'Achieved 750+ credit score',
          text: 'The coaching changed my entire perspective on money. I went from paycheck to paycheck to saving 30% of my income.',
          rating: 5
        },
        {
          name: 'Ashley Williams',
          score: 'Debt-free in 18 months',
          text: 'DorTae\'s coaching gave me the tools and confidence to tackle $45,000 in debt. Now I\'m planning for retirement!',
          rating: 5
        }
      ]
    },
    {
      id: 'financial-planning',
      icon: PiggyBank,
      title: 'Financial Planning',
      subtitle: 'Build Lasting Wealth',
      description: 'Comprehensive financial planning services to help you create wealth, plan for retirement, and secure your family\'s financial future.',
      features: [
        'Complete financial assessment',
        'Retirement planning strategies',
        'Investment guidance',
        'Tax optimization planning',
        'Estate planning basics',
        'Insurance needs analysis'
      ],
      pricing: {
        basic: {
          name: 'Foundation',
          price: 297,
          period: 'one-time',
          features: [
            'Financial health checkup',
            'Basic retirement projection',
            'Budget optimization',
            'Initial investment guidance'
          ]
        },
        premium: {
          name: 'Comprehensive',
          price: 497,
          period: 'one-time',
          popular: true,
          features: [
            'Full financial plan creation',
            'Detailed retirement roadmap',
            'Investment portfolio review',
            'Tax strategy session',
            '3-month follow-up',
            'Quarterly check-ins'
          ]
        },
        enterprise: {
          name: 'Wealth Builder',
          price: 197,
          period: 'month',
          features: [
            'Ongoing financial advising',
            'Monthly strategy sessions',
            'Investment monitoring',
            'Tax planning coordination',
            'Estate planning guidance',
            'Priority access to opportunities'
          ]
        }
      },
      testimonials: [
        {
          name: 'Robert Thompson',
          score: 'Retired at 55',
          text: 'The financial planning sessions helped me create a clear path to early retirement. Worth every penny!',
          rating: 5
        },
        {
          name: 'Maria Garcia',
          score: '$100K net worth milestone',
          text: 'From zero savings to six figures in 3 years. DorTae\'s planning strategies are gold!',
          rating: 5
        }
      ]
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 2);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBooking = (service, plan) => {
    // Handle booking navigation
    console.log('Booking:', service.title, plan);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-red-500/10"></div>
        <div className="absolute inset-0">
          <div className="absolute transform rotate-45 -right-40 -top-40 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-red-500/20 rounded-full blur-3xl"></div>
          <div className="absolute transform rotate-45 -left-40 -bottom-40 w-80 h-80 bg-gradient-to-r from-red-500/20 to-yellow-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent animate-fadeIn">
              Our Services
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto animate-slideUp">
              Comprehensive financial solutions designed to transform your credit, build wealth, and secure your future
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Users, label: 'Happy Clients', value: '2,500+' },
            { icon: TrendingUp, label: 'Avg Score Increase', value: '127pts' },
            { icon: Award, label: 'Success Rate', value: '94%' },
            { icon: Clock, label: 'Years Experience', value: '15+' }
          ].map((stat, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300">
              <stat.icon className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Services Section */}
      <div className="container mx-auto px-4 py-16">
        {services.map((service, index) => (
          <div key={service.id} className={`mb-20 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
            {/* Service Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-red-500 rounded-2xl mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <service.icon className="w-10 h-10 text-gray-900" />
              </div>
              <h2 className="text-4xl font-bold mb-3">{service.title}</h2>
              <p className="text-xl text-gray-300">{service.subtitle}</p>
            </div>

            {/* Service Content */}
            <div className="grid lg:grid-cols-2 gap-12 mb-12">
              {/* Description & Features */}
              <div>
                <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                  {service.description}
                </p>
                
                <h3 className="text-2xl font-semibold mb-6 text-yellow-400">What's Included</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonials */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-semibold mb-6">Success Stories</h3>
                <div className="relative h-64">
                  {service.testimonials.map((testimonial, idx) => (
                    <div
                      key={idx}
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        idx === activeTestimonial ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <div className="flex items-start space-x-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-yellow-400">{testimonial.score}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing Cards */}
            <div>
              <h3 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(service.pricing).map(([key, plan]) => (
                  <div
                    key={key}
                    className={`relative bg-white/5 backdrop-blur-lg rounded-2xl p-6 border ${
                      plan.popular ? 'border-yellow-400' : 'border-white/10'
                    } hover:bg-white/10 transform hover:scale-105 transition-all duration-300`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-yellow-400 to-red-500 text-gray-900 text-sm font-bold px-4 py-1 rounded-full">
                          MOST POPULAR
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h4 className="text-xl font-semibold mb-2">{plan.name}</h4>
                      <div className="text-4xl font-bold mb-2">
                        ${plan.price}
                        <span className="text-lg text-gray-400 font-normal">/{plan.period}</span>
                      </div>
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={() => handleBooking(service, plan.name)}
                      className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-yellow-400 to-red-500 text-gray-900 hover:shadow-lg hover:shadow-yellow-400/30'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <Calendar className="w-5 h-5" />
                        <span>Book Now</span>
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {index < services.length - 1 && (
              <div className="flex justify-center my-20">
                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-yellow-400/20 to-red-500/20 backdrop-blur-lg rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Financial Future?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Take the first step towards financial freedom. Schedule your free consultation today.
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-red-500 text-gray-900 font-bold rounded-xl hover:shadow-lg hover:shadow-yellow-400/30 transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2">
            <span>Get Started Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ServicesPage;
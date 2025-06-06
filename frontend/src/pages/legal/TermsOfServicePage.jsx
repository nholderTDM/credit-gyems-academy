import React, { useState, useEffect, useMemo } from 'react';
import { FileText, ChevronRight, Shield, AlertTriangle, Scale, Ban, DollarSign, Globe, Clock, UserCheck, AlertCircle, X } from 'lucide-react';

const TermsOfServicePage = () => {
  const [activeSection, setActiveSection] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const lastUpdated = 'May 29, 2025';
  const effectiveDate = 'June 1, 2025';

  const sections = useMemo(() => [
    { id: 'acceptance', title: 'Acceptance of Terms', icon: UserCheck },
    { id: 'services', title: 'Description of Services', icon: FileText },
    { id: 'eligibility', title: 'Eligibility', icon: Shield },
    { id: 'account', title: 'Account Registration', icon: UserCheck },
    { id: 'fees', title: 'Fees and Payment', icon: DollarSign },
    { id: 'prohibited', title: 'Prohibited Uses', icon: Ban },
    { id: 'intellectual', title: 'Intellectual Property', icon: Globe },
    { id: 'disclaimer', title: 'Disclaimers', icon: AlertTriangle },
    { id: 'limitation', title: 'Limitation of Liability', icon: Scale },
    { id: 'termination', title: 'Termination', icon: Clock },
    { id: 'governing', title: 'Governing Law', icon: Scale },
    { id: 'contact', title: 'Contact Information', icon: AlertCircle }
  ], []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
      
      const sectionElements = sections.map(section => ({
        id: section.id,
        element: document.getElementById(section.id)
      }));
      
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const element = sectionElements[i].element;
        if (element && element.getBoundingClientRect().top <= 100) {
          setActiveSection(sectionElements[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-red-500 rounded-2xl mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Scale className="w-10 h-10 text-gray-900" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Please read these terms carefully before using Credit Gyems Academy services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4 text-sm text-gray-400">
              <p>Last Updated: {lastUpdated}</p>
              <span className="hidden sm:inline">•</span>
              <p>Effective Date: {effectiveDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2 text-yellow-300">Important Legal Notice</h3>
              <p className="text-yellow-200 text-sm">
                By accessing or using Credit Gyems Academy services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using our services.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          {/* Table of Contents - Sticky Sidebar */}
          <div className="lg:col-span-1 mb-8 lg:mb-0">
            <div className="sticky top-20">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold mb-4 text-yellow-400">Table of Contents</h2>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-3 group ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-yellow-400/20 to-red-500/20 text-white'
                          : 'hover:bg-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <section.icon className={`w-4 h-4 ${
                        activeSection === section.id ? 'text-yellow-400' : 'text-gray-500 group-hover:text-yellow-400'
                      }`} />
                      <span className="text-sm">{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="prose prose-invert max-w-none">
              {/* Acceptance of Terms */}
              <section id="acceptance" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <UserCheck className="w-8 h-8 text-yellow-400" />
                    <span>Acceptance of Terms</span>
                  </h2>
                  <div className="space-y-4 text-gray-300">
                    <p>
                      These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and Credit Gyems Academy ("Company," "we," "us," or "our"). By accessing or using our website, mobile applications, or any services we provide (collectively, the "Services"), you acknowledge that you have read, understood, and agree to be bound by these Terms.
                    </p>
                    <p>
                      We reserve the right to update or modify these Terms at any time without prior notice. Your continued use of the Services following any changes constitutes your acceptance of the revised Terms. It is your responsibility to review these Terms periodically.
                    </p>
                    <div className="bg-gradient-to-r from-yellow-400/10 to-red-500/10 rounded-xl p-4 mt-6">
                      <p className="font-semibold">By using our Services, you represent and warrant that:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>You are at least 18 years of age</li>
                        <li>You have the legal capacity to enter into binding contracts</li>
                        <li>You will use the Services in compliance with all applicable laws</li>
                        <li>All information you provide is accurate and complete</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Description of Services */}
              <section id="services" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-yellow-400" />
                    <span>Description of Services</span>
                  </h2>
                  <div className="space-y-6 text-gray-300">
                    <p>
                      Credit Gyems Academy provides financial education, credit repair services, credit coaching, and financial planning services. Our Services include but are not limited to:
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-2">Credit Repair Services</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Credit report analysis and review</li>
                          <li>• Dispute letter preparation and submission</li>
                          <li>• Credit bureau communications</li>
                          <li>• Negative item removal assistance</li>
                        </ul>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-2">Credit Coaching</h4>
                        <ul className="text-sm space-y-1">
                          <li>• One-on-one coaching sessions</li>
                          <li>• Credit education programs</li>
                          <li>• Personalized action plans</li>
                          <li>• Progress monitoring</li>
                        </ul>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-2">Financial Planning</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Retirement planning</li>
                          <li>• Debt management strategies</li>
                          <li>• Investment guidance</li>
                          <li>• Budget optimization</li>
                        </ul>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-2">Educational Resources</h4>
                        <ul className="text-sm space-y-1">
                          <li>• E-books and guides</li>
                          <li>• Masterclasses and workshops</li>
                          <li>• Online community access</li>
                          <li>• Resource library</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                      <p className="text-red-300 text-sm">
                        <strong>Important:</strong> We are not a law firm and do not provide legal advice. Our services are educational and consultative in nature. Results may vary based on individual circumstances.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Eligibility */}
              <section id="eligibility" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <Shield className="w-8 h-8 text-yellow-400" />
                    <span>Eligibility</span>
                  </h2>
                  <div className="space-y-4 text-gray-300">
                    <p>
                      To use our Services, you must meet the following eligibility requirements:
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <span className="text-yellow-400 font-bold text-lg">1.</span>
                        <div>
                          <strong className="text-white">Age Requirement:</strong> You must be at least 18 years of age or the age of legal majority in your jurisdiction.
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-yellow-400 font-bold text-lg">2.</span>
                        <div>
                          <strong className="text-white">Legal Capacity:</strong> You must have the legal capacity to enter into contracts and agreements.
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-yellow-400 font-bold text-lg">3.</span>
                        <div>
                          <strong className="text-white">Accurate Information:</strong> You must provide accurate, current, and complete information during registration and maintain its accuracy.
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-yellow-400 font-bold text-lg">4.</span>
                        <div>
                          <strong className="text-white">Compliance:</strong> You must comply with all applicable federal, state, and local laws and regulations.
                        </div>
                      </div>
                    </div>
                    
                    <p>
                      We reserve the right to refuse service, terminate accounts, or cancel orders at our sole discretion.
                    </p>
                  </div>
                </div>
              </section>

              {/* Account Registration */}
              <section id="account" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <UserCheck className="w-8 h-8 text-yellow-400" />
                    <span>Account Registration</span>
                  </h2>
                  <div className="space-y-6 text-gray-300">
                    <p>
                      To access certain features of our Services, you may be required to create an account. When creating an account, you agree to:
                    </p>
                    
                    <div className="bg-gradient-to-r from-yellow-400/10 to-red-500/10 rounded-xl p-6">
                      <h4 className="font-semibold text-white mb-3">Account Responsibilities:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start space-x-2">
                          <ChevronRight className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <span>Provide accurate and complete registration information</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <ChevronRight className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <span>Maintain the security and confidentiality of your login credentials</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <ChevronRight className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <span>Notify us immediately of any unauthorized access or security breach</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <ChevronRight className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <span>Be responsible for all activities under your account</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <ChevronRight className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <span>Not share your account with others or transfer it without our consent</span>
                        </li>
                      </ul>
                    </div>
                    
                    <p>
                      We reserve the right to suspend or terminate your account if we suspect any breach of these Terms or fraudulent activity.
                    </p>
                  </div>
                </div>
              </section>

              {/* Fees and Payment */}
              <section id="fees" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <DollarSign className="w-8 h-8 text-yellow-400" />
                    <span>Fees and Payment</span>
                  </h2>
                  <div className="space-y-6 text-gray-300">
                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-white">Payment Terms</h3>
                      <p className="mb-4">
                        By purchasing our Services, you agree to pay all applicable fees as described on our website at the time of purchase. All fees are in U.S. dollars unless otherwise specified.
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="border-l-4 border-yellow-400 pl-4">
                          <h4 className="font-semibold text-white mb-2">Accepted Payment Methods</h4>
                          <ul className="text-sm space-y-1">
                            <li>• Credit/Debit Cards (Visa, Mastercard, AMEX)</li>
                            <li>• Bank Transfers</li>
                            <li>• Payment Plans (Klarna, AfterPay)</li>
                            <li>• Digital Wallets</li>
                          </ul>
                        </div>
                        <div className="border-l-4 border-red-500 pl-4">
                          <h4 className="font-semibold text-white mb-2">Billing Policies</h4>
                          <ul className="text-sm space-y-1">
                            <li>• Subscription fees are billed in advance</li>
                            <li>• One-time fees are due upon purchase</li>
                            <li>• Auto-renewal unless cancelled</li>
                            <li>• No hidden fees or charges</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-white">Refund Policy</h3>
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-300">
                          <strong>30-Day Money-Back Guarantee:</strong> We offer a 30-day money-back guarantee on most services. Refund requests must be submitted within 30 days of purchase. Some exclusions may apply, including customized services and digital products after download.
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-white">Cancellation Policy</h3>
                      <ul className="space-y-2">
                        <li>• Monthly subscriptions can be cancelled at any time</li>
                        <li>• Cancellations take effect at the end of the current billing period</li>
                        <li>• No refunds for partial months or unused services</li>
                        <li>• Consultation appointments must be cancelled 24 hours in advance</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Prohibited Uses */}
              <section id="prohibited" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <Ban className="w-8 h-8 text-yellow-400" />
                    <span>Prohibited Uses</span>
                  </h2>
                  <div className="space-y-4 text-gray-300">
                    <p>
                      You agree not to use our Services for any unlawful purpose or in any way that could damage, disable, overburden, or impair our Services. Prohibited activities include but are not limited to:
                    </p>
                    
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                      <h4 className="font-semibold text-red-300 mb-3">Strictly Prohibited:</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        <ul className="space-y-2">
                          <li className="flex items-start space-x-2">
                            <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">Violating any laws or regulations</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">Impersonating others or misrepresenting affiliation</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">Harassing, threatening, or intimidating users</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">Uploading malicious code or viruses</span>
                          </li>
                        </ul>
                        <ul className="space-y-2">
                          <li className="flex items-start space-x-2">
                            <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">Attempting unauthorized access to systems</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">Scraping or harvesting user data</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">Interfering with service operations</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">Circumventing security measures</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <p>
                      Violation of these prohibitions may result in immediate termination of your account and legal action.
                    </p>
                  </div>
                </div>
              </section>

              {/* Intellectual Property */}
              <section id="intellectual" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <Globe className="w-8 h-8 text-yellow-400" />
                    <span>Intellectual Property</span>
                  </h2>
                  <div className="space-y-6 text-gray-300">
                    <p>
                      All content, features, and functionality of our Services, including but not limited to text, graphics, logos, images, audio clips, digital downloads, and software, are the exclusive property of Credit Gyems Academy or its licensors and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-2">Our Rights</h4>
                        <p className="text-sm">
                          We retain all rights, title, and interest in and to our Services, including all intellectual property rights. Nothing in these Terms transfers any such rights to you.
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-2">Your License</h4>
                        <p className="text-sm">
                          We grant you a limited, non-exclusive, non-transferable license to access and use our Services for personal, non-commercial purposes in accordance with these Terms.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-yellow-400/10 to-red-500/10 rounded-xl p-4">
                      <p className="font-semibold mb-2">You may not:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Reproduce, distribute, or publicly display our content without permission</li>
                        <li>Modify, adapt, or create derivative works from our content</li>
                        <li>Use our trademarks, logos, or branding without written consent</li>
                        <li>Remove or alter any copyright or proprietary notices</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Disclaimers */}
              <section id="disclaimer" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <AlertTriangle className="w-8 h-8 text-yellow-400" />
                    <span>Disclaimers</span>
                  </h2>
                  <div className="space-y-6 text-gray-300">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                      <p className="text-red-300 font-semibold mb-3 uppercase">
                        THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND
                      </p>
                      <p className="text-sm">
                        To the fullest extent permitted by law, we disclaim all warranties, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-white mb-3">We do not warrant that:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <span>The Services will be uninterrupted, secure, or error-free</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <span>Results obtained from the Services will be accurate or reliable</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <span>Any errors in the Services will be corrected</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <span>The Services will meet your specific requirements</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                      <p className="text-yellow-300 text-sm">
                        <strong>Financial Disclaimer:</strong> We are not financial advisors, attorneys, or accountants. Our Services are educational and informational in nature. Always consult with qualified professionals before making financial decisions.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Limitation of Liability */}
              <section id="limitation" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <Scale className="w-8 h-8 text-yellow-400" />
                    <span>Limitation of Liability</span>
                  </h2>
                  <div className="space-y-6 text-gray-300">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                      <p className="text-red-300 font-semibold mb-3 uppercase">
                        LIMITATION OF LIABILITY
                      </p>
                      <p className="mb-3">
                        TO THE MAXIMUM EXTENT PERMITTED BY LAW, CREDIT GYEMS ACADEMY AND ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND LICENSORS SHALL NOT BE LIABLE FOR:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                        <li>Loss of profits, revenue, data, or use</li>
                        <li>Damages arising from your use or inability to use the Services</li>
                        <li>Any unauthorized access to or alteration of your data</li>
                        <li>Any third-party content or conduct</li>
                      </ul>
                    </div>
                    
                    <p>
                      Our total liability for any claims under these Terms shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.
                    </p>
                    
                    <p className="text-sm text-gray-400">
                      Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above limitations may not apply to you.
                    </p>
                  </div>
                </div>
              </section>

              {/* Termination */}
              <section id="termination" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <Clock className="w-8 h-8 text-yellow-400" />
                    <span>Termination</span>
                  </h2>
                  <div className="space-y-6 text-gray-300">
                    <p>
                      These Terms remain in effect until terminated by either party. You may terminate your account at any time by contacting us or using the account closure option in your settings.
                    </p>
                    
                    <div>
                      <h4 className="font-semibold text-white mb-3">We may terminate or suspend your account immediately if:</h4>
                      <div className="bg-gradient-to-r from-yellow-400/10 to-red-500/10 rounded-xl p-4">
                        <ul className="space-y-2">
                          <li className="flex items-start space-x-2">
                            <ChevronRight className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span>You breach any provision of these Terms</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <ChevronRight className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span>You engage in fraudulent or illegal activities</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <ChevronRight className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span>We are required to do so by law</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <ChevronRight className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span>We discontinue the Services</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <p>
                      Upon termination, your right to access and use the Services will immediately cease. Provisions that by their nature should survive termination shall survive.
                    </p>
                  </div>
                </div>
              </section>

              {/* Governing Law */}
              <section id="governing" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <Scale className="w-8 h-8 text-yellow-400" />
                    <span>Governing Law</span>
                  </h2>
                  <div className="space-y-4 text-gray-300">
                    <p>
                      These Terms shall be governed by and construed in accordance with the laws of the State of Georgia, United States, without regard to its conflict of law provisions.
                    </p>
                    
                    <div className="bg-gradient-to-r from-yellow-400/10 to-red-500/10 rounded-xl p-6">
                      <h4 className="font-semibold text-white mb-3">Dispute Resolution</h4>
                      <p className="mb-3">
                        Any disputes arising out of or relating to these Terms or the Services shall be resolved through:
                      </p>
                      <ol className="list-decimal list-inside space-y-2">
                        <li><strong>Informal Resolution:</strong> First, through good faith negotiations</li>
                        <li><strong>Mediation:</strong> If informal resolution fails, through mediation</li>
                        <li><strong>Arbitration:</strong> Finally, through binding arbitration in accordance with the rules of the American Arbitration Association</li>
                      </ol>
                    </div>
                    
                    <p className="text-sm text-gray-400">
                      You waive any right to a jury trial and to participate in a class action lawsuit or class-wide arbitration.
                    </p>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section id="contact" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <AlertCircle className="w-8 h-8 text-yellow-400" />
                    <span>Contact Information</span>
                  </h2>
                  <div className="space-y-4 text-gray-300">
                    <p>
                      If you have any questions about these Terms of Service, please contact us:
                    </p>
                    
                    <div className="bg-gradient-to-r from-yellow-400/10 to-red-500/10 rounded-xl p-6 space-y-3">
                      <div>
                        <strong className="text-white">Credit Gyems Academy</strong>
                      </div>
                      <div>
                        <strong>Email:</strong> legal@creditgyems369.com
                      </div>
                      <div>
                        <strong>Phone:</strong> (555) 123-4567
                      </div>
                      <div>
                        <strong>Address:</strong> 123 Financial Plaza, Suite 456, Atlanta, GA 30301
                      </div>
                      <div>
                        <strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST
                      </div>
                    </div>
                    
                    <div className="mt-8 p-4 bg-white/5 rounded-xl">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="mt-1 w-4 h-4 text-yellow-400 bg-white/10 border-gray-600 rounded focus:ring-yellow-400"
                        />
                        <span className="text-sm">
                          I have read, understood, and agree to be bound by these Terms of Service
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full shadow-lg transform hover:scale-110 transition-all duration-300 z-40"
        >
          <ChevronRight className="w-6 h-6 text-gray-900 transform -rotate-90" />
        </button>
      )}
    </div>
  );
};

export default TermsOfServicePage;
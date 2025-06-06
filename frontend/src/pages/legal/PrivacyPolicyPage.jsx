import React, { useState, useEffect, useMemo } from 'react';
import { Shield, ChevronRight, Eye, Lock, Database, Mail, Users, Globe, AlertCircle, FileText } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const [activeSection, setActiveSection] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const lastUpdated = 'May 29, 2025';

  const sections = useMemo(() => [
    { id: 'introduction', title: 'Introduction', icon: FileText },
    { id: 'information-collect', title: 'Information We Collect', icon: Database },
    { id: 'how-we-use', title: 'How We Use Your Information', icon: Eye },
    { id: 'information-sharing', title: 'Information Sharing', icon: Users },
    { id: 'data-security', title: 'Data Security', icon: Lock },
    { id: 'your-rights', title: 'Your Rights', icon: Shield },
    { id: 'cookies', title: 'Cookies and Tracking', icon: Globe },
    { id: 'changes', title: 'Changes to This Policy', icon: AlertCircle },
    { id: 'contact', title: 'Contact Information', icon: Mail }
  ], []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
      
      // Update active section based on scroll position
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
              <Shield className="w-10 h-10 text-gray-900" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Last Updated: {lastUpdated}
            </p>
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
              {/* Introduction */}
              <section id="introduction" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-yellow-400" />
                    <span>Introduction</span>
                  </h2>
                  <div className="space-y-4 text-gray-300">
                    <p>
                      Credit Gyems Academy ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (creditgyems369.com), use our services, or interact with us.
                    </p>
                    <p>
                      By using our services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
                    </p>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mt-6">
                      <p className="text-yellow-300 text-sm">
                        <strong>Important:</strong> We are committed to maintaining the confidentiality, integrity, and security of all personal information entrusted to us.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Information We Collect */}
              <section id="information-collect" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <Database className="w-8 h-8 text-yellow-400" />
                    <span>Information We Collect</span>
                  </h2>
                  <div className="space-y-6 text-gray-300">
                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-white">Personal Information</h3>
                      <p className="mb-3">We may collect personal information that you provide directly to us, including:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Name and contact information (email address, phone number, mailing address)</li>
                        <li>Financial information (credit scores, debt information, income details)</li>
                        <li>Government-issued identification numbers (SSN, driver's license)</li>
                        <li>Account credentials (username and password)</li>
                        <li>Payment information (credit card details, billing address)</li>
                        <li>Communication preferences and history</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-white">Automatically Collected Information</h3>
                      <p className="mb-3">When you visit our website, we automatically collect certain information:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Device information (IP address, browser type, operating system)</li>
                        <li>Usage data (pages visited, time spent, clicks, and navigation paths)</li>
                        <li>Location information (general geographic location based on IP address)</li>
                        <li>Cookies and similar tracking technologies</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-white">Information from Third Parties</h3>
                      <p className="mb-3">We may receive information about you from:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Credit bureaus and consumer reporting agencies</li>
                        <li>Financial institutions and creditors</li>
                        <li>Social media platforms (if you connect your accounts)</li>
                        <li>Business partners and affiliates</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* How We Use Your Information */}
              <section id="how-we-use" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <Eye className="w-8 h-8 text-yellow-400" />
                    <span>How We Use Your Information</span>
                  </h2>
                  <div className="space-y-4 text-gray-300">
                    <p>We use the information we collect for various purposes, including:</p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                      {[
                        { title: 'Service Delivery', desc: 'To provide credit repair, coaching, and financial planning services' },
                        { title: 'Communication', desc: 'To respond to inquiries and send service-related communications' },
                        { title: 'Account Management', desc: 'To create and manage your account and process transactions' },
                        { title: 'Improvement', desc: 'To improve our services and develop new features' },
                        { title: 'Marketing', desc: 'To send promotional materials and updates (with your consent)' },
                        { title: 'Legal Compliance', desc: 'To comply with legal obligations and protect our rights' },
                        { title: 'Analytics', desc: 'To analyze usage patterns and optimize user experience' },
                        { title: 'Security', desc: 'To detect and prevent fraud and unauthorized access' }
                      ].map((item, index) => (
                        <div key={index} className="bg-white/5 rounded-xl p-4">
                          <h4 className="font-semibold text-yellow-400 mb-2">{item.title}</h4>
                          <p className="text-sm">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Information Sharing */}
              <section id="information-sharing" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <Users className="w-8 h-8 text-yellow-400" />
                    <span>Information Sharing</span>
                  </h2>
                  <div className="space-y-6 text-gray-300">
                    <p>
                      We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
                    </p>
                    
                    <div className="space-y-4">
                      <div className="border-l-4 border-yellow-400 pl-4">
                        <h4 className="font-semibold text-white mb-2">Service Providers</h4>
                        <p>We share information with trusted third-party service providers who assist us in operating our business, such as payment processors, email service providers, and cloud storage services.</p>
                      </div>
                      
                      <div className="border-l-4 border-red-500 pl-4">
                        <h4 className="font-semibold text-white mb-2">Legal Requirements</h4>
                        <p>We may disclose information when required by law, court order, or government regulation, or when we believe disclosure is necessary to protect our rights or the safety of others.</p>
                      </div>
                      
                      <div className="border-l-4 border-yellow-400 pl-4">
                        <h4 className="font-semibold text-white mb-2">Business Transfers</h4>
                        <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</p>
                      </div>
                      
                      <div className="border-l-4 border-red-500 pl-4">
                        <h4 className="font-semibold text-white mb-2">With Your Consent</h4>
                        <p>We may share your information with your explicit consent or at your direction.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Security */}
              <section id="data-security" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <Lock className="w-8 h-8 text-yellow-400" />
                    <span>Data Security</span>
                  </h2>
                  <div className="space-y-4 text-gray-300">
                    <p>
                      We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                    </p>
                    
                    <div className="grid gap-4 mt-6">
                      {[
                        'SSL/TLS encryption for data transmission',
                        'Secure data storage with encryption at rest',
                        'Regular security audits and vulnerability assessments',
                        'Access controls and authentication procedures',
                        'Employee training on data protection and privacy',
                        'Incident response and breach notification procedures'
                      ].map((measure, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <ChevronRight className="w-5 h-5 text-green-400 flex-shrink-0" />
                          <span>{measure}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mt-6">
                      <p className="text-red-300 text-sm">
                        <strong>Note:</strong> While we strive to protect your information, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Your Rights */}
              <section id="your-rights" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <Shield className="w-8 h-8 text-yellow-400" />
                    <span>Your Rights</span>
                  </h2>
                  <div className="space-y-6 text-gray-300">
                    <p>
                      You have certain rights regarding your personal information:
                    </p>
                    
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-yellow-400/10 to-red-500/10 rounded-xl p-6">
                        <h4 className="font-semibold text-white mb-3">Your Privacy Rights Include:</h4>
                        <ul className="space-y-3">
                          <li className="flex items-start space-x-3">
                            <span className="text-yellow-400 font-bold">•</span>
                            <div>
                              <strong>Access:</strong> Request a copy of the personal information we hold about you
                            </div>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="text-yellow-400 font-bold">•</span>
                            <div>
                              <strong>Correction:</strong> Request correction of inaccurate or incomplete information
                            </div>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="text-yellow-400 font-bold">•</span>
                            <div>
                              <strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)
                            </div>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="text-yellow-400 font-bold">•</span>
                            <div>
                              <strong>Portability:</strong> Request a portable copy of your information
                            </div>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="text-yellow-400 font-bold">•</span>
                            <div>
                              <strong>Opt-Out:</strong> Opt out of marketing communications at any time
                            </div>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="text-yellow-400 font-bold">•</span>
                            <div>
                              <strong>Restriction:</strong> Request restriction of processing in certain circumstances
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <p>
                      To exercise any of these rights, please contact us using the information provided in the Contact section below.
                    </p>
                  </div>
                </div>
              </section>

              {/* Cookies and Tracking */}
              <section id="cookies" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <Globe className="w-8 h-8 text-yellow-400" />
                    <span>Cookies and Tracking</span>
                  </h2>
                  <div className="space-y-6 text-gray-300">
                    <p>
                      We use cookies and similar tracking technologies to enhance your experience on our website. Cookies are small data files stored on your device that help us:
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-2">Essential Cookies</h4>
                        <p className="text-sm">Required for website functionality and security</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-2">Analytics Cookies</h4>
                        <p className="text-sm">Help us understand how visitors use our site</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-2">Marketing Cookies</h4>
                        <p className="text-sm">Used to deliver relevant advertisements</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-2">Preference Cookies</h4>
                        <p className="text-sm">Remember your settings and preferences</p>
                      </div>
                    </div>
                    
                    <p>
                      You can control cookies through your browser settings. However, disabling certain cookies may limit your ability to use some features of our website.
                    </p>
                  </div>
                </div>
              </section>

              {/* Changes to This Policy */}
              <section id="changes" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <AlertCircle className="w-8 h-8 text-yellow-400" />
                    <span>Changes to This Policy</span>
                  </h2>
                  <div className="space-y-4 text-gray-300">
                    <p>
                      We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Update the "Last Updated" date at the top of this policy</li>
                      <li>Notify you via email or prominent notice on our website</li>
                      <li>Obtain your consent if required by applicable law</li>
                    </ul>
                    <p>
                      We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
                    </p>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section id="contact" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <Mail className="w-8 h-8 text-yellow-400" />
                    <span>Contact Information</span>
                  </h2>
                  <div className="space-y-4 text-gray-300">
                    <p>
                      If you have any questions about this Privacy Policy or our privacy practices, please contact us:
                    </p>
                    
                    <div className="bg-gradient-to-r from-yellow-400/10 to-red-500/10 rounded-xl p-6 space-y-3">
                      <div>
                        <strong className="text-white">Credit Gyems Academy</strong>
                      </div>
                      <div>
                        <strong>Email:</strong> privacy@creditgyems369.com
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
                    
                    <p className="text-sm text-gray-400 mt-6">
                      For general inquiries, please visit our <a href="/contact" className="text-yellow-400 hover:text-yellow-300 transition-colors">Contact Page</a>.
                    </p>
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

export default PrivacyPolicyPage;
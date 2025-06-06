import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, Shield, FileText, Scale, Info, ChevronRight, BookOpen, DollarSign, Gavel, HeartHandshake, Mail } from 'lucide-react';

const DisclaimerPage = () => {
  const [activeSection, setActiveSection] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const lastUpdated = 'May 29, 2025';

  const sections = useMemo(() => [
    { id: 'general', title: 'General Information', icon: Info },
    { id: 'no-legal-advice', title: 'No Legal Advice', icon: Gavel },
    { id: 'no-financial-advice', title: 'No Financial Advice', icon: DollarSign },
    { id: 'results', title: 'Results Disclaimer', icon: AlertTriangle },
    { id: 'testimonials', title: 'Testimonials Disclaimer', icon: HeartHandshake },
    { id: 'earnings', title: 'Earnings Disclaimer', icon: DollarSign },
    { id: 'education', title: 'Educational Purpose', icon: BookOpen },
    { id: 'external', title: 'External Links', icon: ChevronRight },
    { id: 'limitation', title: 'Limitation of Liability', icon: Scale },
    { id: 'contact', title: 'Contact Information', icon: Mail }
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
              <AlertTriangle className="w-10 h-10 text-gray-900" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
              Legal Disclaimer
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Important information about the use of our services and website
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Last Updated: {lastUpdated}
            </p>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2 text-red-300">Important Notice</h3>
              <p className="text-red-200">
                The information provided on creditgyems369.com and through Credit Gyems Academy services is for general informational and educational purposes only. Please read this disclaimer carefully before using our services or relying on any information provided.
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
              {/* General Information */}
              <section id="general" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <Info className="w-8 h-8 text-yellow-400" />
                    <span>General Information</span>
                  </h2>
                  <div className="space-y-4 text-gray-300">
                    <p>
                      The information contained on creditgyems369.com and all associated platforms ("Website") is provided by Credit Gyems Academy for general informational purposes only. All information on the Website is provided in good faith; however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Website.
                    </p>
                    <p>
                      Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the Website or reliance on any information provided on the Website. Your use of the Website and your reliance on any information on the Website is solely at your own risk.
                    </p>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mt-6">
                      <p className="text-yellow-300">
                        <strong>Key Point:</strong> This disclaimer applies to all content, services, products, and materials available through our website and services.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* No Legal Advice */}
              <section id="no-legal-advice" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <Gavel className="w-8 h-8 text-yellow-400" />
                    <span>No Legal Advice</span>
                  </h2>
                  <div className="space-y-6 text-gray-300">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                      <p className="text-red-300 font-semibold mb-3">LEGAL DISCLAIMER</p>
                      <p>
                        Credit Gyems Academy is NOT a law firm and does NOT provide legal advice. The information provided through our services, website, courses, e-books, and consultations is for educational and informational purposes only.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <p>
                        While we strive to provide accurate and up-to-date information regarding credit laws and regulations, this information should not be construed as legal advice or legal opinion on any specific facts or circumstances.
                      </p>
                      
                      <div className="border-l-4 border-yellow-400 pl-4">
                        <h4 className="font-semibold text-white mb-2">Important Considerations:</h4>
                        <ul className="space-y-2 text-sm">
                          <li>• Credit laws vary by state and jurisdiction</li>
                          <li>• Individual circumstances require personalized legal analysis</li>
                          <li>• We cannot represent you in legal proceedings</li>
                          <li>• We do not provide attorney-client privileged communications</li>
                        </ul>
                      </div>
                      
                      <p className="text-sm text-gray-400">
                        For legal advice specific to your situation, please consult with a qualified attorney licensed in your jurisdiction.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* No Financial Advice */}
              <section id="no-financial-advice" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <DollarSign className="w-8 h-8 text-yellow-400" />
                    <span>No Financial Advice</span>
                  </h2>
                  <div className="space-y-6 text-gray-300">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                      <p className="text-red-300 font-semibold mb-3">FINANCIAL DISCLAIMER</p>
                      <p>
                        Credit Gyems Academy does NOT provide financial investment advice. We are not registered investment advisors, certified financial planners, or licensed securities brokers.
                      </p>
                    </div>
                    
                    <p>
                      Our services focus on credit education, credit repair strategies, and general financial literacy. Any financial planning services offered are educational in nature and should not be considered personalized financial advice.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-2">What We DO Provide:</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Credit education</li>
                          <li>• Budgeting strategies</li>
                          <li>• Debt management education</li>
                          <li>• General financial literacy</li>
                        </ul>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-2">What We DON'T Provide:</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Investment advice</li>
                          <li>• Securities recommendations</li>
                          <li>• Tax planning advice</li>
                          <li>• Insurance recommendations</li>
                        </ul>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-400">
                      Always consult with qualified financial professionals before making significant financial decisions.
                    </p>
                  </div>
                </div>
              </section>

              {/* Results Disclaimer */}
              <section id="results" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <AlertTriangle className="w-8 h-8 text-yellow-400" />
                    <span>Results Disclaimer</span>
                  </h2>
                  <div className="space-y-6 text-gray-300">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                      <p className="text-yellow-300 font-semibold mb-3">NO GUARANTEE OF RESULTS</p>
                      <p>
                        Individual results will vary. Credit repair results depend on many factors including your unique credit history, the nature of items on your credit report, and your participation in the credit repair process.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-white mb-3">Factors Affecting Results:</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        <ul className="space-y-2">
                          <li className="flex items-start space-x-2">
                            <ChevronRight className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">Accuracy of negative items</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <ChevronRight className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">Age of credit accounts</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <ChevronRight className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">Current credit behavior</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <ChevronRight className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">Creditor cooperation</span>
                          </li>
                        </ul>
                        <ul className="space-y-2">
                          <li className="flex items-start space-x-2">
                            <ChevronRight className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">Credit bureau responses</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <ChevronRight className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">Legal requirements</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <ChevronRight className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">Individual circumstances</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <ChevronRight className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">Time and effort invested</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <p>
                      We cannot and do not guarantee any specific increase in credit scores or removal of specific items from credit reports. Past performance does not guarantee future results.
                    </p>
                  </div>
                </div>
              </section>

              {/* Testimonials Disclaimer */}
              <section id="testimonials" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <HeartHandshake className="w-8 h-8 text-yellow-400" />
                    <span>Testimonials Disclaimer</span>
                  </h2>
                  <div className="space-y-4 text-gray-300">
                    <p>
                      The testimonials on creditgyems369.com are provided by actual clients of Credit Gyems Academy. However, these testimonials reflect the personal experiences and opinions of those individuals only.
                    </p>
                    
                    <div className="bg-gradient-to-r from-yellow-400/10 to-red-500/10 rounded-xl p-6">
                      <h4 className="font-semibold text-white mb-3">Important Notes About Testimonials:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start space-x-2">
                          <span className="text-yellow-400 font-bold">•</span>
                          <span>Results described are not typical and individual results will vary</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-yellow-400 font-bold">•</span>
                          <span>Testimonials are not intended to represent or guarantee results</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-yellow-400 font-bold">•</span>
                          <span>Some names and details may be changed to protect privacy</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-yellow-400 font-bold">•</span>
                          <span>Past success does not guarantee future results</span>
                        </li>
                      </ul>
                    </div>
                    
                    <p className="text-sm text-gray-400">
                      We present testimonials as a reflection of client experiences but cannot guarantee you will achieve similar results. Your results depend on your unique situation and effort.
                    </p>
                  </div>
                </div>
              </section>

              {/* Earnings Disclaimer */}
              <section id="earnings" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <DollarSign className="w-8 h-8 text-yellow-400" />
                    <span>Earnings Disclaimer</span>
                  </h2>
                  <div className="space-y-6 text-gray-300">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                      <p className="text-red-300 font-semibold mb-3">NO EARNINGS PROJECTIONS, PROMISES, OR REPRESENTATIONS</p>
                      <p>
                        Any earnings or income statements, or earnings or income examples, are only estimates of what we think you could earn. There is no assurance you'll do as well.
                      </p>
                    </div>
                    
                    <p>
                      When we discuss improving your financial situation through better credit, we're referring to the potential benefits of having good credit, such as:
                    </p>
                    
                    <ul className="space-y-2 ml-4">
                      <li>• Lower interest rates on loans and credit cards</li>
                      <li>• Better approval odds for credit applications</li>
                      <li>• Potential savings on insurance premiums</li>
                      <li>• More favorable rental terms</li>
                      <li>• Better employment opportunities (where credit checks are performed)</li>
                    </ul>
                    
                    <p>
                      These benefits are not guaranteed and depend entirely on your individual circumstances, credit improvement, and the decisions of lenders, insurers, employers, and others who may review your credit.
                    </p>
                  </div>
                </div>
              </section>

              {/* Educational Purpose */}
              <section id="education" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <BookOpen className="w-8 h-8 text-yellow-400" />
                    <span>Educational Purpose</span>
                  </h2>
                  <div className="space-y-4 text-gray-300">
                    <p>
                      All content provided by Credit Gyems Academy, including but not limited to courses, e-books, consultations, and website content, is for educational purposes only. Our role is to:
                    </p>
                    
                    <div className="bg-gradient-to-r from-yellow-400/10 to-red-500/10 rounded-xl p-6">
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-3">
                          <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <span>Educate you about credit reporting laws and your rights</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <span>Provide strategies for improving creditworthiness</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <span>Assist in identifying potential errors on credit reports</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <span>Teach financial literacy and money management skills</span>
                        </li>
                      </ul>
                    </div>
                    
                    <p>
                      The application of this education to your specific situation is your responsibility. We encourage you to think critically and make informed decisions based on your unique circumstances.
                    </p>
                  </div>
                </div>
              </section>

              {/* External Links */}
              <section id="external" className="mb-12 scroll-mt-20">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
                    <ChevronRight className="w-8 h-8 text-yellow-400" />
                    <span>External Links Disclaimer</span>
                  </h2>
                  <div className="space-y-4 text-gray-300">
                    <p>
                      The creditgyems369.com website may contain links to external websites that are not provided or maintained by or in any way affiliated with Credit Gyems Academy.
                    </p>
                    
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                      <p className="text-yellow-300">
                        <strong>Please note:</strong> We do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
                      </p>
                    </div>
                    
                    <ul className="space-y-2">
                      <li className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <span>We are not responsible for external website content</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <span>External links do not imply endorsement</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <span>We have no control over external website privacy policies</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <span>Access external links at your own risk</span>
                      </li>
                    </ul>
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
                      <p className="text-red-300 font-semibold mb-3 uppercase">LIMITATION OF LIABILITY</p>
                      <p>
                        IN NO EVENT SHALL CREDIT GYEMS ACADEMY, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES, BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                      </p>
                    </div>
                    
                    <p>
                      This limitation of liability applies whether the alleged liability is based on contract, tort, negligence, strict liability, or any other basis, even if Credit Gyems Academy has been advised of the possibility of such damage.
                    </p>
                    
                    <p>
                      Our liability to you for any cause whatsoever and regardless of the form of action, will at all times be limited to the amount paid, if any, by you to us during the six (6) month period prior to any cause of action arising.
                    </p>
                    
                    <p className="text-sm text-gray-400">
                      Some jurisdictions do not allow limitations on implied warranties or the exclusion or limitation of certain damages. If these laws apply to you, some or all of the above disclaimers, exclusions, or limitations may not apply, and you may have additional rights.
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
                      If you have any questions about this Disclaimer, please contact us:
                    </p>
                    
                    <div className="bg-gradient-to-r from-yellow-400/10 to-red-500/10 rounded-xl p-6 space-y-3">
                      <div>
                        <strong className="text-white">Credit Gyems Academy</strong>
                      </div>
                      <div>
                        <strong>Website:</strong> creditgyems369.com
                      </div>
                      <div>
                        <strong>Email:</strong> info@creditgyems369.com
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
                    
                    <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-sm text-center">
                        By using our website and services, you acknowledge that you have read, understood, and agree to be bound by this Disclaimer.
                      </p>
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

export default DisclaimerPage;
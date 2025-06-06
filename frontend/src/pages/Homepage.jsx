/*
 * EMAILJS SETUP INSTRUCTIONS:
 * 
 * 1. Create an EmailJS account at https://www.emailjs.com/
 * 2. Create a new service (Gmail, Outlook, etc.)
 * 3. Create a new email template with the following variables:
 *    - {{to_email}} - Recipient email (info@creditgyems369.com)
 *    - {{from_email}} - Sender email
 *    - {{first_name}} - Lead's first name
 *    - {{last_name}} - Lead's last name
 *    - {{email}} - Lead's email
 *    - {{phone}} - Lead's phone
 *    - {{current_credit_score}} - Credit score range
 *    - {{credit_goals}} - Selected credit goals
 *    - {{interests}} - Selected interests
 *    - {{requested_info}} - Requested resources
 *    - {{urgency_level}} - Timeline urgency
 *    - {{lead_score}} - Calculated lead score
 *    - {{submission_date}} - Form submission date
 *    - {{summary}} - Summary of the lead
 * 4. Update EMAILJS_CONFIG below with your actual values
 * 5. Add your domain to EmailJS allowed origins
 * 
 * For testing, you can use the console to see the email data being sent.
 */

import React, { useState, useEffect, useCallback } from 'react';

// EmailJS configuration - UPDATE THESE VALUES WITH YOUR ACTUAL EMAILJS SETTINGS
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_creditgyems', // Replace with your EmailJS service ID
  TEMPLATE_ID: 'template_lead_form', // Replace with your EmailJS template ID
  PUBLIC_KEY: 'YOUR_EMAILJS_PUBLIC_KEY' // Replace with your EmailJS public key
};

// Check if EmailJS is available and initialized
const emailjsAvailable = () => {
  return typeof window !== 'undefined' && window.emailjs && window.emailjs.send;
};

// Custom CSS styles for the design system - OPTIMIZED FOR COMPACTNESS
const customStyles = `
  .credit-gyems-gradient {
    background: linear-gradient(135deg, #FFD700 0%, #FF0000 50%, #0A2342 100%);
  }
  
  .hero-gradient {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 0, 0, 0.05) 50%, rgba(10, 35, 66, 0.1) 100%);
  }
  
  .glass-card {
    background: rgba(248, 248, 255, 0.85);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 215, 0, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  
  .glass-card-dark {
    background: rgba(10, 35, 66, 0.9);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 215, 0, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
  
  .gradient-text {
    background: linear-gradient(45deg, #FFD700, #FF0000);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .btn-primary {
    background: linear-gradient(45deg, #FFD700, #FF0000);
    color: #0A2342;
    font-weight: 700;
    padding: 12px 24px;
    border-radius: 50px;
    border: none;
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
    transition: all 0.3s ease;
    cursor: pointer;
    font-size: 14px;
    min-height: 44px;
  }
  
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
  }
  
  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  .btn-secondary {
    background: transparent;
    color: #0A2342;
    font-weight: 600;
    padding: 12px 24px;
    border-radius: 50px;
    border: 2px solid #FFD700;
    transition: all 0.3s ease;
    cursor: pointer;
    font-size: 14px;
    min-height: 44px;
  }
  
  .btn-secondary:hover {
    background: #FFD700;
    color: #0A2342;
    transform: translateY(-1px);
  }
  
  .form-input {
    width: 100%;
    padding: 10px 16px;
    border: 2px solid #E8E8E8;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    background: rgba(248, 248, 255, 0.95);
    min-height: 44px;
    color: #374151;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    line-height: 1.4;
  }
  
  .form-input:focus {
    outline: none;
    border-color: #FFD700;
    box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.15);
    background: white;
  }
  
  .form-input.error {
    border-color: #FF0000;
    box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.15);
  }
  
  .form-input option {
    color: #374151;
    padding: 8px;
    font-size: 14px;
  }
  
  .form-input select {
    color: #374151;
  }
  
  .form-input select option {
    color: #374151;
    background: white;
    padding: 8px;
  }
  
  .form-label {
    display: inline-block;
    font-size: 14px;
    font-weight: 700;
    color: #374151;
    margin-bottom: 6px;
    line-height: 1.4;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .checkbox-card {
    display: flex;
    align-items: flex-start;
    padding: 12px 16px;
    border-radius: 12px;
    border: 2px solid #E5E7EB;
    transition: all 0.3s ease;
    cursor: pointer;
    background: rgba(248, 248, 255, 0.5);
    margin-bottom: 8px;
    position: relative;
    min-height: 48px;
  }
  
  .checkbox-card:hover {
    border-color: #FFD700;
    background: rgba(255, 215, 0, 0.05);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  
  .checkbox-card.selected {
    border-color: #FFD700;
    background: rgba(255, 215, 0, 0.1);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.25);
  }
  
  .radio-card {
    display: flex;
    align-items: flex-start;
    padding: 12px 16px;
    border-radius: 12px;
    border: 2px solid #E5E7EB;
    transition: all 0.3s ease;
    cursor: pointer;
    background: rgba(248, 248, 255, 0.5);
    margin-bottom: 8px;
    position: relative;
    min-height: 48px;
  }
  
  .radio-card:hover {
    border-color: #26A69A;
    background: rgba(38, 166, 154, 0.05);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  
  .radio-card.selected {
    border-color: #26A69A;
    background: rgba(38, 166, 154, 0.1);
    box-shadow: 0 4px 12px rgba(38, 166, 154, 0.25);
  }
  
  .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #0A2342;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .success-checkmark {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(45deg, #26A69A, #4CAF50);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    animation: scaleIn 0.3s ease-out;
  }
  
  @keyframes scaleIn {
    0% { transform: scale(0); }
    100% { transform: scale(1); }
  }
  
  .floating-element {
    animation: float 6s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  
  .card-hover {
    transition: all 0.3s ease;
  }
  
  .card-hover:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
  
  .trust-badge {
    background: rgba(255, 215, 0, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.3);
    color: #0A2342;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }
  
  .progress-bar {
    background: #E8E8E8;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
  }
  
  .progress-fill {
    background: linear-gradient(45deg, #FFD700, #FF0000);
    height: 100%;
    transition: width 0.3s ease;
  }
  
  .form-section {
    background: rgba(248, 248, 255, 0.7);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
  }
  
  .form-section h4 {
    font-size: 16px;
    font-weight: 700;
    color: #374151;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    line-height: 1.4;
  }
  
  .form-section h4 svg {
    margin-right: 8px;
    flex-shrink: 0;
  }
  
  .checkbox-input {
    width: 18px;
    height: 18px;
    margin-right: 12px;
    margin-top: 2px;
    flex-shrink: 0;
    accent-color: #FFD700;
  }
  
  .radio-input {
    width: 18px;
    height: 18px;
    margin-right: 12px;
    margin-top: 2px;
    flex-shrink: 0;
    accent-color: #26A69A;
  }
  
  .tier-badge {
    position: absolute;
    top: 8px;
    right: 12px;
    padding: 4px 8px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
  }
  
  .premium-badge {
    background: linear-gradient(45deg, #FFD700, #FF0000);
    color: white;
  }
  
  .advanced-badge {
    background: linear-gradient(45deg, #9333EA, #C084FC);
    color: white;
  }
  
  .specialized-badge {
    background: linear-gradient(45deg, #059669, #10B981);
    color: white;
  }
  
  .core-badge {
    background: linear-gradient(45deg, #1D4ED8, #3B82F6);
    color: white;
  }
  
  .form-text {
    font-size: 14px;
    line-height: 1.4;
    color: #374151;
  }
  
  .form-step-title {
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 8px;
  }
  
  .form-step-subtitle {
    font-size: 16px;
    line-height: 1.4;
    color: #6B7280;
    margin-bottom: 20px;
  }
  
  .lead-magnet-container {
    width: 100%;
    max-width: none;
  }
  
  @media (min-width: 768px) {
    .form-input {
      min-width: 280px;
    }
    
    .wide-select {
      min-width: 320px;
    }
  }
  
  .wide-select {
    min-width: 240px;
  }

  /* COMPACT PROGRESS INDICATOR */
  .compact-progress {
    margin-bottom: 16px;
  }
  
  .compact-progress .progress-steps {
    display: flex;
    justify-content: center;
    margin-bottom: 8px;
    gap: 12px;
  }
  
  .compact-progress .step-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
    transition: all 0.3s ease;
  }
  
  .compact-progress .step-connector {
    width: 32px;
    height: 3px;
    margin: 14px 0;
    border-radius: 2px;
    transition: all 0.3s ease;
  }
  
  .compact-progress .step-label {
    font-size: 12px;
    margin-top: 6px;
    text-align: center;
    color: #6B7280;
  }

  /* COMPACT FORM LAYOUT */
  .compact-form-container {
    max-height: 85vh;
    overflow-y: auto;
    padding: 16px;
    border-radius: 20px;
  }
  
  .compact-form-step {
    min-height: auto;
  }
  
  .compact-form-header {
    text-align: center;
    margin-bottom: 16px;
  }
  
  .compact-form-header .hero-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 12px;
  }
  
  .compact-form-content {
    padding: 0;
  }
  
  .compact-button-group {
    margin-top: 20px;
    display: flex;
    gap: 12px;
  }
  
  .compact-button-group button {
    flex: 1;
    padding: 12px 16px;
    font-size: 14px;
  }

  /* RESPONSIVE OPTIMIZATIONS */
  @media (max-width: 768px) {
    .form-input {
      padding: 8px 12px;
      font-size: 14px;
      min-height: 40px;
    }
    
    .form-section {
      padding: 12px;
      margin-bottom: 12px;
    }
    
    .form-section h4 {
      font-size: 14px;
    }
    
    .checkbox-card, .radio-card {
      padding: 10px 12px;
      min-height: 44px;
    }
    
    .form-step-title {
      font-size: 20px;
    }
    
    .form-step-subtitle {
      font-size: 14px;
    }
    
    .compact-form-container {
      padding: 12px;
      max-height: 90vh;
    }
    
    .compact-form-header .hero-icon {
      width: 60px;
      height: 60px;
    }
  }
  
  @media (max-width: 480px) {
    .compact-progress .progress-steps {
      gap: 8px;
    }
    
    .compact-progress .step-circle {
      width: 28px;
      height: 28px;
      font-size: 12px;
    }
    
    .compact-progress .step-connector {
      width: 24px;
      height: 2px;
      margin: 13px 0;
    }
    
    .form-group {
      margin-bottom: 16px;
    }
    
    .checkbox-card, .radio-card {
      margin-bottom: 6px;
    }
  }
`;

// Counter animation component
const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    const incrementTime = Math.max(10, (2000 / end));
    
    if (end > 0) {
      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start >= end) clearInterval(timer);
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [value]);

  return <span>{count}</span>;
};

// Credit Score Ring Component
const CreditScoreRing = ({ score, label }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedScore / 850) * circumference;

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#E8E8E8"
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#creditGradient)"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-2000 ease-out"
        />
        <defs>
          <linearGradient id="creditGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF0000" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#26A69A" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold gradient-text">{animatedScore}</span>
        <span className="text-xs text-gray-600 font-medium">{label}</span>
      </div>
    </div>
  );
};

// Enhanced Lead Magnet Component with COMPACT DESIGN and EmailJS Integration
const CoachLeadMagnet = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailJSReady, setEmailJSReady] = useState(false);
  
  // Initialize EmailJS when component mounts
  useEffect(() => {
    const checkEmailJS = () => {
      if (emailjsAvailable()) {
        setEmailJSReady(true);
        console.log('EmailJS is ready for use');
      } else {
        console.log('EmailJS not yet available, retrying...');
        setTimeout(checkEmailJS, 1000); // Retry after 1 second
      }
    };
    
    // Check immediately and then retry if needed
    checkEmailJS();
  }, []);
  
  const [leadData, setLeadData] = useState({
    // Basic Info
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    currentCreditScore: '',
    
    // Goals & Interests
    interests: [],
    requestedInfo: [],
    urgencyLevel: '',
    creditGoals: [],
    
    // Financial Info
    annualIncome: '',
    currentDebt: '',
    homeOwnership: '',
    
    // Communication Preferences
    isSubscribedToEmails: true,
    gdprConsent: false,
    requestedConsultation: false,
    preferredContactMethod: 'email',
    
    // Source tracking
    source: 'landing_page',
    campaign: 'lead_magnet',
    landingPage: typeof window !== 'undefined' ? window.location.href : '',
    referrer: typeof document !== 'undefined' ? document.referrer || '' : '',
    
    // UTM Parameters (if available)
    utmParameters: {
      source: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_source') || '' : '',
      medium: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_medium') || '' : '',
      campaign: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_campaign') || '' : '',
      term: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_term') || '' : '',
      content: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_content') || '' : ''
    }
  });

  const totalSteps = 4;

  // Form options data
  const interestOptions = [
    { value: 'credit_repair', label: '🎯 Credit Repair & Dispute Resolution', category: 'core' },
    { value: 'credit_coaching', label: '💪 Personal Credit Coaching Sessions', category: 'core' },
    { value: 'financial_planning', label: '📈 Financial Planning & Strategy', category: 'advanced' },
    { value: 'debt_elimination', label: '💸 Debt Elimination Game Plan', category: 'core' },
    { value: 'wealth_building', label: '💰 Wealth Building & Investment', category: 'advanced' },
    { value: 'real_estate_financing', label: '🏠 Real Estate & Mortgage Qualification', category: 'specialized' },
    { value: 'business_credit', label: '🏢 Business Credit Building', category: 'specialized' },
    { value: 'credit_monitoring', label: '📊 Credit Monitoring & Maintenance', category: 'core' }
  ];

  const requestedInfoOptions = [
    { value: 'free_credit_report_analysis', label: '📋 Free Credit Report Analysis', tier: 'all' },
    { value: 'credit_improvement_timeline', label: '⏱️ Personal Credit Improvement Timeline', tier: 'all' },
    { value: 'debt_payoff_strategy', label: '🎯 Customized Debt Payoff Strategy', tier: 'intermediate' },
    { value: 'mortgage_readiness_assessment', label: '🏠 Mortgage Readiness Assessment', tier: 'advanced' },
    { value: 'business_credit_blueprint', label: '🏢 Business Credit Building Blueprint', tier: 'advanced' },
    { value: 'investment_planning_guide', label: '📈 Investment Planning for Beginners', tier: 'advanced' },
    { value: 'credit_monitoring_setup', label: '🔔 Credit Monitoring Setup Guide', tier: 'intermediate' },
    { value: 'dispute_letter_templates', label: '✍️ Professional Dispute Letter Templates', tier: 'intermediate' },
    { value: 'budget_optimization_plan', label: '💡 Budget Optimization Plan', tier: 'all' },
    { value: 'one_on_one_coaching', label: '🎯 One-on-One Coaching Session', tier: 'premium' }
  ];

  const creditScoreRanges = [
    { value: '300-499', label: '300-499 (Needs Major Improvement)', score: 400 },
    { value: '500-579', label: '500-579 (Poor)', score: 540 },
    { value: '580-669', label: '580-669 (Fair)', score: 625 },
    { value: '670-739', label: '670-739 (Good)', score: 705 },
    { value: '740-799', label: '740-799 (Very Good)', score: 770 },
    { value: '800-850', label: '800-850 (Excellent)', score: 825 },
    { value: 'unknown', label: "I don't know my credit score", score: 0 }
  ];

  const creditGoalOptions = [
    { value: 'improve_score', label: '📈 Improve Credit Score', points: 15 },
    { value: 'buy_home', label: '🏠 Buy a Home', points: 20 },
    { value: 'refinance_mortgage', label: '🏡 Refinance Mortgage', points: 15 },
    { value: 'get_better_rates', label: '💰 Get Better Interest Rates', points: 10 },
    { value: 'start_business', label: '🏢 Start a Business', points: 20 },
    { value: 'debt_consolidation', label: '🔄 Debt Consolidation', points: 15 },
    { value: 'repair_credit_damage', label: '🛠️ Repair Credit Damage', points: 25 },
    { value: 'build_credit_history', label: '📊 Build Credit History', points: 20 }
  ];

  const urgencyLevels = [
    { value: 'immediate', label: '🚨 Immediate (Within 30 days)', points: 25 },
    { value: 'soon', label: '⚡ Soon (1-3 months)', points: 20 },
    { value: 'planning', label: '📅 Planning (3-6 months)', points: 15 },
    { value: 'future', label: '🔮 Future consideration (6+ months)', points: 10 }
  ];

  const incomeRanges = [
    { value: 'under_25k', label: 'Under $25,000 per year' },
    { value: '25k_50k', label: '$25,000 - $50,000 per year' },
    { value: '50k_75k', label: '$50,000 - $75,000 per year' },
    { value: '75k_100k', label: '$75,000 - $100,000 per year' },
    { value: '100k_150k', label: '$100,000 - $150,000 per year' },
    { value: 'over_150k', label: 'Over $150,000 per year' }
  ];

  const debtRanges = [
    { value: 'none', label: 'No debt currently' },
    { value: 'under_5k', label: 'Under $5,000 total debt' },
    { value: '5k_15k', label: '$5,000 - $15,000 total debt' },
    { value: '15k_30k', label: '$15,000 - $30,000 total debt' },
    { value: '30k_50k', label: '$30,000 - $50,000 total debt' },
    { value: 'over_50k', label: 'Over $50,000 total debt' }
  ];

  const homeOwnershipOptions = [
    { value: 'own', label: 'I own my home' },
    { value: 'rent', label: 'I rent my home' },
    { value: 'live_with_family', label: 'I live with family' },
    { value: 'looking_to_buy', label: 'I am looking to buy a home' }
  ];

  // Lead scoring function
  const calculateLeadScore = useCallback(() => {
    let score = 0;
    
    // Points for having contact information
    if (leadData.firstName) score += 10;
    if (leadData.lastName) score += 10;
    if (leadData.phone) score += 15;
    if (leadData.email) score += 5;
    
    // Points for credit score range (higher need = higher score)
    const currentCreditScoreRange = creditScoreRanges.find(range => range.value === leadData.currentCreditScore);
    if (currentCreditScoreRange) {
      if (currentCreditScoreRange.score < 580) score += 25;
      else if (currentCreditScoreRange.score < 670) score += 20;
      else if (currentCreditScoreRange.score < 740) score += 15;
      else if (currentCreditScoreRange.score > 0) score += 10;
    }
    
    // Points for interests and goals
    score += leadData.interests.length * 5;
    score += leadData.creditGoals.length * 8;
    score += leadData.requestedInfo.length * 3;
    
    // Points for urgency
    const urgency = urgencyLevels.find(u => u.value === leadData.urgencyLevel);
    if (urgency) score += urgency.points;
    
    // Points for financial information
    if (leadData.annualIncome) score += 10;
    if (leadData.currentDebt) score += 5;
    if (leadData.homeOwnership && leadData.homeOwnership !== 'rent') score += 10;
    
    // Bonus for consultation request
    if (leadData.requestedConsultation) score += 15;
    
    // Bonus for premium tier requests
    const hasPremiumRequest = leadData.requestedInfo.some(item => 
      requestedInfoOptions.find(opt => opt.value === item && opt.tier === 'premium')
    );
    if (hasPremiumRequest) score += 20;
    
    // Cap at 100
    return Math.min(100, score);
  }, [leadData, creditScoreRanges, urgencyLevels, requestedInfoOptions]);

  // Event handlers
  const handleInputChange = (field, value) => {
    setLeadData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleArrayToggle = (field, value) => {
    setLeadData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!leadData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(leadData.email)) newErrors.email = 'Please enter a valid email';
        if (!leadData.firstName) newErrors.firstName = 'First name is required';
        break;
      case 2:
        if (!leadData.currentCreditScore) newErrors.currentCreditScore = 'Please select your credit score range';
        if (leadData.creditGoals.length === 0) newErrors.creditGoals = 'Please select at least one credit goal';
        break;
      case 3:
        if (leadData.interests.length === 0 && leadData.requestedInfo.length === 0) {
          newErrors.interests = 'Please select at least one area of interest or resource';
        }
        if (!leadData.urgencyLevel) newErrors.urgencyLevel = 'Please select your timeline';
        break;
      case 4:
        if (!leadData.gdprConsent) newErrors.gdprConsent = 'Consent is required to proceed';
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setLoading(true);
    
    try {
      // Calculate lead score
      const leadScore = calculateLeadScore();
      
      // Prepare data for storage/email
      const submissionData = {
        ...leadData,
        leadScore,
        submissionDate: new Date().toISOString(),
        formattedData: {
          creditScoreLabel: creditScoreRanges.find(r => r.value === leadData.currentCreditScore)?.label || '',
          interestLabels: leadData.interests.map(i => interestOptions.find(opt => opt.value === i)?.label || i),
          resourceLabels: leadData.requestedInfo.map(r => requestedInfoOptions.find(opt => opt.value === r)?.label || r),
          urgencyLabel: urgencyLevels.find(u => u.value === leadData.urgencyLevel)?.label || '',
          goalLabels: leadData.creditGoals.map(g => creditGoalOptions.find(opt => opt.value === g)?.label || g),
          incomeLabel: incomeRanges.find(i => i.value === leadData.annualIncome)?.label || '',
          debtLabel: debtRanges.find(d => d.value === leadData.currentDebt)?.label || '',
          homeLabel: homeOwnershipOptions.find(h => h.value === leadData.homeOwnership)?.label || ''
        }
      };

      // Try to send email via EmailJS
      if (emailjsAvailable() && EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
        console.log('EmailJS is available and configured, attempting to send email...');
        
        const templateParams = {
          // Email routing
          to_email: 'info@creditgyems369.com',
          from_email: leadData.email,
          reply_to: leadData.email,
          
          // Personal Information
          first_name: leadData.firstName || '',
          last_name: leadData.lastName || '',
          full_name: `${leadData.firstName || ''} ${leadData.lastName || ''}`.trim() || 'Not provided',
          phone: leadData.phone || 'Not provided',
          email: leadData.email,
          
          // Credit Information
          current_credit_score: submissionData.formattedData.creditScoreLabel,
          credit_goals: submissionData.formattedData.goalLabels.join(', ') || 'None selected',
          
          // Service Interests
          interests: submissionData.formattedData.interestLabels.join(', ') || 'None selected',
          requested_info: submissionData.formattedData.resourceLabels.join(', ') || 'None selected',
          urgency_level: submissionData.formattedData.urgencyLabel,
          
          // Financial Information
          annual_income: submissionData.formattedData.incomeLabel || 'Not provided',
          current_debt: submissionData.formattedData.debtLabel || 'Not provided',
          home_ownership: submissionData.formattedData.homeLabel || 'Not provided',
          
          // Communication Preferences
          requested_consultation: leadData.requestedConsultation ? 'Yes' : 'No',
          preferred_contact: leadData.preferredContactMethod || 'email',
          subscribed_emails: leadData.isSubscribedToEmails ? 'Yes' : 'No',
          
          // Lead Scoring & Analytics
          lead_score: leadScore,
          lead_priority: leadScore >= 80 ? 'High Priority' :
                        leadScore >= 60 ? 'Medium Priority' :
                        leadScore >= 40 ? 'Standard Priority' : 'General Interest',
          
          // Source Tracking
          source: leadData.source || 'landing_page',
          campaign: leadData.campaign || 'lead_magnet',
          landing_page: leadData.landingPage || 'Not provided',
          referrer: leadData.referrer || 'Direct',
          
          // UTM Parameters
          utm_source: leadData.utmParameters.source || 'None',
          utm_medium: leadData.utmParameters.medium || 'None',
          utm_campaign: leadData.utmParameters.campaign || 'None',
          utm_term: leadData.utmParameters.term || 'None',
          utm_content: leadData.utmParameters.content || 'None',
          
          // Timestamp
          submission_date: new Date().toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          
          // Summary for quick review
          summary: `New ${leadScore >= 80 ? 'HIGH PRIORITY' : 'lead'} submission from ${leadData.firstName || 'prospect'} (${leadData.email}) with lead score of ${leadScore}/100. ${leadData.requestedConsultation ? 'CONSULTATION REQUESTED.' : ''}`
        };
        
        console.log('Sending email with template params:', templateParams);
        
        // Send email using EmailJS
        const response = await window.emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          templateParams,
          EMAILJS_CONFIG.PUBLIC_KEY
        );
        
        console.log('Email sent successfully via EmailJS:', response);
        
        // Also try to send a copy to the lead (welcome email)
        const welcomeParams = {
          to_email: leadData.email,
          from_email: 'info@creditgyems369.com',
          first_name: leadData.firstName || 'there',
          lead_score: leadScore,
          next_steps: leadData.requestedConsultation ? 
            'We will contact you within 24 hours to schedule your free consultation.' :
            'Check your email for your personalized credit improvement resources.',
          consultation_requested: leadData.requestedConsultation ? 'Yes' : 'No'
        };
        
        // Send welcome email (using a different template)
        try {
          await window.emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            'template_welcome', // Welcome email template
            welcomeParams,
            EMAILJS_CONFIG.PUBLIC_KEY
          );
          console.log('Welcome email sent to lead');
        } catch (welcomeError) {
          console.log('Welcome email failed (template may not exist):', welcomeError);
          // Don't fail the whole process if welcome email fails
        }
        
      } else {
        console.log('EmailJS not configured or not available. Simulating submission...');
        console.log('📧 EMAIL WOULD BE SENT TO: info@creditgyems369.com');
        console.log('📋 LEAD DATA SUMMARY:');
        console.log('- Name:', `${leadData.firstName} ${leadData.lastName}`);
        console.log('- Email:', leadData.email);
        console.log('- Phone:', leadData.phone || 'Not provided');
        console.log('- Lead Score:', `${leadScore}/100`);
        console.log('- Priority:', leadScore >= 80 ? 'HIGH PRIORITY' : leadScore >= 60 ? 'Medium' : 'Standard');
        console.log('- Consultation Requested:', leadData.requestedConsultation ? 'YES' : 'No');
        console.log('- Full Data:', submissionData);
        
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('✅ Simulation complete - In production, email would be sent via EmailJS');
      }
      
      // Store data locally for demo purposes (you can remove this in production)
      if (typeof window !== 'undefined') {
        const existingLeads = JSON.parse(localStorage.getItem('creditGyemsLeads') || '[]');
        existingLeads.push(submissionData);
        localStorage.setItem('creditGyemsLeads', JSON.stringify(existingLeads));
        console.log('Lead data stored locally:', submissionData);
      }
      
      setSuccess(true);
      
      // Track conversion event (if Google Analytics is loaded)
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'lead_generation', {
          event_category: 'Lead',
          event_label: 'Credit Assessment Form',
          value: leadScore
        });
      }
      
    } catch (error) {
      console.error('Submission failed:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Submission failed. Please try again or contact support.';
      
      if (error.text) {
        errorMessage = `Email service error: ${error.text}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // COMPACT Progress indicator
  const ProgressIndicator = () => (
    <div className="compact-progress">
      <div className="compact-progress .progress-steps">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i + 1} className="flex items-center">
            <div
              className={`step-circle ${
                i + 1 < currentStep
                  ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg'
                  : i + 1 === currentStep
                  ? 'bg-gradient-to-r from-yellow-400 to-red-400 text-slate-800 shadow-lg'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i + 1 < currentStep ? '✓' : i + 1}
            </div>
            {i + 1 < totalSteps && (
              <div className={`step-connector ${
                i + 1 < currentStep ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="progress-bar w-full max-w-md mx-auto">
        <div 
          className="progress-fill transition-all duration-500"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      <div className="step-label">Step {currentStep} of {totalSteps}</div>
    </div>
  );

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="success-checkmark mb-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold gradient-text mb-4">
          Welcome to Credit Gyems Academy! 🎉
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto text-base leading-relaxed">
          Your personalized credit improvement plan is being prepared. Check your email for your free guide and next steps!
        </p>
        <div className="glass-card p-6 max-w-sm mx-auto mb-6">
          <h4 className="font-bold text-lg mb-3">Your Lead Score</h4>
          <div className="text-3xl font-bold gradient-text mb-3">{calculateLeadScore()}/100</div>
          <p className="text-sm text-gray-600 leading-relaxed">Based on your responses, we've created a personalized approach for your credit journey.</p>
        </div>
        <button 
          onClick={() => {
            setSuccess(false);
            setCurrentStep(1);
            setLeadData({
              email: '', firstName: '', lastName: '', phone: '', currentCreditScore: '',
              interests: [], requestedInfo: [], urgencyLevel: '', creditGoals: [],
              annualIncome: '', currentDebt: '', homeOwnership: '',
              isSubscribedToEmails: true, gdprConsent: false, requestedConsultation: false,
              preferredContactMethod: 'email', source: 'landing_page', campaign: 'lead_magnet',
              landingPage: typeof window !== 'undefined' ? window.location.href : '',
              referrer: typeof document !== 'undefined' ? document.referrer || '' : '',
              utmParameters: {
                source: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_source') || '' : '',
                medium: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_medium') || '' : '',
                campaign: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_campaign') || '' : '',
                term: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_term') || '' : '',
                content: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_content') || '' : ''
              }
            });
            setErrors({});
          }}
          className="btn-secondary"
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full lead-magnet-container">
      <ProgressIndicator />

      <div className="glass-card shadow-2xl border-2 border-yellow-200/60 compact-form-container rounded-2xl w-full">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="compact-form-step">
            <div className="compact-form-header">
              <div className="hero-icon bg-gradient-to-r from-yellow-400 to-red-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg floating-element">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="form-step-title gradient-text">Get Your Free Credit Assessment</h3>
              <p className="form-step-subtitle">Let's start your credit transformation journey with DorTae Freeman</p>
            </div>

            <div className="compact-form-content space-y-4">
              <div className="form-group">
                <label className="form-label">📧 Email Address *</label>
                <input
                  type="email"
                  value={leadData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email address"
                  required
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">👋 First Name *</label>
                  <input
                    type="text"
                    value={leadData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                    placeholder="Enter your first name"
                    required
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">👤 Last Name</label>
                  <input
                    type="text"
                    value={leadData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="form-input"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">📱 Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={leadData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="form-input"
                  placeholder="(555) 123-4567"
                />
                <p className="text-xs text-gray-500 mt-1">Helpful for personalized coaching</p>
              </div>
            </div>

            <div className="compact-button-group">
              <button
                onClick={nextStep}
                disabled={!leadData.email || !leadData.firstName}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue Assessment →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Credit Goals & Current Status */}
        {currentStep === 2 && (
          <div className="compact-form-step">
            <div className="compact-form-header">
              <h3 className="form-step-title gradient-text">Your Credit Goals</h3>
              <p className="form-step-subtitle">Help us understand your current situation and goals</p>
            </div>

            <div className="compact-form-content space-y-4">
              <div className="form-section">
                <h4>
                  <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  📊 Current Credit Score Range *
                </h4>
                <select
                  value={leadData.currentCreditScore}
                  onChange={(e) => handleInputChange('currentCreditScore', e.target.value)}
                  className={`form-input w-full ${errors.currentCreditScore ? 'error' : ''}`}
                  style={{ color: leadData.currentCreditScore ? '#374151' : '#9CA3AF' }}
                >
                  <option value="" disabled style={{ color: '#9CA3AF' }}>Select your current credit score range...</option>
                  {creditScoreRanges.map(range => (
                    <option key={range.value} value={range.value} style={{ color: '#374151' }}>
                      {range.label}
                    </option>
                  ))}
                </select>
                {errors.currentCreditScore && <p className="text-red-500 text-sm mt-1">{errors.currentCreditScore}</p>}
              </div>

              <div className="form-section">
                <h4>
                  <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  🎯 Credit Goals (Select all that apply) *
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {creditGoalOptions.map(goal => (
                    <div 
                      key={goal.value} 
                      className={`checkbox-card ${leadData.creditGoals.includes(goal.value) ? 'selected' : ''}`}
                      onClick={() => handleArrayToggle('creditGoals', goal.value)}
                    >
                      <input
                        type="checkbox"
                        checked={leadData.creditGoals.includes(goal.value)}
                        onChange={() => {}} // Handled by onClick
                        className="checkbox-input"
                      />
                      <span className="form-text">{goal.label}</span>
                    </div>
                  ))}
                </div>
                {errors.creditGoals && <p className="text-red-500 text-sm mt-1">{errors.creditGoals}</p>}
              </div>

              <div className="form-section">
                <h4>
                  <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  💼 Financial Info (Optional)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    value={leadData.annualIncome}
                    onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                    className="form-input text-sm"
                    style={{ color: leadData.annualIncome ? '#374151' : '#9CA3AF' }}
                  >
                    <option value="" style={{ color: '#9CA3AF' }}>Annual Income</option>
                    {incomeRanges.map(range => (
                      <option key={range.value} value={range.value} style={{ color: '#374151' }}>
                        {range.label.replace(' per year', '')}
                      </option>
                    ))}
                  </select>

                  <select
                    value={leadData.currentDebt}
                    onChange={(e) => handleInputChange('currentDebt', e.target.value)}
                    className="form-input text-sm"
                    style={{ color: leadData.currentDebt ? '#374151' : '#9CA3AF' }}
                  >
                    <option value="" style={{ color: '#9CA3AF' }}>Total Debt</option>
                    {debtRanges.map(range => (
                      <option key={range.value} value={range.value} style={{ color: '#374151' }}>
                        {range.label.replace(' total debt', '')}
                      </option>
                    ))}
                  </select>

                  <select
                    value={leadData.homeOwnership}
                    onChange={(e) => handleInputChange('homeOwnership', e.target.value)}
                    className="form-input text-sm"
                    style={{ color: leadData.homeOwnership ? '#374151' : '#9CA3AF' }}
                  >
                    <option value="" style={{ color: '#9CA3AF' }}>Housing</option>
                    {homeOwnershipOptions.map(option => (
                      <option key={option.value} value={option.value} style={{ color: '#374151' }}>
                        {option.label.replace('I ', '').replace('my ', '')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="compact-button-group">
              <button onClick={prevStep} className="btn-secondary">← Back</button>
              <button
                onClick={nextStep}
                disabled={!leadData.currentCreditScore || leadData.creditGoals.length === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Services & Timeline */}
        {currentStep === 3 && (
          <div className="compact-form-step">
            <div className="compact-form-header">
              <h3 className="form-step-title gradient-text">Customize Your Experience</h3>
              <p className="form-step-subtitle">What services interest you and when do you need help?</p>
            </div>

            <div className="compact-form-content space-y-4">
              <div className="form-section">
                <h4>
                  <svg className="w-6 h-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ⏰ Timeline for Goals *
                </h4>
                <div className="space-y-2">
                  {urgencyLevels.map(level => (
                    <div 
                      key={level.value} 
                      className={`radio-card ${leadData.urgencyLevel === level.value ? 'selected' : ''}`}
                      onClick={() => handleInputChange('urgencyLevel', level.value)}
                    >
                      <input
                        type="radio"
                        name="urgencyLevel"
                        checked={leadData.urgencyLevel === level.value}
                        onChange={() => {}} // Handled by onClick
                        className="radio-input"
                      />
                      <span className="form-text">{level.label}</span>
                    </div>
                  ))}
                </div>
                {errors.urgencyLevel && <p className="text-red-500 text-sm mt-1">{errors.urgencyLevel}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-section">
                  <h4>
                    <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    🎯 Services of Interest
                  </h4>
                  <div className="space-y-1 max-h-28 overflow-y-auto">
                    {interestOptions.slice(0, 6).map(option => (
                      <div 
                        key={option.value} 
                        className={`checkbox-card ${leadData.interests.includes(option.value) ? 'selected' : ''}`}
                        onClick={() => handleArrayToggle('interests', option.value)}
                      >
                        <input
                          type="checkbox"
                          checked={leadData.interests.includes(option.value)}
                          onChange={() => {}} // Handled by onClick
                          className="checkbox-input"
                        />
                        <div className="flex-grow">
                          <span className="form-text text-sm block">{option.label}</span>
                        </div>
                        <span className={`tier-badge text-xs ${
                          option.category === 'core' ? 'core-badge' :
                          option.category === 'advanced' ? 'advanced-badge' :
                          'specialized-badge'
                        }`}>
                          {option.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-section">
                  <h4>
                    <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    📚 Helpful Resources
                  </h4>
                  <div className="space-y-1 max-h-28 overflow-y-auto">
                    {requestedInfoOptions.slice(0, 6).map(option => (
                      <div 
                        key={option.value} 
                        className={`checkbox-card ${leadData.requestedInfo.includes(option.value) ? 'selected' : ''}`}
                        onClick={() => handleArrayToggle('requestedInfo', option.value)}
                      >
                        <input
                          type="checkbox"
                          checked={leadData.requestedInfo.includes(option.value)}
                          onChange={() => {}} // Handled by onClick
                          className="checkbox-input"
                        />
                        <div className="flex-grow">
                          <span className="form-text text-sm block">{option.label}</span>
                        </div>
                        {option.tier === 'premium' && (
                          <span className="tier-badge premium-badge text-xs">
                            PREMIUM
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {errors.interests && <p className="text-red-500 text-sm">{errors.interests}</p>}
            </div>

            <div className="compact-button-group">
              <button onClick={prevStep} className="btn-secondary">← Back</button>
              <button
                onClick={nextStep}
                disabled={!leadData.urgencyLevel && leadData.interests.length === 0 && leadData.requestedInfo.length === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Almost Done! →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Final Details & Consent */}
        {currentStep === 4 && (
          <div className="compact-form-step">
            <div className="compact-form-header">
              <h3 className="text-2xl font-bold gradient-text mb-2">Final Step</h3>
              <p className="text-sm text-gray-600">Complete your assessment and get your personalized plan</p>
            </div>

            <div className="compact-form-content space-y-4">
              <div className="form-section">
                <h4>
                  <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Communication Preferences
                </h4>
                
                <div className="space-y-3">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={leadData.isSubscribedToEmails}
                      onChange={(e) => handleInputChange('isSubscribedToEmails', e.target.checked)}
                      className="checkbox-input"
                    />
                    <span className="form-text text-sm">
                      <strong>Yes, send me credit tips!</strong> Get weekly insights, exclusive content, 
                      and updates from DorTae Freeman. Unsubscribe anytime.
                    </span>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select
                      value={leadData.preferredContactMethod}
                      onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
                      className="form-input text-sm"
                    >
                      <option value="email">📧 Email</option>
                      <option value="phone">📞 Phone</option>
                      <option value="text">💬 Text Message</option>
                    </select>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={leadData.requestedConsultation}
                        onChange={(e) => handleInputChange('requestedConsultation', e.target.checked)}
                        className="checkbox-input mr-2"
                      />
                      <span className="form-text text-sm">
                        <strong>Free 15-min consultation</strong>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Privacy & Consent *
                </h4>
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={leadData.gdprConsent}
                    onChange={(e) => handleInputChange('gdprConsent', e.target.checked)}
                    className="checkbox-input"
                    required
                  />
                  <span className="form-text text-sm">
                    I agree to receive my personalized credit assessment and consent to Credit Gyems Academy 
                    storing and processing my information to provide credit improvement resources and communications. 
                    <strong className="text-red-600">Required to proceed.</strong>
                  </span>
                </label>
                {errors.gdprConsent && <p className="text-red-500 text-sm mt-1">{errors.gdprConsent}</p>}
              </div>

              <div className="form-section">
                <h4 className="gradient-text">Your Lead Score Preview</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold gradient-text">{calculateLeadScore()}/100</div>
                    <p className="text-xs text-gray-600">Credit Priority Score</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {calculateLeadScore() >= 80 ? '🚀 High Priority' :
                       calculateLeadScore() >= 60 ? '⚡ Medium Priority' :
                       calculateLeadScore() >= 40 ? '📈 Standard Priority' : '📋 General Interest'}
                    </p>
                  </div>
                </div>
                
                {/* EmailJS Status Indicator (for development) */}
                <div className="mt-4 p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${emailJSReady ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    Email Service: {emailJSReady ? 'Ready' : 'Loading...'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Current form data:', leadData);
                      console.log('Calculated lead score:', calculateLeadScore());
                      console.log('EmailJS ready:', emailJSReady);
                      console.log('EmailJS available:', emailjsAvailable());
                    }}
                    className="text-xs text-blue-500 underline mt-1"
                  >
                    Debug Form Data
                  </button>
                </div>
              </div>
            </div>

            <div className="compact-button-group">
              <button onClick={prevStep} className="btn-secondary">← Back</button>
              <button
                onClick={handleSubmit}
                disabled={!leadData.gdprConsent || loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    Get My Credit Assessment! 🎉
                  </>
                )}
              </button>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg mt-4">
                <p className="text-red-600 text-sm">{errors.submit}</p>
                
                  {/* Development debugging info */}
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer">Debug Info</summary>
                    <div className="mt-2 text-xs text-gray-600">
                      <p>EmailJS Ready: {emailJSReady ? 'Yes' : 'No'}</p>
                      <p>EmailJS Available: {emailjsAvailable() ? 'Yes' : 'No'}</p>
                      <p>Service ID: {EMAILJS_CONFIG.SERVICE_ID}</p>
                      <p>Template ID: {EMAILJS_CONFIG.TEMPLATE_ID}</p>
                      <p>Public Key: {EMAILJS_CONFIG.PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY' ? 'Not configured' : 'Configured'}</p>
                    </div>
                  </details>
              </div>
            )}

            <p className="text-xs text-gray-500 text-center mt-4">
              🔒 Your information is secure and will never be sold. Get ready for your credit transformation!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Services data
const services = [
  {
    icon: "credit-card",
    title: "Credit Repair Mastery",
    description: "Professional dispute resolution and credit rebuilding strategies. DorTae guides you through proven techniques that deliver measurable results and lasting credit improvements.",
    color: "#FFD700",
    buttonText: "Start Your Repair Journey",
    tier: "Foundation Program"
  },
  {
    icon: "academic-cap", 
    title: "Elite Credit Coaching",
    description: "One-on-one intensive coaching sessions with accountability and education. Learn insider strategies from DorTae and join our community of successful clients.",
    color: "#FF0000",
    buttonText: "Get Personal Coaching",
    tier: "Premium Program"
  },
  {
    icon: "currency-dollar",
    title: "Wealth Building Blueprint", 
    description: "Comprehensive financial planning covering debt elimination, investment strategies, and wealth building. Transform your entire financial life with expert guidance.",
    color: "#26A69A",
    buttonText: "Build Your Wealth",
    tier: "Elite Program"
  }
];

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    position: "Small Business Owner • Client Since 2023",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80&q=80",
    content: "DorTae completely transformed my financial situation. My credit score jumped 120 points in just 3 months! Her strategies were like having a personal trainer for my credit.",
    rating: 5,
    type: "text",
    achievement: "120+ Point Increase"
  },
  {
    id: 2,
    name: "Marcus Williams", 
    position: "Real Estate Investor • Elite Client",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80&q=80",
    content: "Credit Gyems Academy helped me qualify for my first investment property loan. DorTae's coaching was invaluable - she believed in my goals when I didn't believe in myself.",
    rating: 5,
    type: "video",
    thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=320&h=180&q=80",
    achievement: "Investment Property Qualified"
  },
  {
    id: 3,
    name: "Alicia Rodriguez",
    position: "First-Time Homebuyer • Success Story", 
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80&q=80",
    content: "I went from a 580 to a 720 credit score and finally bought my dream home! DorTae's coaching and resources were life-changing. She made the impossible seem achievable.",
    rating: 5,
    type: "text",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=320&h=180&q=80",
    achievement: "Dream Home Purchased"
  }
];

// Products with realistic pricing
const products = [
  {
    id: 1,
    title: "Credit Repair Mastery Guide",
    description: "The complete playbook DorTae uses to help clients increase their credit scores by 100+ points. Includes dispute templates, strategy guides, and step-by-step instructions.",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80",
    price: "$47",
    originalPrice: "$97",
    popular: true,
    tier: "Bestseller"
  },
  {
    id: 2,
    title: "Financial Freedom Blueprint", 
    description: "Comprehensive wealth-building strategies including debt elimination, budget optimization, and investment fundamentals. Your roadmap to financial independence.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80",
    price: "$67",
    originalPrice: "$127",
    popular: false,
    tier: "Advanced"
  },
  {
    id: 3,
    title: "Credit Secrets Revealed",
    description: "Insider knowledge and advanced strategies used by credit professionals. Learn the tactics that credit repair companies don't want you to know.",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80", 
    price: "$37",
    originalPrice: "$77",
    popular: false,
    tier: "Essential"
  },
  {
    id: 4,
    title: "Business Credit Builder",
    description: "Complete guide to establishing and building business credit, including vendor lists, application strategies, and funding opportunities for entrepreneurs.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80",
    price: "$97",
    originalPrice: "$197", 
    popular: false,
    tier: "Professional"
  },
  {
    id: 5,
    title: "Real Estate Credit Prep",
    description: "Everything you need to know about preparing your credit for mortgage approval, including timeline strategies and optimization techniques for home buyers.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80",
    price: "$57",
    originalPrice: "$117",
    popular: false,
    tier: "Specialized"
  },
  {
    id: 6,
    title: "Credit Mastery Masterclass",
    description: "Live 3-hour intensive masterclass with DorTae Freeman covering advanced credit strategies, Q&A session, and personalized action planning. Limited seats available.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80",
    price: "$297",
    originalPrice: "$497",
    popular: true,
    tier: "Live Course",
    type: "course"
  }
];

const Homepage = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [expanded, setExpanded] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, []);
  
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <span
        key={i}
        className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`}
      >
        ★
      </span>
    ));
  };

  return (
    <>
      <style>{customStyles}</style>
      <div className="min-h-screen bg-gray-50">
        {/* EmailJS Script - Load via CDN */}
        <script 
          type="text/javascript" 
          src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"
        ></script>
        
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-red-400 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">CG</span>
                </div>
                <span className="font-bold text-lg text-gray-800">Credit Gyems Academy</span>
              </div>
              
              <div className="hidden md:flex space-x-8">
                {['Home', 'Services', 'Products', 'About', 'Resources'].map((item) => (
                  <a key={item} href={`#${item.toLowerCase()}`} className="font-medium text-gray-700 hover:text-yellow-500 transition-colors">
                    {item}
                  </a>
                ))}
              </div>
              
              <button className="btn-primary">
                Free Assessment
              </button>
            </div>
          </div>
        </nav>
        
        {/* Hero Section */}
        <div className="pt-24 pb-16 md:pb-24 relative overflow-hidden hero-gradient">
          {/* Decorative elements */}
          <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-yellow-300/30 to-red-300/20 blur-3xl floating-element"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-gradient-to-br from-red-300/20 to-teal-300/10 blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <div className="inline-flex items-center bg-gradient-to-r from-yellow-100 to-red-100 px-4 py-2 rounded-full border border-yellow-300 mb-6">
                  <span className="text-sm font-bold text-gray-700">🏆 #1 Credit Transformation Expert</span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  <span className="gradient-text">Transform Your Credit Journey</span>
                  <br />
                  <span className="text-gray-800">with Credit Gyems Academy</span>
                </h1>
                
                <p className="text-lg md:text-xl text-gray-600 mb-8">
                  Expert credit repair, coaching, and financial planning with <strong>DorTae Freeman</strong>. 
                  Join thousands who've achieved financial freedom through proven strategies and personalized guidance.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  <button className="btn-primary">
                    🎯 Get Your Free Credit Assessment
                  </button>
                  <button className="btn-secondary">
                    📞 Learn More About Our Services
                  </button>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-500 font-medium">Trusted by Champions</span>
                  <div className="h-px bg-gray-200 flex-grow"></div>
                </div>
                
                <div className="flex gap-6 flex-wrap">
                  {['BBB A+', 'Featured Expert', '2500+ Success Stories'].map((item, index) => (
                    <div key={index} className="trust-badge">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="md:w-1/2">
                <div className="relative">
                  <div className="absolute -top-4 -left-4 right-6 bottom-6 bg-gradient-to-br from-yellow-200/40 to-red-200/40 rounded-2xl -z-10 floating-element"></div>
                  <div className="glass-card p-6 rounded-2xl">
                    <img 
                      src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80" 
                      alt="Credit transformation success" 
                      className="w-full rounded-lg mb-6"
                    />
                    
                    <h3 className="text-xl font-bold mb-4 gradient-text">
                      Your Credit Transformation Starts Here
                    </h3>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-yellow-100 border border-yellow-400 text-gray-700 inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Credit Repair
                      </span>
                      <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-red-100 border border-red-400 text-gray-700 inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                        Expert Coaching
                      </span>
                      <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-teal-100 border border-teal-400 text-gray-700 inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Wealth Building
                      </span>
                    </div>
                    
                    <button className="w-full btn-primary">
                      Watch Success Stories
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-8 0a9 9 0 108 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* About DorTae Section */}
        <div className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-5/12">
                <div className="relative">
                  <div className="absolute top-5 -left-5 w-full h-full rounded-full bg-gradient-to-br from-yellow-300/30 to-red-300/30 -z-10"></div>
                  <img
                    src="https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80"
                    alt="DorTae Freeman - Credit Expert"
                    className="rounded-full w-72 h-72 md:w-96 md:h-96 object-cover border-6 border-white shadow-xl"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-yellow-400 to-red-400 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                    🏆 Credit Expert
                  </div>
                </div>
              </div>
              
              <div className="md:w-7/12">
                <span className="uppercase tracking-wider text-yellow-500 font-semibold text-sm">Meet Your Credit Expert</span>
                
                <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6 gradient-text">
                  DorTae Freeman
                </h2>
                
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  As the founder of <strong>Credit Gyems Academy</strong>, DorTae Freeman has transformed thousands of 
                  lives through expert credit repair, coaching, and financial planning. With her proven methodology and 
                  passionate approach, she helps clients achieve lasting financial freedom and credit excellence.
                </p>
                
                <div className="mb-8">
                  <p className="text-gray-600 text-lg leading-relaxed mb-4">
                    {expanded ? (
                      <>
                        DorTae's journey began when she personally overcame significant credit challenges, 
                        rebuilding her score from the ground up. This experience ignited her passion for helping 
                        others achieve credit transformation using proven strategies and unwavering support.
                        <br /><br />
                        Today, Credit Gyems Academy stands as a testament to her vision that everyone 
                        deserves access to the knowledge and tools needed to build excellent credit and secure 
                        their financial future. Her approach combines technical expertise with genuine care for each client's success.
                      </>
                    ) : "DorTae's journey began when she personally overcame significant credit challenges..."}
                  </p>
                  
                  <button 
                    className="text-yellow-500 font-medium flex items-center hover:text-yellow-600 transition-colors"
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? "Show Less" : "Read DorTae's Full Story"}
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ml-1 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { figure: "2500", label: "Clients Helped", suffix: "+" },
                    { figure: "150", label: "Avg Score Increase", suffix: "+" },
                    { figure: "95", label: "Success Rate", suffix: "%" }
                  ].map((stat, index) => (
                    <div key={index} className="glass-card p-4 text-center rounded-lg">
                      <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">
                        <AnimatedCounter value={stat.figure} />
                        {stat.suffix}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Services Section */}
        <div className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="uppercase tracking-wider text-yellow-500 font-semibold text-sm">Our Expertise</span>
              
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 gradient-text">
                Comprehensive Credit Solutions
              </h2>
              
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                At Credit Gyems Academy, we offer a full spectrum of services designed to transform your credit 
                and build lasting financial success through proven strategies and expert guidance.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div key={index}>
                  <div className="glass-card h-full flex flex-col relative overflow-hidden border-2 border-yellow-200/50 card-hover rounded-2xl">
                    <div className="h-2 w-full bg-gradient-to-r" style={{ 
                      background: `linear-gradient(to right, ${service.color}, ${service.color}80)` 
                    }}></div>
                    
                    <div className="p-8 flex-grow flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
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
                        
                        <span className="bg-gradient-to-r from-yellow-100 to-red-100 px-3 py-1 rounded-full text-xs font-bold text-gray-700 border border-yellow-300">
                          {service.tier}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-4 text-gray-800">{service.title}</h3>
                      
                      <p className="text-gray-600 mb-8 flex-grow">{service.description}</p>
                      
                      <button 
                        className="btn-primary w-full"
                        style={{ 
                          background: `linear-gradient(to right, ${service.color}, ${service.color}CC)`
                        }}
                      >
                        {service.buttonText}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Lead Magnet Section */}
        <div className="py-16 md:py-24 bg-gray-900 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-1/4 left-0 w-96 h-96 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-400/0 blur-3xl floating-element"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-gradient-to-br from-red-400/10 to-red-400/0 blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              <div className="lg:w-2/5">
                <div className="inline-flex items-center bg-gradient-to-r from-yellow-400/20 to-red-400/20 px-4 py-2 rounded-full border border-yellow-400/30 mb-6">
                  <span className="text-sm font-bold text-yellow-300">🎯 Free Credit Assessment</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6 text-white">
                  Get Your <span className="gradient-text">Personalized Credit Plan</span>
                </h2>
                
                <p className="text-gray-300 text-lg leading-relaxed mb-8">
                  Ready to transform your credit? Get your personalized 
                  <strong className="text-yellow-400"> "Credit Transformation Assessment"</strong> based on your specific goals. 
                  Our smart evaluation creates a custom roadmap that has helped thousands achieve credit success.
                </p>
                
                <div className="flex flex-col gap-3 mb-8">
                  {[
                    "🎯 Personalized credit score improvement plan",
                    "📋 Professional dispute strategy templates",
                    "📈 Proven credit building techniques from DorTae",
                    "🏆 Access to exclusive client success resources",
                    "📞 Priority booking for expert consultations",
                    "💪 Ongoing support and accountability system"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-red-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                
                <div className="bg-gradient-to-r from-yellow-400/10 to-red-400/10 border border-yellow-400/30 rounded-lg p-4 mb-6">
                  <p className="text-yellow-200 text-sm font-medium flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    The more details you provide, the more personalized your credit transformation plan becomes!
                  </p>
                </div>
              </div>
              
              <div className="lg:w-3/5">
                <div className="relative mx-auto w-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/40 to-red-400/40 blur-3xl -z-10 floating-element"></div>
                  
                  <CoachLeadMagnet />
                  
                  <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        100% Free
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Secure & Private
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Instant Results
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Testimonials Section */}
        <div className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="uppercase tracking-wider text-yellow-500 font-semibold text-sm">Client Success Stories</span>
              
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 gradient-text">
                Transformational Results
              </h2>
              
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Hear from clients who have experienced remarkable credit transformations through Credit Gyems Academy's proven methods and DorTae's expert guidance.
              </p>
            </div>
            
            <div className="relative my-8 h-auto md:h-80 lg:h-64">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`transition-opacity duration-500 ${
                    activeTestimonial === index ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0 -z-10'
                  }`}
                  style={{ display: activeTestimonial === index ? 'block' : 'none' }}
                >
                  <div className="glass-card shadow-2xl p-6 md:p-10 h-full rounded-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
                      {testimonial.type === "video" && (
                        <div className="rounded-lg overflow-hidden relative shadow-xl">
                          <div className="pb-[56.25%] relative">
                            <img
                              src={testimonial.thumbnail}
                              alt={`${testimonial.name} success story video`}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-red-400 flex items-center justify-center shadow-2xl cursor-pointer hover:scale-105 transition-transform">
                              <svg className="h-8 w-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
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
                            alt={`${testimonial.name} success result`}
                            className="w-full rounded-lg shadow-xl"
                          />
                        </div>
                      )}
                      
                      <div className={testimonial.type === "text" && !testimonial.image ? "col-span-2" : ""}>
                        <div className="relative">
                          <svg className="absolute -top-10 -left-6 h-20 w-20 text-yellow-200/50" fill="currentColor" viewBox="0 0 32 32">
                            <path d="M10 8c-2.667 0-5 1.333-7 4 0.667-0.667 1.667-1 3-1 2 0 3.667 1.667 3.667 3.667 0 2.667-2 4.667-4.667 4.667-3.333 0-5-2.333-5-7 0-7.333 4.333-10.333 10-11.333v3c-2.333 0.667-4 1.333-5 3 1-0.333 2.333-0.667 3.667-0.667 2.333 0 4.333 1.333 4.333 3.667 0 2.667-2.333 4.667-5 4.667-3.333 0-5-2.333-5-7 0-7.333 4.333-10.333 10-11.333v3c-2.333 0.667-4 1.333-5 3 0.667-0.333 1.667-0.667 2.333-0.667z"></path>
                          </svg>
                          
                          <p className="text-2xl md:text-3xl font-serif italic mb-8 pl-4 text-gray-700">
                            {testimonial.content}
                          </p>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <img
                                src={testimonial.avatar}
                                alt={testimonial.name}
                                className="w-12 h-12 rounded-full mr-4 border-2 border-yellow-200"
                              />
                              
                              <div>
                                <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                                <p className="text-gray-500 text-sm">{testimonial.position}</p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="bg-gradient-to-r from-yellow-100 to-red-100 px-3 py-1 rounded-full text-xs font-bold text-gray-700 border border-yellow-300 mb-2">
                                {testimonial.achievement}
                              </div>
                              <div className="flex">
                                {renderStars(testimonial.rating)}
                              </div>
                            </div>
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
                  className={`w-4 h-4 rounded-full transition-all ${
                    activeTestimonial === index ? 'bg-gradient-to-r from-yellow-400 to-red-400 w-8' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => setActiveTestimonial(index)}
                />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <button className="btn-primary">
                View More Success Stories
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Products Section */}
        <div className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="uppercase tracking-wider text-yellow-500 font-semibold text-sm">Digital Products</span>
              
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 gradient-text">
                Transform Your Credit Knowledge
              </h2>
              
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Comprehensive guides and courses designed by DorTae Freeman to help you master credit improvement 
                and build lasting financial success.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product.id}>
                  <div className="glass-card h-full flex flex-col relative overflow-hidden border-2 border-yellow-200/30 card-hover rounded-2xl">
                    {product.popular && (
                      <div className="absolute -right-10 top-6 bg-gradient-to-r from-red-500 to-red-600 text-white px-10 py-1 transform rotate-45 z-10 text-sm font-bold shadow-lg">
                        {product.type === 'course' ? 'FEATURED' : 'BESTSELLER'}
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
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-800 flex-grow">{product.title}</h3>
                        <span className="bg-gradient-to-r from-yellow-100 to-red-100 px-2 py-1 rounded-full text-xs font-bold text-gray-700 border border-yellow-300 ml-2">
                          {product.tier}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 flex-grow">{product.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <span className="text-2xl font-bold gradient-text">{product.price}</span>
                          {product.originalPrice && (
                            <span className="text-gray-400 line-through ml-2">{product.originalPrice}</span>
                          )}
                        </div>
                        {product.originalPrice && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                            SAVE {Math.round((1 - parseFloat(product.price.replace('$', '')) / parseFloat(product.originalPrice.replace('$', ''))) * 100)}%
                          </span>
                        )}
                      </div>
                      
                      <button className="btn-primary w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={product.type === 'course' ? "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" : "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"} />
                        </svg>
                        {product.type === 'course' ? 'Enroll Now' : 'Get Guide'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <button className="btn-secondary border-2 border-red-500 text-red-600 hover:bg-red-50">
                View All Products
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Final CTA Section */}
        <div className="py-20 md:py-28 bg-gray-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ 
            backgroundImage: 'url(https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80)', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }}></div>
          
          {/* Decorative elements */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-400/0 blur-3xl floating-element"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-red-400/20 to-red-400/0 blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center bg-gradient-to-r from-yellow-400/20 to-red-400/20 px-6 py-3 rounded-full border border-yellow-400/30 mb-8">
                <svg className="w-6 h-6 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-lg font-bold text-yellow-300">🚀 Ready to Transform Your Credit?</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-bold mb-8">
                <span className="gradient-text">Begin Your Credit</span>
                <br />
                <span className="text-white">Transformation Today</span>
              </h2>
              
              <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
                Join over <strong className="text-yellow-400">2,500 successful clients</strong> who have 
                transformed their credit and secured their financial future with DorTae Freeman's proven strategies. 
                Your credit success story starts now.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
                <button className="btn-primary text-lg px-10 py-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Get Your Free Credit Assessment
                </button>
                
                <button className="border-2 border-white text-white font-semibold px-10 py-4 rounded-full text-lg hover:bg-white/10 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Talk to DorTae Freeman
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                {[
                  { number: "2500+", label: "Clients Transformed", icon: "👥" },
                  { number: "150+", label: "Average Score Increase", icon: "📈" },
                  { number: "95%", label: "Success Rate", icon: "🏆" }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl mb-2">{stat.icon}</div>
                    <div className="text-3xl font-bold gradient-text mb-1">
                      <AnimatedCounter value={stat.number.replace(/[^0-9]/g, '')} />
                      {stat.number.replace(/[0-9]/g, '')}
                    </div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="bg-white pt-16 pb-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-red-400 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-lg">CG</span>
                  </div>
                  <span className="font-bold text-lg text-gray-800">Credit Gyems Academy</span>
                </div>
                
                <p className="text-gray-600 mb-6 pr-8">
                  Transforming credit journeys and building lasting financial freedom through expert guidance, 
                  proven strategies, and personalized coaching with DorTae Freeman.
                </p>
                
                <div className="flex gap-4 mb-6">
                  {['Facebook', 'Instagram', 'LinkedIn', 'YouTube'].map((platform) => (
                    <a 
                      key={platform} 
                      href="#" 
                      className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-yellow-100 hover:text-yellow-500 transition-colors"
                    >
                      <div className="h-5 w-5 rounded-full bg-gray-400"></div>
                    </a>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-6">Services</h4>
                <ul className="space-y-4">
                  {['Credit Repair', 'Credit Coaching', 'Financial Planning', 'Consultation'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-gray-600 hover:text-yellow-500 transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-6">Products</h4>
                <ul className="space-y-4">
                  {['E-Books', 'Masterclasses', 'Resources', 'Community'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-gray-600 hover:text-yellow-500 transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-6">Company</h4>
                <ul className="space-y-4">
                  {['About', 'Blog', 'Testimonials', 'Contact'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-gray-600 hover:text-yellow-500 transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <hr className="my-10 border-gray-200" />
            
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} Credit Gyems Academy, LLC. All rights reserved.
              </p>
              
              <div className="flex gap-6 mt-4 md:mt-0">
                {['Privacy Policy', 'Terms of Service', 'Disclaimer'].map((item) => (
                  <a key={item} href="#" className="text-gray-500 hover:text-yellow-500 transition-colors text-sm">
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Homepage;
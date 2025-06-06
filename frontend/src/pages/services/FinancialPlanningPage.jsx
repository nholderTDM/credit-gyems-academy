import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  TrendingUp,
  PiggyBank,
  Target,
  Shield,
  Calculator,
  BarChart3,
  DollarSign,
  Home,
  GraduationCap,
  Heart,
  Briefcase,
  Users,
  ArrowRight,
  CheckCircle,
  Clock,
  Award,
  FileText,
  Calendar,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Star,
  Quote,
  Phone,
  Mail,
  Zap,
  Lock,
  Eye,
  Building2,
  Car,
  Plane,
  Gift,
  LineChart,
  PieChart,
  AlertCircle,
  Info
} from 'lucide-react';

const FinancialPlanningPage = () => {
  const navigate = useNavigate();
  const [setSelectedPlan] = useState('comprehensive');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [clientReviews, setClientReviews] = useState([]);
  const [calculatorValues, setCalculatorValues] = useState({
    currentAge: '',
    retirementAge: '',
    monthlyIncome: '',
    monthlySavings: '',
    currentSavings: ''
  });
  const [retirementProjection, setRetirementProjection] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    planningGoals: [],
    timeline: '',
    planType: 'comprehensive'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  // Financial planning services
  const planningServices = [
    {
      id: 'foundation',
      name: 'Foundation Planning',
      price: 497,
      duration: 'one-time',
      description: 'Essential financial planning for beginners',
      features: [
        'Financial health assessment',
        'Budget creation & optimization',
        'Debt reduction strategy',
        'Emergency fund planning',
        '3-month action plan',
        'Basic investment guidance',
        'Insurance needs analysis',
        '2 follow-up sessions'
      ],
      deliverables: [
        'Personalized financial report',
        'Budget spreadsheet template',
        'Debt payoff calculator'
      ],
      highlighted: false
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Planning',
      price: 1497,
      duration: '6 months',
      description: 'Complete financial transformation package',
      features: [
        'Full financial analysis',
        'Custom wealth building strategy',
        'Advanced tax planning',
        'Investment portfolio design',
        'Retirement planning',
        'Estate planning basics',
        'Monthly strategy sessions',
        'Quarterly reviews',
        'Priority email support',
        'Access to planning software'
      ],
      deliverables: [
        'Comprehensive financial plan',
        'Investment policy statement',
        'Tax optimization report',
        'Estate planning checklist'
      ],
      highlighted: true,
      popular: true
    },
    {
      id: 'wealth',
      name: 'Wealth Management',
      price: 2997,
      duration: '12 months',
      description: 'Premium wealth building and preservation',
      features: [
        'Executive financial planning',
        'Advanced investment strategies',
        'Business succession planning',
        'Complex tax strategies',
        'Multi-generational wealth planning',
        'Real estate investment guidance',
        'Alternative investments',
        'Weekly consultations available',
        '24/7 priority support',
        'Quarterly portfolio rebalancing',
        'Access to exclusive opportunities',
        'Family financial education'
      ],
      deliverables: [
        'Wealth management blueprint',
        'Family financial constitution',
        'Legacy planning documents',
        'Annual strategy updates'
      ],
      highlighted: false
    }
  ];

  // Planning goals
  const planningGoals = [
    { id: 'retirement', label: 'Retirement Planning', icon: PiggyBank },
    { id: 'home', label: 'Home Purchase', icon: Home },
    { id: 'education', label: 'Education Funding', icon: GraduationCap },
    { id: 'wealth', label: 'Wealth Building', icon: TrendingUp },
    { id: 'debt', label: 'Debt Freedom', icon: Lock },
    { id: 'business', label: 'Business Planning', icon: Briefcase },
    { id: 'estate', label: 'Estate Planning', icon: Shield },
    { id: 'tax', label: 'Tax Optimization', icon: Calculator },
    { id: 'insurance', label: 'Insurance Planning', icon: Heart },
    { id: 'investment', label: 'Investment Strategy', icon: LineChart }
  ];

  // Financial milestones
  const milestones = [
    {
      age: '20s',
      goals: ['Build emergency fund', 'Start investing', 'Establish credit'],
      icon: Zap
    },
    {
      age: '30s',
      goals: ['Buy first home', 'Increase retirement savings', 'Start 529 plans'],
      icon: Home
    },
    {
      age: '40s',
      goals: ['Maximize retirement accounts', 'Diversify investments', 'Estate planning'],
      icon: TrendingUp
    },
    {
      age: '50s',
      goals: ['Catch-up contributions', 'Long-term care planning', 'Legacy planning'],
      icon: Shield
    },
    {
      age: '60s+',
      goals: ['Retirement income strategy', 'Medicare planning', 'Wealth transfer'],
      icon: Gift
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: "What's included in a financial plan?",
      answer: "Our financial plans include a comprehensive analysis of your current financial situation, personalized strategies for achieving your goals, detailed action steps, investment recommendations, tax optimization strategies, and ongoing support to ensure successful implementation."
    },
    {
      question: "How is this different from working with a financial advisor?",
      answer: "We focus on education and empowerment. While traditional advisors often manage your money, we teach you how to manage it yourself while providing expert guidance. Our approach combines coaching, planning, and strategy without requiring you to hand over control of your assets."
    },
    {
      question: "Do I need a certain income or net worth?",
      answer: "No! Financial planning is valuable at any income level. We work with clients from all financial backgrounds and tailor our strategies to your specific situation. The earlier you start planning, the more powerful the results."
    },
    {
      question: "How long does it take to see results?",
      answer: "Many clients see immediate improvements in their cash flow and financial clarity. Longer-term goals like wealth building and retirement planning show significant progress within 6-12 months when following our strategies consistently."
    },
    {
      question: "Can you help with existing investments?",
      answer: "Yes! We'll review your current investments as part of your financial plan and provide recommendations for optimization. We focus on low-cost, diversified strategies that align with your goals and risk tolerance."
    },
    {
      question: "What if my situation changes?",
      answer: "Life changes, and your financial plan should too. All our packages include plan updates, and our Comprehensive and Wealth Management clients receive ongoing support to adjust strategies as needed."
    }
  ];

  useEffect(() => {
    fetchClientReviews();
  }, []);

  const fetchClientReviews = async () => {
    try {
      // Simulated reviews for demo
      const demoReviews = [
        {
          id: 1,
          name: "Robert Chen",
          location: "San Francisco, CA",
          achievement: "Retired 10 years early",
          text: "DorTae's financial planning changed everything. I went from living paycheck to paycheck to retiring at 55 with a paid-off home.",
          rating: 5,
          planType: "Comprehensive Planning"
        },
        {
          id: 2,
          name: "Maria Rodriguez",
          location: "Miami, FL",
          achievement: "Debt-free in 18 months",
          text: "The debt reduction strategy worked perfectly. I'm now investing the money I used to spend on payments!",
          rating: 5,
          planType: "Foundation Planning"
        },
        {
          id: 3,
          name: "James & Lisa Thompson",
          location: "Chicago, IL",
          achievement: "Built 7-figure portfolio",
          text: "The wealth management strategies transformed our finances. Our kids' college is funded and retirement is secure.",
          rating: 5,
          planType: "Wealth Management"
        }
      ];
      setClientReviews(demoReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/financial-planning/inquiries', {
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
          planningGoals: [],
          timeline: '',
          planType: 'comprehensive'
        });
        
        // Redirect to booking page after 2 seconds
        setTimeout(() => {
          navigate('/booking?service=financial-planning');
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

  const handleGoalToggle = (goalId) => {
    setFormData(prev => ({
      ...prev,
      planningGoals: prev.planningGoals.includes(goalId)
        ? prev.planningGoals.filter(id => id !== goalId)
        : [...prev.planningGoals, goalId]
    }));
  };

  const calculateRetirement = () => {
    const { currentAge, retirementAge, monthlySavings, currentSavings } = calculatorValues;
    
    if (!currentAge || !retirementAge || !monthlySavings) {
      alert('Please fill in all fields');
      return;
    }

    const yearsToRetirement = parseInt(retirementAge) - parseInt(currentAge);
    const monthlyContribution = parseFloat(monthlySavings);
    const startingBalance = parseFloat(currentSavings) || 0;
    const annualReturn = 0.07; // 7% average return
    const monthlyReturn = annualReturn / 12;
    const months = yearsToRetirement * 12;

    // Future value calculation
    const futureValue = startingBalance * Math.pow(1 + annualReturn, yearsToRetirement) +
      monthlyContribution * ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn);

    // Monthly retirement income (4% rule)
    const monthlyRetirementIncome = (futureValue * 0.04) / 12;

    setRetirementProjection({
      totalSaved: Math.round(futureValue),
      monthlyIncome: Math.round(monthlyRetirementIncome),
      yearsToRetirement
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-[#0A2342] to-black text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/10 to-[#26A69A]/10"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#FFD700]/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#26A69A]/20 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-[#26A69A]/20 rounded-full mb-6">
                <Target className="h-4 w-4 text-[#26A69A] mr-2" />
                <span className="text-sm font-medium text-[#26A69A]">Your Financial Future Starts Here</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                Strategic Financial Planning for
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#26A69A]">
                  Life-Changing Results
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8">
                Build wealth, achieve financial freedom, and create the life you deserve with personalized planning from DorTae Freeman.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
                >
                  Start Planning Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button 
                  onClick={() => document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
                >
                  <Calculator className="mr-2 h-5 w-5" />
                  Retirement Calculator
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-[#FFD700]">$2.8M</div>
                  <div className="text-sm text-gray-400">Avg. Retirement Saved</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#FFD700]">8 Years</div>
                  <div className="text-sm text-gray-400">Earlier Retirement</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#FFD700]">326%</div>
                  <div className="text-sm text-gray-400">Avg. Net Worth Increase</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold mb-6">Financial Milestones by Age</h3>
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex items-start">
                      <div className="h-10 w-10 bg-[#FFD700]/20 rounded-full flex items-center justify-center mr-4">
                        <milestone.icon className="h-5 w-5 text-[#FFD700]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">In Your {milestone.age}</h4>
                        <p className="text-sm text-gray-300">
                          {milestone.goals.join(' • ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Plan Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Financial Planning Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We create personalized strategies for every aspect of your financial life
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planningGoals.map((goal) => (
              <div key={goal.id} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group">
                <div className="flex items-start">
                  <div className="h-12 w-12 bg-gradient-to-r from-[#FFD700]/20 to-[#26A69A]/20 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <goal.icon className="h-6 w-6 text-[#26A69A]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{goal.label}</h3>
                    <p className="text-sm text-gray-600">
                      Expert strategies tailored to your specific goals and timeline
                    </p>
                  </div>
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
              Choose Your Financial Planning Package
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional guidance tailored to your needs and goals
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {planningServices.map((service) => (
              <div
                key={service.id}
                className={`relative rounded-2xl overflow-hidden transition-all ${
                  service.highlighted 
                    ? 'shadow-2xl scale-105' 
                    : 'shadow-lg hover:shadow-xl'
                }`}
              >
                {service.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white text-center py-2 text-sm font-semibold">
                    MOST COMPREHENSIVE
                  </div>
                )}
                
                <div className={`p-8 ${service.highlighted ? 'pt-12' : ''} ${
                  service.highlighted 
                    ? 'bg-gradient-to-br from-gray-900 to-[#0A2342] text-white' 
                    : 'bg-white'
                }`}>
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
                  </div>
                  
                  <div className="mb-8">
                    <h4 className={`font-semibold mb-4 ${service.highlighted ? 'text-[#FFD700]' : 'text-gray-900'}`}>
                      What's Included:
                    </h4>
                    <ul className="space-y-3 mb-6">
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
                    
                    <h4 className={`font-semibold mb-3 ${service.highlighted ? 'text-[#FFD700]' : 'text-gray-900'}`}>
                      Deliverables:
                    </h4>
                    <ul className="space-y-2">
                      {service.deliverables.map((deliverable, index) => (
                        <li key={index} className="flex items-center">
                          <FileText className={`h-4 w-4 mr-2 ${
                            service.highlighted ? 'text-[#26A69A]' : 'text-[#26A69A]'
                          }`} />
                          <span className={`text-sm ${service.highlighted ? 'text-gray-300' : 'text-gray-600'}`}>
                            {deliverable}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedPlan(service.id);
                      setFormData(prev => ({ ...prev, planType: service.id }));
                      document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      service.highlighted
                        ? 'bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white hover:opacity-90'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    Get Started
                  </button>
                </div>
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
              Retirement Planning Calculator
            </h2>
            <p className="text-xl text-gray-600">
              See how much you could have saved for retirement
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Age
                </label>
                <input
                  type="number"
                  value={calculatorValues.currentAge}
                  onChange={(e) => setCalculatorValues(prev => ({ ...prev, currentAge: e.target.value }))}
                  placeholder="30"
                  min="18"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retirement Age
                </label>
                <input
                  type="number"
                  value={calculatorValues.retirementAge}
                  onChange={(e) => setCalculatorValues(prev => ({ ...prev, retirementAge: e.target.value }))}
                  placeholder="65"
                  min="50"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Savings
                </label>
                <input
                  type="number"
                  value={calculatorValues.monthlySavings}
                  onChange={(e) => setCalculatorValues(prev => ({ ...prev, monthlySavings: e.target.value }))}
                  placeholder="500"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Savings (Optional)
                </label>
                <input
                  type="number"
                  value={calculatorValues.currentSavings}
                  onChange={(e) => setCalculatorValues(prev => ({ ...prev, currentSavings: e.target.value }))}
                  placeholder="10000"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              onClick={calculateRetirement}
              className="w-full py-3 bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Calculate Retirement Savings
            </button>
            
            {retirementProjection && (
              <div className="mt-8 p-6 bg-gradient-to-r from-[#FFD700]/10 to-[#26A69A]/10 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Retirement Projection</h3>
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-[#26A69A]">
                      ${retirementProjection.totalSaved.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Saved at Retirement</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#FFD700]">
                      ${retirementProjection.monthlyIncome.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Monthly Retirement Income</div>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-600 mt-4">
                  Based on {retirementProjection.yearsToRetirement} years of saving with 7% average annual return
                </p>
              </div>
            )}
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  This calculator provides estimates based on average market returns. Your actual results may vary. 
                  Schedule a consultation for a personalized retirement plan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Client Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real results from real people who transformed their financial futures
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {clientReviews.map((review) => (
              <div key={review.id} className="bg-gray-50 rounded-xl p-8">
                <div className="flex items-center mb-4">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="h-5 w-5 text-[#FFD700] fill-current" />
                  ))}
                </div>
                
                <Quote className="h-8 w-8 text-gray-300 mb-4" />
                
                <p className="text-gray-600 mb-6 italic">"{review.text}"</p>
                
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold text-gray-900">{review.name}</p>
                      <p className="text-sm text-gray-500">{review.location}</p>
                    </div>
                    <Award className="h-8 w-8 text-[#26A69A]" />
                  </div>
                  
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Achievement</p>
                    <p className="font-semibold text-[#26A69A]">{review.achievement}</p>
                    <p className="text-xs text-gray-500 mt-2">Plan: {review.planType}</p>
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
              Start Your Financial Transformation
            </h2>
            <p className="text-xl text-gray-600">
              Schedule your free financial planning consultation
            </p>
          </div>
          
          {showThankYou ? (
            <div className="bg-green-50 rounded-xl p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-gray-600">
                We've received your request and will contact you within 24 hours to schedule your consultation.
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
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  What are your financial planning goals? (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {planningGoals.slice(0, 6).map((goal) => (
                    <label
                      key={goal.id}
                      className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.planningGoals.includes(goal.id)
                          ? 'border-[#26A69A] bg-[#26A69A]/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.planningGoals.includes(goal.id)}
                        onChange={() => handleGoalToggle(goal.id)}
                        className="sr-only"
                      />
                      <goal.icon className={`h-5 w-5 mr-2 ${
                        formData.planningGoals.includes(goal.id) ? 'text-[#26A69A]' : 'text-gray-400'
                      }`} />
                      <span className="text-sm">{goal.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeline for Goals
                  </label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                  >
                    <option value="">Select timeline</option>
                    <option value="immediate">Immediate (0-6 months)</option>
                    <option value="short">Short-term (6-24 months)</option>
                    <option value="medium">Medium-term (2-5 years)</option>
                    <option value="long">Long-term (5+ years)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Planning Package
                  </label>
                  <select
                    name="planType"
                    value={formData.planType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                  >
                    <option value="foundation">Foundation Planning</option>
                    <option value="comprehensive">Comprehensive Planning</option>
                    <option value="wealth">Wealth Management</option>
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
                    Schedule Free Consultation
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                <Lock className="inline h-4 w-4 mr-1" />
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
              Get answers to common questions about financial planning
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
      <section className="py-20 bg-gradient-to-r from-[#FFD700] to-[#26A69A] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Your Financial Freedom Awaits
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Take control of your financial future with expert guidance and proven strategies
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              View Planning Packages
            </button>
            <a
              href="tel:1-800-WEALTH"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-colors flex items-center justify-center"
            >
              <Phone className="mr-2 h-5 w-5" />
              Call 1-800-WEALTH
            </a>
          </div>
          <p className="text-sm mt-8 opacity-75">
            <Shield className="inline h-4 w-4 mr-1" />
            Fiduciary standard • Fee transparency • Your success is our priority
          </p>
        </div>
      </section>
    </div>
  );
};

export default FinancialPlanningPage;
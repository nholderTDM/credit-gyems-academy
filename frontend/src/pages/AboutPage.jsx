import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award,
  Users,
  Target,
  Heart,
  Star,
  CheckCircle,
  ArrowRight,
  Calendar,
  Trophy,
  Briefcase,
  BookOpen,
  TrendingUp,
  Shield,
  Globe,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Play,
  Quote,
  Building2,
  GraduationCap,
  Zap,
  BarChart3
} from 'lucide-react';

const AboutPage = () => {
  const [stats, setStats] = useState({
    clientsHelped: 0,
    creditPointsImproved: 0,
    yearsExperience: 0,
    successRate: 0
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [mediaFeatures, setMediaFeatures] = useState([]);

  // Animated counter effect
  useEffect(() => {
    const animateValue = (start, end, duration, setter) => {
      const range = end - start;
      let current = start;
      const increment = end > start ? 1 : -1;
      const stepTime = Math.abs(Math.floor(duration / range));
      
      const timer = setInterval(() => {
        current += increment * (range > 100 ? Math.ceil(range / 100) : 1);
        if ((increment === 1 && current >= end) || (increment === -1 && current <= end)) {
          current = end;
          clearInterval(timer);
        }
        setter(current);
      }, stepTime);
    };

    // Animate stats
    animateValue(0, 5000, 2000, (value) => setStats(prev => ({ ...prev, clientsHelped: value })));
    animateValue(0, 750000, 2000, (value) => setStats(prev => ({ ...prev, creditPointsImproved: value })));
    animateValue(0, 15, 2000, (value) => setStats(prev => ({ ...prev, yearsExperience: value })));
    animateValue(0, 98, 2000, (value) => setStats(prev => ({ ...prev, successRate: value })));

    // Fetch team members
    fetchTeamMembers();
    fetchMediaFeatures();
  }, []);

  const fetchTeamMembers = async () => {
    // Simulated team data
    const demoTeam = [
      {
        id: 1,
        name: "DorTae Freeman",
        role: "Founder & CEO",
        bio: "Credit repair expert with 15+ years of experience helping thousands achieve financial freedom.",
        image: null,
        linkedin: "#",
        twitter: "#"
      },
      {
        id: 2,
        name: "Sarah Johnson",
        role: "Head of Credit Analysis",
        bio: "Certified credit counselor specializing in complex credit situations and dispute resolution.",
        image: null,
        linkedin: "#"
      },
      {
        id: 3,
        name: "Michael Chen",
        role: "Financial Planning Director",
        bio: "CFP® professional focused on helping clients build long-term wealth and financial security.",
        image: null,
        linkedin: "#"
      },
      {
        id: 4,
        name: "Jessica Williams",
        role: "Client Success Manager",
        bio: "Dedicated to ensuring every client achieves their credit goals with personalized support.",
        image: null,
        linkedin: "#"
      }
    ];
    setTeamMembers(demoTeam);
  };

  const fetchMediaFeatures = async () => {
    // Simulated media features
    const demoMedia = [
      { id: 1, outlet: "Forbes", title: "Top Credit Repair Experts to Watch", logo: null },
      { id: 2, outlet: "CNBC", title: "Breaking Down Credit Myths", logo: null },
      { id: 3, outlet: "The Wall Street Journal", title: "Credit Repair Industry Leaders", logo: null },
      { id: 4, outlet: "Business Insider", title: "Financial Freedom Through Credit Repair", logo: null }
    ];
    setMediaFeatures(demoMedia);
  };

  const values = [
    {
      icon: Heart,
      title: "Client-First Approach",
      description: "Your success is our priority. We're committed to delivering personalized solutions that work."
    },
    {
      icon: Shield,
      title: "Integrity & Transparency",
      description: "We operate with complete honesty, providing clear expectations and ethical practices."
    },
    {
      icon: Target,
      title: "Results-Driven",
      description: "We measure our success by your results, focusing on real improvements to your credit."
    },
    {
      icon: BookOpen,
      title: "Education & Empowerment",
      description: "We believe in teaching you how to maintain excellent credit for life."
    }
  ];

  const milestones = [
    { year: 2009, event: "Founded Credit Gyems Academy", description: "Started with a mission to democratize credit repair" },
    { year: 2012, event: "1,000th Client Success Story", description: "Reached our first major milestone in transforming lives" },
    { year: 2015, event: "Launched Digital Platform", description: "Expanded services nationwide through technology" },
    { year: 2018, event: "Industry Recognition", description: "Named Top Credit Repair Service by multiple publications" },
    { year: 2020, event: "Community Impact Award", description: "Recognized for financial literacy initiatives" },
    { year: 2024, event: "5,000+ Lives Changed", description: "Continuing to grow and help more people achieve financial freedom" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-gray-900 to-[#0A2342] text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/10 to-[#FF0000]/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700]/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FF0000]/20 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Transforming Credit,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FF0000]">
                Changing Lives
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Learn about our journey, mission, and the passionate team dedicated to helping you achieve financial freedom through credit excellence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/services"
                className="px-8 py-4 bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
              >
                Explore Our Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center">
                <Play className="mr-2 h-5 w-5" />
                Watch Our Story
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 -mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-[#FFD700]">{stats.clientsHelped.toLocaleString()}+</div>
                <div className="text-gray-600 mt-2">Clients Helped</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#FFD700]">{stats.creditPointsImproved.toLocaleString()}+</div>
                <div className="text-gray-600 mt-2">Credit Points Improved</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#FFD700]">{stats.yearsExperience}+</div>
                <div className="text-gray-600 mt-2">Years Experience</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#FFD700]">{stats.successRate}%</div>
                <div className="text-gray-600 mt-2">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Meet DorTae Freeman
              </h2>
              <div className="prose prose-lg text-gray-600">
                <p className="mb-4">
                  With over 15 years of experience in credit repair and financial services, DorTae Freeman founded Credit Gyems Academy with a simple mission: to make professional credit repair accessible to everyone.
                </p>
                <p className="mb-4">
                  "I've seen firsthand how bad credit can hold people back from their dreams - whether it's buying a home, starting a business, or simply feeling financially secure. That's why I dedicated my career to helping people take control of their credit and their future."
                </p>
                <p className="mb-6">
                  Today, Credit Gyems Academy has helped over 5,000 clients improve their credit scores, remove millions in negative items, and achieve their financial goals.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-[#FFD700] mr-2" />
                  <span className="text-sm text-gray-600">Certified Credit Counselor</span>
                </div>
                <div className="flex items-center">
                  <GraduationCap className="h-5 w-5 text-[#FFD700] mr-2" />
                  <span className="text-sm text-gray-600">Financial Planning Expert</span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 text-[#FFD700] mr-2" />
                  <span className="text-sm text-gray-600">Industry Leader</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-[#FFD700] transition-colors">
                  <Linkedin className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#FFD700] transition-colors">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#FFD700] transition-colors">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#FFD700] transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-r from-[#FFD700] to-[#FF0000] rounded-2xl p-1">
                <div className="bg-gray-50 rounded-2xl p-8">
                  <Quote className="h-12 w-12 text-[#FFD700] mb-4" />
                  <p className="text-xl text-gray-800 italic mb-4">
                    "Your credit score doesn't define you, but improving it can open doors you never thought possible. Let us help you unlock your potential."
                  </p>
                  <p className="text-gray-600 font-semibold">- DorTae Freeman, Founder & CEO</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Mission & Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're driven by a commitment to transform lives through credit repair, financial education, and personalized support.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="h-16 w-16 bg-gradient-to-r from-[#FFD700] to-[#FF0000] rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Our Expert Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dedicated professionals committed to your credit success
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
                <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                  {member.image ? (
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="h-24 w-24 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-[#FF0000] font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                  
                  <div className="flex gap-3">
                    {member.linkedin && (
                      <a href={member.linkedin} className="text-gray-400 hover:text-[#FFD700] transition-colors">
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {member.twitter && (
                      <a href={member.twitter} className="text-gray-400 hover:text-[#FFD700] transition-colors">
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From humble beginnings to industry leader
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200"></div>
            
            {milestones.map((milestone, index) => (
              <div key={index} className={`relative flex items-center mb-12 ${
                index % 2 === 0 ? 'justify-start' : 'justify-end'
              }`}>
                <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="text-[#FFD700] font-bold text-xl mb-2">{milestone.year}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{milestone.event}</h3>
                    <p className="text-gray-600 text-sm">{milestone.description}</p>
                  </div>
                </div>
                
                <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center z-10">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured In
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Recognized by leading financial publications
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {mediaFeatures.map((feature) => (
              <div key={feature.id} className="bg-white rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
                {feature.logo ? (
                  <img src={feature.logo} alt={feature.outlet} className="h-12 mx-auto mb-4" />
                ) : (
                  <div className="h-12 flex items-center justify-center mb-4">
                    <Building2 className="h-10 w-10 text-gray-400" />
                  </div>
                )}
                <p className="font-semibold text-gray-900">{feature.outlet}</p>
                <p className="text-sm text-gray-600 mt-2">{feature.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Credit Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands who've transformed their financial future with Credit Gyems Academy
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/services"
              className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              View Our Services
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
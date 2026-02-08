"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  DocumentCheckIcon,
  ArrowRightIcon,
  BuildingOffice2Icon,
  KeyIcon,
  UserGroupIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: ShieldCheckIcon,
      title: "Enterprise Security",
      description: "Bank-level encryption for all your business documents and data",
      color: "blue"
    },
    {
      icon: LockClosedIcon,
      title: "Secure Access Control",
      description: "Role-based permissions and multi-factor authentication",
      color: "green"
    },
    {
      icon: DocumentCheckIcon,
      title: "Compliance Ready",
      description: "Built-in compliance for regulations like GDPR, HIPAA, SOC2",
      color: "purple"
    },
    {
      icon: BuildingOffice2Icon,
      title: "Business Management",
      description: "Manage multiple businesses under one secure platform",
      color: "orange"
    },
    {
      icon: KeyIcon,
      title: "API Integration",
      description: "Seamless integration with your existing systems",
      color: "pink"
    },
    {
      icon: UserGroupIcon,
      title: "Team Collaboration",
      description: "Secure document sharing and team management",
      color: "cyan"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechCorp Inc",
      content: "TrustLayer revolutionized how we manage business documents. 100% secure and incredibly easy to use.",
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "CFO, Global Solutions",
      content: "The compliance features alone saved us months of audit preparation. Highly recommended!",
      avatar: "MC"
    },
    {
      name: "Alex Rodriguez",
      role: "CTO, StartupXYZ",
      content: "API integration was seamless. Our developers love the clean documentation.",
      avatar: "AR"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <motion.div 
              animate={{ 
                rotate: [0, 10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="relative"
            >
              <div className="relative h-16 w-auto">
                <img 
                  src="/logoo.png" 
                  alt="TrustLayer" 
                  className="h-16 w-auto"
                />
              </div>
            </motion.div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                TrustLayer
              </span>
              <span className="text-xs text-gray-400 font-medium">
                Secure Business Platform
              </span>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <button 
              onClick={() => router.push("/login")}
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/register")}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/20"
            >
              Get Started Free
            </motion.button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
              Secure Business
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Management Platform
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
          >
            TrustLayer provides enterprise-grade security for your business operations, 
            document management, and API integrations. Built for compliance, designed for scale.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/register")}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl text-lg font-semibold transition-all duration-200 shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3"
            >
              Start Free Trial
              <ArrowRightIcon className="h-5 w-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/login")}
              className="px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 rounded-xl text-lg font-semibold transition-all duration-200 border border-gray-600/50"
            >
              Sign In to Dashboard
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Everything You Need, Secured</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Comprehensive security features designed for modern businesses
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300"
            >
              <div className={`inline-flex p-4 bg-${feature.color}-500/20 rounded-2xl mb-6`}>
                <feature.icon className={`h-8 w-8 text-${feature.color}-400`} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Trusted by Businesses Worldwide</h2>
          <p className="text-gray-400 text-lg">Join thousands of satisfied customers</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-300 italic">"{testimonial.content}"</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-cyan-500/20 backdrop-blur-sm rounded-3xl p-12 text-center border border-blue-500/30"
        >
          <h2 className="text-4xl font-bold mb-6">Ready to Secure Your Business?</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of businesses that trust us with their most sensitive operations
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/register")}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl text-lg font-semibold transition-all duration-200 shadow-2xl shadow-blue-500/30"
            >
              Start Free Trial - No Credit Card
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/login")}
              className="px-8 py-4 bg-transparent border-2 border-blue-500/50 hover:border-blue-400 rounded-xl text-lg font-semibold transition-all duration-200"
            >
              Schedule a Demo
            </motion.button>
          </div>
          
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              "No credit card required",
              "14-day free trial",
              "24/7 support",
              "SOC2 compliant"
            ].map((item, index) => (
              <div key={item} className="flex items-center justify-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-gray-800/50">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <img 
              src="/logoo.png" 
              alt="TrustLayer" 
              className="h-10 w-auto"
            />
            <div>
              <span className="text-lg font-bold">TrustLayer</span>
              <p className="text-xs text-gray-400">Secure Business Platform</p>
            </div>
          </div>
          
          <div className="flex gap-6 text-gray-400 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
          </div>
        </div>
        
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} TrustLayer. All rights reserved.</p>
          <p className="mt-2">Enterprise-grade security for modern businesses</p>
        </div>
      </footer>
    </div>
  );
}
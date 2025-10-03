"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap,
  Shield,
  Globe,
  Users,
  MapPin,
  Star,
  Calendar,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";

const features = [
  {
    icon: Zap,
    label: "AI-Powered Planning",
    description:
      "Personalized itineraries crafted by AI based on your preferences",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Shield,
    label: "Budget Control",
    description: "Clear cost estimates across different budget tiers",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Globe,
    label: "Local Insights",
    description: "Authentic recommendations for food, culture, and hidden gems",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users,
    label: "Group Planning",
    description: "Collaborate with friends and family in real-time",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: MapPin,
    label: "Interactive Maps",
    description: "Visual journey planning with state-wise exploration",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: Star,
    label: "Community Recommendations",
    description:
      "Community-driven suggestions for off-the-beaten-path experiences",
    gradient: "from-orange-500 to-purple-500",
  },
];

const Features: React.FC = () => {
  return (
    <>
      <motion.div
        id="features"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className=" sm:space-y-12  sm:py-16 sm:mt-70 relative"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="text-center space-y-2">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white"
          >
            Why Choose{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-400">
              Itinerarly
            </span>
            ?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-lg text-gray-300 max-w-3xl mx-auto"
          >
            Experience the future of travel planning with our cutting-edge
            features designed to make your Indian adventure unforgettable
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              whileHover={{
                scale: 1.03,
                y: -5,
                transition: { duration: 0.2 },
              }}
              className="group relative bg-white/5 backdrop-blur-lg p-6 sm:p-8 rounded-3xl border border-white/10 hover:border-white/30 transition-all duration-500 hover:shadow-2xl hover:shadow-white/10 overflow-hidden"
            >
              {/* Background glow effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
              />

              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-4">
                  <div
                    className={`p-3 sm:p-4 bg-gradient-to-br ${feature.gradient} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                    {feature.label}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

       

      </motion.div>
    </>
  );
};

export default Features;

"use client";
import BackToTop from "@/components/ui/BackToTop"
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";

const Home: React.FC = () => {
  return (
    <>
    {/* Adding universal BackToTop Button */}
    <BackToTop />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center sm:space-y-8 pt-4 sm:pt-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center justify-center space-x-3 mb-6"
        >
          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-purple-400"></div>
          <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-green-400"></div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-4xl sm:text-8xl md:text-8xl lg:text-7xl font-bold tracking-tight leading-tight drop-shadow-[2px_2px_6px_rgba(0,0,0,0.6)]"
        >
          Welcome to{" "}
          <span className="relative">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-green-400 animate-gradient">
              Itinerarly
            </span>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-purple-400 rounded-full"
            />
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="hidden sm:block text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed font-light max-w-4xl mx-auto text-slate-50 bg-black/50 px-4 py-2 rounded-lg"
        >
          Your intelligent and{" "}
          <span className="relative text-green-400 font-semibold drop-shadow-[1px_1px_4px_rgba(0,0,0,0.7)]">
            personalized
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-orange-400 rounded-full"
            />
          </span>{" "}
          travel companion for exploring the diverse landscapes and rich
          cultural heritage of India.
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/30 via-emerald-500/30 to-indigo-500/30 rounded-2xl opacity-0 group-hover:opacity-60 transition-all duration-300"></div>

            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400/40 via-emerald-400/40 to-indigo-400/40 rounded-2xl animate-pulse opacity-20"></div>

            <Link
              href="/start"
              className="relative inline-flex items-center space-x-3 px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-orange-600 via-emerald-600 to-indigo-600 rounded-2xl border-2 border-white/30 hover:border-white/50 transition-all duration-300 hover:shadow-xl backdrop-blur-sm min-w-[320px] justify-center group overflow-hidden shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-800 ease-in-out"></div>

              <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="absolute top-3 right-4 w-1.5 h-1.5 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
              <div className="absolute bottom-3 left-4 w-1 h-1 bg-orange-200/80 rounded-full opacity-0 group-hover:opacity-100 animate-ping delay-200"></div>

              <Sparkles className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300 relative z-10 drop-shadow-sm" />
              <span className="relative z-10 tracking-wide drop-shadow-sm">
                Start Your Journey
              </span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300 relative z-10 drop-shadow-sm" />
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Home;

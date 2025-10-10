"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      if (window.scrollY > 300) setIsVisible(true);
      else setIsVisible(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const button = (
    <motion.button
      onClick={scrollToTop}
      initial={{ opacity: 0, scale: 0.7, y: 30 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.7,
        y: isVisible ? 0 : 30,
      }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-6 right-6 z-[999999] p-4 rounded-full bg-gradient-to-r from-orange-500/80 to-purple-500/80 shadow-lg shadow-orange-500/20 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 text-white"
      aria-label="Back to top"
    >
      <ArrowUp className="w-5 h-5" />
    </motion.button>
  );

  if (!mounted) return null;

  return createPortal(button, document.body);
}

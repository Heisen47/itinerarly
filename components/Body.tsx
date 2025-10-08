import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  LoaderCircle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Globe,
  MapPin,
  Star,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Home from "./Home";
import About from "./About";
import Features from "./Features";

const stats = [
  { number: "5", label: "Happy Travelers" },
  { number: "7+", label: "Destinations" },
  { number: "98%", label: "Satisfaction Rate" },
];

interface BodyProps {
  sectionRefs: Array<{ ref: (node?: Element | null) => void }>;
  sections: Array<{
    id: string;
    title: string;
    description: string;
    places: string[];
  }>;
}

const communityImages = [
  {
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
    title: "Serene Mountain Views",
    location: "Himachal Pradesh",
  },
  {
    url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    title: "Pristine Beach Paradise",
    location: "Goa",
  },
  {
    url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
    title: "Historic Architecture",
    location: "Uttar Pradesh",
  },
  {
    url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    title: "Cultural Heritage",
    location: "Kerala",
  },
  {
    url: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80",
    title: "Urban Adventures",
    location: "Mumbai",
  },
];

const Body: React.FC<BodyProps> = ({ sectionRefs, sections }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [showFloatingElements, setShowFloatingElements] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isLowEndDevice: false,
    supportsWebM: false,
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) =>
        prev === communityImages.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFloatingElements(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const scrollToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === communityImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? communityImages.length - 1 : prev - 1
    );
  };

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const opacity1 = useTransform(scrollYProgress, [0.5, 1], [1, 0]);
  const opacity2 = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
  const opacity3 = useTransform(scrollYProgress, [0.5, 1], [0, 1]);

  return (
    <div className="relative overflow-hidden">
      {!isMobile ? (
        <div ref={containerRef} className="relative w-full h-[300vh]">
          <motion.div
            style={{ opacity: opacity1 }}
            className="fixed inset-0 -z-10"
          >
            <Image
              src="/assets/pic1.webp"
              alt="Background 1"
              fill
              className="object-cover blur-sm"
              priority
            />
          </motion.div>

          <motion.div
            style={{ opacity: opacity2 }}
            className="fixed inset-0 -z-10"
          >
            <Image
              src="/assets/pic2.webp"
              alt="Background 2"
              fill
              className="object-cover blur-sm"
            />
          </motion.div>

          <motion.div
            style={{ opacity: opacity3 }}
            className="fixed inset-0 -z-10"
          >
            <Image
              src="/assets/pic3.webp"
              alt="Background 3"
              fill
              className="object-cover blur-sm"
            />
          </motion.div>

          <div className="relative z-10 text-white pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-12 sm:space-y-16 lg:space-y-20">
              <section className="h-screen flex justify-center pt-6">
                <Home />
              </section>
              <section className="h-screen flex items-center justify-center pt-6">
                <About />
              </section>
              <section className="h-screen flex items-center justify-center pt-6">
                <Features />
              </section>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative min-h-screen">
          <div className="fixed inset-0 z-0">
            <motion.div
              style={{ opacity: opacity1 }}
              className="absolute inset-0"
            >
              <Image
                src="/assets/pic1.webp"
                alt="Background 1"
                fill
                className="object-cover object-center blur-sm"
                priority
                quality={85}
                sizes="100vw"
              />
            </motion.div>
            <motion.div
              style={{ opacity: opacity2 }}
              className="absolute inset-0"
            >
              <Image
                src="/assets/pic2.webp"
                alt="Background 2"
                fill
                className="object-cover object-center blur-sm"
                quality={85}
                sizes="100vw"
              />
            </motion.div>
            <motion.div
              style={{ opacity: opacity3 }}
              className="absolute inset-0"
            >
              <Image
                src="/assets/pic3.webp"
                alt="Background 3"
                fill
                className="object-cover object-center blur-sm"
                quality={85}
                sizes="100vw"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          </div>

          <div className="relative z-10 text-white">
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-16">
              <section className="min-h-screen flex items-center justify-center py-8">
                <Home />
              </section>
              <section className="min-h-screen flex items-center justify-center py-8">
                <About />
              </section>
              <section className="min-h-screen flex items-center justify-center py-8">
                <Features />
              </section>
            </div>
          </div>
        </div>
      )}

      {showFloatingElements && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
          <div className="absolute top-20 left-10 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-ping" />
          <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" />
        </div>
      )}

      <div className="relative z-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-8 sm:space-y-10 lg:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="space-y-8 sm:space-y-12 relative z-30"
        >
          <div className="space-y-4 mt-8 sm:mt-110 lg:mt-110 text-center text-lg sm:text-xl md:text-2xl font-semibold text-white relative z-10">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Community{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">
                Highlights
              </span>
            </h3>

            <p className="text-base sm:text-lg text-slate-100 max-w-2xl mx-auto px-4">
              Discover breathtaking destinations through the eyes of our travel
              community
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="pt-4 relative z-40"
            >
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-center sm:space-y-0 sm:space-x-4 px-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto relative z-50"
                >
                  <a
                    href="https://imgur.com/upload"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-center space-x-3 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600/80 to-orange-600/80 backdrop-blur-sm rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 relative overflow-hidden w-full sm:w-auto sm:min-w-[220px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300 relative z-10" />
                    <span className="relative z-10">
                      Share Your Travel Photos
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
                  </a>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto relative z-50"
                >
                  <button
                    onClick={() => {
                      window.open(
                        "https://docs.google.com/forms/d/e/1FAIpQLSex2El_Ag0yKlqho5a4bgoHYvJLfFF0zbcfBnyneJQjb607YA/viewform?usp=dialog",
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }}
                    className="group inline-flex items-center justify-center space-x-3 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-600/80 to-blue-600/80 backdrop-blur-sm rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 relative overflow-hidden w-full sm:w-auto sm:min-w-[220px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Star className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 relative z-10" />
                    <span className="relative z-10">Submit Imgur Link</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
                  </button>
                </motion.div>
              </div>
              <p className="text-xs text-white mt-3 px-4">
                Upload to Imgur and share your incredible India moments with our
                community
              </p>
            </motion.div>
          </div>

          {/* Image Carousel Section */}
          <div className="relative w-full max-w-6xl mx-auto px-4 z-30">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${currentImageIndex * 100}%)`,
                }}
              >
                {communityImages.map((img, idx) => (
                  <div key={idx} className="w-full flex-shrink-0 relative">
                    <Image
                      src={img.url}
                      alt={img.title}
                      width={800}
                      height={500}
                      className="w-full h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] object-cover object-center"
                      loading={idx === 0 ? "eager" : "lazy"}
                      priority={idx === 0}
                      quality={90}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, 800px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 text-white">
                      <h4 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">
                        {img.title}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs sm:text-sm md:text-base text-gray-200">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{img.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={prevImage}
                className="flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 sm:p-3 transition-all duration-300 items-center justify-center backdrop-blur-md border border-white/20 hover:scale-110 z-40"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </button>

              <button
                onClick={nextImage}
                className="flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 sm:p-3 transition-all duration-300 items-center justify-center backdrop-blur-md border border-white/20 hover:scale-110 z-40"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </button>
            </div>

            <div className="flex justify-center space-x-2 sm:space-x-3 mt-4 sm:mt-6 md:mt-8">
              {communityImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToImage(idx)}
                  className={`transition-all duration-300 rounded-full z-40 relative ${
                    idx === currentImageIndex
                      ? "w-6 sm:w-8 h-2 sm:h-3 bg-white scale-110"
                      : "w-2 sm:w-3 h-2 sm:h-3 bg-white/40 hover:bg-white/60 hover:scale-110"
                  }`}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>

            <div className="sm:hidden flex justify-center mt-4">
              <div className="flex items-center space-x-3 text-xs text-gray-300 bg-black/30 px-3 py-2 rounded-full backdrop-blur-sm border border-white/20">
                <Calendar className="w-3 h-3" />
                <span>Use arrows to explore destinations</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center space-y-6 pt-8 sm:pt-12 pb-8 relative z-5"
        >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-3xl pointer-events-none z-0" />
        </motion.div>

        {showFloatingElements && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 p-3 rounded-full bg-gradient-to-r from-orange-500/80 to-purple-500/80 shadow-lg shadow-orange-500/20 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-110"
            aria-label="Back to top"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 15l7-7 7 7"
              />
            </svg>
          </motion.button>
        )}

        {isLoading && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 text-center bg-white/10 backdrop-blur-lg p-6 sm:p-8 rounded-3xl border border-white/20 mx-4"
            >
              <LoaderCircle className="w-12 h-12 sm:w-16 sm:h-16 text-orange-400 animate-spin mx-auto mb-4" />
              <p className="text-white text-base sm:text-lg font-medium">
                Preparing your adventure...
              </p>
              <p className="text-gray-300 text-sm mt-2">This won't take long</p>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Body;

"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const About: React.FC = () => {
  return (
    <>
      <motion.div
        id="about"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="space-y-8 sm:space-y-12 py-10 sm:py-16 relative"
      >
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>

        <div className="text-center space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white"
          >
            About{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-green-400">
              Itinerarly
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-lg text-slate-100 max-w-3xl mx-auto"
          >
            Your AI-powered companion for creating personalized travel
            experiences in India
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="space-y-6 h-full flex flex-col"
          >
            <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 flex-1 min-h-0">
              <h3 className="text-xl sm:text-2xl font-semibold text-orange-400 mb-3">
                Our Mission
              </h3>
              <p className="text-gray-200 leading-relaxed">
                Itinerarly was created to revolutionize how travelers explore
                the rich cultural tapestry of India. We combine artificial
                intelligence with local expertise to create journeys that are
                both authentic and personalized to your preferences.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 flex-1 min-h-0">
              <h3 className="text-xl sm:text-2xl font-semibold text-green-400 mb-3">
                How It Works
              </h3>
              <p className="text-gray-200 leading-relaxed">
                Our AI analyzes your travel preferences, budget constraints, and
                desired experiences to craft the perfect itinerary. Whether
                you're seeking cultural immersion, adventure, relaxation, or
                culinary exploration, our platform adapts to your unique travel
                style.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 flex-1 min-h-0">
              <h3 className="text-xl sm:text-2xl font-semibold text-purple-400 mb-3">
                Our Vision
              </h3>
              <p className="text-gray-200 leading-relaxed">
                We envision a world where travel planning is stress-free and
                where every journey to India becomes a transformative
                experience. We aim to showcase both iconic landmarks and hidden
                gems that make India an extraordinary destination.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="relative h-full flex flex-col"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 via-green-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20 overflow-hidden shadow-2xl h-full">
              <div className="grid grid-cols-2 gap-4 h-full">
                <Link
                  href="/ai-planning"
                  className="group relative rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
                >
                  <div className="w-full aspect-square bg-gray-200 relative">
                    <Image
                      src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da"
                      alt="Taj Mahal"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute left-0 right-0 bottom-0 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-full group-focus:opacity-0 transition-all duration-300 ease-out pointer-events-none group-hover:pointer-events-auto">
                      <div className="backdrop-blur-sm bg-gradient-to-t from-black/65 to-transparent px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm sm:text-base font-semibold text-white">
                              AI Planning
                            </h4>
                            <p className="text-[11px] sm:text-sm text-white/80 mt-1">
                              Tailored routes & budgets
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full bg-orange-400 ring-2 ring-white/30" />
                            <ArrowRight className="w-4 h-4 text-white/90" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-white/10 ring-2 ring-white/20" />
                  </div>
                </Link>

                <Link
                  href="/community"
                  className="group relative rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
                >
                  <div className="w-full aspect-square bg-gray-200 relative">
                    <Image
                      src="https://images.unsplash.com/photo-1566552881560-0be862a7c445"
                      alt="Kerala Backwaters"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute left-0 right-0 bottom-0 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-full group-focus:opacity-0 transition-all duration-300 ease-out pointer-events-none group-hover:pointer-events-auto">
                      <div className="backdrop-blur-sm bg-gradient-to-t from-black/65 to-transparent px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm sm:text-base font-semibold text-white">
                              Community
                            </h4>
                            <p className="text-[11px] sm:text-sm text-white/80 mt-1">
                              Local tips & meetups
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full bg-green-400 ring-2 ring-white/30" />
                            <ArrowRight className="w-4 h-4 text-white/90" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-white/10 ring-2 ring-white/20" />
                  </div>
                </Link>

                <Link
                  href="/cultural"
                  className="group relative rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
                >
                  <div className="w-full aspect-square bg-gray-200 relative">
                    <Image
                      src="https://images.unsplash.com/photo-1477587458883-47145ed94245"
                      alt="Himalayan Mountains"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute left-0 right-0 bottom-0 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-full group-focus:opacity-0 transition-all duration-300 ease-out pointer-events-none group-hover:pointer-events-auto">

                      <div className="backdrop-blur-sm bg-gradient-to-t from-black/65 to-transparent px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm sm:text-base font-semibold text-white">
                              Cultural Experiences
                            </h4>
                            <p className="text-[11px] sm:text-sm text-white/80 mt-1">
                              Heritage & tours
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full bg-purple-400 ring-2 ring-white/30" />
                            <ArrowRight className="w-4 h-4 text-white/90" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-white/10 ring-2 ring-white/20" />
                  </div>
                </Link>

                <Link
                  href="/food"
                  className="group relative rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
                >
                  <div className="w-full aspect-square bg-gray-200 relative">
                    <Image
                      src="https://images.unsplash.com/photo-1587474260584-136574528ed5"
                      alt="Indian Food"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute left-0 right-0 bottom-0 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-full group-focus:opacity-0 transition-all duration-300 ease-out pointer-events-none group-hover:pointer-events-auto">
                      <div className="backdrop-blur-sm bg-gradient-to-t from-black/65 to-transparent px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm sm:text-base font-semibold text-white">
                              Culinary Journeys
                            </h4>
                            <p className="text-[11px] sm:text-sm text-white/80 mt-1">
                              Food trails & classes
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full bg-blue-400 ring-2 ring-white/30" />
                            <ArrowRight className="w-4 h-4 text-white/90" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-white/10 ring-2 ring-white/20" />
                  </div>
                </Link>
              </div>

              {/* <div className="mt-6 space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-orange-400"></div>
                <p className="text-sm text-gray-200">
                  Cultural Experiences
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-400"></div>
                <p className="text-sm text-gray-200">Natural Wonders</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-purple-400"></div>
                <p className="text-sm text-gray-200">Culinary Journeys</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-blue-400"></div>
                <p className="text-sm text-gray-200">Adventure Travel</p>
              </div>
            </div> */}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-10"
        ></motion.div>
      </motion.div>
    </>
  );
};

export default About;

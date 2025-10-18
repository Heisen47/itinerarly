import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Coffee,
  LogIn,
  User,
  ChevronDown,
  LogOut,
  Info,
  Compass,
  LoaderIcon,
} from "lucide-react";
import { SignInModal } from "./SignInModal";
import Cookies from "js-cookie";
import axios from "axios";
import { useToken } from "@/lib/TokenProvider";
import { getCookieSafely } from "@/lib/cookie-utils";
import { motion } from "framer-motion";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    name?: string;
    email?: string;
    avatar?: string;
  } | null>(null);
  const SiteUrl: string =
    process.env.NEXT_PUBLIC_SITE_URL || "https://itinerarly-be.onrender.com";

  const {
    token,
    isLoading: tokenLoading,
    refreshTokenCount,
    logout,
    isAuthenticated,
  } = useToken();

  const handleModal = () => {
    setOpenModal(!openModal);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Add offset for fixed navbar height
      const navbarHeight = 64; // h-16 in Tailwind equals 64px
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Close all menus
      setIsMenuOpen(false);
      setIsProfileDropdownOpen(false);
    }
  };

  const handleAuthClick = async (): Promise<void> => {
    if (isLoggedIn) {
      await handleLogout();
    } else {
      setOpenModal(true);
    }
  };

  const handleLogout = async (): Promise<void> => {
    setIsLoggedIn(false);
    setUserInfo(null);
    setIsProfileDropdownOpen(false);

    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie =
        name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;";
      document.cookie =
        name +
        "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" +
        window.location.hostname;
    }

    if (typeof window !== "undefined") {
      sessionStorage.clear();
      localStorage.clear();
    }

    logout();

    try {
      await axios.post(
        `${SiteUrl}/api/v1/logout`,
        {},
        {
          withCredentials: true,
          timeout: 5000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err) {
      console.error("Backend logout error (frontend already cleaned up):", err);
    }
    window.location.href = "/";
  };

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(`${SiteUrl}/api/v1/user/profile`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      setUserInfo(response.data);
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      setUserInfo(null);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    const checkLogin = () => {
      const loggedIn = getCookieSafely(Cookies, "isLoggedIn") === "true";
      setIsLoggedIn(loggedIn);

      if (loggedIn && !userInfo) {
        fetchUserInfo();
      }

      if (loggedIn && openModal) {
        setOpenModal(false);
      }
    };

    checkLogin();

    window.addEventListener("focus", checkLogin);
    return () => window.removeEventListener("focus", checkLogin);
  }, [userInfo, openModal]);

  useEffect(() => {
    if (isAuthenticated && openModal) {
      setOpenModal(false);
    }
  }, [isAuthenticated, openModal]);

  useEffect(() => {
    if (isAuthenticated && openModal) {
      setOpenModal(false);
    }
  }, [isAuthenticated, openModal]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".profile-dropdown")) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleHashScroll = () => {
        const hash = window.location.hash;
        if (hash) {
          const sectionId = hash.substring(1);
          setTimeout(() => {
            scrollToSection(sectionId);
          }, 500);
        }
      };

      handleHashScroll();

      window.addEventListener("hashchange", handleHashScroll);
      return () => window.removeEventListener("hashchange", handleHashScroll);
    }
  }, []);

  const navItems = [
    { label: "Home", href: "#home"},
    { label: "About", href: "#about"},
    { label: "Features", href: "#features"},
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link
                href="/"
                className="font-bold text-xl text-white hover:text-orange-400 transition-colors duration-300"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-green-400">
                  Itinerarly
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) =>
                  <button
                    key={item.label}
                    onClick={() => scrollToSection(item.href.slice(1))}
                    className="text-white/90 hover:text-orange-400 transition-colors duration-300 cursor-pointer font-medium"
                  >
                    {item.label}
                  </button>
              )}

              {/* Profile Section or Sign In Button */}
              {isLoggedIn ? (
                <div className="relative profile-dropdown">
                  <button
                    className="flex items-center space-x-2 text-white/90 hover:text-orange-400 focus:outline-none transition-colors duration-300"
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-green-400 rounded-full flex items-center justify-center overflow-hidden border-2 border-white/20">
                      {userInfo?.avatar ? (
                        <img
                          src={userInfo.avatar}
                          alt={userInfo.name || "User"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            if (e.currentTarget.nextElementSibling) {
                              (
                                e.currentTarget
                                  .nextElementSibling as HTMLElement
                              ).style.display = "flex";
                            }
                          }}
                        />
                      ) : null}
                      <User
                        className={`w-5 h-5 text-white ${
                          userInfo?.avatar ? "hidden" : "block"
                        }`}
                      />
                    </div>
                    <span className="text-sm font-medium">
                        <button
                        onClick={handleAuthClick}
                        className="text-sm font-medium hover:text-orange-400 transition-colors"
                        >
                        Sign In
                        </button>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isProfileDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-md rounded-2xl shadow-2xl py-2 z-50 border border-white/20">
                      <div className="px-4 py-3 text-sm border-b border-white/20">
                        <div className="font-medium text-white">
                          <button
                            onClick={handleAuthClick}
                            className="text-sm font-medium hover:text-orange-400 transition-colors"
                          >
                            Sign In
                          </button>
                        </div>
                        {userInfo?.email && (
                          <div className="text-gray-400 text-xs mt-1">
                            {userInfo.email}
                          </div>
                        )}
                      </div>

                      {/* Token Display */}
                      {isLoggedIn && typeof token !== "undefined" && (
                        <div className="px-4 py-3 text-sm border-b border-white/20 bg-gradient-to-r from-orange-500/20 to-green-500/20">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">
                              Available Tokens:
                            </span>
                            <span className="font-medium text-orange-400 flex items-center">
                              <span className="text-yellow-400 mr-1">⚡</span>
                              {tokenLoading ? "..." : token}
                            </span>
                          </div>
                          <div className="flex items-center mt-2 p-2 bg-blue-500/20 rounded-lg border border-blue-400/30">
                            <Info className="w-3 h-3 text-blue-400 mr-2 flex-shrink-0" />
                            <p className="text-xs text-blue-200">
                              6 tokens refresh every 24 hours
                            </p>
                          </div>
                        </div>
                      )}

                      <hr className="my-1 border-white/20" />

                      <button
                        className="flex items-center w-full px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors duration-300 rounded-xl mx-2"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4 mr-3 text-red-400" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="text-sm text-white/90 hover:text-orange-400 hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-300 border border-white/20 font-medium"
                  onClick={handleAuthClick}
                >
                  Sign In
                </button>
              )}

              <a
                href="https://coff.ee/heisen47"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-xl hover:from-yellow-400 hover:to-orange-400 flex items-center transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              >
                Buy me a coffee
                <Coffee className="inline ml-2 w-4 h-4" />
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              {isLoggedIn ? (
                <div className="relative profile-dropdown">
                  <button
                    className="flex items-center space-x-1 text-white/90 hover:text-orange-400 transition-colors duration-300"
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                  >
                    <div className="w-7 h-7 bg-gradient-to-r from-orange-400 to-green-400 rounded-full flex items-center justify-center overflow-hidden border border-white/20">
                      <button
                        onClick={handleAuthClick}
                        className="text-xs font-medium hover:text-orange-400 transition-colors"
                      >
                        Sign In
                      </button>
                      <User
                        className={`w-4 h-4 text-white ${
                          userInfo?.avatar ? "hidden" : "block"
                        }`}
                      />
                    </div>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        isProfileDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Mobile Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-black/90 backdrop-blur-md rounded-2xl shadow-2xl py-2 z-50 border border-white/20">
                      <div className="px-3 py-2 text-xs border-b border-white/20">
                        <div className="font-medium truncate text-white">
                          <button
                            onClick={handleAuthClick}
                            className="text-xs font-medium hover:text-orange-400 transition-colors"
                          >
                            Sign In
                          </button>
                        </div>
                      </div>

                      {/* Mobile Token Display */}
                      {isLoggedIn && typeof token !== "undefined" && (
                        <div className="px-3 py-2 text-xs border-b border-white/20 bg-gradient-to-r from-orange-500/20 to-green-500/20">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">Tokens:</span>
                            <span className="font-medium text-orange-400 flex items-center">
                              <span className="text-yellow-400 mr-1">⚡</span>
                              {tokenLoading ? <LoaderIcon/> : token}
                            </span>
                          </div>
                          <div className="flex items-center mt-2 p-1.5 bg-blue-500/20 rounded border border-blue-400/30">
                            <Info className="w-2.5 h-2.5 text-blue-400 mr-1.5 flex-shrink-0" />
                            <p className="text-xs text-blue-200">
                              6 tokens refresh every 24hrs
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Profile link removed from mobile menu */}

                      <button
                        className="flex items-center w-full px-3 py-2 text-xs text-white hover:bg-white/10 transition-colors duration-300 rounded-xl mx-1"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-3 h-3 mr-2 text-red-400" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="text-sm text-white/90 hover:text-orange-400 hover:bg-white/10 px-2 py-1 rounded-xl transition-all duration-300 border border-white/20"
                  onClick={handleModal}
                >
                  <LogIn className="w-4 h-4" />
                </button>
              )}

              <a
                href="https://coff.ee/heisen47"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-xl hover:from-yellow-400 hover:to-orange-400 flex items-center transition-all duration-300 shadow-lg"
              >
                <Coffee className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      <SignInModal openModal={openModal} onClose={handleModal} />
    </>
  );
};

export default Navbar;

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Drawer } from "vaul";
import ItineraryGeneration from "../lib/ItineraryGeneration";
import Itinerary from "./Itinerary";
import { IoMdHome } from "react-icons/io";
import { GoNorthStar } from "react-icons/go";

import {
  User,
  ChevronDown,
  Settings,
  LogOut,
  LogIn,
  Coffee,
  Clock,
  Info,
  LoaderIcon,
} from "lucide-react";
import { SignInModal } from "./SignInModal";
import axios from "../lib/axios-config";
import Cookies from "js-cookie";
import Link from "next/link";
import { FaUmbrellaBeach } from "react-icons/fa";
import { useToken } from "@/lib/TokenProvider";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import indiaGeoJson from "../app/start/india-geoJson.json";

export default function Planner() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [plannerMode, setPlannerMode] = useState<"manual" | "month">("manual");
  const [formData, setFormData] = useState({
    destination: "",
    people: "",
    days: "",
    budget: "",
  });
  const [monthData, setMonthData] = useState({
    month: "",
    people: "",
    days: "",
    budget: "",
  });
  const [itinerary, setItinerary] = useState("");
  const [destinationName, setDestinationName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    name?: string;
    email?: string;
    avatar?: string;
  } | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);

  const [isValidDestination, setIsValidDestination] = useState(true);
  const [validationError, setValidationError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const SiteUrl: string =
    process.env.NEXT_PUBLIC_SITE_URL || "https://itinerarly-be.onrender.com";

  const {
    token,
    isLoading: tokenLoading,
    consumeToken,
    refreshTokenCount,
    isTokenAvailable,
    logout,
    isAuthenticated,
  } = useToken();

  const router = useRouter();

  const calculateLevenshteinDistance = (str1: string, str2: string): number => {
    const track = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(0));

    for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        );
      }
    }

    return track[str2.length][str1.length];
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const maxLen = Math.max(str1.length, str2.length);
    if (maxLen === 0) return 100;

    const distance = calculateLevenshteinDistance(
      str1.toLowerCase(),
      str2.toLowerCase()
    );
    return ((maxLen - distance) / maxLen) * 100;
  };

  const applySuggestion = (suggestion: string) => {
    setFormData((prev) => ({ ...prev, destination: suggestion }));
    setIsValidDestination(true);
    setValidationError("");
    setSuggestions([]);
  };

  const validatePlace = async (place: string) => {
    const trimmedPlace = place.trim();
    if (!trimmedPlace) {
      setIsValidDestination(true);
      setValidationError("");
      setSuggestions([]);
      setIsValidating(false);
      return;
    }

    setIsValidating(true);
    setValidationError("");
    setSuggestions([]);

    const geoData = indiaGeoJson;

    const placeNames = geoData.features
      .map((feature: any) =>
        [
          feature.properties?.district?.trim(),
          feature.properties?.st_nm?.trim(),
        ].filter(Boolean)
      )
      .flat()
      .filter(
        (value, index, self) =>
          self.findIndex((v) => v.toLowerCase() === value.toLowerCase()) ===
          index
      );
    
    if (placeNames.length === 0) {
       console.error("DEBUG: `placeNames` array is still empty. This shouldn't happen now.");
    }

    const normalizedPlace = trimmedPlace.toLowerCase();

    const isValid = placeNames.some(
      (name: string) => name.toLowerCase() === normalizedPlace
    );

    setIsValidDestination(isValid);

    if (!isValid) {
      const partialMatches = placeNames.filter((name: string) => {
        const normalizedName = name.toLowerCase();
        const inputWords = normalizedPlace.split(" ");
        const dataWords = normalizedName.split(" ");

        return inputWords.some((inputWord) =>
          dataWords.some(
            (dataWord) =>
              dataWord.includes(inputWord) ||
              inputWord.includes(dataWord) ||
              dataWord.startsWith(inputWord) ||
              inputWord.startsWith(dataWord)
          )
        );
      });

      const similarityMatches = placeNames
        .map((name: string) => ({
          name,
          similarity: calculateSimilarity(normalizedPlace, name.toLowerCase()),
        }))
        .filter((item) => item.similarity >= 60)
        .sort((a, b) => b.similarity - a.similarity);

      const containsMatches = placeNames.filter((name: string) => {
        const normalizedName = name.toLowerCase();
        return (
          normalizedName.includes(normalizedPlace) ||
          normalizedPlace.includes(normalizedName)
        );
      });

      const allMatches = [
        ...new Set([
          ...containsMatches,
          ...partialMatches,
          ...similarityMatches.map((m) => m.name),
        ]),
      ];

      const topSuggestions = allMatches.slice(0, 5);

      setSuggestions(topSuggestions);

      if (topSuggestions.length > 0) {
        setValidationError(
          `Did you mean: ${topSuggestions.map((s) => `'${s}'`).join(", ")}?`
        );
      } else {
        setValidationError(
          `"${trimmedPlace}" not found. Please try a valid place in India.`
        );
      }
    } else {
      setSuggestions([]);
      setValidationError("");
    }

    setIsValidating(false);
  };


  const extractDestinationName = (itineraryText: string): string => {
    const destinationMatch = itineraryText.match(/Destination:\s*([^\n]+)/i);
    return destinationMatch
      ? destinationMatch[1].trim()
      : "AI Recommended Destination";
  };

  const handleModal = () => {
    setOpenModal(!openModal);
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
    // if (process.env.NODE_ENV === "development") {
    //   console.log("🛠️ DEV MODE: fetchUserInfo mocked - fake user");
    //   const fakeUser = {
    //     name: "Dev User",
    //     email: "dev@example.com",
    //     avatar: `https://ui-avatars.com/api/?name=Dev+User&background=3b82f6&color=fff&size=128&rounded=true`,
    //   };
    //   setUserInfo(fakeUser);
    //   return;
    // }

    try {
      const response = await axios.get(`${SiteUrl}/api/v1/user/profile`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          _t: new Date().getTime(),
        },
      });

      const userData = response.data;

      if (!userData.avatar && userData.name) {
        userData.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          userData.name
        )}&background=3b82f6&color=fff&size=128&rounded=true`;
      }

      setUserInfo(userData);
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      setUserInfo(null);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMonthChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setMonthData((prev) => ({ ...prev, [name]: value }));
  };

  const generateItinerary = async () => {
    if (!isValidDestination || !formData.destination.trim()) {
      if (validationError) return;
      setValidationError("Please enter a valid place in India.");
      return;
    }

    setLoading(true);
    try {
      if (!isLoggedIn) {
        setOpenModal(true);
        setLoading(false);
        return;
      }
      if (!isTokenAvailable) {
        setShowTokenModal(true);
        setLoading(false);
        return;
      }

      const cacheKey = `itinerary_${formData.destination}`;
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(cacheKey.toLowerCase());
        if (cached) {
          setItinerary(cached);
          setDestinationName(formData.destination);
          setDrawerOpen(false);
          setShowModal(true);
          setLoading(false);
          return;
        }
      }

      const tokenConsumed = await consumeToken();

      if (!tokenConsumed) {
        setLoading(false);
        return;
      }

      const result = await ItineraryGeneration(formData);
      setItinerary(result ?? "");
      setDestinationName(formData.destination);

      if (typeof window !== "undefined" && result) {
        localStorage.setItem(cacheKey, result);
      }

      setDrawerOpen(false);
      setShowModal(true);
    } catch (error) {
      console.error("Error in itinerary generation process:", error);
      setItinerary(
        "Sorry, we couldn't generate an itinerary. Please try again."
      );
      setDestinationName(formData.destination);
      setDrawerOpen(false);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthBasedItinerary = async () => {
    setLoading(true);

    try {
      if (!isLoggedIn) {
        setOpenModal(true);
        setLoading(false);
        return;
      }

      if (!isTokenAvailable) {
        setShowTokenModal(true);
        setLoading(false);
        return;
      }

      const cacheKey = `itinerary_month_${monthData.month}_${monthData.people}_${monthData.days}_${monthData.budget}`;
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          setItinerary(cached);
          setDestinationName(extractDestinationName(cached));
          setDrawerOpen(false);
          setShowModal(true);
          setLoading(false);
          return;
        }
      }

      const tokenConsumed = await consumeToken();

      if (!tokenConsumed) {
        setLoading(false);
        return;
      }

      const result = await generateMonthBasedTrip(monthData);
      setItinerary(result ?? "");
      setDestinationName(extractDestinationName(result ?? ""));

      if (typeof window !== "undefined" && result) {
        localStorage.setItem(cacheKey, result);
      }

      setDrawerOpen(false);
      setShowModal(true);
    } catch (error) {
      console.error("Error generating month-based itinerary:", error);
      const errorMessage =
        "Sorry, we couldn't generate an itinerary for your selected month. Please try again.";
      setItinerary(errorMessage);
      setDestinationName(`Best destination for ${monthData.month}`);
      setDrawerOpen(false);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  async function generateMonthBasedTrip(monthData: {
    month: string;
    people: string;
    days: string;
    budget: string;
  }) {
    try {
      const requestBody = {
        formData: {
          destination: "Best destination for " + monthData.month,
          people: monthData.people,
          days: monthData.days,
          budget: monthData.budget,
          month: monthData.month,
        },
      };

      const response = await axios.post("/api/RandomItinerary", requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      let result;
      if (response.data && response.data.result) {
        result = response.data.result;
      } else if (typeof response.data === "string") {
        result = response.data;
      } else {
        result = JSON.stringify(response.data, null, 2);
      }

      if (!result) {
        throw new Error("API returned empty result");
      }

      return result;
    } catch (error) {
      console.error("Error in generateMonthBasedTrip:", error);

      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
      } else {
        console.error("Non-axios error:", error);
      }

      throw new Error("Failed to generate month-based itinerary");
    }
  }

  useEffect(() => {
    const checkLogin = () => {
      const loggedIn = Cookies.get("isLoggedIn") === "true";
      setIsLoggedIn(loggedIn || isAuthenticated);

      if ((loggedIn || isAuthenticated) && !userInfo) {
        fetchUserInfo();
      }
    };

    checkLogin();

    window.addEventListener("focus", checkLogin);
    return () => window.removeEventListener("focus", checkLogin);
  }, [userInfo, isAuthenticated]);

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
    if (isAuthenticated && !userInfo) {
      fetchUserInfo();
    }
    setIsLoggedIn(isAuthenticated);
  }, [isAuthenticated]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <>
      <div className="flex justify-center items-center h-16 bg-blue-600 relative">
        <button
          onClick={() => router.push("/")}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-blue-700 text-white py-2 px-4 rounded hover:bg-blue-800 transition"
          type="button"
        >
          <IoMdHome />
        </button>

        <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
          <Drawer.Trigger asChild>
            <div className="p-2 text-white text-center rounded cursor-pointer shadow-md bg-blue-700 hover:bg-blue-800 transition flex items-center justify-center">
              <span className="block sm:hidden">
                <FaUmbrellaBeach className="w-5 h-5" />
              </span>
              <span className="hidden sm:block">Open Planner</span>
            </div>
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[1000]" />
            <Drawer.Content className="bg-gray-100 h-fit fixed bottom-0 left-0 right-0 outline-none rounded-t-lg z-[1010]">
              <Drawer.Title className="text-lg font-bold p-4">
                Plan Your Trip
              </Drawer.Title>

              <div className="p-4 bg-white space-y-4">
                {/* Mode Toggle */}
                <div className="flex items-center justify-center mb-6">
                  <div className="flex bg-gray-200 rounded-lg p-1">
                    <button
                      onClick={() => setPlannerMode("manual")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                        plannerMode === "manual"
                          ? "bg-blue-600 text-white shadow"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      Choose My Trip
                    </button>
                    <button
                      onClick={() => setPlannerMode("month")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-1 ${
                        plannerMode === "month"
                          ? "bg-green-600 text-white shadow"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      I'm feeling lucky <GoNorthStar />
                    </button>
                  </div>
                </div>

                {plannerMode === "manual" ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      generateItinerary();
                    }}
                  >
                    <div>
                      <label
                        htmlFor="destination"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Where do you want to go?
                      </label>
                      <input
                        type="text"
                        id="destination"
                        name="destination"
                        value={formData.destination}
                        onChange={handleChange}
                        onBlur={() => validatePlace(formData.destination)}
                        required
                        placeholder="Enter destination"
                        className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 transition-colors ${
                          !isValidDestination
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                      />
                      {validationError && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationError}
                        </p>
                      )}
                      {isValidating && (
                        <p className="text-blue-500 text-sm mt-1">
                          Validating...
                        </p>
                      )}
                      {suggestions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {suggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => applySuggestion(suggestion)}
                              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="people"
                        className="block text-sm font-medium text-gray-700"
                      >
                        How many people?
                      </label>
                      <select
                        id="people"
                        name="people"
                        value={formData.people}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                      >
                        <option value="" disabled>
                          Select group size
                        </option>
                        <option value="1-4">1-4</option>
                        <option value="5-9">5-9</option>
                        <option value=">9">&gt;9</option>
                      </select>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="days"
                        className="block text-sm font-medium text-gray-700"
                      >
                        How many days?
                      </label>
                      <input
                        type="number"
                        id="days"
                        name="days"
                        value={formData.days}
                        onChange={handleChange}
                        required
                        min={1}
                        placeholder="Enter number of days"
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                      />
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="budget"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Approximate Budget (INR)
                      </label>
                      <select
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                      >
                        <option value="" disabled>
                          Select budget
                        </option>
                        <option value="high">High (Above ₹50,000)</option>
                        <option value="medium">
                          Medium (₹20,000 - ₹50,000)
                        </option>
                        <option value="low">Low (Below ₹20,000)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={
                        loading ||
                        !isValidDestination ||
                        !formData.destination.trim()
                      }
                      className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8
 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Generating...
                        </div>
                      ) : (
                        "Generate Itinerary"
                      )}
                    </button>
                  </form>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      generateMonthBasedItinerary();
                    }}
                  >
                    <div>
                      <label
                        htmlFor="month"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Which month do you want to travel?
                      </label>
                      <select
                        id="month"
                        name="month"
                        value={monthData.month}
                        onChange={handleMonthChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                      >
                        <option value="" disabled>
                          Select month
                        </option>
                        {months.map((month) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="people-month"
                        className="block text-sm font-medium text-gray-700"
                      >
                        How many people?
                      </label>
                      <select
                        id="people-month"
                        name="people"
                        value={monthData.people}
                        onChange={handleMonthChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                      >
                        <option value="" disabled>
                          Select group size
                        </option>
                        <option value="1-4">1-4</option>
                        <option value="5-9">5-9</option>
                        <option value=">9">&gt;9</option>
                      </select>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="days-month"
                        className="block text-sm font-medium text-gray-700"
                      >
                        How many days?
                      </label>
                      <input
                        type="number"
                        id="days-month"
                        name="days"
                        value={monthData.days}
                        onChange={handleMonthChange}
                        required
                        min={1}
                        placeholder="Enter number of days"
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                      />
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="budget-month"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Approximate Budget (INR)
                      </label>
                      <select
                        id="budget-month"
                        name="budget"
                        value={monthData.budget}
                        onChange={handleMonthChange}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                      >
                        <option value="" disabled>
                          Select budget
                        </option>
                        <option value="high">High (Above ₹50,000)</option>
                        <option value="medium">
                          Medium (₹20,000 - ₹50,000)
                        </option>
                        <option value="low">Low (Below ₹20,000)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-6 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Finding Best Destination...
                        </div>
                      ) : (
                        "Find Best Destination & Generate Itinerary"
                      )}
                    </button>
                  </form>
                )}
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          {isLoggedIn ? (
            <div className="relative profile-dropdown">
              <button
                className="flex items-center space-x-2 text-white hover:text-gray-200 focus:outline-none"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                  {userInfo?.avatar ? (
                    <>
                      <img
                        src={userInfo.avatar}
                        alt={userInfo.name || "User"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget
                            .nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                      <User className="w-5 h-5 text-blue-600 hidden" />
                    </>
                  ) : (
                    <User className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <span className="text-sm font-medium hidden md:block">
                  {userInfo?.name ? userInfo.name.split(" ")[0] : "User"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isProfileDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-[9999] border border-gray-200">
                  <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                        {userInfo?.avatar ? (
                          <>
                            <img
                              src={userInfo.avatar}
                              alt={userInfo.name || "User"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const fallback = e.currentTarget
                                  .nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                            <User className="w-6 h-6 text-white hidden" />
                          </>
                        ) : (
                          <User className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {userInfo?.name || <LoaderIcon />}
                        </div>
                        {userInfo?.email && (
                          <div className="text-gray-500 text-xs truncate">
                            {userInfo.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {typeof token !== "undefined" && (
                    <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span>Available Tokens:</span>
                        <span className="font-medium text-blue-600 flex items-center">
                          <span className="text-yellow-500 mr-1">⚡</span>
                          {tokenLoading ? "..." : token}
                        </span>
                      </div>
                      <div className="flex items-center mt-2 p-2 bg-blue-100 rounded border border-blue-200">
                        <Info className="w-3 h-3 text-blue-600 mr-2 flex-shrink-0" />
                        <p className="text-xs text-blue-700">
                          6 tokens refresh every 24 hours
                        </p>
                      </div>
                    </div>
                  )}

                  <a
                    href="https://coff.ee/heisen47"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sm:hidden flex items-center px-4 py-2 bg-yellow-400 text-sm text-white hover:bg-gray-100"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <Coffee className="w-4 h-4 mr-3" />
                    Buy Me Coffee
                  </a>

                  <hr className="my-1" />

                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                className="bg-blue-700 text-white py-2 px-4 rounded hover:bg-blue-800 transition flex items-center space-x-2"
                onClick={handleAuthClick}
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden md:block">Sign In</span>
              </button>
            </div>
          )}

          <a
            href="https://coff.ee/heisen47"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition items-center space-x-2"
          >
            <Coffee className="w-4 h-4" />
            <span className="hidden md:block">Coffee</span>
          </a>
        </div>
      </div>

      <Itinerary
        open={showModal}
        onClose={() => setShowModal(false)}
        itinerary={itinerary}
        destination={
          destinationName ||
          formData.destination ||
          "AI Recommended Destination"
        }
      />

      <SignInModal openModal={openModal} onClose={handleModal} />

      <Dialog open={showTokenModal} onOpenChange={setShowTokenModal}>
        <DialogContent className="sm:max-w-[425px] bg-white shadow-xl rounded-lg border border-gray-300">
          <DialogHeader>
            <div className="flex flex-col items-center text-center py-4">
              <div className="bg-blue-50 p-3 rounded-full mb-4">
                <Clock className="h-10 w-10 text-blue-500" />
              </div>
              <DialogTitle className="text-xl mb-2">
                Token Limit Reached
              </DialogTitle>
              <DialogDescription className="text-center max-w-xs mx-auto">
                You don't have enough tokens to generate an itinerary. Please
                wait 24 hours for your tokens to refresh.
              </DialogDescription>
              <p className="mt-2 text-sm font-medium text-blue-600 text-center">
                Your tokens will refresh automatically in 24 hours.
              </p>
            </div>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <DialogClose asChild>
              <Button className="min-w-[100px]">OK, got it</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Copy, Loader, Check, MapPin, Calendar, Utensils, Cloud, X } from "lucide-react";

interface PlaceDetailsProps {
  place: string;
  details: string;
  lat?: number;
  lon?: number;
  onClose: () => void;
}

type Attraction = {
  name: string;
  coordinates: [number, number];
};

type ParsedDetails = {
  bestTime: string;
  attractions: Attraction[];
  food: string[];
};

const PlaceDetails: React.FC<PlaceDetailsProps> = ({
  place,
  details,
  lat,
  lon,
  onClose,
}) => {
  const [weather, setWeather] = useState<null | {
    temp: number;
    description: string;
    icon: string;
  }>(null);

  const [parsed, setParsed] = useState<ParsedDetails | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    if (!details) {
      setParsed(null);
      setParseError("No details available.");
      return;
    }
    try {
      const match = details.match(/{[\s\S]*}/);
      if (!match) throw new Error("No JSON found");
      const data = JSON.parse(match[0]);
      if (
        typeof data.bestTime === "string" &&
        Array.isArray(data.attractions) &&
        data.attractions.every(
          (a: any) =>
            typeof a.name === "string" &&
            Array.isArray(a.coordinates) &&
            a.coordinates.length === 2 &&
            typeof a.coordinates[0] === "number" &&
            typeof a.coordinates[1] === "number"
        ) &&
        Array.isArray(data.food)
      ) {
        setParsed(data);
        setParseError(null);
      } else {
        throw new Error("Invalid data structure");
      }
    } catch (e) {
      setParsed(null);
      setParseError(
        "Sorry, we couldn't load the details for this place. Please try again later."
      );
    }
  }, [details]);

  // Fetch weather
  useEffect(() => {
    const fetchWeather = async () => {
      if (lat && lon) {
        try {
          const response = await axios.get(
            `/api/weather?lat=${lat}&lon=${lon}`
          );
          setWeather({
            temp: response.data.main.temp,
            description: response.data.weather[0].description,
            icon: response.data.weather[0].icon,
          });
        } catch (error) {
          setWeather(null);
        }
      }
    };
    fetchWeather();
  }, [lat, lon]);

  const getCopyText = () => {
    if (!parsed) return "";
    return [
      `Best Time to Visit: ${parsed.bestTime}`,
      "",
      "Top Attractions:",
      ...parsed.attractions.map(
        (a, i) => `${i + 1}. ${a.name} (${a.coordinates[0]}, ${a.coordinates[1]})`
      ),
      "",
      "Local Cuisine to Try:",
      ...parsed.food.map((f, i) => `${i + 1}. ${f}`),
    ].join("\n");
  };

  const handleCopy = () => {
    if (!parsed) return;
    navigator.clipboard.writeText(getCopyText());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]"
      onClick={onClose}
    >
      <div
        className="absolute top-20 bg-white rounded-xl shadow-2xl max-w-lg w-full m-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-blue-600 text-white p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              {place}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className={`text-white hover:text-blue-200 transition p-1 rounded-full ${copied ? 'bg-green-500' : 'hover:bg-blue-500'}`}
                aria-label="Copy details"
                title="Copy details"
                disabled={!parsed}
              >
                {copied ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-200 hover:bg-blue-500 p-1 rounded-full transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {/* Error or Loading */}
          {parseError ? (
            <div className="flex items-center gap-2 text-red-500 p-4 bg-red-50 rounded-lg mb-4">
              <X className="h-5 w-5" />
              {parseError}
            </div>
          ) : !parsed ? (
            <div className="flex items-center justify-center gap-2 text-blue-600 p-8">
              <Loader className="animate-spin h-6 w-6" /> 
              <span className="font-medium">Loading details...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-sm">
                <div className="flex items-center text-blue-600 font-medium mb-2">
                  <Calendar className="mr-2 h-4 w-4" />
                  Best Time to Visit
                </div>
                <div className="text-gray-700">{parsed.bestTime}</div>
              </div>

              <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-sm">
                <div className="flex items-center text-blue-600 font-medium mb-3">
                  <MapPin className="mr-2 h-4 w-4" />
                  Top Attractions
                </div>
                <ul className="space-y-2">
                  {parsed.attractions.map((a, i) => (
                    <li key={i} className="flex items-start">
                      <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 h-5 w-5 rounded-full text-xs font-bold mr-2 mt-0.5">
                        {i+1}
                      </span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${a.coordinates[0]},${a.coordinates[1]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline transition"
                      >
                        {a.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-sm">
                <div className="flex items-center text-blue-600 font-medium mb-3">
                  <Utensils className="mr-2 h-4 w-4" />
                  Local Cuisine to Try
                </div>
                <ul className="space-y-2">
                  {parsed.food.map((f, i) => (
                    <li key={i} className="flex items-start">
                      <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 h-5 w-5 rounded-full text-xs font-bold mr-2 mt-0.5">
                        {i+1}
                      </span>
                      <span className="text-gray-700">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 border-t border-gray-200">
          {weather || (lat && lon) ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center text-blue-600 font-medium">
                <Cloud className="mr-2 h-4 w-4" />
                Current Weather
              </div>
              
              {weather ? (
                <div className="flex items-center bg-blue-50 px-3 py-2 rounded-md">
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
                    alt={weather.description}
                    className="w-10 h-10"
                  />
                  <div className="ml-1">
                    <div className="font-bold text-blue-700">{Math.round(weather.temp)}°C</div>
                    <div className="text-xs text-gray-600 capitalize">{weather.description}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader className="animate-spin h-4 w-4" /> Loading weather...
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-end">
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceDetails;
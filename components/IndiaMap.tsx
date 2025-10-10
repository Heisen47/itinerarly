"use client";

import { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import indiaGeoJson from "../app/start/india-geoJson.json";
import { sections } from "@/data/sections";
import { LoaderCircle, RotateCcw, X } from "lucide-react";
import { Plus, Minus } from "lucide-react";
import Gemini from "../lib/Gemini";
import PlaceDetails from "./PlaceDetails";
import { StateDetailsModal } from "./StateDetailsModal";

interface IndiaMapProps {
  type: string | null;
}

export default function IndiaMap({ type }: IndiaMapProps) {
  const [hoveredPlace, setHoveredPlace] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [position, setPosition] = useState({
    coordinates: [82, 22],
    zoom: 1,
  });
  const [markerDetailsMap, setMarkerDetailsMap] = useState<
    Record<string, string>
  >({});
  const [loadingMarker, setLoadingMarker] = useState<string | null>(null);
  const [showPlaceDetails, setShowPlaceDetails] = useState(false);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [stateMousePosition, setStateMousePosition] = useState({ x: 0, y: 0 });
  const [showStateDetails, setShowStateDetails] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [mapScale, setMapScale] = useState(800);
  const [minZoom, setMinZoom] = useState(1);
  const [initialZoom, setInitialZoom] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 480) {
        setMapScale(1400);
        setMinZoom(0.8);
        setInitialZoom(1.2);
      } else if (window.innerWidth < 768) {
        setMapScale(1200);
        setMinZoom(0.9);
        setInitialZoom(1.2);
      } else {
        setMapScale(800);
        setMinZoom(1);
        setInitialZoom(1);
      }
    };

    handleResize();

    setPosition((pos) => ({
      ...pos,
      zoom: initialZoom,
    }));

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const selectedSection = sections.find((section) => section.id === type);
  const highlightedPlaces = selectedSection?.places || [];

  const handleStateClick = (geo: any, e: React.MouseEvent<SVGPathElement>) => {
    const stateName =
      geo.properties?.NAME_1 ||
      geo.properties?.st_nm ||
      geo.properties?.name ||
      geo.properties?.NAME ||
      "Unknown State";
    setSelectedState(stateName);
    setHoveredState(null);
    setShowStateDetails(true);
    setStateMousePosition({ x: e.clientX, y: e.clientY });
    setShowStateModal(true);
  };

  const fetchDetailsForMarker = async (markerName: string) => {
    if (markerDetailsMap[markerName]) return;
    setLoadingMarker(markerName);
    const data = await Gemini(markerName);
    setMarkerDetailsMap((prev) => ({ ...prev, [markerName]: data ?? "" }));
    setLoadingMarker(null);
  };

  useEffect(() => {
    const loadMap = async () => {
      try {
        if (!indiaGeoJson) throw new Error("GeoJSON data not found");
        await new Promise((resolve) => setTimeout(resolve, 300));
        setIsMapLoading(false);
      } catch (error) {
        setIsMapLoading(false);
      }
    };
    loadMap();
  }, []);

  const handleMouseEnter = (place: any, event: React.MouseEvent) => {
    if (!selectedPlace) {
      setHoveredPlace(place.name);
      setMousePosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseLeave = () => {
    if (!selectedPlace) setHoveredPlace(null);
  };

  const handleMarkerClick = (place: any, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedPlace(place.name);
    setHoveredPlace(place.name);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleShowDetails = async () => {
    if (hoveredPlace) {
      if (!markerDetailsMap[hoveredPlace])
        await fetchDetailsForMarker(hoveredPlace);
      const currentPlace = hoveredPlace;
      setHoveredPlace(null);
      setShowPlaceDetails(true);
      setSelectedPlace(currentPlace);
    }
  };

  const handleStateCloseModal = () => {
    setShowStateDetails(false);
    setSelectedState(null);
    setShowStateModal(false);
  };

  return (
    <div className="w-full h-full bg-blue-500 relative overflow-hidden">
      <div className="absolute top-5 right-5 z-10 flex flex-col gap-2">
        <button
          onClick={() =>
            setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.3 }))
          }
          className="p-2 bg-white cursor-pointer rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
        <button
          onClick={() =>
            setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.3 }))
          }
          className="p-2 bg-white cursor-pointer rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        >
          <Minus className="w-6 h-6" />
        </button>
        <button
          onClick={() =>
            setPosition({
              coordinates: [82, 22],
              zoom: initialZoom,
            })
          }
          className="p-2 bg-white rounded-full cursor-pointer shadow-lg hover:bg-gray-100 transition-colors"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {isMapLoading ? (
        <div className="h-full w-full flex items-center justify-center">
          <LoaderCircle className="w-12 h-12 animate-spin text-white" />
        </div>     
      ) : (
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: mapScale,
            center: [82, 22],
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={({
              coordinates,
              zoom,
            }: {
              coordinates: [number, number];
              zoom: number;
            }) => setPosition({ coordinates, zoom })}
            maxZoom={5}
            minZoom={minZoom}    //map cursor-zoom
          >
            <Geographies geography={indiaGeoJson}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo, index) => {
                  const name =
                    geo.properties?.NAME_1 ||
                    geo.properties?.st_nm ||
                    geo.properties?.name ||
                    geo.properties?.NAME ||
                    `geography-${index}`;
                  const isSelected = selectedState === name;
                  const isHovered = hoveredState === name;

                  return (
                    <Geography
                      key={`${name}-${index}`}
                      geography={geo}
                      onMouseEnter={(
                        e: React.MouseEvent<SVGPathElement, MouseEvent>
                      ) => {
                        setHoveredState(name);
                        setStateMousePosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => {
                        if (!selectedState || selectedState !== name) {
                          setHoveredState(null);
                        }
                      }}
                      onClick={(
                        e: React.MouseEvent<SVGPathElement, MouseEvent>
                      ) => handleStateClick(geo, e)}
                      stroke="#FFFFFF"
                      strokeWidth={0.5}
                      style={{
                        default: {
                          fill: isSelected
                            ? "#4299E1"
                            : isHovered
                            ? "#FFA500"
                            : "#D6D6DA",
                          outline: "none",
                        },
                        hover: {
                          fill: isHovered ? "#FFA500" : "#E6E6EA",
                          outline: "none",
                        },
                        pressed: { fill: "#D6D6DA", outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            <g className="disputed-territories">
              <path
                d="M..."
                fill="none"
                stroke="#FF0000"
                strokeWidth={1}
                strokeDasharray="5,5"
              />
            </g>

            {highlightedPlaces.map((place: any) => (
              <Marker
                key={place.name}
                coordinates={[place.coordinates[0], place.coordinates[1]]}
              >
                <g
                  onClick={(e) => handleMarkerClick(place, e)}
                  onMouseEnter={(e) => handleMouseEnter(place, e)}
                  onMouseLeave={handleMouseLeave}
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    r={hoveredPlace === place.name ? 6 : 4}
                    fill={
                      selectedPlace === place.name
                        ? "#FF8C00"
                        : hoveredPlace === place.name
                        ? "#FFA500"
                        : "#F53"
                    }
                    stroke="#fff"
                    strokeWidth={2}
                    className="transition-all duration-200"
                  />
                </g>
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      )}

      {hoveredPlace && !showPlaceDetails && (
        <div
          className="fixed bg-white p-4 rounded-lg shadow-xl border border-gray-200 z-50"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y + 10,
            maxWidth: "300px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg">{hoveredPlace}</h3>
            <button
              onClick={() => setHoveredPlace(null)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <hr />
          {loadingMarker === hoveredPlace ? (
            <div className="flex items-center justify-center">
              <LoaderCircle className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <button
              className="text-blue-400 text-center hover:underline"
              onClick={handleShowDetails}
            >
              Show details
            </button>
          )}
        </div>
      )}

      {hoveredState && (
        <div
          className="fixed bg-gray-800 text-white px-3 py-1 rounded shadow z-50 text-sm"
          style={{
            left: stateMousePosition.x + 10,
            top: stateMousePosition.y + 10,
            pointerEvents: "none",
          }}
        >
          {hoveredState}
        </div>
      )}

      {showPlaceDetails &&
        selectedPlace &&
        (() => {
          const selected = highlightedPlaces.find(
            (p: any) => p.name === selectedPlace
          );
          return (
            <PlaceDetails
              place={selectedPlace}
              details={markerDetailsMap[selectedPlace] || ""}
              lat={selected?.coordinates[1]}
              lon={selected?.coordinates[0]}
              onClose={() => {
                setShowPlaceDetails(false);
                setSelectedPlace(null);
              }}
            />
          );
        })()}

      <StateDetailsModal
        showStateModal={showStateModal}
        stateName={selectedState}
        mousePosition={stateMousePosition}
        onClose={() => {
          handleStateCloseModal();
          setShowStateModal(false);
        }}
      />
    </div>
  );
}

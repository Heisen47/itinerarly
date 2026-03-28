import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import { Loader, Clock, AlertTriangle, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import StateDetailsBody from "./StateDetailsBody";
import Cookies from "js-cookie";
import { useToken } from "../lib/TokenProvider";
import { getCookieSafely } from "@/lib/cookie-utils";

interface StateDetailsModal {
  showStateModal: boolean;
  stateName: string | null;
  mousePosition?: { x: number; y: number };
  onClose: () => void;
}

export function StateDetailsModal({
  showStateModal,
  stateName,
  onClose,
  mousePosition,
}: StateDetailsModal) {
  const [dataLoad, setDataLoad] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [details, setDetails] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showTokenModal, setShowTokenModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isNetworkError, setIsNetworkError] = useState<boolean>(false);

  const { token, isLoading: tokenLoading, consumeToken, refreshTokenCount, isTokenAvailable, error } = useToken();
  
  const SiteUrl: string = process.env.NEXT_PUBLIC_SITE_URL || "https://itinerarly-be.onrender.com";
  
  useEffect(() => {
    const isDevTestUser = process.env.NEXT_PUBLIC_DEV_TEST_USER === "true";
    const checkLogin = () => {
      if (isDevTestUser) {
        setIsLoggedIn(true);
        return;
      }
      const loggedIn = getCookieSafely(Cookies, "isLoggedIn") === "true";
      setIsLoggedIn(loggedIn);
      
      if (loggedIn) {
        try {
          refreshTokenCount().catch(error => {
            if (error instanceof Error && error.message === "Network Error") {
              setIsNetworkError(true);
              setErrorMessage("Unable to connect to the server. Please check your internet connection and try again.");
              setShowTokenModal(true);
            }
          });
        } catch (error) {
        }
      }
    };
    
    checkLogin();
  }, [showStateModal]);

  useEffect(() => {
    if (error && error.includes("Network Error")) {
      setIsNetworkError(true);
      setErrorMessage("Unable to connect to the server. Please check your internet connection and try again.");
      setShowTokenModal(true);
    }
  }, [error]);

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stateName) {
      setErrorMessage("State name is required!");
      setShowTokenModal(true);
      return;
    }
    
    setDataLoad(true);
    
    try {
      if (!isLoggedIn) {
        setErrorMessage("Please sign in to generate state details.");
        setShowAuthModal(true);
        setDataLoad(false);
        return;
      }

      if (isNetworkError) {
        setErrorMessage("Unable to connect to the server. Please check your internet connection and try again.");
        setShowTokenModal(true);
        setDataLoad(false);
        return;
      }

      if (!isTokenAvailable) {
        setErrorMessage("You don't have enough tokens. Please wait 24 hours for your tokens to refresh.");
        setShowTokenModal(true);
        setDataLoad(false);
        return;
      }

      if (typeof window !== "undefined") {
        let placeName = stateName.toLowerCase();
        const cached = localStorage.getItem(`stateDetails_${placeName}`);
        if (cached) {
          setDetails(cached);
          setDataLoad(false);
          setIsNetworkError(false);
          setErrorMessage("");
          return;
        }
      }

      let tokenConsumed = false;
      try {
        tokenConsumed = await consumeToken();
      } catch (error) {
        if (error instanceof Error && error.message === "Network Error") {
          setIsNetworkError(true);
          setErrorMessage("Unable to connect to the server. Please check your internet connection and try again.");
          setShowTokenModal(true);
        } else {
          setErrorMessage("Error consuming token. Please try again.");
          setShowTokenModal(true);
        }
        setDataLoad(false);
        return;
      }
      
      if (!tokenConsumed) {
        setDataLoad(false);
        return;
      }

      setProgressText("");
      const { generateStateDetails } = await import("@/lib/AIGeneration");
      const result = await generateStateDetails(stateName, (text: string) => {
        setProgressText(text);
      });
      setDetails(result);

      if (typeof window !== "undefined" && result) {
        let place = stateName.toLowerCase();
        localStorage.setItem(`stateDetails_${place}`, result);
      }
      setIsNetworkError(false);
      setErrorMessage("");

    } catch (err) {
      if (err instanceof Error && err.message === "Network Error") {
        setIsNetworkError(true);
        setErrorMessage("Unable to connect to the server. Please check your internet connection and try again.");
      } else {
        setErrorMessage("Failed to generate state details. Please try again.");
      }
      setShowTokenModal(true);
    }
    setDataLoad(false);
    setProgressText("");
  };

  useEffect(() => {
    if (!showStateModal) setDetails(null);
  }, [showStateModal, stateName]);

  return (
    <>
      <Dialog open={showStateModal} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] bg-white shadow-xl rounded-lg border border-gray-300">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle>Planning to visit {stateName}?</DialogTitle>
                <DialogDescription>Let me help you with that!</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            
            <Button 
              type="submit" 
              onClick={handleGenerate}
              disabled={dataLoad || !isTokenAvailable || !isLoggedIn || isNetworkError}
              className={
                (dataLoad || !isTokenAvailable || !isLoggedIn || isNetworkError) 
                  ? "opacity-50 cursor-not-allowed" 
                  : ""
              }
            >
              {dataLoad ? (
                <div className="flex items-center">
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  <span className="truncate max-w-[200px] text-xs">
                    {progressText ? progressText : "Generating..."}
                  </span>
                </div>
              ) : isNetworkError ? (
                "Connection Error"
              ) : !isLoggedIn ? (
                "Sign in to generate"
              ) : !isTokenAvailable ? (
                "No tokens remaining"
              ) : (
                `Generate!`
              )}
            </Button>
          </DialogFooter>

          {details && (
            <div className="mt-4">
              <StateDetailsBody
                place={stateName ?? ""}
                details={details}
                onClose={onClose}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showTokenModal} onOpenChange={() => setShowTokenModal(false)}>
        <DialogContent className="sm:max-w-[425px] bg-white shadow-xl rounded-lg border border-gray-300">
          <DialogHeader>
            <div className="flex flex-col items-center text-center py-4">
              <div className="bg-blue-50 p-3 rounded-full mb-4">
                {isNetworkError ? (
                  <WifiOff className="h-10 w-10 text-red-500" />
                ) : errorMessage.includes("token") ? (
                  <Clock className="h-10 w-10 text-blue-500" />
                ) : (
                  <AlertTriangle className="h-10 w-10 text-amber-500" />
                )}
              </div>
              <DialogTitle className="text-xl mb-2">
                {isNetworkError ? "Connection Error" : 
                  errorMessage.includes("token") ? "Token Limit Reached" : "Action Required"}
              </DialogTitle>
              <DialogDescription className="text-center max-w-xs mx-auto">
                {errorMessage}
                {errorMessage.includes("token") && !isNetworkError && (
                  <div className="mt-2 text-sm font-medium text-blue-600">
                    Your tokens will refresh automatically in 24 hours.
                  </div>
                )}
                {isNetworkError && (
                  <div className="mt-2 text-sm font-medium text-blue-600">
                    Try refreshing the page or checking your network settings.
                  </div>
                )}
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <DialogClose asChild>
              <Button 
                className="min-w-[100px]" 
                onClick={() => {
                  if (isNetworkError) {
                    window.location.reload();
                  }
                }}
              >
                {isNetworkError ? "Refresh Page" : "OK, got it"}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
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

import { FaGithub, FaGoogle } from "react-icons/fa";
import React, { useEffect, useState, useRef } from "react";
import { useToken } from "@/lib/TokenProvider";


interface SignInModalProps {
  openModal: boolean;
  onClose: () => void; 
}


const SiteUrl: string = process.env.NEXT_PUBLIC_SITE_URL || "https://itinerarly-be.onrender.com";


const signInWithGithub = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem("oauthFlowStarted");
    sessionStorage.removeItem("oauthFlowTimestamp");
    sessionStorage.removeItem("authInProgress");
    sessionStorage.setItem("oauthFlowStarted", "github");
    sessionStorage.setItem("oauthFlowTimestamp", new Date().toISOString());
    sessionStorage.setItem("authInProgress", "true");
  }

  window.location.href = `${SiteUrl}/oauth2/authorization/github`;
}

const signInWithGoogle = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem("oauthFlowStarted");
    sessionStorage.removeItem("oauthFlowTimestamp");
    sessionStorage.removeItem("authInProgress");
    
    sessionStorage.setItem("oauthFlowStarted", "google");
    sessionStorage.setItem("oauthFlowTimestamp", new Date().toISOString());
    sessionStorage.setItem("authInProgress", "true");
  }

  window.location.href = `${SiteUrl}/oauth2/authorization/google`;
};

export function SignInModal({ openModal, onClose }: SignInModalProps) {
  const { refreshTokenCount, isAuthenticated } = useToken();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const hasHandled = useRef(false);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const url = new URL(window.location.href);
      const hasAuthParams = url.searchParams.has('token') || 
                            url.searchParams.has('code') || 
                            url.searchParams.has('auth') ||
                            url.searchParams.has('state') ||
                            url.pathname.includes('/login/oauth');

      const oauthFlowStarted = typeof window !== 'undefined' ? sessionStorage.getItem("oauthFlowStarted") : null;
      const authInProgress = typeof window !== 'undefined' ? sessionStorage.getItem("authInProgress") : null;
      
      const referer = document.referrer;
      const isFromGitHub = referer && (
        referer.includes('github.com') || 
        referer.includes('api.github.com') || 
        referer.includes('githubusercontent.com')
      );

      if (hasAuthParams || (oauthFlowStarted && authInProgress) || isFromGitHub) {
        console.log("OAuth flow detected, processing authentication...");
        setIsAuthenticating(true);
        
        try {
          await refreshTokenCount();
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem("oauthFlowStarted");
            sessionStorage.removeItem("oauthFlowTimestamp");
            sessionStorage.removeItem("authInProgress");
          }

          if (hasAuthParams) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          
          setIsAuthenticating(false);
          setTimeout(() => {
            if (isAuthenticated) {
              onClose();
              window.location.replace("/start");
            }
          }, 500);
        } catch (error) {
          console.error("Authentication failed:", error);
          setIsAuthenticating(false);
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem("oauthFlowStarted");
            sessionStorage.removeItem("oauthFlowTimestamp");
            sessionStorage.removeItem("authInProgress");
          }
        }
      }
    };

    if (openModal) {
      handleOAuthCallback();
    }
    
    return () => {
      hasHandled.current = false;
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined' && 
        !sessionStorage.getItem("authInProgress") && 
        !hasHandled.current) {
      hasHandled.current = true;
      onClose();
    }
  }, [isAuthenticated, onClose]);

  useEffect(() => {
    if (openModal && isAuthenticated) {
      onClose();
    }
  }, [openModal, isAuthenticated, onClose]);

  return (
    <Dialog open={openModal} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white shadow-xl rounded-lg border border-gray-300">
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
          <DialogDescription>
            Choose your preferred authentication method to access your account.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col md:flex-row md:justify-around space-y-4 md:space-y-0 md:space-x-4 p-2">
          <button 
            className="cursor-pointer border border-black h-20 w-20 flex justify-center items-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={signInWithGoogle}
            disabled={isAuthenticating || (typeof window !== 'undefined' && sessionStorage.getItem("authInProgress") === "true")}
          >
            <FaGoogle className="h-10 w-10 text-center"/>
          </button>
          <button 
            className="cursor-pointer border border-black h-20 w-20 flex justify-center items-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={signInWithGithub}
            disabled={isAuthenticating || (typeof window !== 'undefined' && sessionStorage.getItem("authInProgress") === "true")}
          >
            <FaGithub className="h-10 w-10 text-center"/>
          </button>
        </div>
        {(isAuthenticating || (typeof window !== 'undefined' && sessionStorage.getItem("authInProgress") === "true")) && (
          <div className="text-center text-sm text-gray-600 p-2">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Authenticating... Please wait.</span>
            </div>
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isAuthenticating}>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
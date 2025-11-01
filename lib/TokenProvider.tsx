"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { sanitizeCookieValue, setCookieSafely, extractJwtToken } from "./cookie-utils";

const SiteUrl: string = process.env.NEXT_PUBLIC_SITE_URL || "https://itinerarly-be.onrender.com";


function checkAuthenticationMechanisms() {
  
  const visibleCookies = document.cookie;
  const hasCookies = visibleCookies.length > 0;
  const hasVisibleJsessionId = visibleCookies.includes('JSESSIONID');
  const hasVisibleAuthToken = visibleCookies.includes('auth-token') || visibleCookies.includes('authToken');
  
  const jsessionidFromJsCookie = Cookies.get("JSESSIONID");

  let authTokenRaw = Cookies.get("auth-token");
  let altAuthTokenRaw = Cookies.get("authToken");

  let authTokenFromJsCookie = authTokenRaw ? extractJwtToken(authTokenRaw) : undefined;
  let altAuthTokenFromJsCookie = altAuthTokenRaw ? extractJwtToken(altAuthTokenRaw) : undefined;

  if (authTokenRaw && authTokenRaw !== authTokenFromJsCookie) {
    setCookieSafely(Cookies, "auth-token", authTokenFromJsCookie);
  }
  
  if (altAuthTokenRaw && altAuthTokenRaw !== altAuthTokenFromJsCookie) {
    setCookieSafely(Cookies, "authToken", altAuthTokenFromJsCookie);
  }
  
  const hasLocalStorageToken = 
    localStorage.getItem("token") !== null ||
    localStorage.getItem("X-Auth-Token") !== null ||
    localStorage.getItem("Authorization") !== null;
    
  const oauthFlowStarted = typeof window !== 'undefined' ? sessionStorage.getItem("oauthFlowStarted") !== null : false;
  const authInProgress = typeof window !== 'undefined' ? sessionStorage.getItem("authInProgress") === "true" : false;
  
  return (
    hasVisibleJsessionId || 
    jsessionidFromJsCookie !== undefined ||
    hasVisibleAuthToken ||
    authTokenFromJsCookie !== undefined ||
    altAuthTokenFromJsCookie !== undefined ||
    hasLocalStorageToken ||
    
    sessionStorage.getItem("isAuthenticated") === "true" ||
    localStorage.getItem("isAuthenticated") === "true" ||
    
    authInProgress
  );
}

interface TokenContextType {
  token: number | undefined;
  isLoading: boolean;
  error: string | null;
  refreshTokenCount: () => Promise<void>;
  consumeToken: () => Promise<boolean>;
  isTokenAvailable: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const TokenContext = createContext<TokenContextType>({
  token: undefined,
  isLoading: false,
  error: null,
  refreshTokenCount: async () => {},
  consumeToken: async () => false,
  isTokenAvailable: false,
  isAuthenticated: false,
  logout: () => {},
});

export function TokenProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const isTokenAvailable = typeof token === 'number' && token > 0;  const refreshTokenCount = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    const authTokenRaw = Cookies.get("auth-token");
    const altAuthTokenRaw = Cookies.get("authToken");
    
    if (authTokenRaw) {
      const sanitizedToken = extractJwtToken(authTokenRaw);
      if (sanitizedToken !== authTokenRaw) {
        setCookieSafely(Cookies, "auth-token", sanitizedToken);
      }
    }
    
    if (altAuthTokenRaw) {
      const sanitizedToken = extractJwtToken(altAuthTokenRaw);
      if (sanitizedToken !== altAuthTokenRaw) {
        setCookieSafely(Cookies, "authToken", sanitizedToken);
      }
    }

    try {
      const response = await axios.get(`${SiteUrl}/api/v1/tokens/remaining`, {
        withCredentials: true 
      });
      
      setToken(response.data.remainingTokens ?? 0);
      setIsAuthenticated(true);
      
      setCookieSafely(Cookies, "isLoggedIn", "true", { 
        expires: 1, 
        sameSite: 'Lax',
        secure: process.env.NODE_ENV === 'production'
      });

      try {
        sessionStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("lastAuthCheck", new Date().toISOString());
      } catch (e) {
        console.error("Could not store auth state in storage:", e);
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      setToken(0);
      setIsAuthenticated(false);

      Cookies.remove("isLoggedIn");
      
      try {
        sessionStorage.removeItem("isAuthenticated");
        localStorage.removeItem("isAuthenticated");
        localStorage.setItem("lastAuthError", new Date().toISOString());
      } catch (e) {
        console.error("Could not clear auth state in storage:", e);
      }
      
      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.error || '';
        const isOAuthCharacterError = 
          errorMsg.includes('OAuth2 authentication failed') && 
          errorMsg.includes('invalid character [34]');
        
        if (isOAuthCharacterError) {
          console.error("Detected OAuth2 invalid character error - cleaning cookies");
          
          const authTokenRaw = Cookies.get("auth-token");
          const altAuthTokenRaw = Cookies.get("authToken");
          
          if (authTokenRaw) {
            Cookies.remove("auth-token");
            const sanitizedToken = extractJwtToken(authTokenRaw);
            setCookieSafely(Cookies, "auth-token", sanitizedToken);
          }
          
          if (altAuthTokenRaw) {
            Cookies.remove("authToken");
            const sanitizedToken = extractJwtToken(altAuthTokenRaw);
            setCookieSafely(Cookies, "authToken", sanitizedToken);
          }

          setError("Fixing authentication issue. Please wait...");

          setTimeout(() => {
            refreshTokenCount();
          }, 500);
          
          return;
        } else if (error.response?.status === 401) {
          setError("Authentication error. Please sign in again.");
        } else {
          setError(`Failed to fetch tokens: ${error.response?.data?.message || error.message}`);
        }
      } else {
        setError("Failed to fetch tokens");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const consumeToken = async (): Promise<boolean> => {
    const isLoggedIn = Cookies.get("isLoggedIn") === "true";
    
    if (!isAuthenticated || !isLoggedIn) {
      setError("Please sign in to continue");
      return false;
    }

    if (token === undefined || token <= 0) {
      setError("No tokens remaining or token count not yet loaded");
      return false;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      
      const response = await axios.post(
        `${SiteUrl}/api/v1/tokens/consume`,
        {}, 
        {
          withCredentials: true,
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.success === true) {
        if (response.data?.remainingTokens !== undefined) {
          setToken(response.data.remainingTokens);
        } else {
          await refreshTokenCount();
        }
        return true;
      } else {
        const message = response.data?.message || "No tokens remaining";
        setError(message);
        return false;
      }
    } catch (error) {
      console.error("Error consuming token:", error);
      
      if (axios.isAxiosError(error)) {
        console.error("📊 Axios error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            withCredentials: error.config?.withCredentials,
            headers: error.config?.headers
          }
        });
      }
      
      let errorMessage = "Failed to consume token";
      let shouldAlert = true;
      
      if (axios.isAxiosError(error)) {
        const responseText = typeof error.response?.data === 'string' ? error.response.data : '';
        const isHtmlResponse = responseText.includes('<!DOCTYPE html>') || responseText.includes('<html');
        
        if (isHtmlResponse) {
          setIsAuthenticated(false);
          Cookies.remove("isLoggedIn");
          try {
            sessionStorage.removeItem("isAuthenticated");
            localStorage.removeItem("isAuthenticated");
            localStorage.setItem("lastAuthError", new Date().toISOString());
          } catch (e) {
            console.error("Could not clear auth state in storage:", e);
          }
          errorMessage = "Your session has expired. Please sign in again.";
          shouldAlert = false; 
        } else if (error.response?.status === 401) {
          setIsAuthenticated(false);
          Cookies.remove("isLoggedIn");
          try {
            sessionStorage.removeItem("isAuthenticated");
            localStorage.removeItem("isAuthenticated");
            localStorage.setItem("lastAuthError", new Date().toISOString());
          } catch (e) {
            console.error("Could not clear auth state in storage:", e);
          }
          errorMessage = "Authentication error. Please sign in again.";
          shouldAlert = false;
        } else if (error.response?.status === 403) {
          
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else {
            errorMessage = "Access denied. You may have run out of daily tokens or your session is invalid.";
          }
        } else if (error.response?.status === 500) {
          errorMessage = "Server error occurred. Please try again later.";
        } else {
          errorMessage = error.response?.data?.message || error.message;
        }
      } else {
        errorMessage = (error as Error)?.message || "Network error occurred";
      }
      
      setError(errorMessage);
      
      if (shouldAlert) {
        alert(errorMessage);
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const isAuthPresent = checkAuthenticationMechanisms();
    const isAuthInSession = typeof window !== 'undefined' ? sessionStorage.getItem("isAuthenticated") === "true" : false;
    
    
    if (isAuthPresent || isAuthInSession) {
      refreshTokenCount();
    } else {
      setToken(0);
      setIsAuthenticated(false);
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token' || event.key === 'X-Auth-Token' || 
          event.key === 'Authorization' || event.key === 'isAuthenticated') {
        const isAuthPresent = checkAuthenticationMechanisms();
        if (isAuthPresent) {
          refreshTokenCount();
        }
      }
    };
    
    const authCheckInterval = setInterval(() => {
      if (isAuthenticated) {
        
        const lastAuthCheck = localStorage.getItem("lastAuthCheck");
        const now = new Date().getTime();
        const fiveMinutesAgo = now - (5 * 60 * 1000);
        
        if (!lastAuthCheck || new Date(lastAuthCheck).getTime() < fiveMinutesAgo) {
          localStorage.setItem("lastAuthCheck", new Date().toISOString());
          refreshTokenCount();
        } 
      }
    }, 5 * 60 * 1000); 
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(authCheckInterval);
    };
  }, []); 

  useEffect(() => {
    const checkAuth = () => {
      const isAuthPresent = checkAuthenticationMechanisms();
      
      if (isAuthPresent) {
        refreshTokenCount();
      } else {
   
        setToken(0);
        setIsAuthenticated(false);
      }
    };

    window.addEventListener("focus", checkAuth);
    return () => window.removeEventListener("focus", checkAuth);
  }, []);

  useEffect(() => {
  }, [isAuthenticated]);

  const logout = () => {
    setToken(0);
    setIsAuthenticated(false);
    setError(null);
    
    const cookieNames = ["auth-token", "JSESSIONID", "isLoggedIn", "authToken"];
    const domains = [undefined, ".itinerarly-be.onrender.com", "itinerarly-be.onrender.com", window.location.hostname, `.${window.location.hostname}`];
    const paths = ["/", undefined];
    
    cookieNames.forEach(cookieName => {
      domains.forEach(domain => {
        paths.forEach(path => {
          const options: any = {};
          if (domain) options.domain = domain;
          if (path) options.path = path;
          
          Cookies.remove(cookieName, options);
          
          Cookies.remove(cookieName, { ...options, secure: true });
          Cookies.remove(cookieName, { ...options, secure: false });
          Cookies.remove(cookieName, { ...options, sameSite: 'Lax' });
          Cookies.remove(cookieName, { ...options, sameSite: 'None', secure: true });
        });
      });
    });

    cookieNames.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
    });

    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem("isAuthenticated");
        localStorage.removeItem("isAuthenticated");
        sessionStorage.removeItem("oauthFlowStarted");
        sessionStorage.removeItem("oauthFlowTimestamp");
        sessionStorage.removeItem("authInProgress");
        localStorage.setItem("lastAuthError", new Date().toISOString());
      }
    } catch (e) {
      console.error("Could not clear auth state in storage:", e);
    }

  };

  const value = {
    token,
    isLoading,
    error,
    refreshTokenCount,
    consumeToken,
    isTokenAvailable,
    isAuthenticated,
    logout
  };

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
}

export function useToken() {
  return useContext(TokenContext);
}

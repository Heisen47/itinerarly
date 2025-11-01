"use client";
import { SignInModal } from "@/components/SignInModal";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useToken } from "@/lib/TokenProvider";

function SignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useToken();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "auth") {
      setShowError(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/start");
    }
  }, [isAuthenticated, router]);

  const handleClose = () => {
    router.push('/');
  };

  return (
    <>
      {showError && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Failed to authenticate. Please try again.
        </div>
      )}
      <SignInModal openModal={true} onClose={handleClose} />
    </>
  );
}

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f7e9d5] flex-col">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <SignInContent />
      </Suspense>
    </div>
  );
}

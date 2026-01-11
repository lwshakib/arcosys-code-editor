"use client";

import { useState, useEffect, Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ShieldAlert, Smartphone } from "lucide-react";

function DeviceApprovalContent() {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const searchParams = useSearchParams();
  const userCode = searchParams.get("user_code");
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push(`/sign-in?callbackURL=/device/approve?user_code=${userCode}`);
    }
  }, [session, isSessionPending, router, userCode]);

  if (isSessionPending || !session) {
    return (
      <div className="flex items-center justify-center min-vh-100 p-4">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  const handleApprove = async () => {
    if (!userCode) return;
    setIsProcessing(true);
    setError(null);
    try {
      const { error: approveError } = await authClient.device.approve({
        userCode: userCode,
      });
      
      if (approveError) {
        setError(approveError.error_description || "Failed to approve device");
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDeny = async () => {
    if (!userCode) return;
    setIsProcessing(true);
    setError(null);
    try {
      const { error: denyError } = await authClient.device.deny({
        userCode: userCode,
      });
      
      if (denyError) {
        setError(denyError.error_description || "Failed to deny device");
      } else {
        router.push("/");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-vh-100 p-4">
        <Card className="w-full max-w-md border-zinc-800 bg-zinc-950/50 backdrop-blur-xl text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <ShieldCheck className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Device Approved</CardTitle>
            <CardDescription className="text-zinc-400">
              Your device has been successfully authorized. You can now close this tab.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/")} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white">
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-vh-100 p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-950/50 backdrop-blur-xl">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
            <Smartphone className="h-6 w-6 text-purple-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-white">Approve Device?</CardTitle>
          <CardDescription className="text-center text-zinc-400">
            A device is requesting access to your Arcosys account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-zinc-900/50 p-4 border border-zinc-800 text-center">
            <p className="text-sm text-zinc-500 uppercase tracking-widest mb-1 font-semibold">User Code</p>
            <p className="text-3xl font-mono font-bold text-white tracking-wider">{userCode}</p>
          </div>
          
          <div className="flex items-start space-x-3 text-sm text-zinc-400">
            <ShieldCheck className="h-5 w-5 text-zinc-500 mt-0.5" />
            <p>This will allow the device to access your files and perform actions on your behalf.</p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button 
            onClick={handleDeny} 
            variant="outline"
            className="flex-1 border-zinc-800 bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white"
            disabled={isProcessing}
          >
            Deny
          </Button>
          <Button 
            onClick={handleApprove} 
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
            disabled={isProcessing}
          >
            {isProcessing ? "Approving..." : "Approve"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function DeviceApprovalPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DeviceApprovalContent />
    </Suspense>
  );
}

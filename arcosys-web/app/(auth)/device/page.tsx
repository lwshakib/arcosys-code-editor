"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function DeviceAuthorizationPage() {
  const [userCode, setUserCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Format the code: remove dashes and convert to uppercase
      const formattedCode = userCode.trim().replace(/-/g, "").toUpperCase();

      if (formattedCode.length < 4) {
        setError("Please enter a valid code.");
        setIsLoading(false);
        return;
      }

      // Check if the code is valid using GET /device endpoint
      const response = await authClient.device({
        query: { user_code: formattedCode },
      });
      
      if (response.data) {
        // Redirect to approval page
        router.push(`/device/approve?user_code=${formattedCode}`);
      } else {
        setError("Invalid or expired code");
      }
    } catch (err) {
      setError("Invalid or expired code");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-vh-100 p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-950/50 backdrop-blur-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-white">Device Authorization</CardTitle>
          <CardDescription className="text-zinc-400">
            Enter the code shown on your device to link it to your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userCode" className="text-sm font-medium text-zinc-300">
                User Code
              </Label>
              <Input
                id="userCode"
                type="text"
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                placeholder="XXXX-XXXX"
                className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-purple-500/20 focus:border-purple-500/50"
                maxLength={12}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 font-medium">{error}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              disabled={isLoading || !userCode.trim()}
            >
              {isLoading ? "Verifying..." : "Continue"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

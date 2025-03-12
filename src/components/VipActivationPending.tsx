
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Timer, Crown } from 'lucide-react';

interface VipActivationPendingProps {
  userEmail: string;
}

const VipActivationPending: React.FC<VipActivationPendingProps> = ({ userEmail }) => {
  const [remainingTime, setRemainingTime] = useState<number>(10 * 60); // 10 minutes = 600 seconds
  
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-500 to-amber-500 h-2" />
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
            {remainingTime > 0 ? (
              <Timer className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            ) : (
              <Crown className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            )}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">
              {remainingTime > 0 ? "Waiting for VIP Activation" : "VIP is Ready!"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {remainingTime > 0 ? (
                <>
                  Your request is being processed. VIP status will be activated in:
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                    {formatTime(remainingTime)}
                  </div>
                </>
              ) : (
                <>
                  Your VIP account has been activated!<br />
                  Please refresh the page to see your benefits.
                </>
              )}
            </p>
          </div>
          
          {remainingTime === 0 && (
            <p className="text-sm text-gray-500">
              If the VIP icon doesn't appear, please refresh the page or log in again.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VipActivationPending;

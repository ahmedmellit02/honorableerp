import { Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function BannedDeviceBanner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Shield className="h-16 w-16 text-red-500" />
                <AlertTriangle className="h-8 w-8 text-red-600 absolute -top-1 -right-1" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-red-600">Device Access Restricted</h1>
              <p className="text-muted-foreground">
                This device has been banned from accessing the application for security reasons.
              </p>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h2 className="font-semibold text-sm mb-2">What does this mean?</h2>
              <ul className="text-sm text-muted-foreground space-y-1 text-left">
                <li>• This specific device has been flagged by administrators</li>
                <li>• Access is blocked regardless of user account</li>
                <li>• Other devices on the same network are unaffected</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <h2 className="font-semibold text-sm mb-2">Need help?</h2>
              <p className="text-sm text-muted-foreground">
                Please contact your system administrator for assistance or to appeal this restriction.
              </p>
            </div>
            
            <div className="text-xs text-muted-foreground pt-2">
              Device restrictions are implemented for security and compliance purposes.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
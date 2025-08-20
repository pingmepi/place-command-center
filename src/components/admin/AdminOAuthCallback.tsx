import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function AdminOAuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Handle the OAuth callback by extracting the session from the URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('OAuth callback error:', error);
          toast({
            title: "Authentication Error",
            description: error.message,
            variant: "destructive",
          });
          navigate('/admin/login', { replace: true });
          return;
        }

        if (data.session) {
          // Session established successfully, redirect to admin dashboard
          navigate('/admin', { replace: true });
        } else {
          // No session found, redirect back to login
          toast({
            title: "Authentication Failed",
            description: "No valid session found. Please try again.",
            variant: "destructive",
          });
          navigate('/admin/login', { replace: true });
        }
      } catch (err) {
        console.error('Unexpected error during OAuth callback:', err);
        toast({
          title: "Authentication Error",
          description: "An unexpected error occurred during authentication.",
          variant: "destructive",
        });
        navigate('/admin/login', { replace: true });
      }
    };

    handleOAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-pulse">
          <Shield className="h-8 w-8 mx-auto mb-4 text-primary" />
        </div>
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}
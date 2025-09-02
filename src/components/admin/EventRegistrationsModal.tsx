import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Calendar, 
  Clock,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RegistrationDetailsModal } from './RegistrationDetailsModal';
import { useCurrency } from '@/context/CurrencyProvider';

interface Registration {
  id: string;
  user: {
    name: string;
    email: string;
    phone?: string;
    photo_url?: string;
  };
  event: {
    title: string;
    date_time: string;
    venue: string;
    price?: number;
    currency?: string;
  };
  status: 'confirmed' | 'cancelled' | 'pending' | 'refunded';
  payment_status: 'paid' | 'pending' | 'failed' | 'refunded' | 'free';
  payment_id?: string;
  registered_at: string;
  special_requests?: string;
  dietary_preferences?: string;
  emergency_contact?: {
    name: string;
    phone: string;
  };
}

interface EventRegistrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | null;
  eventTitle: string;
}

export function EventRegistrationsModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
}: EventRegistrationsModalProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    if (isOpen && eventId) {
      loadRegistrations();
    }
  }, [isOpen, eventId]);

  const loadRegistrations = async () => {
    if (!eventId) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          user:users(name, photo_url),
          event:events(title, date_time, venue, price, currency)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData: Registration[] = data?.map(reg => ({
        id: reg.id,
        user: {
          ...reg.user,
          email: `user${reg.user_id.slice(0, 8)}@example.com`, // Placeholder email
          phone: undefined,
        },
        event: reg.event,
        status: reg.status === 'success' ? 'confirmed' : 
                reg.status === 'failed' ? 'cancelled' : 
                reg.status === 'cancelled' ? 'cancelled' : 'pending',
        payment_status: reg.status === 'success' ? 'paid' : 
                       reg.status === 'failed' ? 'failed' : 'pending',
        payment_id: reg.payment_id,
        registered_at: reg.created_at,
        special_requests: undefined,
        dietary_preferences: undefined,
        emergency_contact: undefined,
      })) || [];

      setRegistrations(transformedData);
    } catch (error) {
      console.error('Error loading registrations:', error);
      toast({
        title: "Error Loading Registrations",
        description: "Failed to load event registrations.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'refunded':
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default' as const;
      case 'cancelled':
        return 'destructive' as const;
      case 'pending':
        return 'secondary' as const;
      case 'refunded':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  const handleViewDetails = (registration: Registration) => {
    setSelectedRegistration(registration);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedRegistration(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Event Registrations</DialogTitle>
            <DialogDescription>
              All registrations for {eventTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No registrations found for this event</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    {registrations.length} registration{registrations.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                
                {registrations.map((registration) => (
                  <div
                    key={registration.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleViewDetails(registration)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={registration.user.photo_url} />
                        <AvatarFallback>
                          {registration.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <p className="font-medium">{registration.user.name}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {registration.user.email}
                          </div>
                          {registration.user.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {registration.user.phone}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(registration.registered_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(registration.status)}
                        <Badge variant={getStatusVariant(registration.status)}>
                          {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <Badge variant="outline">
                        {registration.payment_status === 'free' ? 'Free' : 
                         registration.payment_status.charAt(0).toUpperCase() + registration.payment_status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <RegistrationDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        registration={selectedRegistration}
      />
    </>
  );
}
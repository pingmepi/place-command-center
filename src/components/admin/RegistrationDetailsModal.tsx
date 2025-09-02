import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  MapPin,
  User,
  CreditCard,
  Clock,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
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


interface RegistrationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration | null;
  onContactUser?: () => void;
  onRefund?: () => void;
  onCancel?: () => void;
}


export function RegistrationDetailsModal({
  isOpen,
  onClose,
  registration,
  onContactUser,
  onRefund,
  onCancel,
}: RegistrationDetailsModalProps) {

  const { formatCurrency } = useCurrency();

  if (!registration) return null;

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

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default' as const;
      case 'failed':
        return 'destructive' as const;
      case 'pending':
        return 'secondary' as const;
      case 'refunded':
        return 'outline' as const;
      case 'free':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registration Details</DialogTitle>
          <DialogDescription>
            Complete registration information for {registration.user.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">User Information</h3>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={registration.user.photo_url} />
                <AvatarFallback>
                  {registration.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h4 className="font-medium">{registration.user.name}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {registration.user.email}
                </div>
                {registration.user.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {registration.user.phone}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Event Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Event Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{registration.event.title}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {new Date(registration.event.date_time).toLocaleString()}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {registration.event.venue}
              </div>
              {registration.event.price && registration.event.price > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {formatCurrency(Number(registration.event.price))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Registration Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Registration Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="flex items-center gap-2">
                  {getStatusIcon(registration.status)}
                  <Badge variant={getStatusVariant(registration.status)}>
                    {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
                <Badge variant={getPaymentStatusVariant(registration.payment_status)}>
                  {registration.payment_status.charAt(0).toUpperCase() + registration.payment_status.slice(1)}
                </Badge>
              </div>
            </div>

            {registration.payment_id && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Payment ID</label>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {registration.payment_id}
                </code>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Registered At</label>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                {new Date(registration.registered_at).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(registration.special_requests || registration.dietary_preferences || registration.emergency_contact) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Information</h3>

                {registration.special_requests && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Special Requests</label>
                    <p className="text-sm bg-muted p-3 rounded-md">
                      {registration.special_requests}
                    </p>
                  </div>
                )}

                {registration.dietary_preferences && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Dietary Preferences</label>
                    <p className="text-sm bg-muted p-3 rounded-md">
                      {registration.dietary_preferences}
                    </p>
                  </div>
                )}

                {registration.emergency_contact && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Emergency Contact</label>
                    <div className="bg-muted p-3 rounded-md space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4" />
                        {registration.emergency_contact.name}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4" />
                        {registration.emergency_contact.phone}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

          {/* Actions (replaces table dropdown) */}
          <div className="flex items-center justify-end gap-2 pt-2">
            {onContactUser && (
              <Button variant="outline" onClick={onContactUser} className="gap-2">
                Contact User
              </Button>
            )}
            {onRefund && (
              <Button variant="outline" onClick={onRefund} className="gap-2">
                Process Refund
              </Button>
            )}
            {onCancel && (
              <Button variant="destructive" onClick={onCancel} className="gap-2">
                Cancel Registration
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
      </DialogContent>
    </Dialog>
  );
}
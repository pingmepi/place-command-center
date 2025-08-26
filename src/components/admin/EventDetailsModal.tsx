import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Edit,
  User,
  Building,
  Clock
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent as AlertContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader as AlertHeader, AlertDialogTitle as AlertTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { EventModal } from './EventModal';

interface Event {
  id: string;
  title: string;
  description?: string;
  date_time: string;
  venue: string;
  capacity: number;
  price?: number;
  currency?: string;
  is_cancelled: boolean;
  created_at: string;
  community_id: string;
  community: {
    name: string;
    city: string;
    photo_url?: string;
  };
  host: {
    name: string;
    photo_url?: string;
  };
  registration_count?: number;
}

// Helpers for null-safe strings and initials (local to this file)
const safeString = (v: unknown): string => {
  if (v === null || v === undefined) return '';
  try { return String(v); } catch { return ''; }
};
const getInitials = (name?: string): string => {
  const s = safeString(name).trim();
  if (!s) return 'U';
  const parts = s.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0];
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : undefined;
  const initials = `${first ?? ''}${last ?? ''}`.toUpperCase();
  return initials || (first?.toUpperCase() ?? 'U');
};


interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onSuccess?: () => void;
  onViewRegistrations?: () => void;
  onCancel?: () => void;
}

export function EventDetailsModal({ isOpen, onClose, event, onSuccess, onViewRegistrations, onCancel }: EventDetailsModalProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!event) return null;

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    onSuccess?.();
    setIsEditModalOpen(false);
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return 'Free';
    try {
      const nf = new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'INR' });
      return nf.format(price);
    } catch {
      return `${currency || ''} ${price.toLocaleString()}`.trim();
    }
  };

  const getStatusBadge = () => {
    if (event.is_cancelled) {
      return <Badge variant="destructive">Cancelled</Badge>;
    }

    const eventDate = new Date(event.date_time);
    const now = new Date();

    if (eventDate < now) {
      return <Badge variant="secondary">Completed</Badge>;
    }

    return <Badge variant="default">Upcoming</Badge>;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Event Details</span>
              <Button onClick={handleEdit} size="sm" disabled={event.is_cancelled} title={event.is_cancelled ? 'Cancelled events cannot be edited' : undefined}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Event
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Event Header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold">{event.title}</h2>
                {getStatusBadge()}
              </div>
              {event.description && (
                <p className="text-muted-foreground">{event.description}</p>
              )}
            </div>

            <Separator />

            {/* Event Details Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Date & Time */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">Date & Time</span>
                </div>
                <div className="text-sm">
                  <p>{new Date(event.date_time).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                  <p className="text-muted-foreground">
                    {new Date(event.date_time).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Venue */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">Venue</span>
                </div>
                <p className="text-sm">{event.venue}</p>
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">Capacity</span>
                </div>
                <div className="text-sm">
                  <p>{event.registration_count || 0} / {event.capacity} registered</p>
                  <div className="w-full bg-muted rounded-full h-2 mt-1">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{
                        width: `${Math.min(((event.registration_count || 0) / event.capacity) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="font-medium">Price</span>
                </div>
                <p className="text-sm font-medium">{formatPrice(event.price, event.currency)}</p>
              </div>
            </div>

            <Separator />

            {/* Community & Host */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Community */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" />
                  <span className="font-medium">Community</span>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={safeString(event.community.photo_url) || undefined}
                      alt={safeString(event.community.name) || 'Community image'}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ''; }}
                    />
                    <AvatarFallback>
                      {getInitials(event.community.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{event.community.name}</p>
                    <p className="text-xs text-muted-foreground">{event.community.city}</p>
                  </div>
                </div>
              </div>

              {/* Host */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-medium">Host</span>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={safeString(event.host.photo_url) || undefined}
                      alt={safeString(event.host.name) || 'Host avatar'}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ''; }}
                    />
                    <AvatarFallback>
                      {getInitials(event.host.name)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium">{event.host.name}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Metadata */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">Created</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(event.created_at).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* Actions (replaces table dropdown) */}
            <div className="flex items-center justify-end gap-2 pt-2">
              {onViewRegistrations && (
                <Button variant="outline" onClick={onViewRegistrations} className="gap-2">
                  View Registrations
                </Button>
              )}
              {onCancel && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2" disabled={event.is_cancelled} title={event.is_cancelled ? 'Event is already cancelled' : undefined}>Cancel Event</Button>
                  </AlertDialogTrigger>
                  <AlertContent>
                    <AlertHeader>
                      <AlertTitle>Cancel this event?</AlertTitle>
                      <AlertDialogDescription>
                        This action will mark the event as cancelled. Attendees will no longer be able to register.
                      </AlertDialogDescription>
                    </AlertHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Nevermind</AlertDialogCancel>
                      <AlertDialogAction onClick={onCancel}>Yes, cancel</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EventModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        event={event}
      />
    </>
  );
}
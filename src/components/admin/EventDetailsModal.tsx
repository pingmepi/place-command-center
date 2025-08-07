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

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onSuccess?: () => void;
}

export function EventDetailsModal({ isOpen, onClose, event, onSuccess }: EventDetailsModalProps) {
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
    return `${currency || 'INR'} ${price.toLocaleString()}`;
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
              <Button onClick={handleEdit} size="sm">
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
                    <AvatarImage src={event.community.photo_url} />
                    <AvatarFallback>
                      {event.community.name.substring(0, 2).toUpperCase()}
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
                    <AvatarImage src={event.host.photo_url} />
                    <AvatarFallback>
                      {event.host.name.split(' ').map(n => n[0]).join('').toUpperCase()}
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
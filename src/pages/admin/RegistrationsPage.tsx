import React, { useEffect, useState } from 'react';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Download, Calendar, User, CreditCard, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RegistrationDetailsModal } from '@/components/admin/RegistrationDetailsModal';

interface Registration {
  id: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  payment_id?: string;
  created_at: string;
  updated_at: string;
  event: {
    title: string;
    date_time: string;
    venue: string;
    community: {
      name: string;
      city: string;
    };
  };
  user: {
    name: string;
    photo_url?: string;
  };
}

const columns: Column<Registration>[] = [
  {
    key: 'user',
    header: 'User',
    sortable: true,
    render: (value, row) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.user.photo_url} />
          <AvatarFallback className="text-xs">
            {row.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{row.user.name}</span>
      </div>
    ),
  },
  {
    key: 'event',
    header: 'Event',
    sortable: true,
    filterable: true,
    render: (value, row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <Calendar className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="font-medium">{row.event.title}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{row.event.community.name}</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    key: 'event',
    header: 'Event Date',
    sortable: true,
    render: (value, row) => (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">
            {new Date(row.event.date_time).toLocaleDateString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(row.event.date_time).toLocaleTimeString()}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    filterable: true,
    render: (value) => {
      const variants = {
        pending: 'outline' as const,
        success: 'default' as const,
        failed: 'destructive' as const,
        cancelled: 'destructive' as const,
      };
      return <Badge variant={variants[value]}>{value.charAt(0).toUpperCase() + value.slice(1)}</Badge>;
    },
  },
  {
    key: 'payment_id',
    header: 'Payment',
    render: (value, row) => (
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-muted-foreground" />
        <div>
          {value ? (
            <div>
              <p className="text-sm font-medium">Paid</p>
              <p className="text-xs text-muted-foreground">ID: {value.slice(0, 8)}...</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not processed</p>
          )}
        </div>
      </div>
    ),
  },
  {
    key: 'created_at',
    header: 'Registered',
    sortable: true,
    render: (value) => (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm">{new Date(value).toLocaleDateString()}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(value).toLocaleTimeString()}
          </p>
        </div>
      </div>
    ),
  },
];

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      setIsLoading(true);
      
      const { data: registrationsData, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          event:events(
            title,
            date_time,
            venue,
            community:communities(name, city)
          ),
          user:users(name, photo_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRegistrations(registrationsData || []);
    } catch (error) {
      console.error('Error loading registrations:', error);
      toast({
        title: "Error Loading Registrations",
        description: "Failed to load registrations data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRegistration = (registration: Registration) => {
    toast({
      title: "Cancel Registration",
      description: `Cancel registration for ${registration.user.name} - Feature coming soon!`,
      variant: "destructive",
    });
  };

  const handleRefund = (registration: Registration) => {
    toast({
      title: "Process Refund",
      description: `Process refund for ${registration.user.name} - Feature coming soon!`,
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Registrations",
      description: "Export functionality coming soon!",
    });
  };

  // Get unique events and statuses for filtering
  const events = [...new Set(registrations.map(r => r.event.title))].map(title => ({
    value: title,
    label: title,
  }));

  const statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'success', label: 'Success' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const filters = [
    {
      key: 'event' as keyof Registration,
      label: 'Event',
      options: events,
    },
    {
      key: 'status' as keyof Registration,
      label: 'Status',
      options: statuses,
    },
  ];

  const handleViewDetails = (registration: Registration) => {
    // Transform to match RegistrationDetailsModal interface
    const transformedRegistration = {
      id: registration.id,
      user: {
        name: registration.user.name,
        email: `user@example.com`, // Placeholder
        photo_url: registration.user.photo_url,
      },
      event: {
        title: registration.event.title,
        date_time: registration.event.date_time,
        venue: registration.event.venue,
      },
      status: registration.status === 'success' ? 'confirmed' : 
              registration.status === 'failed' ? 'cancelled' : 'pending',
      payment_status: registration.status === 'success' ? 'paid' : 'pending',
      payment_id: registration.payment_id,
      registered_at: registration.created_at,
    };
    setSelectedRegistration(transformedRegistration as any);
    setIsDetailsModalOpen(true);
  };

  const actions = [
    {
      label: 'View Details',
      onClick: handleViewDetails,
    },
    {
      label: 'Contact User',
      onClick: (registration: Registration) => {
        toast({
          title: "Contact User",
          description: `Contact ${registration.user.name} - Feature coming soon!`,
        });
      },
    },
    {
      label: 'Process Refund',
      onClick: handleRefund,
    },
    {
      label: 'Cancel Registration',
      onClick: handleCancelRegistration,
      variant: 'destructive' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Registrations</h1>
          <p className="text-muted-foreground">Manage event registrations and payments</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="admin-focus">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Registrations Table */}
      <DataTable
        data={registrations}
        columns={columns}
        title="Event Registrations"
        isLoading={isLoading}
        onRefresh={loadRegistrations}
        onExport={handleExport}
        searchPlaceholder="Search registrations..."
        filters={filters}
        actions={actions}
      />

      <RegistrationDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        registration={selectedRegistration}
      />
    </div>
  );
}
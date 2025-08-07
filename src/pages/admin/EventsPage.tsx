import React, { useEffect, useState } from 'react';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Calendar, MapPin, Users, DollarSign, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  updated_at: string;
  community: {
    name: string;
    city: string;
  };
  host: {
    name: string;
    photo_url?: string;
  } | null;
  registration_count?: number;
  tags?: { name: string }[];
}

const columns: Column<Event>[] = [
  {
    key: 'title',
    header: 'Event',
    sortable: true,
    render: (value, row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">{row.title}</p>
          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
            {row.description || 'No description'}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: 'date_time',
    header: 'Date & Time',
    sortable: true,
    render: (value) => (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">
            {new Date(value).toLocaleDateString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(value).toLocaleTimeString()}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: 'community',
    header: 'Community',
    sortable: true,
    filterable: true,
    render: (value, row) => (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{row.community.name}</p>
          <p className="text-xs text-muted-foreground">{row.community.city}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'host',
    header: 'Host',
    render: (value, row) => (
      <div className="flex items-center gap-2">
        {row.host ? (
          <>
            <Avatar className="h-6 w-6">
              <AvatarImage src={row.host.photo_url} />
              <AvatarFallback className="text-xs">
                {row.host.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{row.host.name}</span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">No host</span>
        )}
      </div>
    ),
  },
  {
    key: 'capacity',
    header: 'Capacity',
    sortable: true,
    render: (value, row) => (
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span>{row.registration_count || 0}/{value}</span>
      </div>
    ),
  },
  {
    key: 'price',
    header: 'Price',
    sortable: true,
    render: (value, row) => (
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-muted-foreground" />
        <span>
          {value && value > 0 
            ? `${row.currency || 'INR'} ${value}` 
            : 'Free'
          }
        </span>
      </div>
    ),
  },
  {
    key: 'is_cancelled',
    header: 'Status',
    filterable: true,
    render: (value, row) => {
      const isPast = new Date(row.date_time) < new Date();
      if (value) {
        return <Badge variant="destructive">Cancelled</Badge>;
      }
      if (isPast) {
        return <Badge variant="secondary">Completed</Badge>;
      }
      return <Badge variant="default">Upcoming</Badge>;
    },
  },
  {
    key: 'created_at',
    header: 'Created',
    sortable: true,
    render: (value) => new Date(value).toLocaleDateString(),
  },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      
      const { data: eventsData, error } = await supabase
        .from('events')
        .select(`
          *,
          community:communities(name, city),
          host:users(name, photo_url),
          registration_count:event_registrations(count),
          tags:event_tags(tag:tags(name))
        `)
        .order('date_time', { ascending: false });

      if (error) throw error;

      const transformedData = eventsData?.map(event => ({
        ...event,
        registration_count: event.registration_count?.[0]?.count || 0,
        tags: event.tags?.map(t => t.tag) || [],
      })) || [];

      setEvents(transformedData);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: "Error Loading Events",
        description: "Failed to load events data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    toast({
      title: "Edit Event",
      description: `Editing ${event.title} - Feature coming soon!`,
    });
  };

  const handleCancel = (event: Event) => {
    toast({
      title: "Cancel Event",
      description: `Cancel ${event.title} - Feature coming soon!`,
      variant: "destructive",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Events",
      description: "Export functionality coming soon!",
    });
  };

  // Get unique communities and statuses for filtering
  const communities = [...new Set(events.map(e => e.community.name))].map(name => ({
    value: name,
    label: name,
  }));

  const statuses = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const filters = [
    {
      key: 'community' as keyof Event,
      label: 'Community',
      options: communities,
    },
    {
      key: 'is_cancelled' as keyof Event,
      label: 'Status',
      options: statuses,
    },
  ];

  const actions = [
    {
      label: 'Edit Event',
      onClick: handleEdit,
    },
    {
      label: 'View Registrations',
      onClick: (event: Event) => {
        toast({
          title: "View Registrations",
          description: `Viewing registrations for ${event.title}`,
        });
      },
    },
    {
      label: 'Cancel Event',
      onClick: handleCancel,
      variant: 'destructive' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Events</h1>
          <p className="text-muted-foreground">Manage events across all communities</p>
        </div>
        <Button className="admin-focus">
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Events Table */}
      <DataTable
        data={events}
        columns={columns}
        title="Events Overview"
        isLoading={isLoading}
        onRefresh={loadEvents}
        onExport={handleExport}
        searchPlaceholder="Search events..."
        filters={filters}
        actions={actions}
      />
    </div>
  );
}
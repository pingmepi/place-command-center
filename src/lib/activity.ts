import { supabase } from '@/integrations/supabase/client';

export type ActivityType =
  | 'user_created'
  | 'event_created'
  | 'community_created'
  | 'discussion_created'
  | 'registration_created';

interface LogActivityInput {
  action_type: ActivityType | string;
  target_type: string; // e.g., 'event' | 'community' | 'discussion'
  target_id?: string | null;
  metadata?: Record<string, any> | null;
  timestamp?: string; // ISO string; defaults to now
}

export async function logActivity(input: LogActivityInput): Promise<void> {
  try {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;

    await supabase.from('user_activity_log').insert({
      user_id: userId || '00000000-0000-0000-0000-000000000000',
      action_type: input.action_type,
      target_type: input.target_type,
      target_id: input.target_id ?? null,
      metadata: input.metadata ?? null,
      timestamp: input.timestamp || new Date().toISOString(),
    });
  } catch (e) {
    // Non-blocking: swallow errors but log to console for debugging
    console.warn('logActivity failed', e);
  }
}


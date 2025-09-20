import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface Activity {
  id: string;
  user_id: string;
  prospect_id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'quote_sent' | 'follow_up';
  subject?: string;
  description: string;
  scheduled_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  prospect_name?: string;
  prospect?: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
  };
  user_name?: string;
}

export interface CreateActivityData {
  prospect_id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'quote_sent' | 'follow_up';
  subject?: string;
  description: string;
  scheduled_at?: string;
}

export function useActivities() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          prospects:prospect_id (
            name,
            email,
            phone,
            company
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include prospect_name for compatibility
      const transformedData = (data || []).map(activity => ({
        ...activity,
        prospect_name: activity.prospects?.name || 'Prospect inconnu',
        prospect: activity.prospects
      }));

      setActivities(transformedData);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Erreur lors du chargement des activités');
      toast({
        title: "Erreur",
        description: "Impossible de charger les activités",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createActivity = async (activityData: CreateActivityData) => {
    try {
      if (!user) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('activities')
        .insert([
          {
            ...activityData,
            user_id: user.id,
          }
        ])
        .select(`
          *,
          prospects:prospect_id (
            name,
            email,
            phone,
            company
          )
        `)
        .single();

      if (error) throw error;

      const transformedActivity = {
        ...data,
        prospect_name: data.prospects?.name || 'Prospect inconnu',
        prospect: data.prospects
      };

      setActivities(prev => [transformedActivity, ...prev]);
      
      toast({
        title: "Succès",
        description: "Activité ajoutée avec succès!"
      });

      return transformedActivity;
    } catch (err) {
      console.error('Error creating activity:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'activité",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          prospects:prospect_id (
            name,
            email,
            phone,
            company
          )
        `)
        .single();

      if (error) throw error;

      const transformedActivity = {
        ...data,
        prospect_name: data.prospects?.name || 'Prospect inconnu',
        prospect: data.prospects
      };

      setActivities(prev => 
        prev.map(activity => 
          activity.id === id ? { ...activity, ...transformedActivity } : activity
        )
      );

      toast({
        title: "Succès",
        description: "Activité mise à jour avec succès!"
      });

      return transformedActivity;
    } catch (err) {
      console.error('Error updating activity:', err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'activité",
        variant: "destructive"
      });
      throw err;
    }
  };

  const completeActivity = async (id: string) => {
    return updateActivity(id, { completed_at: new Date().toISOString() });
  };

  const getActivitiesByProspect = (prospectId: string) => {
    return activities.filter(activity => activity.prospect_id === prospectId);
  };

  const getActivitiesByType = (type: string) => {
    return activities.filter(activity => activity.type === type);
  };

  const getPendingActivities = () => {
    return activities.filter(activity => !activity.completed_at);
  };

  const getUpcomingActivities = () => {
    const now = new Date();
    return activities.filter(activity => 
      activity.scheduled_at && 
      new Date(activity.scheduled_at) > now &&
      !activity.completed_at
    );
  };

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  return {
    activities,
    loading,
    error,
    createActivity,
    updateActivity,
    completeActivity,
    refetch: fetchActivities,
    getActivitiesByProspect,
    getActivitiesByType,
    getPendingActivities,
    getUpcomingActivities
  };
}
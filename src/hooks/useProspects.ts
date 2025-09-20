import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface Prospect {
  id: string;
  user_id: string;
  assigned_to?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';
  priority: 'low' | 'medium' | 'high';
  source?: string;
  budget_range?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProspectData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  priority: 'low' | 'medium' | 'high';
  budget_range?: string;
  notes?: string;
}

export function useProspects() {
  const { user } = useAuth();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProspects = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProspects(data || []);
    } catch (err) {
      console.error('Error fetching prospects:', err);
      setError('Erreur lors du chargement des prospects');
      toast({
        title: "Erreur",
        description: "Impossible de charger les prospects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProspect = async (prospectData: CreateProspectData) => {
    try {
      if (!user) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('prospects')
        .insert([
          {
            ...prospectData,
            user_id: user.id,
            status: 'new',
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setProspects(prev => [data, ...prev]);
      
      toast({
        title: "Succès",
        description: "Prospect ajouté avec succès!"
      });

      return data;
    } catch (err) {
      console.error('Error creating prospect:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le prospect",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateProspect = async (id: string, updates: Partial<Prospect>) => {
    try {
      const { data, error } = await supabase
        .from('prospects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProspects(prev => 
        prev.map(prospect => 
          prospect.id === id ? { ...prospect, ...data } : prospect
        )
      );

      toast({
        title: "Succès",
        description: "Prospect mis à jour avec succès!"
      });

      return data;
    } catch (err) {
      console.error('Error updating prospect:', err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le prospect",
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteProspect = async (id: string) => {
    try {
      const { error } = await supabase
        .from('prospects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProspects(prev => prev.filter(prospect => prospect.id !== id));
      
      toast({
        title: "Succès",
        description: "Prospect supprimé avec succès!"
      });
    } catch (err) {
      console.error('Error deleting prospect:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le prospect",
        variant: "destructive"
      });
      throw err;
    }
  };

  const getProspectsByStatus = (status: string) => {
    return prospects.filter(prospect => prospect.status === status);
  };

  const getProspectsByPriority = (priority: string) => {
    return prospects.filter(prospect => prospect.priority === priority);
  };

  useEffect(() => {
    if (user) {
      fetchProspects();
    }
  }, [user]);

  return {
    prospects,
    loading,
    error,
    createProspect,
    updateProspect,
    deleteProspect,
    refetch: fetchProspects,
    getProspectsByStatus,
    getProspectsByPriority
  };
}
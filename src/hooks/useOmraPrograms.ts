import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OmraProgram {
  id: string;
  title: string;
  description: string | null;
  duration_days: number;
  price_per_person: number;
  max_participants: number | null;
  current_participants: number;
  departure_date: string;
  return_date: string;
  departure_city: string;
  departure_airport?: string | null;
  arrival_airport?: string | null;
  hotels: any[];
  included_services: string[];
  excluded_services: string[];
  itinerary: any[];
  status: 'draft' | 'published' | 'full' | 'cancelled' | 'completed';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string | null;
}

export interface CreateOmraProgramData {
  title: string;
  description?: string | null;
  duration_days: number;
  price_per_person: number;
  max_participants?: number | null;
  departure_date: string;
  return_date: string;
  departure_city: string;
  departure_airport?: string;
  arrival_airport?: string;
  hotels?: any[];
  included_services?: string[];
  excluded_services?: string[];
  status?: 'draft' | 'published' | 'full' | 'cancelled' | 'completed';
}

export interface UpdateOmraProgramData {
  title?: string;
  description?: string | null;
  duration_days?: number;
  price_per_person?: number;
  max_participants?: number | null;
  departure_date?: string;
  return_date?: string;
  departure_city?: string;
  departure_airport?: string;
  arrival_airport?: string;
  hotels?: any[];
  included_services?: string[];
  excluded_services?: string[];
  status?: 'draft' | 'published' | 'full' | 'cancelled' | 'completed';
}

export function useOmraPrograms() {
  return useQuery({
    queryKey: ['omra-programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('omra_programs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OmraProgram[];
    },
  });
}

export function useCreateOmraProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (programData: CreateOmraProgramData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('omra_programs')
        .insert([{
          ...programData,
          included_services: programData.included_services || [],
          excluded_services: programData.excluded_services || [],
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omra-programs'] });
    },
  });
}

export function useUpdateOmraProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: programData }: { id: string; data: UpdateOmraProgramData }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('omra_programs')
        .update({
          ...programData,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omra-programs'] });
    },
  });
}
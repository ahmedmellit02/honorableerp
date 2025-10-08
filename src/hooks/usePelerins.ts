import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Pelerin {
  id: string;
  program_id: string;
  name: string;
  address: string | null;
  contacts: string[];
  advance_payment: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePelerinData {
  program_id: string;
  name: string;
  address?: string;
  contacts: string[];
  advance_payment: number;
}

export function usePelerins(programId: string) {
  return useQuery({
    queryKey: ['pelerins', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pelerins')
        .select('*')
        .eq('program_id', programId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Pelerin[];
    },
  });
}

export function useCreatePelerin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pelerinData: CreatePelerinData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('pelerins')
        .insert([{
          ...pelerinData,
          name: pelerinData.name.toUpperCase(),
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pelerins', data.program_id] });
    },
  });
}

export function useUpdatePelerin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: pelerinData }: { id: string; data: Partial<CreatePelerinData> }) => {
      const updateData = { ...pelerinData };
      if (updateData.name) {
        updateData.name = updateData.name.toUpperCase();
      }

      const { data, error } = await supabase
        .from('pelerins')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pelerins', data.program_id] });
    },
  });
}

export function useDeletePelerin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, programId }: { id: string; programId: string }) => {
      const { error } = await supabase
        .from('pelerins')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, programId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pelerins', data.programId] });
    },
  });
}

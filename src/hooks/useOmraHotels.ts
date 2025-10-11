import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RoomType {
  capacity: number;
  price: number | null;
}

export interface Hotel {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  star_rating: number | null;
  distance_from_haram: string | null;
  price_per_night: number | null;
  description: string | null;
  amenities: any[];
  images: any[];
  room_types: RoomType[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CreateHotelData {
  name: string;
  room_types?: RoomType[];
}

export function useHotels() {
  return useQuery({
    queryKey: ['hotels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as Hotel[];
    },
  });
}

export function useCreateHotel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hotelData: CreateHotelData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('hotels')
        .insert([{
          ...hotelData,
          room_types: hotelData.room_types || [] as any,
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Hotel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
  });
}

export function useUpdateHotel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, hotelData }: { id: string; hotelData: Partial<Hotel> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('hotels')
        .update(hotelData as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Hotel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
  });
}
-- Add hotel_id and roommate_id to pelerins table
ALTER TABLE public.pelerins
ADD COLUMN hotel_id uuid REFERENCES public.hotels(id) ON DELETE SET NULL,
ADD COLUMN roommate_id uuid REFERENCES public.pelerins(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_pelerins_hotel_id ON public.pelerins(hotel_id);
CREATE INDEX idx_pelerins_roommate_id ON public.pelerins(roommate_id);

COMMENT ON COLUMN public.pelerins.hotel_id IS 'Reference to the hotel where the pelerin will stay';
COMMENT ON COLUMN public.pelerins.roommate_id IS 'Reference to another pelerin who will be the roommate';
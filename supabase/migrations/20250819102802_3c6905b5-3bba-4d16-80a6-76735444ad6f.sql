-- Remove the duplicate notification trigger
DROP TRIGGER IF EXISTS notification_trigger ON public.sales;

-- Keep only the check_and_generate_notification_trigger
-- Let's also verify the remaining trigger is set up correctly
DROP TRIGGER IF EXISTS check_and_generate_notification_trigger ON public.sales;

-- Recreate the trigger properly
CREATE TRIGGER check_and_generate_notification_trigger
    AFTER INSERT ON public.sales
    FOR EACH ROW
    EXECUTE FUNCTION public.check_and_generate_notification();
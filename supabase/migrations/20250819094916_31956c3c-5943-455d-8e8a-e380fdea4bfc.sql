-- Recreate the trigger
CREATE TRIGGER check_and_generate_notification_trigger
  AFTER INSERT ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_generate_notification();
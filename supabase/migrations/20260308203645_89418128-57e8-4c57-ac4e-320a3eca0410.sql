
CREATE TABLE public.notification_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_fingerprint TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  notify_rsvp BOOLEAN NOT NULL DEFAULT true,
  notify_checkin BOOLEAN NOT NULL DEFAULT true,
  notify_reminder BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(device_fingerprint)
);

ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view notification_subscriptions"
ON public.notification_subscriptions FOR SELECT USING (true);

CREATE POLICY "Anyone can insert notification_subscriptions"
ON public.notification_subscriptions FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update notification_subscriptions"
ON public.notification_subscriptions FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete notification_subscriptions"
ON public.notification_subscriptions FOR DELETE USING (true);

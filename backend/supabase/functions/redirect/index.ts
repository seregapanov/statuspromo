import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  const path = new URL(req.url).pathname;
  const code = path.split('/').pop();

  if (!code) {
    return new Response('Not found', { status: 404 });
  }

  const { data, error } = await supabase
    .from('shares')
    .select('utm_link, campaign_id, user_id')
    .eq('short_code', code)
    .single();

  if (error || !data) {
    return new Response('Link not found', { status: 404 });
  }

  // Логируем клик
  await supabase.from('clicks').insert({
    utm_link: data.utm_link,
    campaign_id: data.campaign_id,
    user_id: data.user_id,
    ip: req.headers.get('x-forwarded-for'),
    user_agent: req.headers.get('user-agent')
  });

  return new Response(null, {
    status: 302,
    headers: { 'Location': data.utm_link }
  });
});


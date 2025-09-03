// [[path]].ts — динамический редирект для UTM-ссылок
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Инициализация Supabase клиента
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const path = url.pathname; // Например: /c/abc123

    // Извлекаем короткий код (последняя часть пути)
    const pathSegments = path.split('/').filter(Boolean);
    const code = pathSegments.pop(); // Например: 'abc123'

    if (!code) {
      return new Response('Not found', { status: 404 });
    }

    // Ищем запись по короткому коду в таблице shares
    const { data: share, error } = await supabase
      .from('shares')
      .select('utm_link, campaign_id, user_id')
      .eq('short_code', code)
      .single();

    if (error || !share) {
      return new Response('Link not found', { status: 404 });
    }

    // Логируем клик
    await supabase.from('clicks').insert({
      utm_link: share.utm_link,
      campaign_id: share.campaign_id,
      user_id: share.user_id,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      clicked_at: new Date().toISOString(),
    });

    // Редирект на целевую UTM-ссылку
    return new Response(null, {
      status: 302,
      headers: {
        'Location': share.utm_link,
        'Cache-Control': 'no-store', // Не кешировать редирект
      },
    });

  } catch (err) {
    console.error('Redirect error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
});

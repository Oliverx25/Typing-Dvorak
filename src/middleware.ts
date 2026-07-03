import { defineMiddleware } from 'astro:middleware';
import { createServerClient } from '@supabase/ssr';

const AUTH_ONLY_ROUTES = ['/login', '/signup', '/forgot-password'];

export const onRequest = defineMiddleware(async (context, next) => {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const pathname = context.url.pathname;

  const canUseCookies =
    context.cookies &&
    typeof context.cookies.getAll === 'function' &&
    typeof context.cookies.set === 'function';

  if (!url || !key || !canUseCookies) {
    context.locals.user = null;
    return next();
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return context.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          context.cookies.set(name, value, options);
        });
      },
    },
  });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    context.locals.user = user ?? null;

    if (user && AUTH_ONLY_ROUTES.includes(pathname)) {
      return context.redirect('/lessons');
    }
  } catch {
    context.locals.user = null;
  }

  return next();
});

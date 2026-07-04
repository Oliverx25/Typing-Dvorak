import { N as sequence, U as defineMiddleware } from "./chunks/render_5Y2nopdm.mjs";
import { createServerClient } from "@supabase/ssr";
//#region src/middleware.ts
var AUTH_ONLY_ROUTES = [
	"/login",
	"/signup",
	"/forgot-password"
];
//#endregion
//#region \0virtual:astro:middleware
var onRequest = sequence(defineMiddleware(async (context, next) => {
	const url = "https://rtbgqigcbhcgmqmirujx.supabase.co";
	const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0YmdxaWdjYmhjZ21xbWlydWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDU1MTMsImV4cCI6MjA5ODY4MTUxM30.KuFKpeCgpCrv-jsFQfBpQmYS2gmJ-misVMMjZkfaRqk";
	const pathname = context.url.pathname;
	if (!(context.cookies && typeof context.cookies.getAll === "function" && typeof context.cookies.set === "function")) {
		context.locals.user = null;
		return next();
	}
	const supabase = createServerClient(url, key, { cookies: {
		getAll() {
			return context.cookies.getAll();
		},
		setAll(cookiesToSet) {
			cookiesToSet.forEach(({ name, value, options }) => {
				context.cookies.set(name, value, options);
			});
		}
	} });
	try {
		const { data: { user } } = await supabase.auth.getUser();
		context.locals.user = user ?? null;
		if (user && AUTH_ONLY_ROUTES.includes(pathname)) return context.redirect("/lessons");
	} catch {
		context.locals.user = null;
	}
	return next();
}));
//#endregion
export { onRequest };

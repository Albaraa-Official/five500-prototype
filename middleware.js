import { NextResponse } from "next/server";

// Set SITE_UNLOCK_KEY in your hosting provider's environment variables to
// override this default. Visiting the site with ?key=<the key> grants
// access (stored in a cookie) until the site is unlocked for everyone.
const UNLOCK_KEY = process.env.SITE_UNLOCK_KEY || "fJSuy4Y8itTM8bujQZ4LyG2uH6P9LiIV";
const SITE_LOCKED = process.env.SITE_LOCKED !== "false";
const COOKIE_NAME = "site_access";

export function middleware(request) {
  if (!SITE_LOCKED) {
    return NextResponse.next();
  }

  const { pathname, searchParams } = request.nextUrl;

  const keyParam = searchParams.get("key");
  if (keyParam && keyParam === UNLOCK_KEY) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete("key");
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set(COOKIE_NAME, UNLOCK_KEY, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  }

  const cookieValue = request.cookies.get(COOKIE_NAME)?.value;
  if (cookieValue === UNLOCK_KEY) {
    return NextResponse.next();
  }

  return new NextResponse(lockedPageHtml(), {
    status: 503,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function lockedPageHtml() {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>الموقع غير متاح حالياً</title>
<style>
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
    background:#111; color:#f5f5f5; font-family: system-ui, -apple-system, "Segoe UI", Tahoma, sans-serif; text-align:center; padding:24px; }
  .box { max-width:420px; }
  h1 { font-size:1.5rem; margin-bottom:8px; }
  p { color:#aaa; line-height:1.6; }
</style>
</head>
<body>
  <div class="box">
    <h1>الموقع غير متاح حالياً</h1>
    <p>نعمل على تحديث الموقع، يرجى المحاولة لاحقاً.</p>
  </div>
</body>
</html>`;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

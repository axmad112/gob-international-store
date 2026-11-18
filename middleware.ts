export async function middleware() { return; }

export const config = { matcher: ['/admin/:path*', '/account/:path*', '/cart/:path*', '/wishlist/:path*', '/checkout/:path*'] };

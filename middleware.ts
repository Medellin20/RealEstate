import { NextResponse, type NextRequest } from 'next/server';
import { isValidAdminSessionToken } from '@/lib/auth/admin-session';
import { ADMIN_SESSION_COOKIE } from '@/lib/utils/constants';

// Protège l'ensemble de l'espace /admin (Route Handlers /api/admin/**
// exceptés, qui vérifient la session eux-mêmes). Aucune vérification de
// mot de passe ne dépend du JavaScript côté client : la validation du
// cookie de session signé se fait ici, côté serveur, à chaque requête.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === '/admin/login';
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  let isAuthenticated = false;

  try {
    isAuthenticated = await isValidAdminSessionToken(token);
  } catch (error) {
    // Une configuration de session invalide ne doit jamais afficher une
    // page Next.js blanche. On renvoie simplement vers la connexion.
    console.error('ADMIN SESSION VALIDATION ERROR:', error);
  }

  if (!isAuthenticated && !isLoginPage) {
    const loginUrl = new URL('/admin/login', request.url);
    if (token) loginUrl.searchParams.set('session', 'expired');
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

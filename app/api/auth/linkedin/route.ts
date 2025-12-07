import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || '77k9wnqhp0sk14';
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/callback';

export async function GET() {
  // Gerar state aleatório para segurança (prevenir CSRF)
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  // Armazenar state em cookie (válido por 10 minutos)
  const cookieStore = await cookies();
  cookieStore.set('linkedin_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutos
  });

  // Scopes necessários
  const scopes = [
    'openid',
    'profile',
    'email',
    'w_member_social', // Pode não funcionar sem aprovação, mas tentamos
  ].join(' ');

  // URL de autorização do LinkedIn
  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', LINKEDIN_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', LINKEDIN_REDIRECT_URI);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('scope', scopes);

  // Redirecionar para LinkedIn
  return NextResponse.redirect(authUrl.toString());
}


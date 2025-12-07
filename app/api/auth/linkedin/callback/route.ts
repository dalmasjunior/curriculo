import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || '77k9wnqhp0sk14';
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || 'WPL_AP1.Sj70oehETyEeJYyj.OuSVCw==';
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Verificar se houve erro
  if (error) {
    return NextResponse.redirect(`${FRONTEND_URL}/curriculo?error=${encodeURIComponent(error)}`);
  }

  // Verificar se temos o código
  if (!code) {
    return NextResponse.redirect(`${FRONTEND_URL}/curriculo?error=no_code`);
  }

  // Verificar state (CSRF protection)
  const cookieStore = await cookies();
  const storedState = cookieStore.get('linkedin_oauth_state')?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${FRONTEND_URL}/curriculo?error=invalid_state`);
  }

  // Limpar o cookie do state
  cookieStore.delete('linkedin_oauth_state');

  try {
    // Trocar código por access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Erro ao obter token:', errorText);
      return NextResponse.redirect(`${FRONTEND_URL}/curriculo?error=token_failed`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Buscar dados do usuário
    let userId: string;
    let userInfo: any = {};

    // Tentar buscar via OpenID Connect userinfo endpoint
    try {
      const userInfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (userInfoResponse.ok) {
        userInfo = await userInfoResponse.json();
        userId = userInfo.sub;
      } else {
        // Tentar endpoint alternativo
        const meResponse = await fetch('https://api.linkedin.com/v2/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!meResponse.ok) {
          return NextResponse.redirect(`${FRONTEND_URL}/curriculo?error=userinfo_failed`);
        }

        const meData = await meResponse.json();
        userId = meData.id;
        userInfo = meData;
      }
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error);
      return NextResponse.redirect(`${FRONTEND_URL}/curriculo?error=userinfo_failed`);
    }

    // Buscar dados adicionais (experiência, educação, etc.)
    const profileData = await fetchLinkedInData(accessToken, userId);
    
    // Combinar dados
    const allData = {
      ...userInfo,
      ...profileData,
    };

    // Armazenar token temporariamente em cookie (para uso futuro se necessário)
    const cookieStore = await cookies();
    cookieStore.set('linkedin_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600, // 1 hora
    });

    // Redirecionar com dados (usando sessionStorage via query param)
    // Nota: Para dados grandes, considere usar session storage no backend
    return NextResponse.redirect(
      `${FRONTEND_URL}/curriculo?linkedin_import=success&data=${encodeURIComponent(JSON.stringify(allData))}`
    );
  } catch (error) {
    console.error('Erro no callback:', error);
    return NextResponse.redirect(`${FRONTEND_URL}/curriculo?error=callback_failed`);
  }
}

async function fetchLinkedInData(accessToken: string, userId: string) {
  const data: any = {
    id: userId,
  };

  try {
    // Buscar perfil completo
    const profileResponse = await fetch('https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      data.firstName = profile.firstName?.localized?.pt_BR || profile.firstName?.localized?.en_US || '';
      data.lastName = profile.lastName?.localized?.pt_BR || profile.lastName?.localized?.en_US || '';
      data.profilePicture = profile.profilePicture?.displayImage~?.elements?.[0]?.identifiers?.[0]?.identifier || '';
    }

    // Buscar experiência profissional
    try {
      const positionsResponse = await fetch(`https://api.linkedin.com/v2/people/(id:${userId})/positions`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (positionsResponse.ok) {
        const positions = await positionsResponse.json();
        data.positions = positions.elements || [];
      }
    } catch (e) {
      console.log('Erro ao buscar posições:', e);
    }

    // Buscar educação
    try {
      const educationsResponse = await fetch(`https://api.linkedin.com/v2/people/(id:${userId})/educations`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (educationsResponse.ok) {
        const educations = await educationsResponse.json();
        data.educations = educations.elements || [];
      }
    } catch (e) {
      console.log('Erro ao buscar educação:', e);
    }

    // Buscar habilidades
    try {
      const skillsResponse = await fetch(`https://api.linkedin.com/v2/people/(id:${userId})/skills`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (skillsResponse.ok) {
        const skills = await skillsResponse.json();
        data.skills = skills.elements || [];
      }
    } catch (e) {
      console.log('Erro ao buscar habilidades:', e);
    }
  } catch (error) {
    console.error('Erro ao buscar dados adicionais:', error);
  }

  return data;
}


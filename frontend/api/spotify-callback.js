// Spotify OAuth Callback Handler
import { exchangeCodeForToken } from './spotify-auth.js';

export default async function handler(req, res) {
  const { code, error, state } = req.query;

  if (error) {
    console.error('Spotify auth error:', error);
    return res.redirect(`/?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.redirect('/?error=no_code');
  }

  if (state !== 'moodtunes_auth') {
    return res.redirect('/?error=invalid_state');
  }

  try {
    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);
    
    // Store token in session/localStorage via client-side redirect
    const tokenParams = new URLSearchParams({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || '',
      expires_in: tokenData.expires_in || 3600
    });

    // Redirect back to main app with tokens
    return res.redirect(`/?spotify_auth=success&${tokenParams.toString()}`);

  } catch (error) {
    console.error('Token exchange error:', error);
    return res.redirect(`/?error=${encodeURIComponent('token_exchange_failed')}`);
  }
}

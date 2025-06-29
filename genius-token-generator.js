// Genius Token Generator using Client Credentials
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function generateGeniusToken() {
  console.log('🎵 Generating permanent Genius API token...');
  
  const CLIENT_ID = 'ZUyCMQ4kvkW1z4pq41dwT8DCii-2QApzOjT7YjU1HziyOI-xglvYPO45H6_l6Fgi';
  const CLIENT_SECRET = 'B573ANm_gLE8U0V5FTK6emnUpEtcrESSrl11qGZklODl6v6nYM3xP5JTTb6hzVF4yXOstxCmcm5JQXVyYi8C2A';
  
  console.log('Client ID:', CLIENT_ID.substring(0, 20) + '...');
  console.log('Client Secret:', CLIENT_SECRET.substring(0, 20) + '...');
  
  // Method 1: Try using Client ID as access token (common pattern)
  console.log('\n🔍 Method 1: Testing Client ID as access token...');
  try {
    const testRes = await fetch('https://api.genius.com/search?q=test', {
      headers: {
        Authorization: `Bearer ${CLIENT_ID}`,
      },
    });
    
    if (testRes.ok) {
      console.log('✅ SUCCESS! Your Client ID works as an access token!');
      console.log('🎉 Use this as your GENIUS_ACCESS_TOKEN:');
      console.log(CLIENT_ID);
      return CLIENT_ID;
    } else {
      console.log('❌ Client ID doesn\'t work as access token');
    }
  } catch (error) {
    console.log('❌ Error testing Client ID:', error.message);
  }
  
  // Method 2: Try OAuth Client Credentials flow
  console.log('\n🔍 Method 2: Trying OAuth Client Credentials flow...');
  try {
    const tokenUrl = 'https://api.genius.com/oauth/token';
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });
    
    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
    
    if (tokenRes.ok) {
      const tokenData = await tokenRes.json();
      console.log('✅ SUCCESS! Generated access token:');
      console.log('🎉 Use this as your GENIUS_ACCESS_TOKEN:');
      console.log(tokenData.access_token);
      return tokenData.access_token;
    } else {
      const errorText = await tokenRes.text();
      console.log('❌ OAuth flow failed:', errorText);
    }
  } catch (error) {
    console.log('❌ Error with OAuth flow:', error.message);
  }
  
  // Method 3: Instructions for manual token
  console.log('\n📋 Method 3: Manual token retrieval');
  console.log('1. Go to: https://genius.com/api-clients');
  console.log('2. Find your app with Client ID:', CLIENT_ID.substring(0, 20) + '...');
  console.log('3. Look for "Client Access Token" (not "Access Token")');
  console.log('4. Copy that token - it should be permanent!');
  
  return null;
}

generateGeniusToken();

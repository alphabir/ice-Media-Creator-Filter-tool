
import { CONFIG } from './config';

export interface InstagramMetadata {
  handle: string;
  biography?: string;
  followers_count?: number;
  media_count?: number;
  name?: string;
  profile_picture_url?: string;
  recent_captions?: string[];
  error?: string;
}

/**
 * Fetches public signals for an Instagram handle using the Meta Graph API.
 */
export async function fetchCreatorSignals(handle: string): Promise<InstagramMetadata> {
  const cleanHandle = handle.replace('@', '');
  const accessToken = CONFIG.META_GRAPH_ACCESS_TOKEN;

  if (!accessToken) {
    return { handle, error: "No access token configured" };
  }

  try {
    // 1. Get the Page ID linked to this token
    const meResponse = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}`
    );
    const meData = await meResponse.json();
    
    const pageId = meData.data?.[0]?.id;
    if (!pageId) {
      return { handle, error: "Access token is valid but doesn't have Page permissions." };
    }

    // 2. Get the linked Instagram Business ID
    const igResponse = await fetch(
      `https://graph.facebook.com/v21.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`
    );
    const igData = await igResponse.json();
    const igId = igData.instagram_business_account?.id;

    if (!igId) {
      return { handle, error: "No IG Business account linked to the FB Page." };
    }

    // 3. Use Business Discovery to get data for the target handle
    const discoveryUrl = `https://graph.facebook.com/v21.0/${igId}?fields=business_discovery.username(${cleanHandle}){name,username,biography,followers_count,media_count,profile_picture_url,media{caption}}&access_token=${accessToken}`;
    
    const discoveryResponse = await fetch(discoveryUrl);
    const discoveryData = await discoveryResponse.json();

    if (discoveryData.error) {
      return { handle, error: discoveryData.error.message };
    }

    const profile = discoveryData.business_discovery;
    return {
      handle,
      name: profile.name,
      biography: profile.biography,
      followers_count: profile.followers_count,
      media_count: profile.media_count,
      profile_picture_url: profile.profile_picture_url,
      recent_captions: profile.media?.data?.slice(0, 5).map((m: any) => m.caption) || []
    };
  } catch (err) {
    console.error(`Error fetching signals for ${handle}:`, err);
    return { handle, error: "Connection error" };
  }
}

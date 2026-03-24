"use client";

import {
  createClient,
  type RealtimeChannel,
  type SupabaseClient,
} from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;
const realtimeChannels = new Map<string, RealtimeChannel>();

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publishableKey) {
    throw new Error("Supabase auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and a publishable key.");
  }

  return {
    url,
    publishableKey,
  };
}

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    const { url, publishableKey } = getSupabaseConfig();
    browserClient = createClient(url, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return browserClient;
}

export function getSharedRealtimeChannel(channelName: string) {
  const supabase = getSupabaseBrowserClient();
  const existing = realtimeChannels.get(channelName);

  if (existing) {
    return existing;
  }

  const channel = supabase.channel(channelName, {
    config: {
      broadcast: {
        self: false,
      },
    },
  });

  realtimeChannels.set(channelName, channel);
  return channel;
}

export async function releaseSharedRealtimeChannel(channelName: string) {
  const channel = realtimeChannels.get(channelName);
  if (!channel) {
    return;
  }

  realtimeChannels.delete(channelName);
  await channel.unsubscribe();
}

export async function getSupabaseAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const supabase = getSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import type { RealtimeConfig } from "@/types/chat";
import {
  getSharedRealtimeChannel,
  releaseSharedRealtimeChannel,
} from "@/client/lib/supabase-browser";

export interface SyncEvent {
  type: "refresh";
  chatId?: string;
}

export function createRealtimeBridge(
  config: RealtimeConfig,
  onEvent: (event: SyncEvent) => void,
) {
  const channelName = `gpt-chatbot-sync:${config.channelKey}`;
  const broadcastChannel =
    typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(channelName) : null;

  let supabaseChannel: RealtimeChannel | null = null;

  broadcastChannel?.addEventListener("message", (event) => {
    onEvent(event.data as SyncEvent);
  });

  if (config.enabled && config.supabaseUrl && config.supabaseAnonKey) {
    supabaseChannel = getSharedRealtimeChannel(channelName).on(
      "broadcast",
      { event: "sync" },
      ({ payload }) => {
        onEvent(payload as SyncEvent);
      },
    );

    void supabaseChannel.subscribe();
  }

  return {
    publish(event: SyncEvent) {
      broadcastChannel?.postMessage(event);
      void supabaseChannel?.send({
        type: "broadcast",
        event: "sync",
        payload: event,
      });
    },
    destroy() {
      broadcastChannel?.close();
      if (supabaseChannel) {
        void releaseSharedRealtimeChannel(channelName);
      }
    },
  };
}

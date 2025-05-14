/// <reference types="vite/client" />

declare module 'vite-plugin-pwa' {
  import { Plugin } from 'vite';
  
  interface VitePWAOptions {
    registerType?: 'autoUpdate' | 'prompt' | false;
    includeAssets?: string[];
    manifest?: Record<string, any>;
    workbox?: Record<string, any>;
    [key: string]: any;
  }
  
  export function VitePWA(options?: VitePWAOptions): Plugin;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

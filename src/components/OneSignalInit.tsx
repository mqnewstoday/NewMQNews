"use client";

import { useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    OneSignal: any;
  }
}

export default function OneSignalInit() {
  useEffect(() => {
    // Inisialisasi antrean API OneSignal
    window.OneSignal = window.OneSignal || [];
    
    window.OneSignal.push(() => {
      window.OneSignal.init({
        appId: "542c9bb4-d7e3-4938-b453-cf7ad6bef22c",
        allowLocalhostAsSecureOrigin: true, // Izinkan testing di localhost
        notifyButton: {
          enable: true,
          position: 'bottom-left', // Tombol melayang di kiri bawah agar tidak tabrakan dengan WhatsApp/fitur lainnya
          size: 'medium',
          theme: 'default',
          colors: {
            'circle.background': '#0f766e', // Teal / Hijau toska tua khas MQ News Today
            'circle.foreground': '#ffffff',
            'badge.background': '#e11d48',
            'badge.foreground': '#ffffff',
            'badge.bordercolor': '#ffffff',
            'pulse.color': '#ffffff',
            'dialog.button.background.hovering': '#0d9488',
            'dialog.button.background': '#0f766e',
            'dialog.button.foreground': '#ffffff',
            'dialog.background': '#ffffff',
          },
          text: {
            'tip.state.unsubscribed': 'Berlangganan Notifikasi',
            'tip.state.subscribed': 'Sudah Berlangganan Notifikasi',
            'tip.state.blocked': 'Akses notifikasi diblokir',
            'message.action.subscribed': 'Terima kasih telah berlangganan!',
            'message.action.unsubscribed': 'Anda telah membatalkan langganan',
            'dialog.main.title': 'Kelola Notifikasi Berita',
            'dialog.main.button.subscribe': 'BERLANGGANAN',
            'dialog.main.button.unsubscribe': 'BERHENTI BERLANGGANAN',
          }
        },
        promptOptions: {
          slidedown: {
            prompts: [
              {
                type: "category",
                autoPrompt: true,
                text: {
                  actionMessage: "Apakah Anda ingin menerima notifikasi instan ketika redaksi merilis info penting dan artikel terbaru di MQ News Today?",
                  acceptButton: "Ya, Kirim Notifikasi",
                  cancelButton: "Nanti Saja"
                }
              }
            ]
          }
        }
      });
    });
  }, []);

  return (
    <Script
      src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
      strategy="afterInteractive"
    />
  );
}

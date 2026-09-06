import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestion de Caisse - Trésorerie & Opérations Financières',
  description: 'Application de gestion, contrôle et journalisation des flux de caisse en temps réel.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}

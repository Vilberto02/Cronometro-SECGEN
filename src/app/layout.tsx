import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cronómetro',
  description: 'Un simple temporizador de cuenta regresiva controlado por teclado.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <div id="tooltip-root"></div> {/* Added for potential future tooltip usage */}
      </body>
    </html>
  );
}

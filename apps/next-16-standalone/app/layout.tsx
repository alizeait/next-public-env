import { PublicEnv } from '../env';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <PublicEnv />
      <body>{children}</body>
    </html>
  );
}

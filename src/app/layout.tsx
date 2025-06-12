import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import "./globals.css";
import { AppContextProvider } from './Components/AppState';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
        <div>
          <AppContextProvider>
            <h1 className="text-left text-5xl my-6 mx-6 text-sky-700 font-extrabold border-b-2">Football Stats</h1>
            {children}
          </AppContextProvider>
        </div>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

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
        <div className="min-h-screen flex flex-col">
          <AppContextProvider>
            <h1 className="text-left text-5xl my-6 mx-6 text-sky-700 font-extrabold border-b-2">Football Stats</h1>
            <main className="flex-1">
              {children}
            </main>
            <footer className="text-center py-4 text-gray-600 text-sm border-t">
              data provided by <a href="https://www.pro-football-reference.com" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-800 underline">pro-football-reference.com</a>
            </footer>
          </AppContextProvider>
        </div>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

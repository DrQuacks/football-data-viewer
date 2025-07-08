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
            <h1 className="text-left text-2xl sm:text-3xl md:text-4xl lg:text-5xl my-3 sm:my-4 md:my-5 lg:my-6 mx-3 sm:mx-4 md:mx-5 lg:mx-6 text-sky-700 font-extrabold border-b-2">Football Stats</h1>
            <main className="flex-1 px-3 sm:px-4 md:px-5 lg:px-6">
              {children}
            </main>
            <footer className="text-center py-3 sm:py-4 text-gray-600 text-xs sm:text-sm border-t px-3 sm:px-4 md:px-5 lg:px-6">
              data provided by <a href="https://www.pro-football-reference.com" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-800 underline">pro-football-reference.com</a>
            </footer>
          </AppContextProvider>
        </div>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

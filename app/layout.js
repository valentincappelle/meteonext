import "./globals.css";
import ClientLayout from "./ClientLayout";

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}

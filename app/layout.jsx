export const metadata = {
  title: "Orders Dashboard",
  description: "RetailCRM -> Supabase dashboard",
};

import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

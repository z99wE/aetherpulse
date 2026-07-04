import "./globals.css";

export const metadata = {
  title: "CyVix | Civic Decision Intelligence",
  description:
    "CyVix turns city telemetry, citizen feedback, and AI reasoning into a live decision layer for public service teams."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

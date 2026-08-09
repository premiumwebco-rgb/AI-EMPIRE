import "./globals.css";

export const metadata = {
  title: "AI-EMPIRE HQ",
  description: "The live castle — reads Postgres directly, no snapshot."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div id="app">{children}</div>
        <footer className="credit">
          AI-EMPIRE HQ — live, reading data/agent-adapters.json-governed tasks directly from Postgres. Nothing here is simulated.
        </footer>
      </body>
    </html>
  );
}

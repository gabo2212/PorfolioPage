import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../style.css";
import ClientChatWrapper from "../components/ClientChatWrapper";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Personal portfolio site",
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body>
        {children}
        <ClientChatWrapper />
      </body>
    </html>
  );
};

export default RootLayout;

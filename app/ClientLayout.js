"use client";
import ClientProviders from "./ClientProviders";
import Navbar from "../components/Navbar";

export default function ClientLayout({ children }) {
  return (
    <ClientProviders>
      <Navbar />
      {children}
    </ClientProviders>
  );
}

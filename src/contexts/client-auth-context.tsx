"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useState } from "react";

import { clientsTable } from "@/db/schema";

type Client = typeof clientsTable.$inferSelect;

interface ClientAuthContextData {
  client: Client | null;
  isLoading: boolean;
  signOut: () => void;
}

const ClientAuthContext = createContext<ClientAuthContextData>(
  {} as ClientAuthContextData,
);

interface ClientAuthProviderProps {
  children: React.ReactNode;
  initialClient: Client | null;
}

export function ClientAuthProvider({
  children,
  initialClient,
}: ClientAuthProviderProps) {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(initialClient);
  const [isLoading] = useState(false);

  const signOut = () => {
    document.cookie =
      "client_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setClient(null);
    router.push("/authentication");
  };

  return (
    <ClientAuthContext.Provider value={{ client, isLoading, signOut }}>
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  const context = useContext(ClientAuthContext);

  if (!context) {
    throw new Error("useClientAuth must be used within a ClientAuthProvider");
  }

  return context;
}

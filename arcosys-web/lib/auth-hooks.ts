import React from "react";
import { authClient } from "./auth-client";

export function useListAccounts() {
  const { data: session } = authClient.useSession();
  const [accounts, setAccounts] = React.useState<any[]>([]);
  const [isPending, setIsPending] = React.useState(true);

  React.useEffect(() => {
    if (session?.user) {
      setIsPending(true);
      fetch("/api/accounts")
        .then((res) => res.json())
        .then((data) => {
          setAccounts(data);
          setIsPending(false);
        })
        .catch((err) => {
          console.error("Failed to fetch accounts:", err);
          setIsPending(false);
        });
    } else {
      setIsPending(false);
    }
  }, [session?.user]);

  return { data: accounts, isPending };
}

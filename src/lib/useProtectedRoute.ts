"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useProtectedRoute(expectedRole: string) {
  const router = useRouter();

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      if (decoded.role !== expectedRole) {
        alert("⛔ Accès refusé");
        router.push("/login");
      }
    } catch (error) {
      console.error("Erreur de décodage du token", error);
      router.push("/login");
    }
  }, [expectedRole, router]);
}

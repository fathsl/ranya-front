"use client";

import { getUserFromToken } from "@/app/lib/auth";

export default async function AdminDashboard() {
  const user = await getUserFromToken();

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">👑 Dashboard Admin</h1>
      <p>Bienvenue {user?.email} | Rôle : {user?.role}</p>
    </div>
  );
}

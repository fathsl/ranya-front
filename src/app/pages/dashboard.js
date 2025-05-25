"use client";
import { useEffect, useState } from 'react'; 
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/auth/me', {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Non authentifié');
        }
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  if (!user) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Bienvenue, {user.name}</h1>
      <p>Voici vos informations personnelles :</p>
      <ul>
        <li>Email: {user.email}</li>
        <li>Rôle: {user.role}</li>
      </ul>
    </div>
  );
}

// frontend/pages/dashboard.js
"use client"; // Nécessaire pour utiliser les hooks côté client
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Appel à l'endpoint backend pour récupérer l'utilisateur connecté
    fetch('http://localhost:3001/auth/me', {
      method: 'GET',
      credentials: 'include', // Permet d'envoyer les cookies
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Non authentifié');
        }
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => {
        // Redirection vers la page de login en cas d'erreur
        router.push('/login');
      });
  }, [router]);

  // Affichage d'un message de chargement tant que les données ne sont pas chargées
  if (!user) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Bienvenue, {user.name}</h1>
      {/* Contenu protégé du Dashboard */}
      <p>Voici vos informations personnelles :</p>
      <ul>
        <li>Email: {user.email}</li>
        <li>Rôle: {user.role}</li>
      </ul>
    </div>
  );
}

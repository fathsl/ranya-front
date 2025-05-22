'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const user = {
    name: 'Coaché Test',
    email: 'test@coachapp.com',
    phone: '+216 99 999 999',
    bio: 'Coaché très motivé',
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Profil</h1>
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <img
            src="/avatar.png"
            alt="avatar"
            className="w-16 h-16 rounded-full border"
          />
          <div>
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-1">
          <p><strong>Bio :</strong> {user.bio}</p>
          <p><strong>Téléphone :</strong> {user.phone}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">Modifier</Button>
          <Button variant="secondary">Changer mot de passe</Button>
        </div>
      </Card>
    </main>
  )
}

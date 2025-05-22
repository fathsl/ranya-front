'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [userName, setUserName] = useState('Coaché')
  const [courses] = useState([
    { title: 'DEV', status: 'En cours' },
    { title: 'IA', status: 'Terminé' },
    { title: 'ALGO', status: 'Non commencé' },
  ])

  useEffect(() => {
    const storedName = localStorage.getItem('username')
    if (storedName) setUserName(storedName)
  }, [])

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Bienvenue, {userName} 👋</h1>

      <h2 className="text-lg font-semibold">Mes cours</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course, i) => (
          <Card key={i} className="p-4 space-y-2">
            <h3 className="font-medium text-lg">{course.title}</h3>
            <Badge variant="secondary">{course.status}</Badge>
          </Card>
        ))}
      </div>
    </main>
  )
}

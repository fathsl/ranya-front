'use client'

import * as Dropdown from '@radix-ui/react-dropdown-menu'
import { LogOut, Settings, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function UserDropdown() {
  const router = useRouter()

  const logout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <Dropdown.Root>
      <Dropdown.Trigger className="rounded-full border p-1">
        <img src="/avatar.png" alt="user" className="w-8 h-8 rounded-full" />
      </Dropdown.Trigger>

      <Dropdown.Content
        className="bg-white p-2 shadow-xl rounded-md w-48 mt-2 border text-sm"
        sideOffset={8}
      >
        <Dropdown.Item className="flex gap-2 items-center p-2 hover:bg-gray-100" onClick={() => router.push('/profile')}>
          <User size={16} /> Profil
        </Dropdown.Item>
        <Dropdown.Item className="flex gap-2 items-center p-2 hover:bg-gray-100" onClick={() => router.push('/settings')}>
          <Settings size={16} /> Paramètres
        </Dropdown.Item>
        <Dropdown.Separator className="my-1 border-t" />
        <Dropdown.Item className="flex gap-2 items-center p-2 hover:bg-red-100 text-red-600" onClick={logout}>
          <LogOut size={16} /> Déconnexion
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown.Root>
  )
}

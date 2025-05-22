'use client'

import { useState } from 'react'
import ModuleForm from './ModuleForm'

type ModuleType = {
  titre: string
  sousModules?: any[]
}

export default function PlanForm() {
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [modules, setModules] = useState<ModuleType[]>([])

  const addModule = (module: ModuleType) => {
    setModules((prev) => [...prev, module])
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const response = await fetch('/api/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, modules }),
    })

    if (response.ok) {
      // à compléter : toast, redirection, etc.
      console.log('Plan créé avec succès.')
    } else {
      console.error('Erreur lors de la création du plan.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold text-gray-800">Créer un nouveau plan</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Titre du plan</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          required
        />
      </div>

      <ModuleForm addModule={addModule} />

      <button
        type="submit"
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
      >
        Enregistrer le plan
      </button>
    </form>
  )
}

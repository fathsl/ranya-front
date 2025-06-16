import React, { useState } from 'react'

// 👇 Type des props attendues
interface ModuleFormProps {
  addModule: (module: { titre: string }) => void
}

const ModuleForm: React.FC<ModuleFormProps> = ({ addModule }) => {
  const [moduleTitle, setModuleTitle] = useState('')

  const handleAdd = () => {
    if (!moduleTitle.trim()) return
    addModule({ titre: moduleTitle }) // 👈 appel du parent
    setModuleTitle('')
  }

  return (
    <div className="space-y-2 border-t pt-4 mt-4">
      <label className="block text-sm font-medium text-gray-700">Titre du module</label>
      <input
        type="text"
        value={moduleTitle}
        onChange={(e) => setModuleTitle(e.target.value)}
        placeholder="Ex: Module Motivation"
        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
      />
      <button
        type="button"
        onClick={handleAdd}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Ajouter ce module
      </button>
    </div>
  )
}

export default ModuleForm

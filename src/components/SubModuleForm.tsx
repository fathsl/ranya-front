'use client'
import { useState } from 'react';
import FileUpload from './FileUpload';
import QCMForm from './QCMForm';



interface SubModuleFormProps {
  addSubModule: (subModule: any) => void
}

export default function SubModuleForm({ addSubModule }: SubModuleFormProps) {
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [video, setVideo] = useState('')
  const [qcm, setQcm] = useState<any>(null)

  const handleAdd = () => {
    if (!title.trim()) return
    addSubModule({ title, link, video, qcm })
    setTitle('')
    setLink('')
    setVideo('')
    setQcm(null)
  }

  return (
    <div className="border p-4 space-y-4 rounded-md shadow">
      <h4 className="text-lg font-medium">Ajouter un sous-module</h4>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre du sous-module"
        className="w-full p-2 border rounded"
      />
      <input
        type="url"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="Lien externe (ex: Google Docs)"
        className="w-full p-2 border rounded"
      />
      <input
        type="url"
        value={video}
        onChange={(e) => setVideo(e.target.value)}
        placeholder="Lien vers une vidéo"
        className="w-full p-2 border rounded"
      />
      <FileUpload />
      <QCMForm onChange={setQcm} />
      <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">
        Ajouter ce sous-module
      </button>
    </div>
  )
}


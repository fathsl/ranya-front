// Page pour afficher/modifier un plan spécifique
// ✅ [id].tsx (affichage d’un plan spécifique)
'use client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PlanDetailPage() {
  const { id } = useParams()
  const [plan, setPlan] = useState<any>(null)

  useEffect(() => {
    async function fetchPlan() {
      const res = await fetch(`/api/plans/${id}`)
      const data = await res.json()
      setPlan(data)
    }
    if (id) fetchPlan()
  }, [id])

  if (!plan) return <div>Chargement...</div>

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-2">{plan.title}</h1>
      <p className="text-gray-600 mb-6">{plan.description}</p>

      <div className="space-y-6">
        {plan.modules?.map((module: any, index: number) => (
          <div key={index} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">{module.titre}</h2>
            {module.sousModules?.map((sm: any, idx: number) => (
              <div key={idx} className="pl-4 mt-2">
                <h4 className="text-md font-semibold">{sm.title}</h4>
                {sm.link && <p>Lien: <a href={sm.link} className="text-blue-500 underline">{sm.link}</a></p>}
                {sm.video && <p>Vidéo: <a href={sm.video} className="text-blue-500 underline">{sm.video}</a></p>}
                {sm.qcm && <p>QCM: {sm.qcm.question} (réponse correcte: {sm.qcm.correct})</p>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'
import PlanForm from '@/components/PlanForm'

export default function CreatePlanPage() {
  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Créer un nouveau plan de coaching</h2>
      <PlanForm />
    </div>
  )
}

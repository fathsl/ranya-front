'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

import SubModuleForm from '@/components/SubModuleForm';
import FileUpload from '@/components/FileUpload';
import QCMForm from '@/components/QCMForm';

interface Coachee {
  id: string;
  nom: string;
  prenom: string;
  email: string;
}

interface SubModule {
  title: string;
  link: string;
  video: string;
  qcm: any;
}

interface Module {
  name: string;
  subModules: SubModule[];
  file?: File | null;
  qcm: any[];
}

export default function PlanCreationPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coachees, setCoachees] = useState<Coachee[]>([]);
  const [selectedCoachee, setSelectedCoachee] = useState('');
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCoachees() {
      const res = await fetch('/api/coachees');
      const data = await res.json();
      setCoachees(data);
    }
    fetchCoachees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          coacheeId: selectedCoachee,
          modules,
        }),
      });

      if (!res.ok) throw new Error('Erreur lors de la création.');
      toast.success('Plan créé avec succès');
      setTitle('');
      setDescription('');
      setSelectedCoachee('');
      setModules([]);
    } catch (err) {
      toast.error('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const addModule = () => {
    setModules([...modules, { name: '', subModules: [], qcm: [], file: null }]);
  };

  const updateModule = (index: number, updatedModule: Module) => {
    const updated = [...modules];
    updated[index] = updatedModule;
    setModules(updated);
  };

  const removeModule = (index: number) => {
    const updated = [...modules];
    updated.splice(index, 1);
    setModules(updated);
  };

  return (
    <Card className="max-w-3xl mx-auto p-6 mt-10 shadow-lg space-y-6">
      <h2 className="text-2xl font-semibold">Créer un plan de coaching</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Titre du plan</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Ex: Coaching confiance en soi"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Expliquer le but et la structure du plan"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Coaché</label>
          <select
            value={selectedCoachee}
            onChange={(e) => setSelectedCoachee(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">-- Sélectionner un coaché --</option>
            {coachees.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom} {c.prenom} ({c.email})
              </option>
            ))}
          </select>
        </div>

        {modules.map((module, index) => (
          <div key={index} className="border border-gray-300 p-4 rounded-md space-y-4">
            <div>
              <label className="block text-sm font-medium">Nom du module</label>
              <Input
                value={module.name}
                onChange={(e) => {
                  const updated = { ...module, name: e.target.value };
                  updateModule(index, updated);
                }}
                placeholder="Ex: Module 1 - Introduction"
              />
            </div>

            <FileUpload
              onFileSelect={(file) => {
                const updated = { ...module, file };
                updateModule(index, updated);
              }}
            />

            <SubModuleForm
              addSubModule={(subModule) => {
                const updated = { ...module, subModules: [...module.subModules, subModule] };
                updateModule(index, updated);
              }}
            />

            <QCMForm
              onQCMChange={(qcm) => {
                const updated = { ...module, qcm };
                updateModule(index, updated);
              }}
            />

            <Button
              type="button"
              className="bg-red-500 text-white"
              onClick={() => removeModule(index)}
            >
              Supprimer ce module
            </Button>
          </div>
        ))}

        <Button type="button" onClick={addModule}>
          Ajouter un module
        </Button>

        <Button type="submit" disabled={loading}>
          {loading ? 'Création...' : 'Créer le plan'}
        </Button>
      </form>
    </Card>
  );
}

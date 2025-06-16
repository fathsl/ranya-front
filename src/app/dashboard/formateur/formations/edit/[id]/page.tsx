"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import FormationCreator from "../../ajouter/page";

const EditFormationPage = () => {
  const params = useParams();
  const id = params.id as string;
  const [formationId, setFormationId] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === "string") {
      setFormationId(id);
    }
  }, [id]);

  if (!formationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <FormationCreator mode="edit" formationIdEdit={formationId} />;
};

export default EditFormationPage;

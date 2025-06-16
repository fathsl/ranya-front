"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSuccess: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  onInviteSuccess,
}) => {
  const [email, setEmail] = useState("");

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    const accessToken = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:3001/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email, role: "coachee" }),
      });

      if (response.ok) {
        toast.success(`Invitation envoyée à ${email}`);
        setEmail("");
        onInviteSuccess();
        onClose();
      } else {
        toast.error("Erreur lors de l'envoi de l'invitation");
      }
    } catch (error) {
      toast.error("Erreur lors de l'envoi de l'invitation");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Inviter un coaché</h2>
        <form onSubmit={handleInvite}>
          <Input
            type="email"
            placeholder="Adresse e-mail du coaché"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="flex justify-end mt-4">
            <Button type="button" variant="outline" onClick={onClose} className="mr-2">
              Annuler
            </Button>
            <Button type="submit">Envoyer l'invitation</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteModal;

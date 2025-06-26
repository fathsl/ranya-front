import { useEffect, useState } from "react";

export interface Module {
  id: string;
  titre?: string;
  name?: string;
}

export interface User {
  id: string;
  name: string;
  role: string;
  email?: string;
}

export interface Participant {
  id: string;
  nom?: string;
  email?: string;
}

export interface Certificate {
  id: string;
  nomParticipant: string;
  formation: string;
  formationEntity?: Formation;
  dateObtention: string;
  urlPdf: string;
  participants: Participant[];
}

export interface TopUser {
  userId: string;
  count: number;
}

export interface UserStats {
  uniqueUsers: number;
  totalFormations: number;
  userFormationCounts: Record<string, number>;
  topUsers: TopUser[];
  averageFormationsPerUser: number;
}

export interface Formation {
  id: string;
  titre: string;
  domaine: string;
  image?: string;
  description: string;
  objectifs: string;
  accessType: "public" | "private";
  archived: boolean;
  invitation: {
    mode: "link" | "email" | "csv";
    emails: string[];
    linkGenerated: boolean;
    csvFile?: unknown;
  };
  user: User;
  userId: string;
  modules: Module[];
  participants: User[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface DashboardData {
  totalFormations: number;
  thisMonthFormations: number;
  publicFormations: number;
  privateFormations: number;
  lastWeekFormations: number;
  domainData: Record<string, number>;
  activeUsers: Array<{ userId: string; count: number }>;
  growthData: Array<{ month: string; count: number }>;
  privateToPublicRatio: string;
  monthlyGrowthRate: string;
}

export interface MonthlyData {
  month: string;
  formations: number;
  participants: number;
  uniqueParticipants: number;
}

export const DOMAIN_COLORS = [
  "#8B5CF6", // Purple
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#3B82F6", // Blue
  "#EC4899", // Pink
  "#6B7280", // Gray
  "#F97316", // Orange
  "#06B6D4", // Cyan
  "#84CC16", // Lime
];

export const fetchFormations = async (): Promise<Formation[]> => {
  try {
    const response = await fetch("http://127.0.0.1:3001/formations", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching formations:", error);
    throw error;
  }
};

export const calculateTotalFormations = (formations: Formation[]): number => {
  return formations.length;
};

export const calculateFormationsThisMonth = (
  formations: Formation[]
): number => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  return formations.filter((formation) => {
    const createdDate = new Date(formation.createdAt);
    return (
      createdDate.getMonth() === currentMonth &&
      createdDate.getFullYear() === currentYear
    );
  }).length;
};

export const calculatePublicFormations = (formations: Formation[]): number => {
  return formations.filter((formation) => formation.accessType === "public")
    .length;
};

export const calculatePrivateFormations = (formations: Formation[]): number => {
  return formations.filter((formation) => formation.accessType === "private")
    .length;
};

export const calculateFormationsByDomain = (
  formations: Formation[]
): Record<string, number> => {
  const domainCount: Record<string, number> = {};

  formations.forEach((formation) => {
    const domain = formation.domaine || "Unknown";
    domainCount[domain] = (domainCount[domain] || 0) + 1;
  });

  return domainCount;
};

export const calculateFormationsLastWeek = (
  formations: Formation[]
): number => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return formations.filter((formation) => {
    const createdDate = new Date(formation.createdAt);
    return createdDate >= sevenDaysAgo;
  }).length;
};

export const calculateMostActiveUsers = (
  formations: Formation[]
): Array<{ userId: string; count: number }> => {
  const userCount: Record<string, number> = {};

  formations.forEach((formation) => {
    const userId = formation.userId;
    userCount[userId] = (userCount[userId] || 0) + 1;
  });

  return Object.entries(userCount)
    .map(([userId, count]) => ({ userId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 users
};

export const calculateFormationGrowthData = (
  formations: Formation[]
): Array<{ month: string; count: number }> => {
  const monthlyCount: Record<string, number> = {};

  formations.forEach((formation) => {
    const createdDate = new Date(formation.createdAt);
    const monthKey = `${createdDate.getFullYear()}-${String(
      createdDate.getMonth() + 1
    ).padStart(2, "0")}`;
    monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + 1;
  });

  return Object.entries(monthlyCount)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

export const calculateDashboardData = (
  formations: Formation[]
): DashboardData => {
  const totalFormations = calculateTotalFormations(formations);
  const thisMonthFormations = calculateFormationsThisMonth(formations);
  const publicFormations = calculatePublicFormations(formations);
  const privateFormations = calculatePrivateFormations(formations);
  const lastWeekFormations = calculateFormationsLastWeek(formations);
  const domainData = calculateFormationsByDomain(formations);
  const activeUsers = calculateMostActiveUsers(formations);
  const growthData = calculateFormationGrowthData(formations);

  const privateToPublicRatio =
    publicFormations > 0
      ? (privateFormations / publicFormations).toFixed(2)
      : "N/A";

  const monthlyGrowthRate =
    thisMonthFormations > 0 && lastWeekFormations > 0
      ? (
          ((thisMonthFormations - lastWeekFormations) / lastWeekFormations) *
          100
        ).toFixed(2) + "%"
      : "N/A";

  return {
    totalFormations,
    thisMonthFormations,
    publicFormations,
    privateFormations,
    lastWeekFormations,
    domainData,
    activeUsers,
    growthData,
    privateToPublicRatio,
    monthlyGrowthRate,
  };
};

export const calculateCompletionRate = (
  certificatesCount: number,
  totalParticipants: number
): number => {
  if (totalParticipants === 0) return 0;
  return Math.round((certificatesCount / totalParticipants) * 100);
};

export const useInvitations = () => {
  const [invitations, setInvitations] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const invitationsResponse = await fetch(
        `http://127.0.0.1:3001/invitations`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!invitationsResponse.ok) {
        throw new Error(`HTTP error! status: ${invitationsResponse.status}`);
      }

      const invitationsData = await invitationsResponse.json();

      // Calculate the length of invitations array
      const invitationsCount = Array.isArray(invitationsData)
        ? invitationsData.length
        : invitationsData.invitations?.length || 0;

      setInvitations(invitationsCount);
      setError(null);
    } catch (err) {
      console.error("Error fetching invitations:", err);
      setError(err.message);
      setInvitations(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  return { invitations, loading, error, refetch: fetchInvitations };
};

export const useCertificates = () => {
  const [certificates, setCertificates] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const certificatesResponse = await fetch(
        "http://127.0.0.1:3001/certificats",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!certificatesResponse.ok) {
        throw new Error(`HTTP error! status: ${certificatesResponse.status}`);
      }

      const certificatesData = await certificatesResponse.json();

      // Calculate the length of certificates array
      const certificatesCount = Array.isArray(certificatesData)
        ? certificatesData.length
        : certificatesData.certificates?.length ||
          certificatesData.certificats?.length ||
          0;

      setCertificates(certificatesCount);
      setError(null);
    } catch (err) {
      console.error("Error fetching certificates:", err);
      setError(err.message);
      setCertificates(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  return { certificates, loading, error, refetch: fetchCertificates };
};

export const calculateUserFormationStats = (
  formations: Formation[]
): UserStats => {
  if (!Array.isArray(formations) || formations.length === 0) {
    return {
      uniqueUsers: 0,
      totalFormations: 0,
      userFormationCounts: {},
      topUsers: [],
      averageFormationsPerUser: 0,
    };
  }

  const userFormationCounts = formations.reduce(
    (acc: Record<string, number>, formation) => {
      if (formation.userId) {
        acc[formation.userId] = (acc[formation.userId] || 0) + 1;
      }
      return acc;
    },
    {}
  );

  const uniqueUsers = Object.keys(userFormationCounts).length;
  const totalFormations = formations.length;
  const averageFormationsPerUser =
    uniqueUsers > 0 ? (totalFormations / uniqueUsers).toFixed(1) : "0";

  const topUsers: TopUser[] = Object.entries(userFormationCounts)
    .map(([userId, count]) => ({ userId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    uniqueUsers,
    totalFormations,
    userFormationCounts,
    topUsers,
    averageFormationsPerUser: parseFloat(averageFormationsPerUser),
  };
};

export const calculateMonthlyFormationsData = (
  formations: Formation[]
): MonthlyData[] => {
  if (!Array.isArray(formations) || formations.length === 0) {
    return [];
  }

  const monthlyGroups = formations.reduce((acc, formation) => {
    const date = new Date(formation.createdAt);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    const monthName = date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
    });

    if (!acc[monthKey]) {
      acc[monthKey] = {
        monthName,
        formations: [],
        allParticipants: [],
        uniqueParticipantIds: new Set(),
      };
    }

    acc[monthKey].formations.push(formation);

    if (formation.participants && Array.isArray(formation.participants)) {
      formation.participants.forEach((participant) => {
        acc[monthKey].allParticipants.push(participant);
        acc[monthKey].uniqueParticipantIds.add(participant.id);
      });
    }

    return acc;
  }, {} as Record<string, any>);

  const monthlyData: MonthlyData[] = Object.entries(monthlyGroups)
    .map(([monthKey, data]) => ({
      month: data.monthName,
      formations: data.formations.length,
      participants: data.allParticipants.length,
      uniqueParticipants: data.uniqueParticipantIds.size,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return monthlyData;
};

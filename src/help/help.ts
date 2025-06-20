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
  participants: Participant[];
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

export const fetchCertificates = async () => {
  const response = await fetch("http://127.0.0.1:3001/certificats", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch certificates: ${response.statusText}`);
  }

  return await response.json();
};

export const calculateCompletionRate = (
  certificatesCount: number,
  totalParticipants: number
): number => {
  if (totalParticipants === 0) return 0;
  return Math.round((certificatesCount / totalParticipants) * 100);
};

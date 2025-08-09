import { handleLogout } from "./utils";
const base = import.meta.env.VITE_BASE_URL;

export const fetchAssignedSouscripteurs = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found");
    return null;
  }

  const url = `${base}/assign/assigned-souscripteurs`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      handleLogout();
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error fetching assigned souscripteurs");
    }

    return data;
  } catch (error) {
    console.error("Error fetching assigned souscripteurs:", error);
    return null;
  }
};

export const fetchMarkAssignmentCompleted = async (souscripteurId, decision = "valide", motif = "",observation="") => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found");
    return null;
  }

  const url = `${base}/assign/mark-completed`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ souscripteurId, decision, motif,observation }),
    });

    if (response.status === 401) {
      handleLogout();
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to mark assignment as completed");
    }

    return data;
  } catch (error) {
    console.error("Error marking assignment as completed:", error);
    return null;
  }
};

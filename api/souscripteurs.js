import { handleLogout } from "./utils";
const base = import.meta.env.VITE_BASE_URL;

export const fetchdSouscripteurById = async (id) => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found");
    return null;
  }

  const url = `${base}/souscripteurs/getsousbyid/${id}`;

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


export const fetchInsertDossierReview = async (souscripteurId, dossierType) => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found");
    return null;
  }

  const url = `${base}/souscripteurs/insert-dossier-review`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        souscripteurId,
        dossierType,
      }),
    });

    if (response.status === 401) {
      handleLogout();
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error inserting dossier review");
    }

    return data;
  } catch (error) {
    console.error("Error inserting dossier review:", error);
    return null;
  }
};


export const fetchMarkDossierExamined = async (souscripteurId, dossierType) => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found");
    return null;
  }

  const url = `${base}/souscripteurs/examined`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ souscripteurId, dossierType }),
    });

    if (response.status === 401) {
      handleLogout();
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error marking dossier as examined");
    }

    return data;
  } catch (error) {
    console.error("Error marking dossier as examined:", error);
    return null;
  }
};

export const fetchMarkDossierConforme = async (souscripteurId, dossierType) => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found");
    return null;
  }

  const url = `${base}/souscripteurs/conforme`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ souscripteurId, dossierType }),
    });

    if (response.status === 401) {
      handleLogout();
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error marking dossier as conforme");
    }

    return data;
  } catch (error) {
    console.error("Error marking dossier as conforme:", error);
    return null;
  }
};




export const fetchInsertAddress = async (addressData) => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found");
    return null;
  }

  const url = `${base}/souscripteurs/addresses`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(addressData),
    });

    if (response.status === 401) {
      handleLogout();
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error inserting address");
    }

    return data;
  } catch (error) {
    console.error("Error inserting address:", error);
    return null;
  }
};


export const fetchAddressesBySouscripteurId = async (souscripteurId) => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found");
    return null;
  }

  const url = `${base}/souscripteurs/addresses/${souscripteurId}`;

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
      throw new Error(data.message || "Error fetching addresses");
    }

    return data;
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return null;
  }
};


export const fetchSouscripteurStats = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found");
    return null;
  }

  const url = `${base}/souscripteurs/stats`;

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
      throw new Error(data.message || "Error fetching stats");
    }

    return data.stats; // return only stats object
  } catch (error) {
    console.error("Error fetching souscripteur stats:", error);
    return null;
  }
};



export const fetchSouscripteurStatsDr = async (id) => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found");
    return null;
  }

  // Assuming `base` contains the base URL
  const url = `${base}/souscripteurs/statsDr/${id}`;

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
      throw new Error(data.error || "Error fetching stats");
    }

    return data.stats; // Return only the stats object

  } catch (error) {
    console.error("Error fetching souscripteur stats:", error);
    return null;
  }
};




export const fetchDossiersTraitesParJour = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found");
    return null;
  }

  const url = `${base}/souscripteurs/stats/traite-par-jour10`;

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
      throw new Error(data.message || "Erreur lors de la récupération des données de traitement par jour");
    }

    return data.data || []; // assuming { success: true, data: [...] }
  } catch (error) {
    console.error("Erreur fetchDossiersTraitesParJour:", error);
    return [];
  }
};

export const fetchDossiersTraitesParJourDr = async (id) => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found");
    return null;
  }

  const url = `${base}/souscripteurs/stats/traite-par-jour/${id}`;

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
      throw new Error(data.message || "Erreur lors de la récupération des données de traitement par jour");
    }

    return data.data || []; // assuming { success: true, data: [...] }
  } catch (error) {
    console.error("Erreur fetchDossiersTraitesParJour:", error);
    return [];
  }
};

/*
export const fetchValidationsPaginated = async ({ decision, dr, limit = 10, offset = 0 }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found");
    return null;
  }

  const url = new URL(`${base}/souscripteurs/validations`);
  url.searchParams.append("decision", decision);
  url.searchParams.append("dr", dr);
  url.searchParams.append("limit", limit);
  url.searchParams.append("offset", offset);

  try {
    const response = await fetch(url.toString(), {
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
      throw new Error(data.message || "Erreur lors de la récupération des validations");
    }

    return data.data || [];
  } catch (error) {
    console.error("Erreur fetchValidationsPaginated:", error);
    return [];
  }
};
*/


export const fetchValidationsPaginated = async ({ decision, dr, observation_cadre, limit = 10, offset = 0 }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found");
    return null;
  }

  const url = new URL(`${base}/souscripteurs/validations`);
  url.searchParams.append("decision", decision);
  url.searchParams.append("dr", dr);
  url.searchParams.append("limit", limit);
  url.searchParams.append("offset", offset);

 
    url.searchParams.append("observation_cadre", observation_cadre);
 

  try {
    const response = await fetch(url.toString(), {
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
      throw new Error(data.message || "Erreur lors de la récupération des validations");
    }

    return data.data || [];
  } catch (error) {
    console.error("Erreur fetchValidationsPaginated:", error);
    return [];
  }
};


export const postBulkValidations = async (decisionsArray) => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found");
    return null;
  }

  try {
    const response = await fetch(`${base}/souscripteurs/validations/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ decisions: decisionsArray }),
    });

    if (response.status === 401) {
      handleLogout();
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de l'insertion des validations");
    }

    return data; // success: true, message: "Décisions enregistrées."
  } catch (error) {
    console.error("Erreur postBulkValidations:", error);
    return null;
  }
};

export const fetchValidationsPv = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found");
    return null;
  }

  const url = new URL(`${base}/souscripteurs/validationspv`);

  try {
    const response = await fetch(url.toString(), {
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
      throw new Error(data.message || "Erreur lors de la récupération des validations PV");
    }

    return data.data || [];
  } catch (error) {
    console.error("Erreur fetchValidationsPv:", error);
    return [];
  }
};


/*

export const fetchInsertToComplete = async (souscripteurId, dossier) => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found");
    return null;
  }

  const url = `${base}/souscripteurs/insertToComplete`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ souscripteurId, dossier }),
    });

    if (response.status === 401) {
      handleLogout();
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error inserting into complete");
    }

    return data;
  } catch (error) {
    console.error("Error inserting into complete:", error);
    return null;
  }
};
*/

export const fetchValidationsBySous = async (souscripteur_id) => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found");
    return null;
  }

  // Make sure to include souscripteur_id in the query string
  const url = `${base}/souscripteurs/validations/sous?souscripteur_id=${souscripteur_id}`;

  try {
    const response = await fetch(url, {
      method: "GET", // GET method does not support body
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',  // Optional, not needed for GET requests
      },
    });

    if (response.status === 401) {
      handleLogout();
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error fetching validations for souscripteur");
    }

    return data;
  } catch (error) {
    console.error("Error fetching validations for souscripteur:", error);
    return null;
  }
};





export const fetchUpdateEnfant = async (code, nbr_enfant) => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found");
    return null;
  }

  try {
    const response = await fetch(`${base}/souscripteurs/update-enfants`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ code, nbr_enfant }),
    });

    if (response.status === 401) {
      handleLogout();
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la mise à jour du nombre d'enfants");
    }

    return data;
  } catch (error) {
    console.error("Erreur fetchUpdateEnfant:", error);
    return null;
  }
};
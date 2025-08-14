

export const login = async (username, password) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
       
        if (data.message.includes('invalid username') || data.message.includes('invalid password')) {
          throw new Error('Nom d\'utilisateur ou mot de passe incorrect');
        } else {
          throw new Error(data.message || 'Échec de la connexion');
        }
      }
  
      return data;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw new Error(error.message || 'Une erreur est survenue. Veuillez réessayer.');
    }
  };


  
  
  export const fetchUserSessions = async () => {
    try {
      const token = localStorage.getItem("token");
  
      if (!token) {
        console.warn("Aucun token trouvé dans le stockage local");
        return null;
      }
  
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/user/session`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
  
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération des sessions');
      }
  
      return data.data; 
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions:', error);
      throw new Error(error.message || 'Une erreur est survenue. Veuillez réessayer.');
    }
  };
  
  

  export const createUser = async (userData) => {
    try {
      const token = localStorage.getItem("token");
  
      if (!token) {
        throw new Error("Token manquant. Veuillez vous reconnecter.");
      }
  
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/user/insert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Required for auth-protected routes
        },
        body: JSON.stringify(userData),
      });
  
      const data = await response.json();
  
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la création de l’utilisateur');
      }
  
      return data.data; // The created user object
    } catch (error) {
      console.error('Erreur lors de l’ajout d’un utilisateur:', error);
      throw new Error(error.message || 'Une erreur est survenue lors de l’ajout.');
    }
  };
  

  export const updateUserAffectationRecours = async (userId, affectationRecoursValue) => {
    try {
      const token = localStorage.getItem("token");
  
      if (!token) {
        throw new Error("Token manquant. Veuillez vous reconnecter.");
      }
  
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/user/update-affectation-recours/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          affectation_recours: affectationRecoursValue,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la mise à jour de l’affectation recours');
      }
  
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l’affectation recours :', error);
      throw new Error(error.message || 'Une erreur est survenue lors de la mise à jour.');
    }
  };
  



  export const fetchUserSessionsDr = async () => {
    try {
      const token = localStorage.getItem("token");
  
      if (!token) {
        console.warn("Aucun token trouvé dans le stockage local");
        return null;
      }
  
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/user/sessionDr`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
  
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération des sessions');
      }
  
      return data.data; 
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions:', error);
      throw new Error(error.message || 'Une erreur est survenue. Veuillez réessayer.');
    }
  };


  
  export const updatePassword = async (newPassword) => {
    try {
      const token = localStorage.getItem("token");
  
      if (!token) {
        throw new Error("Vous devez être connecté pour changer le mot de passe.");
      }
  
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/user/update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });
  
      const data = await response.json();
  
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la mise à jour du mot de passe');
      }
  
      return data.message; // Return success message
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      throw new Error(error.message || 'Une erreur est survenue. Veuillez réessayer.');
    }
  };
import React, { useEffect, useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardTitle,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CFormInput,
  CSpinner,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormLabel,
  CFormSelect,
} from '@coreui/react';
import { FaCircle } from 'react-icons/fa';
import { fetchUserSessions,fetchUserSessionsDr, createUser,updateUserAffectationRecours } from '../../../api/Auth';

import data from '../../data/regions.json'; 

const regions = data.regions;
const UserSessionsPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);


  const [editingUserId, setEditingUserId] = useState(null);
const [newAffectationRecours, setNewAffectationRecours] = useState('traitement');

const userRole= localStorage.getItem('userRole');
const userDr = localStorage.getItem('userDr');


  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    fonction: '',
    affectation: '',
    
    role: userRole === 'membre' ? 'cadre_commercial' : '',
    dr: userRole === 'membre' ? userDr : '',
    affectation_recours: 'traitement', 
  });
/*
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchUserSessions();
        console.log(data);
        setUsers(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);*/

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        let data;
  
        if (userRole === 'admin') {
          data = await fetchUserSessions();
        } else if (userRole === 'membre'){
          data = await fetchUserSessionsDr();
        }
  
        setUsers(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des sessions:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  

  const filteredUsers = users.filter((user) => {
    const searchString = `${user.name || ''} ${user.role || ''} ${user.dr || ''} ${user.affectation || ''}`.toLowerCase();
    return searchString.includes(search.toLowerCase());
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleUpdateAffectationRecours = async (userId) => {
    try {
      await updateUserAffectationRecours(userId, newAffectationRecours);
  
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, affectation_recours: newAffectationRecours } : user
        )
      );
  
      setEditingUserId(null);
      setNewAffectationRecours('');
    } catch (error) {
      alert('Erreur lors de la mise à jour : ' + error.message);
      console.error(error);
    }
  };
  

  const handleAddUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const createdUser = await createUser(newUser);
      setUsers((prev) => [...prev, createdUser]);
      setShowAddModal(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        fonction: '',
        affectation: '',
     
     
    role: userRole === 'membre' ? 'cadre_commercial' : '',
    dr: userRole === 'membre' ? userDr : '',

        affectation_recours:'traitement'
      });
    } catch (err) {
      console.error(err);
      alert('Erreur : impossible d’ajouter l’utilisateur.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-3">
      <CCard>
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <CCardTitle className="mb-0">Sessions Utilisateurs</CCardTitle>
            <CButton color="primary" onClick={() => setShowAddModal(true)}>
              + Ajouter Utilisateur
            </CButton>
          </div>

          <CFormInput
            placeholder="Rechercher par nom, rôle, DR, affectation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="shadow-sm mb-3"
          />

          {loading ? (
            <div className="text-center py-4">
              <CSpinner color="primary" />
            </div>
          ) : (
            <div className="table-responsive">
              <CTable hover responsive align="middle" className="table-modern">
                <CTableHead className="bg-light text-secondary">
                  <CTableRow>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Nom</CTableHeaderCell>
                    <CTableHeaderCell>Rôle</CTableHeaderCell>
                    <CTableHeaderCell>DR</CTableHeaderCell>
                    <CTableHeaderCell>Affectation</CTableHeaderCell>
                    <CTableHeaderCell>Affectation recours</CTableHeaderCell>
                    <CTableHeaderCell>Dernière connexion</CTableHeaderCell>
                    <CTableHeaderCell>Dernière déconnexion</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <CTableRow key={user.id} className="table-row-hover">
                        <CTableDataCell style={{ width: '5%' }}>
                          <FaCircle
                            color={user.status === 'online' ? 'green' : 'red'}
                            title={user.status}
                            style={{ fontSize: '0.9rem' }}
                          />
                        </CTableDataCell>
                        <CTableDataCell>{user.name || '-'}</CTableDataCell>
                        <CTableDataCell>
  {user.role === 'membre' ? 'president' : (user.role || '-')}
</CTableDataCell>

                        <CTableDataCell>{user.dr || '-'}</CTableDataCell>
                        <CTableDataCell>{user.affectation || '-'}</CTableDataCell>
                        <CTableDataCell>
  {editingUserId === user.id ? (
    <div className="d-flex align-items-center gap-2">
      <CFormSelect
        size="sm"
        value={newAffectationRecours}
        onChange={(e) => setNewAffectationRecours(e.target.value)}
      >
       
       
       <option value="traitement">Traitement</option>
                <option value="mhuv">mhuv</option>

                <option value="dgdn">dgdn</option>
             
      </CFormSelect>
      <CButton
        color="success"
        size="sm"
        onClick={() => handleUpdateAffectationRecours(user.id)}
      >
        Enregistrer
      </CButton>
      <CButton
        color="secondary"
        size="sm"
        variant="outline"
        onClick={() => {
          setEditingUserId(null);
          setNewAffectationRecours('traitement');
        }}
      >
        Annuler
      </CButton>
    </div>
  ) : (
    <div className="d-flex align-items-center justify-content-between">
      <span>{user.affectation_recours || '-'}</span>
      <CButton
        color="warning"
        size="sm"
        onClick={() => {
          setEditingUserId(user.id);
          setNewAffectationRecours(user.affectation_recours || 'traitement');
        }}
      >
        Modifier
      </CButton>
    </div>
  )}
</CTableDataCell>

                        <CTableDataCell>{user.last_login ?? '-'}</CTableDataCell>
                        <CTableDataCell>{user.last_logout ?? '-'}</CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan={8} className="text-center text-muted">
                        Aucun utilisateur trouvé.
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* Modal for Adding User */}
      <CModal visible={showAddModal} onClose={() => setShowAddModal(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Ajouter un nouvel utilisateur</CModalTitle>
        </CModalHeader>
        <form onSubmit={handleAddUser}>
          <CModalBody>
            <div className="mb-2">
              <CFormLabel>Nom</CFormLabel>
              <CFormInput name="name" required value={newUser.name} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <CFormLabel>Email</CFormLabel>
              <CFormInput type="email" name="email" required value={newUser.email} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <CFormLabel>Mot de passe</CFormLabel>
              <CFormInput type="password" name="password" required value={newUser.password} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <CFormLabel>Fonction</CFormLabel>
              <CFormInput name="fonction" value={newUser.fonction} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <CFormLabel>Affectation</CFormLabel>
              <CFormInput name="affectation" value={newUser.affectation} onChange={handleChange} />
            </div>
           


            <div className="mb-2">
  <CFormLabel>DR</CFormLabel>
  <CFormSelect name="dr" value={newUser.dr} onChange={handleChange} disabled={userRole === 'membre'} >
    <option value={""}>-- Sélectionner une région --</option>
    {regions.map((region) => (
  <option key={region.code} value={region.code}>{region.name}</option>
))}

  </CFormSelect>
</div>

            <div className="mb-3">
              <CFormLabel>Rôle</CFormLabel>
              <CFormSelect name="role" value={newUser.role} onChange={handleChange} disabled={userRole === 'membre'} >
                <option value="admin">Admin</option>
                
                <option value="membre">President</option>
                <option value="cadre_commercial">Cadre Commercial</option>
               
              </CFormSelect>
            </div>
            <div className="mb-3">
              <CFormLabel>affectation recours</CFormLabel>
              <CFormSelect name="affectation_recours" value={newUser.affectation_recours} onChange={handleChange}>
                <option value="traitement">Traitement</option>
                <option value="mhuv">mhuv</option>

                <option value="dgdn">dgdn</option>
             
              
              </CFormSelect>
            </div>

          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowAddModal(false)}>
              Annuler
            </CButton>
            <CButton type="submit" color="success" disabled={submitting}>
              {submitting ? <CSpinner size="sm" /> : 'Ajouter'}
            </CButton>
          </CModalFooter>
        </form>
      </CModal>

      <style>{`
        .table-modern {
          border-collapse: separate;
          border-spacing: 0 10px;
        }
        .table-modern thead tr th {
          border: none !important;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .table-modern tbody tr.table-row-hover {
          background-color: #f9fafb;
          cursor: pointer;
          transition: background-color 0.3s ease;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgb(0 0 0 / 0.05);
          margin-bottom: 10px;
        }
        .table-modern tbody tr.table-row-hover:hover {
          background-color: #e6f0ff;
        }
        .table-modern tbody tr td {
          border: none !important;
          padding: 12px 15px;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default UserSessionsPage;

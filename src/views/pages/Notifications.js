import React, { useEffect, useState } from 'react';
import { CAlert, CButton, CRow, CCol, CSpinner } from '@coreui/react';
import { useNavigate,useParams } from 'react-router-dom';
import '../../scss/styleC.css';

import { fetchRetardPhase1 } from '../../../api/Project';

const Notification = () => {

    
      


  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  
  useEffect(() => {
    const loadData = async () => {
      try {
        const projects = await fetchRetardPhase1();
        setData(projects);
      } catch (error) {
        localStorage.removeItem("token");
        navigate("/");
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  if (loading) {
    return <CSpinner color="primary" className="d-block mx-auto my-4" />;
  }


  

  const handleProjectClick = (num) => {
    navigate('/project/Consult', { state: { myParam: num } });
  };


  return (
    <CRow className="p-3">
   
      {error && <CAlert color="danger">{error}</CAlert>}
      {data.length === 0 && !error ? (
        <CAlert color="info">Aucune alerte de retard pour le moment.</CAlert>
      ) : (
        data.map((item, index) => (
          <CCol md={12} key={index} className="mb-3">
            <CAlert color="danger" className="d-flex justify-content-between align-items-center">
              <span>
                🚨 Vous avez une phase en retard dans le projet <strong>{item.n_p}</strong> de la wilaya <strong>{item.wilaya_name}</strong>.
              </span>
              <CButton color="light" onClick={() => handleProjectClick(item.n_p)}>
                Voir les détails
              </CButton>
            </CAlert>
          </CCol>
        ))
      )}
    </CRow>
  );
};

export default Notification;

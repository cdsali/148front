import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
} from '@coreui/react';
import ReactPaginate from 'react-paginate';
import Alerte from '../../components/Alerte';
import '../../scss/styleC.css';
import CIcon from '@coreui/icons-react';
import { cilArrowThickRight } from '@coreui/icons';
import { fetchAssignedSouscripteurs } from '../../../api/assign_agent';

import { setAssignedSouscripteurs } from '../../store';

const AssignedSouscripteurs = ({ userId }) => {
  //const [souscripteurs, setSouscripteurs] = useState([]);
  const [alert, setAlert] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();
  const itemsPerPage = 10;
const dispatch = useDispatch();

  const souscripteurs = useSelector((state) => state.assignedSouscripteurs);

  const fetchAssigned = useCallback(async () => {
    if (souscripteurs && souscripteurs.length > 0) return;

    console.log('willl do it');
    const data = await fetchAssignedSouscripteurs();
    if (data?.data) {
      dispatch(setAssignedSouscripteurs(data.data));
    } else {
      setAlert({ type: 'danger', message: 'Erreur de récupération des données.' });
    }
  }, [dispatch]);

  useEffect(() => {

    fetchAssigned();
  }, [fetchAssigned]);

const filteredSouscripteurs = useMemo(() => {
  return souscripteurs.filter(s => s.completed == '0');
}, [souscripteurs]);

const pageCount = Math.ceil(filteredSouscripteurs.length / itemsPerPage);

const currentItems = useMemo(() => {
  const start = currentPage * itemsPerPage;
  return filteredSouscripteurs.slice(start, start + itemsPerPage);
}, [filteredSouscripteurs, currentPage]);

 /* const nextIndex = useMemo(() => {
    return souscripteurs.findIndex(s => s.completed == '0');
  }, [souscripteurs]);
*/
const nextIndex = 0;
  const handlePageClick = ({ selected }) => setCurrentPage(selected);

  const handleView = (id, index) => {
    if (index !== nextIndex) {
      setAlert({ type: 'warning', message: 'Veuillez compléter le précédent souscripteur.' });
      return;
    }
    navigate('/sous_details', { state: { id } });
  };

  return (
    <div style={{ fontFamily: 'Bahnschrift Light', color: '#000' }} className="p-3">
      {alert && <Alerte type={alert.type} message={alert.message} />}

      <div
        className="w-100 mb-4 p-4 rounded"
        style={{
          background: '#fff',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ color: '#000', fontWeight: 600 }}>Total Assignés</h2>
        <div style={{ fontSize: '3rem', fontWeight: 500 }}>{filteredSouscripteurs.length}</div>
      </div>

      <CTable className="shadow-sm rounded" hover responsive borderless>
        <CTableHead style={{ backgroundColor: '#000' }}>
          <CTableRow>
            <CTableHeaderCell>Nom</CTableHeaderCell>
            <CTableHeaderCell>Prénom</CTableHeaderCell>
            <CTableHeaderCell>Date de naissance</CTableHeaderCell>
            <CTableHeaderCell>Action</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {currentItems.map((sous, index) => {
            const globalIndex = currentPage * itemsPerPage + index;
            const isDisabled = globalIndex !== nextIndex;

            return (
              <CTableRow
                key={sous.id_souscripteur}
                style={{ backgroundColor: '#fff', transition: '0.3s' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
              >
                <CTableDataCell>{sous.nom}</CTableDataCell>
                <CTableDataCell>{sous.prenom}</CTableDataCell>
                <CTableDataCell>{sous.date_nais}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    size="sm"
                    color={isDisabled ? 'secondary' : 'primary'}
                    disabled={isDisabled}
                    onClick={() => handleView(sous.id_souscripteur, globalIndex)}
                  >
                    <CIcon icon={cilArrowThickRight} />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            );
          })}
        </CTableBody>
      </CTable>

      <div className="d-flex justify-content-center mt-3">
        <ReactPaginate
          previousLabel={'←'}
          nextLabel={'→'}
          pageCount={pageCount}
          onPageChange={handlePageClick}
          containerClassName={'pagination'}
          activeClassName={'active'}
          pageClassName={'page-item'}
          pageLinkClassName={'page-link text-dark'}
          previousClassName={'page-item'}
          previousLinkClassName={'page-link text-dark'}
          nextClassName={'page-item'}
          nextLinkClassName={'page-link text-dark'}
          breakClassName={'page-item'}
          breakLinkClassName={'page-link text-dark'}
          renderOnZeroPageCount={null}
        />
      </div>
    </div>
  );
};

export default AssignedSouscripteurs;

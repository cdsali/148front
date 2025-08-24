import React, { useState, useEffect, useMemo } from 'react';
import {
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CButton,
  CSpinner,
  CCard,
  CCardBody,
  CCardTitle,
  CRow,
  CCol,
  CFormCheck,
} from '@coreui/react';
import { FaArrowLeft, FaArrowRight, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
  fetchValidationsPaginated,
  postBulkValidations,
  fetchValidationsPv,
  
} from '../../../api/souscripteurs';

import { fetchUserSessionsDr } from '../../../api/Auth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ITEMS_PER_PAGE = 20;

const ValidationsPage = () => {
  const storedUser = localStorage.getItem('UserDr');
  const userDr = storedUser ? JSON.parse(storedUser)?.dr || 4 : 4;

  const [decisionType, setDecisionType] = useState(null);
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [pagination, setPagination] = useState({ lastId: null, hasNextPage: false });
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [pageStack, setPageStack] = useState([]);

  const navigate = useNavigate();

  const loadData = async (type, cursor = null, isNext = true, bol = false, userId = null) => {
    setLoading(true);

    try {
      const result = await fetchValidationsPaginated({
        decision: type,
        userDr,
        userId,
        observation_cadre: bol,
        limit: ITEMS_PER_PAGE,
        lastId: cursor,
      });

      if (Array.isArray(result) && result.length > 0) {
        setValidations(result);
        setPagination({
          lastId: result[result.length - 1].id_souscripteur,
          hasNextPage: result.length === ITEMS_PER_PAGE,
        });
      } else {
        setValidations([]);
        setPagination({ lastId: null, hasNextPage: false });
      }

      setSelectedRows([]);
    } catch (err) {
      console.error('Erreur lors du chargement des données :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getUsers = async () => {
      try {
        const result = await fetchUserSessionsDr();
        setUsers(result);
      } catch (err) {
        console.error('Erreur lors du chargement des utilisateurs :', err);
      }
    };

    getUsers();
  }, []);

  useEffect(() => {
    if (decisionType) {
      let dec = decisionType;
      let bol = false;
      if (decisionType === 'rejeteo') {
        dec = 'rejete';
        bol = true;
      } else if (decisionType === 'completeo') {
        dec = 'complete';
        bol = true;
      }

      loadData(dec, null, true, bol, selectedUserId);
    }
  }, [decisionType, selectedUserId]);

  const handleNext = () => {
    if (pagination.hasNextPage) {
      setPageStack((prev) => [...prev, pagination.lastId]);
      loadData(decisionType, pagination.lastId, true, false, selectedUserId);
    }
  };
  

  const handlePrev = () => {
    if (pageStack.length === 0) return;
  
    const newStack = [...pageStack];
    const prevLastId = newStack.pop();
    setPageStack(newStack);
  
    loadData(decisionType, prevLastId, false, false, selectedUserId);
  };
  

  const handleView = (id) => {
    navigate('/sous_details_membre', { state: { id } });
  };

  const toggleRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleGeneratePvPdf = async () => {
    const nomuser = localStorage.getItem('userName') || 'Utilisateur inconnu';
    setLoading(true);
    try {
      const pvData = await fetchValidationsPv();
      if (!pvData || pvData.length === 0) {
        alert('Aucune donnée PV à générer.');
        return;
      }

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'A4' });
      const marginLeft = 20;
      let currentY = 20;

      doc.setFontSize(16).setFont('helvetica', 'bold').text('PV', marginLeft, currentY);
      const now = new Date();
      const formattedDateTime = now.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      doc.setFontSize(10).setFont('helvetica', 'normal').text(`Date : ${formattedDateTime}`, 150, currentY);
      currentY += 8;
      doc.text(`Généré par : ${nomuser}`, marginLeft, currentY);

      currentY += 15;
      autoTable(doc, {
        startY: currentY,
        head: [
          ['Nom', 'Prénom', 'Date Naissance', 'Décision agent', 'Agent', 'Affectation', 'Date Validation', 'Motif', 'president validation', 'decision president', 'motif president'],
        ],
        body: pvData.map(item => [
          item.nom,
          item.prenom,
          item.date_nais,
          item.decision,
          item.agent_name,
          item.affectation,
          item.validated_at,
          item.motif || '-',
          item.membre_name || '-',
          item.decision_membre || '-',
          item.motif_membre || '-',
        ]),
        styles: {
          fontSize: 6,
          cellPadding: 1,
          valign: 'middle',
          halign: 'left',
          textColor: 20,
        },
        headStyles: {
          fillColor: [52, 73, 94],
          textColor: 255,
          fontSize: 7,
          fontStyle: 'bold',
        },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { left: marginLeft, right: 10 },
      });

      const stats = pvData.reduce((acc, item) => {
        const decision = item.decision || 'Non spécifié';
        acc[decision] = (acc[decision] || 0) + 1;
        return acc;
      }, {});
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12).setFont('helvetica', 'bold');
      let lineOffset = 6;
      Object.entries(stats).forEach(([decision, count]) => {
        doc.text(`• ${decision} : ${count}`, marginLeft + 5, finalY + lineOffset);
        lineOffset += 6;
      });

      doc.save('pv-validations.pdf');
    } catch (error) {
      console.error('Erreur lors de la génération du PV PDF:', error);
      alert('Erreur lors de la génération du PV.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (type) => {
    setDecisionType(type);
  };

  const handleValider = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Token manquant, veuillez vous reconnecter.');
      return;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const agentId = payload?.userId;
    if (!agentId) {
      alert("Impossible d'identifier l'utilisateur");
      return;
    }

    if (selectedRows.length === 0) {
      alert('Aucun souscripteur sélectionné.');
      return;
    }

    const decisionsArray = selectedRows.map(id => ({
      souscripteurId: id,
      agentId,
      decision: 'valide',
      motif: null,
      observation: null
    }));

    const res = await postBulkValidations(decisionsArray);

    if (res?.success) {
      alert('Validations enregistrées.');
     // setValidations((prev) => prev.filter((v) => !selectedRows.includes(v.id_souscripteur)));
      setSelectedRows([]);
  


    // Re-load data with current filters and pagination
    let dec = decisionType;
    let bol = false;
    if (decisionType === 'rejeteo') {
      dec = 'rejete';
      bol = true;
    } else if (decisionType === 'completeo') {
      dec = 'complete';
      bol = true;
    }

    await loadData(dec, null, true, bol, selectedUserId);



    } else {
      alert('Erreur lors de la validation.');
    }
  };

  const stats = useMemo(() => {
    return validations.reduce((acc, item) => {
      const decision = item.decision || 'Non spécifié';
      acc[decision] = (acc[decision] || 0) + 1;
      return acc;
    }, {});
  }, [validations]);

  return (
    <div className="p-3">
      <div className="d-flex justify-content-end mb-3">
        <CButton color="secondary" size="sm" onClick={handleGeneratePvPdf}>
          Générer PV totale
        </CButton>
      </div>

      <CRow className="mb-3">
        <CCol className="d-flex justify-content-center gap-2 flex-wrap">
          <CButton size="sm" color={decisionType === 'valide' ? 'success' : 'light'} onClick={() => handleToggle('valide')}>Favorables</CButton>
          <CButton size="sm" color={decisionType === 'rejete' ? 'danger' : 'light'} onClick={() => handleToggle('rejete')}>Défavorables</CButton>
          <CButton size="sm" color={decisionType === 'rejeteo' ? 'danger' : 'light'} onClick={() => handleToggle('rejeteo')}>Défavorables observation</CButton>
          <CButton size="sm" color={decisionType === 'complete' ? 'warning' : 'light'} onClick={() => handleToggle('complete')}>Completer</CButton>
          <CButton size="sm" color={decisionType === 'completeo' ? 'warning' : 'light'} onClick={() => handleToggle('completeo')}>Completer observation</CButton>
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={4}>
          <label className="form-label fw-semibold">Filtrer par agent</label>
          <select
            className="form-select"
            value={selectedUserId || ''}
            onChange={(e) => setSelectedUserId(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">Tous les agents</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </CCol>
      </CRow>

      <CCard>
        <CCardBody>
          <CCardTitle className="text-center fw-bold mb-3 fs-6">
            Liste des validations
          </CCardTitle>

          {loading ? (
            <div className="text-center py-4">
              <CSpinner color="primary" />
            </div>
          ) : validations.length === 0 && decisionType ? (
            <div className="text-center text-muted py-4">Aucune donnée disponible.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <CTable small striped hover className="text-center align-middle">
                  <CTableHead>
                    <CTableRow className="bg-dark text-white">
                      <CTableHeaderCell>
                        <CFormCheck
                          checked={selectedRows.length > 0 && selectedRows.length === validations.length}
                          onChange={(e) => setSelectedRows(e.target.checked ? validations.map(v => v.id_souscripteur) : [])}
                        />
                      </CTableHeaderCell>
                      <CTableHeaderCell>Nom</CTableHeaderCell>
                      <CTableHeaderCell>Prénom</CTableHeaderCell>
                      <CTableHeaderCell>Date de naissance</CTableHeaderCell>
                      <CTableHeaderCell>Décision</CTableHeaderCell>
                      <CTableHeaderCell>Agent</CTableHeaderCell>
                      <CTableHeaderCell>Affectation</CTableHeaderCell>
                      <CTableHeaderCell>Date validation</CTableHeaderCell>
                      <CTableHeaderCell>Action</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {validations.map((v) => (
                      <CTableRow key={v.id_souscripteur}>
                        <CTableDataCell>
                          <CFormCheck
                            checked={selectedRows.includes(v.id_souscripteur)}
                            onChange={() => toggleRow(v.id_souscripteur)}
                          />
                        </CTableDataCell>
                        <CTableDataCell>{v.nom}</CTableDataCell>
                        <CTableDataCell>{v.prenom}</CTableDataCell>
                        <CTableDataCell>{v.date_nais}</CTableDataCell>
                        <CTableDataCell className={`fw-semibold text-${v.decision === 'valide' ? 'success' : 'danger'}`}>
                          {v.decision}
                        </CTableDataCell>
                        <CTableDataCell>{v.agent_name}</CTableDataCell>
                        <CTableDataCell>{v.affectation}</CTableDataCell>
                        <CTableDataCell>{v.validated_at}</CTableDataCell>
                        <CTableDataCell>
                          <CButton size="sm" color="info" variant="outline" onClick={() => handleView(v.id_souscripteur)}>
                            <FaEye />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>

              <div className="d-flex justify-content-between">
                <CButton size="sm" color="light" disabled={!pagination.lastId} style={{display:'none'}} onClick={handlePrev}>
                  <FaArrowLeft /> Précédent
                </CButton>
                <CButton size="sm" color="light" disabled={!pagination.hasNextPage} style={{display:'none'}} onClick={handleNext}>
                  Suivant <FaArrowRight />
                </CButton>
              </div>

              <div className="text-center mt-3">
                {Object.entries(stats).map(([decision, count]) => (
                  <div key={decision}>
                    <strong>{decision}</strong>: {count} {count > 1 ? 'éléments' : 'élément'}
                  </div>
                ))}
              </div>

              {selectedRows.length > 0 && (
                <div className="text-center mt-3">
                  <CButton color="primary" size="sm" onClick={handleValider}>
                    Valider la sélection ({selectedRows.length})
                  </CButton>
                </div>
              )}
            </>
          )}
        </CCardBody>
      </CCard>
    </div>
  );
};

export default ValidationsPage;
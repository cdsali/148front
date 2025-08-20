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
import { fetchValidationsPaginated, postBulkValidations, fetchValidationsPv } from '../../../api/souscripteurs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ITEMS_PER_PAGE = 10;

const ValidationsPage = () => {
  const storedUser = localStorage.getItem('UserDr');
  const userDr = storedUser ? JSON.parse(storedUser)?.dr || 4 : 4;

  const [decisionType, setDecisionType] = useState(null);
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [pagination, setPagination] = useState({ lastId: null, hasNextPage: false });

  const navigate = useNavigate();

  // Optimized Data Fetching
  const loadData = async (type, cursor = null, isNext = true,bol=false) => {
    setLoading(false);
  

    try {
      const result = await fetchValidationsPaginated({
        decision: type,
        userDr,
        observation_cadre: bol, 
        limit: ITEMS_PER_PAGE,
        lastId: cursor,
      });

      if (Array.isArray(result) && result.length > 0) {
        setValidations(result);
        setHasNextPage(result.length === ITEMS_PER_PAGE);

        // For next, store current lastId in stack
        if (isNext && result.length > 0) {
          setPrevStack((prev) => [...prev, cursor]);
          setLastId(result[result.length - 1].id_souscripteur);
        }

        // For prev, set lastId to second last in stack
        if (!isNext) {
          setLastId(cursor);
          setPrevStack((prev) => prev.slice(0, -1));
        }
      } else {
        setValidations([]);
        setHasNextPage(false);
      }

      setSelectedRows([]);
    } catch (err) {
      console.error('Erreur lors du chargement des données :', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (decisionType) {

           let dec=decisionType;
  let bol=false;
      if (decisionType == "rejeteo") {
        dec = "rejete";
        bol=true;
         
      } else if (decisionType == "completeo") {
        dec = "complete";
        bol=true;
      } 

    /*  setValidations([]);
      setSelectedRows([]);
      setLastId(null);
      setPrevStack([]);*/
    
      loadData(dec, null, true,bol);
    }
  }, [decisionType]);

  // Handle next and previous pagination
  const handleNext = () => {
    if (pagination.hasNextPage) {
      loadData(decisionType, pagination.lastId);
    }
  };

  const handlePrev = () => {
    // No prev-stack needed if we manage the lastId directly
    setPagination((prev) => ({ ...prev, lastId: prev.lastId - ITEMS_PER_PAGE }));
    loadData(decisionType, pagination.lastId);
  };

  const handleView = (id) => {
    navigate('/sous_details_membre', { state: { id } });
  };

  const toggleRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  // Generate PV PDF with pagination
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

      // Title and user info
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

      // Table
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

      // Statistics
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

      // Save the document
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

  // Memoize stats for performance
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
          <CButton
            size="sm"
            color={decisionType === 'valide' ? 'success' : 'light'}
            onClick={() => handleToggle('valide')}
          >
            Favorables
          </CButton>
          <CButton
            size="sm"
            color={decisionType === 'rejete' ? 'danger' : 'light'}
            onClick={() => handleToggle('rejete')}
          >
            Défavorables
          </CButton>


          <CButton
            size="sm"
            color={decisionType === 'rejeteo' ? 'danger' : 'light'}
            onClick={() => handleToggle('rejeteo')}
          >
            Défavorables observation
          </CButton>

          <CButton
            size="sm"
            color={decisionType === 'complete' ? 'warning' : 'light'}
            onClick={() => handleToggle('complete')}
          >
            Completer
          </CButton>

          <CButton
            size="sm"
            color={decisionType === 'completeo' ? 'warning' : 'light'}
            onClick={() => handleToggle('completeo')}
          >
            Completer observation
          </CButton>
        </CCol>
      </CRow>


      <CCard>
        <CCardBody>
          <CCardTitle className="text-center fw-bold mb-3 fs-6">
            Liste des validations{' '}
            <span className={`text-${decisionType === 'valide' ? 'success' : 'danger'}`}>
              {decisionType === 'valide' ? 'favorables' : decisionType === 'rejete' ? 'défavorables' : ''}
            </span>
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
                          checked={
                            selectedRows.length > 0 &&
                            selectedRows.length === validations.length
                          }
                          onChange={(e) =>
                            setSelectedRows(
                              e.target.checked ? validations.map((v) => v.id_souscripteur) : []
                            )
                          }
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
                        <CTableDataCell
                          className={`fw-semibold text-${
                            v.decision === 'valide' ? 'success' : 'danger'
                          }`}
                        >
                          {v.decision}
                        </CTableDataCell>
                        <CTableDataCell>{v.agent_name}</CTableDataCell>
                        <CTableDataCell>{v.affectation}</CTableDataCell>
                        <CTableDataCell>{v.validated_at}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            size="sm"
                            color="info"
                            variant="outline"
                            onClick={() => handleView(v.id_souscripteur)}
                          >
                            <FaEye />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>

              <div className="d-flex justify-content-between">
                <CButton
                  size="sm"
                  color="light"
                  disabled={!pagination.lastId}
                  onClick={handlePrev}
                >
                  <FaArrowLeft /> Précédent
                </CButton>
                <CButton
                  size="sm"
                  color="light"
                  disabled={!pagination.hasNextPage}
                  onClick={handleNext}
                >
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
            </>
          )}
        </CCardBody>
      </CCard>
    </div>
  );
};

export default ValidationsPage;

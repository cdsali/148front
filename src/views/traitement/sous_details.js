import React, { useEffect, useState, useRef,useCallback,useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CTable, CTableBody, CModalHeader, CModalTitle,
  CTableRow, CTableHeaderCell, CTableDataCell, CTableHead, CBadge, CModal, CModalBody, CSpinner ,CForm, CFormInput, CFormSelect
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilArrowLeft, cilZoomIn, cilZoomOut, cilX, cilFullscreen, cifZw } from '@coreui/icons';
import '../../scss/styleC.css';
import { fetchdSouscripteurById,fetchInsertDossierReview ,fetchMarkDossierConforme,fetchMarkDossierExamined,fetchInsertAddress,fetchUpdateEnfant} from '../../../api/souscripteurs';
import { fetchMarkAssignmentCompleted } from '../../../api/assign_agent';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';

import Alerte from "../../components/Alerte";

import RejectModal from "../../components/Modal";

import CompleteModal from "../../components/Complete";

import wilayas from '../../data/wilaya.json';
import communes from '../../data/communes.json';
import PdfPage from '../../components/PdfPage';


import { useDispatch } from 'react-redux';
import { updateAssignedSouscripteur } from '../../store'; 
GlobalWorkerOptions.workerSrc = pdfWorker;




const DocumentItem = React.memo(({
  label,
  path,
  onClick,
  documentStatus,
  updateDocumentStatus,
  dossiersreviews,
  souscripteur,
  setAlertProps,
  residence
}) => {
  if (!path) return null;

  const dossierType = mapLabelToDossierType[label];
  const review = dossiersreviews?.find((dr) => dr.dossier_type === dossierType);

  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [wilaya, setWilaya] = useState("");
  const [commune, setCommune] = useState("");
  const [address, setAddress] = useState("");
  const [enabled, setEnabled] = useState(true);
let [disabled, setDisabled] = useState(false);
  useEffect(() => {
    if (review) {
      if (documentStatus[label]?.vu === 0) updateDocumentStatus(label, { vu: 1 });
      if (review.examined === 1) updateDocumentStatus(label, { examined: 1 });
      if (review.conforme === 1) updateDocumentStatus(label, { conforme: 1 });
    }

    if (dossierType === "residence" && residence) {
      setWilaya(residence.wilaya);
      setCommune(residence.commune);
      setAddress(residence.adresse);
      setEnabled(false);
    }
  }, [review, label, dossiersreviews, residence]);

  const status = documentStatus[label] || { vu: 0, examined: 0, conforme: 0 };

  const handleVisualiserClick = () => onClick();

  const handleExamineClick = async () => {
    const success = await fetchMarkDossierExamined(souscripteur, dossierType);
    if (success) updateDocumentStatus(label, { examined: 1 });
  };

  const handleConformeClick = async () => {
    const success = await fetchMarkDossierConforme(souscripteur, dossierType);
    if (success) updateDocumentStatus(label, { conforme: 1 });
  };

  const handleResidenceUpdateSubmit = async () => {
    if (!wilaya || !commune ) {
      setAlertProps({
        type: "error",
        message: "Tous les champs obligatoires doivent être remplis.",
      });
      return;
    }

    const addressData = {
      souscripteur_id: souscripteur,
      wilaya: Number(wilaya),
      commune,
      adresse: address,
    };

    try {
      const res = await fetchInsertAddress(addressData);
      if (res) {
        setAlertProps({ type: "success", message: "Adresse enregistrée avec succès." });
        setEnabled(false);
        //setWilaya("");
        //setCommune("");
        //setAddress("");
      } else {
        setAlertProps({ type: "error", message: "Échec de l'enregistrement de l'adresse." });
      }
    } catch (err) {
      console.error("Erreur lors de l'enregistrement :", err);
      setAlertProps({ type: "error", message: "Une erreur est survenue." });
    }
  };

  const renderStatusBadge = () => {
    if (status.conforme === 1) return <CBadge color="success" className="ms-2"> Conforme</CBadge>;
    if (status.examined === 1) return <CBadge color="info" className="ms-2"> Examiné</CBadge>;
    if (status.vu === 1) return <CBadge color="warning" className="ms-2"> Vu</CBadge>;
    return <CBadge color="secondary" className="ms-2"> Non examiné</CBadge>;
  };

  return (
    <div className="border rounded px-3 py-3 mb-3 bg-white shadow-sm">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
        <div className="d-flex align-items-center flex-wrap mb-2 mb-md-0">
          <strong className="me-2">{label}</strong>
          {renderStatusBadge()}
        </div>

        <div className="d-flex flex-wrap gap-2">
         
         <CButton size="sm" color="light" 
                   onClick={() => {
                     setDisabled(true); 
                     handleVisualiserClick(); 
                     
                     setTimeout(() => setDisabled(false), 3000); 
                   }}
                   disabled={disabled} 
                   >
                     Visualiser
                   </CButton>

          {status.vu === 1 && status.examined === 0 && dossierType === "Recours" &&(
            <CButton size="sm" color="warning" onClick={handleExamineClick}>
              Examiner
            </CButton>
          )}

          {status.examined === 1 && status.conforme === 0 &&  dossierType === "Recours" &&(
            <CButton size="sm" color="success" onClick={handleConformeClick}>
              Conforme
            </CButton>
          )}

          {/*dossierType === "residence" && status.vu === 1 && (
            <CButton
              size="sm"
              color={showUpdateForm ? "secondary" : "primary"}
              onClick={() => setShowUpdateForm(prev => !prev)}
            >
              {showUpdateForm ? "Fermer" : "Mise à jour"}
            </CButton>
          )*/}
        </div>
      </div>

      {dossierType === "residence" && showUpdateForm && (
        <div className="mt-3">
          <CForm className="row g-3">
            <div className="col-md-4">
              <CFormSelect
                label="Wilaya *"
                value={wilaya}
                onChange={(e) => {
                  setWilaya(e.target.value);
                  setCommune("");
                }}
                disabled={!enabled}
                required
              >
                <option value="">Sélectionner wilaya</option>
                {wilayas.map((w) => (
                  <option key={w.name} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </CFormSelect>
            </div>

            <div className="col-md-4">
              <CFormSelect
                label="Commune *"
                value={commune}
                disabled={!wilaya || !enabled}
                onChange={(e) => setCommune(e.target.value)}
                required
              >
                <option value="">Sélectionner commune</option>
                {communes
                  .filter((c) => c.id_wilaya === Number(wilaya))
                  .map((c) => (
                    <option key={c.nom_fr} value={c.nom_fr}>
                      {c.nom_fr}
                    </option>
                  ))}
              </CFormSelect>
            </div>

            <div className="col-md-4">
              <CFormInput
                label="Adresse"
                placeholder="Adresse exacte"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!enabled}
              />
            </div>

            <div className="col-12 text-end">
              {enabled && (
                <CButton color="primary" onClick={handleResidenceUpdateSubmit}>
                  Enregistrer
                </CButton>
              )}
            </div>
          </CForm>
        </div>
      )}
    </div>
  );
});
const mapLabelToDossierType = {
  "Certificat de résidence": "residence",
  "Déclaration sur l'honneur": "declaration_honneur",
  "Chèque barré": "cheque_barre",
  "Fiche de paie": "fiche_paie",
  "Carte Chifa": "carte_chifa",
  "Fiche familiale": "fiche_famille",
  "Acte de mariage": "acte_mariage",
  "Carte d'identité": "carte_identite",
  "Fiche de paie (conjoint)": "fiche_paie_conjoint",
  "Recours":"Recours"
};

 


const SouscripteurDetailPage = () => {
  const dispatch = useDispatch();
  const { state } = useLocation();
  const id = state?.id;
  const navigate = useNavigate();
  const [infos, setInfos] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDoc, setCurrentDoc] = useState('');
  const [scale, setScale] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [pdfPages, setPdfPages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const pdfWrapperRef = useRef(null);

    const [alertProps, setAlertProps] = useState(null);

    const [minw, setminw] = useState(400);


const [ismarrie,setmarrie]=useState(false);


  const [showRejectModal, setShowRejectModal] = useState(false);

 const [ShowCompleteModal, setShowCompleteModal] = useState(false);

  const openRejectModal = () => setShowRejectModal(true);
  const closeRejectModal = () => setShowRejectModal(false);

  const openCompleteModal = () => setShowCompleteModal(true);
  const closeCompleteModal = () => setShowCompleteModal(false);

 // const nbr_dossier=ismarrie ? 10 : 5;
  const nbr_dossier=1;

const [documentStatus, setDocumentStatus] = useState({
  "Certificat de résidence": { vu: 0, examined: 0, conforme: 0 },
  "Déclaration sur l'honneur": { vu: 0, examined: 0, conforme: 0 },
  "Chèque barré": { vu: 0, examined: 0, conforme: 0 },
  "Fiche de paie": { vu: 0, examined: 0, conforme: 0 },
  "Carte Chifa": { vu: 0, examined: 0, conforme: 0 },
  "Fiche familiale": { vu: 0, examined: 0, conforme: 0 },
  "Acte de mariage": { vu: 0, examined: 0, conforme: 0 },
  "Carte d'identité": { vu: 0, examined: 0, conforme: 0 },
  "Fiche de paie (conjoint)": { vu: 0, examined: 0, conforme: 0 },
  "Recours": { vu: 0, examined: 0, conforme: 0 },
});





const [nbrEnfantInput, setNbrEnfantInput] = useState( 0);

const [isUpdating, setIsUpdating] = useState(false);
const [updateDisabled, setUpdateDisabled] = useState(false);


const handleUpdateEnfantByCode = async (code) => {
  setIsUpdating(true);

  try {
    const response = await fetchUpdateEnfant(code, nbrEnfantInput);

    if (response?.success) {
      alert("Nombre d'enfants mis à jour avec succès !");

  

     
      setUpdateDisabled(true);
    } else {
      alert(response?.message || "Échec de la mise à jour.");
    }
  } catch (error) {
    console.error("Erreur handleUpdateEnfantByCode:", error);
    alert("Erreur serveur lors de la mise à jour.");
  } finally {
    setIsUpdating(false);
  }
};









const calculateExaminedCount = useCallback(() => {
  return Object.values(documentStatus).filter(doc => doc.examined === 1).length;
}, [documentStatus]);

const calculateConformedCount = useCallback(() => {
  return Object.values(documentStatus).filter(doc => doc.conforme === 1).length;
}, [documentStatus]);

const countexamen = useMemo(() => calculateExaminedCount(), [calculateExaminedCount]);
const countconforme = useMemo(() => calculateConformedCount(), [calculateConformedCount]);

const [progress, setprogress] = useState(0);
const [progressf, setprogressf] = useState(0);

useEffect(() => {
  const total = nbr_dossier;
  const done = calculateExaminedCount();
  const cnfrm=calculateConformedCount(); 
  const newProgress = Math.round((done / total) * 100);
   const newProgressf = Math.round((cnfrm / total) * 100);
  setprogress(newProgress);
  setprogressf(newProgressf);
}, [documentStatus, nbr_dossier]);







  const updateDocumentStatus = (label, changes) => {
    setDocumentStatus((prev) => ({
      ...prev,
      [label]: {
        ...prev[label],
        ...changes,
      },
    }));
  };




  



  useEffect(() => {
    if (!id) {
      console.warn("No ID received");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchdSouscripteurById(id);
        if (data) {
          console.log(data);
          setInfos(data);
          setmarrie(data.souscripteur.situation=='marie');
     
        }
      } catch (err) {
        setError(err.message || "Failed to fetch souscripteur data");
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);
/*
  useEffect(() => {
    if (!modalVisible || !currentDoc) return;

    const loadPdf = async () => {
      try {
        setPdfLoading(true);
        setPdfError(null);
        
        const pdf = await getDocument({
          url: currentDoc,
          disableAutoFetch: true,
          disableStream: true
        }).promise;

        const pages = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          pages.push(page);
        }
        setPdfPages(pages);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setPdfError('Failed to load PDF document');
      } finally {
        setPdfLoading(false);
      }
    };

    loadPdf();

    return () => {
      setPdfPages([]);
    };
  }, [modalVisible, currentDoc]);
*/


useEffect(() => {
  if (!modalVisible || !currentDoc) return;

  let cancelled = false;

  const loadPdf = async () => {
    try {
      setPdfLoading(true);
      setPdfError(null);

      const pdf = await getDocument({
        url: currentDoc,
        disableAutoFetch: true,
        disableStream: true
      }).promise;

      if (cancelled) return;

      const pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        if (cancelled) return;

        try {
          const page = await pdf.getPage(i);
          if (!cancelled) {
            pages.push(page); // store the raw PDFPageProxy
          }
        } catch (err) {
          if (err.name === "RenderingCancelledException") {
            console.log(`Rendering of page ${i} cancelled, ignoring...`);
          } else {
            throw err;
          }
        }
      }

      if (!cancelled) setPdfPages(pages);

    } catch (error) {
      if (!cancelled) {
        if (error.name === "RenderingCancelledException") {
          console.log("Rendering cancelled, ignoring...");
        } else {
          console.error("Error loading PDF:", error);
          setPdfError("Failed to load PDF document");
        }
      }
    } finally {
      if (!cancelled) setPdfLoading(false);
    }
  };

  loadPdf();

  return () => {
    cancelled = true;
    setPdfPages([]);
  };
}, [modalVisible, currentDoc]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPos({
      x: e.clientX - translate.x,
      y: e.clientY - translate.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setTranslate({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prev => Math.min(Math.max(prev + delta, 0.5), 3));
    } else {
      setTranslate(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  const resetPosition = () => {
    //setTranslate({ x: 0, y: 0 });
   // setScale(1);
   setminw(800);
  };

  const closeModal = () => {
    setModalVisible(false);
    setCurrentDoc('');
   // setScale(1);
    setTranslate({ x: 0, y: 0 });
    setminw(800);
  };

const renderPdfPages = () => {
  return pdfPages.map((page, index) => (
    <PdfPage
      key={`page-${index}`}
      page={page}
      scale={scale}
      index={index}
      totalPages={pdfPages.length}
    />
  ));
};


  if (isLoading) return <p className="p-4">Chargement...</p>;
  if (error) return <p className="p-4 text-danger">Error: {error}</p>;
  if (!infos) return <p className="p-4">Aucune donnée disponible</p>;
/*
  const { souscripteur, dossiers ,
dossiersreviews,address,conjoint,affiliations,controle,motifs} = infos;
*/
const { souscripteur, dossiers ,
  dossiersreviews,address,conjoint,motifs} = infos;

const allConformedMarrié = Object.values(documentStatus).every(
    (status) => status.conforme === 2
  );

     const allConformedcel= documentStatus["Certificat de résidence"]?.conforme === 1 &&
    documentStatus["Déclaration sur l'honneur"]?.conforme === 1 ;


//const allConformed=ismarrie ? allConformedMarrié : allConformedcel;
const allConformed=1;







const url_data = {
  "Certificat de résidence": "certaficat_residance",
  "Déclaration sur l'honneur": "declaration_sur_lhonneur_conjointement",
  "Chèque barré": "numero_suivi_identite_postale",
  "Fiche de paie": "fiche_paie",
  "Carte Chifa": "carte_securite_sociale_conjoint",
  "Fiche familiale": "fiche_familiale",
  "Acte de mariage": "contrat_mariage",
  "Carte d'identité": "carte_nationale_conjoint",
  "Fiche de paie (conjoint)": "fiche_paie_conjoint",
  "Recours": "recour_dossier",
};


function buildCustomDocumentPath(fullPath, labelKey) {
  const parts = fullPath.split('/').filter(Boolean);
  if (parts.length < 2) return '';

  const folderPath = '/' + parts.slice(0, parts.length - 1).join('/') + '/';
  
  const id=parts[parts.length-2];
  // Lookup the slug from the label
  const labelSlug = url_data[labelKey];
  if (!labelSlug) {
    console.warn(`Label "${labelKey}" not found in url_data.`);
    return '';
  }

  return `${folderPath}${id}-${labelSlug}.pdf`;
}





const openDocument = async (relativePath,isRecour, label) => {

//alert(buildCustomDocumentPath(relativePath,label));

const bb=buildCustomDocumentPath(relativePath,label);
  try {
    setPdfLoading(true);

  
    const encodedPath = relativePath
      .split('/')
      .map(encodeURIComponent)
      .join('/');

      const urlf=   `http://192.168.0.148:3602/souscripteurs/test-doc/${encodedPath}?isrecour=${isRecour}`;

    const response = await fetch(urlf);

    if (!response.ok) throw new Error('Failed to load document');

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    // Redirect new tab to the blob URL (PDF)
    /*if (newTab) {
      newTab.location.href = url;
    }*/



/*
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
       
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
       // return; 
      }

*/

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
//const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Directly open the file URL in a new tab (no blob)
      window.open(urlf, '_blank');
      //return;
    }





    // Update state/UI
    if (isMobile==false) {
    setCurrentDoc(url);
     setModalVisible(true);
    setTranslate({ x: 0, y: 0 });
    }




    updateDocumentStatus(label, { vu: 1 });

    const dossierType = mapLabelToDossierType[label];
    const dossierReview = dossiersreviews?.find(
      (review) => review.dossier_type === dossierType
    );

    if (!dossierReview) {
      await fetchInsertDossierReview(souscripteur.code, dossierType);
    }

  } catch (err) {
    // Close the new tab if fetch fails
   /* if (newTab) {
      newTab.close();
    }
*/
    setAlertProps({
      type: "error",
      message: "Fichier non disponible.",
    });
  } finally {
    setPdfLoading(false);
  }
};







const handleFavorableClick = async () => {
  const confirm = window.confirm("Êtes-vous sûr de vouloir valider ce souscripteur ?");
  if (!confirm) return;

  const result = await fetchMarkAssignmentCompleted(souscripteur.code, "valide");

  if (result) {
    dispatch(updateAssignedSouscripteur(souscripteur.code));
    navigate("/assign");
  } else {
    alert("Échec de la validation. Veuillez réessayer.");
  }
};


 const handleRejetClick = async () => {
 /* const motif = prompt("Veuillez entrer le motif du rejet :");
  if (!motif) return;

  const result = await fetchMarkAssignmentCompleted(souscripteur.code, "rejete", motif);

  if (result) {
    navigate("/assign");
  } else {
    alert("Échec du rejet. Veuillez réessayer.");
  }*/
  navigate("/assign");
};

  const handleCloseAlert = () => {
    setAlertProps(null);
  };





  return (
    <div className="p-4" style={{ fontFamily: 'Bahnschrift Light', backgroundColor: 'white', minHeight: '100vh',fontSize:'13.5px' }}>
         {alertProps && (
        <Alerte
          type={alertProps.type}
          message={alertProps.message}
          details={alertProps.details}
          open={Boolean(alertProps)}
          onClose={handleCloseAlert} // Close function
        />
      )}
      <div className="d-flex align-items-center mb-4">
        <CButton color="light" className="me-3" onClick={() => navigate(-1)}>
          <CIcon icon={cilArrowLeft} className="me-2" />
          Retour à la liste
        </CButton>
        <h4 className="mb-0 text-dark fw-bold">Détails du souscripteur {id}</h4>
      </div>

      <CRow className="g-4">
        <CCol lg={conjoint ? 2 : 4}>
          <CCard className="shadow-sm card-border">
            <CCardHeader className="fw-bold text-dark">🧾 Informations Souscripteur</CCardHeader>
            <CCardBody className="text-dark small">
              <p><strong>Code: </strong> {souscripteur.code}</p>
              <p><strong>Nom et prénom: </strong><br />{souscripteur.nom} {souscripteur.prenom}</p>
              <p><strong>Nom et prénom (ar): </strong><br />{souscripteur.nomAr} {souscripteur.prenomAr}</p>
              <p><strong>Date de naissance: </strong> {souscripteur.date_nais}</p>
              <p><strong>Nombre d'enfants: </strong> {souscripteur.nbr_enfant}</p>
              <div className="d-flex align-items-center gap-2 mb-2">
  <input
    type="number"
    className="form-control form-control-sm"
    value={nbrEnfantInput}
    onChange={(e) => {
      setNbrEnfantInput(Number(e.target.value));
      setUpdateDisabled(false); 
    }}
    style={{ maxWidth: "100px" }}

    disabled={isUpdating || updateDisabled }
  />
  <button
    className="btn btn-sm btn-primary"
    onClick={() => handleUpdateEnfantByCode(souscripteur.code)}
    disabled={isUpdating || updateDisabled }
  >
    {isUpdating ? 'Mise à jour...' : 'modifier'}
  </button>
</div>

              <p><strong>Wilaya de souscription: </strong> {souscripteur.wilaya}</p>
              <p><strong>Situation Familiale: </strong> {souscripteur.situation}</p>
              <p><strong>Parents: </strong>{souscripteur.prenom_pere_fr}/{souscripteur.nom_mere_fr} {souscripteur.prenom_mere_fr}</p>
              <p><strong>Parents (ar): </strong><br />{souscripteur.prenom_pere}/{souscripteur.nom_mere} {souscripteur.prenom_mere}</p>
              <p><strong>Employeur: </strong> {souscripteur.employeur}</p>
              <p><strong>Salaire: </strong> {souscripteur.salaire}</p>
              <p><strong>Salaire Total: </strong> {souscripteur.total_salaire}</p>
            </CCardBody>
          </CCard>
        </CCol>

{conjoint &&
           <CCol lg={2}>
          <CCard className="shadow-sm card-border">
            <CCardHeader className="fw-bold text-dark">🧾 Informations conjoint</CCardHeader>
            <CCardBody className="text-dark small">
             
              <p><strong>Nom et prénom: </strong><br />{conjoint?.nom_conjoint} {conjoint?.prenom_conjoint}</p>
             
    
              <p><strong>Date de naissance: </strong> {conjoint?.date_nais_conjoint}</p>
           
             
      
              <p><strong>Parents: </strong>{conjoint?.prenom_pere_conjoint_fr}/{conjoint?.nom_mere_conjoint_fr} {conjoint?.prenom_mere_conjoint_fr}</p>
              <p><strong>Parents (ar): </strong><br />{conjoint?.prenom_pere_conjoint}/{conjoint?.nom_mere_conjoint} {conjoint?.prenom_mere_conjoint}</p>
              <p><strong>Employeur: </strong> {conjoint?.employeur_conjoint}</p>
        


              <p><strong>Salaire: </strong> {conjoint?.salaire_conjoint}</p>
            
            </CCardBody>
          </CCard>
        </CCol>
}
        <CCol lg={8}>
          <CCard className="shadow-sm card-border">
            <CCardHeader className="fw-bold text-dark">📂 Documents Scannés</CCardHeader>
            <CCardBody>
              <div className="mb-3">
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-2">
                  <span className="text-dark">📋 Statut d'examen : <CBadge color="warning">{countexamen}/{nbr_dossier}</CBadge></span>
                 
                </div>
                <div className="progress" style={{ height: '12px' }}>
                  <div className={progress==100 ? "progress-bar bg-success" :"progress-bar bg-warning"} style={{ width: `${progress}%` }}></div>
                </div>
               
              </div>

               <div className="mb-3">
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-2">
               
                  <span className="text-dark">✅ Statut de conformité : <CBadge color="success">{countconforme}/{nbr_dossier}</CBadge></span>
                </div>
                <div className="progress" style={{ height: '12px' }}>
                  <div className={progressf==100 ? "progress-bar bg-success" :"progress-bar bg-warning"} style={{ width: `${progressf}%` }}></div>
                </div>
                <p className="text-danger small mt-1 mb-0">Tous les documents doivent être examinés et conformes </p>
              </div>

             
              <DocumentItem label="Certificat de résidence" path={dossiers?.residence_path} onClick={() => openDocument(dossiers?.residence_path,'0',"Certificat de résidence")} documentStatus={documentStatus}
        updateDocumentStatus={updateDocumentStatus} dossiersreviews={dossiersreviews } souscripteur={souscripteur.code} setAlertProps={setAlertProps} residence={address} />
              <DocumentItem label="Déclaration sur l'honneur" path={dossiers?.declaration_honneur_path} onClick={() => openDocument(dossiers?.declaration_honneur_path,'0',"Déclaration sur l'honneur")} documentStatus={documentStatus}
        updateDocumentStatus={updateDocumentStatus} dossiersreviews={dossiersreviews } souscripteur={souscripteur.code} setAlertProps={setAlertProps} />
              <DocumentItem label="Chèque barré" path={dossiers?.cheque_barre_path} onClick={() => openDocument(dossiers?.cheque_barre_path,'0',"Chèque barré")} documentStatus={documentStatus}
        updateDocumentStatus={updateDocumentStatus} dossiersreviews={dossiersreviews } souscripteur={souscripteur.code} setAlertProps={setAlertProps} />
              <DocumentItem label="Fiche de paie" path={dossiers?.fiche_paie_path} onClick={() => openDocument(dossiers?.fiche_paie_path,'0',"Fiche de paie")} documentStatus={documentStatus}
        updateDocumentStatus={updateDocumentStatus} dossiersreviews={dossiersreviews } souscripteur={souscripteur.code} setAlertProps={setAlertProps}  />
              <DocumentItem label="Carte Chifa" path={dossiers?.carte_chifa_path} onClick={() => openDocument(dossiers?.carte_chifa_path,'0',"Carte Chifa")} documentStatus={documentStatus}
        updateDocumentStatus={updateDocumentStatus} dossiersreviews={dossiersreviews }  souscripteur={souscripteur.code} setAlertProps={setAlertProps} />
              <DocumentItem label="Fiche familiale" path={dossiers?.fiche_famille_path} onClick={() => openDocument(dossiers?.fiche_famille_path,'0',"Fiche familiale")} documentStatus={documentStatus}
        updateDocumentStatus={updateDocumentStatus} dossiersreviews={dossiersreviews } souscripteur={souscripteur.code} setAlertProps={setAlertProps} />
              <DocumentItem label="Acte de mariage" path={dossiers?.acte_mariage_path} onClick={() => openDocument(dossiers?.acte_mariage_path,'0',"Acte de mariage")} documentStatus={documentStatus}
        updateDocumentStatus={updateDocumentStatus} dossiersreviews={dossiersreviews } souscripteur={souscripteur.code} setAlertProps={setAlertProps} />
              <DocumentItem label="Carte d'identité" path={dossiers?.carte_identite_path} onClick={() => openDocument(dossiers?.carte_identite_path,'0',"Carte d'identité")} documentStatus={documentStatus}
        updateDocumentStatus={updateDocumentStatus} dossiersreviews={dossiersreviews } souscripteur={souscripteur.code}  setAlertProps={setAlertProps} />
              <DocumentItem label="Fiche de paie (conjoint)" path={dossiers?.fiche_paie_conjoint_path} onClick={() => openDocument(dossiers?.fiche_paie_conjoint_path,'0',"Fiche de paie (conjoint)")} documentStatus={documentStatus}
        updateDocumentStatus={updateDocumentStatus} dossiersreviews={dossiersreviews } souscripteur={souscripteur.code} setAlertProps={setAlertProps} />
           <DocumentItem label="Recours" path={dossiers?.recours_path} onClick={() => openDocument(dossiers?.recours_path,'1',"Recours")} documentStatus={documentStatus}
        updateDocumentStatus={updateDocumentStatus} dossiersreviews={dossiersreviews } souscripteur={souscripteur.code} setAlertProps={setAlertProps} />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>


{/*
      <CModal
        visible={modalVisible}
        onClose={closeModal}
        alignment="center"
        size="xl"
        backdrop="static"
        className="pdf-modal"
      >
        <CModalHeader closeButton>
          <CModalTitle>Document</CModalTitle>
        </CModalHeader>
        <CModalBody 
          className="p-0"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            overflow: 'hidden',
            height: '70vh'
          }}
        >
          {pdfLoading && (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
              <CSpinner color="primary" />
            </div>
          )}
          {pdfError && (
            <div className="alert alert-danger m-3">
              {pdfError}
            </div>
          )}
          <div
            ref={pdfWrapperRef}
            style={{
              transform: `translate(${translate.x}px, ${translate.y}px)`,
              padding: '0px',
              minWidth: `${minw}px`
            }}
          >
            {renderPdfPages()}
          </div>
        </CModalBody>
        <div className="d-flex justify-content-between p-3 border-top">
          <div>
            <CButton color="secondary" size="sm" onClick={resetPosition}>
              <CIcon icon={cilFullscreen} className="me-1" />
              Initialiser
            </CButton>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <CButton color="light" size="sm" onClick={() => setminw(minw-10)}>
              <CIcon icon={cilZoomOut} />
            </CButton>
            
            <CButton color="light" size="sm" onClick={() => setminw(minw+10)}>
              <CIcon icon={cilZoomIn} />
            </CButton>
          </div>
        </div>
      </CModal> */}

        <CModal
        visible={modalVisible}
        onClose={closeModal}
        alignment="center"
        size="xl"
        backdrop="static"
        className="pdf-modal"
      >
        <CModalHeader closeButton>
          <CModalTitle>Document</CModalTitle>
        </CModalHeader>
        <CModalBody
          className="p-0"
          style={{
            height: '70vh', 
            overflow: 'hidden'
          }}
        >
          {pdfLoading && (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
              <CSpinner color="primary" />
            </div>
          )}
      
          {pdfError && (
            <div className="alert alert-danger m-3">
              {pdfError}
            </div>
          )}
      
          {!pdfLoading && !pdfError && currentDoc && (
            <iframe
              src={currentDoc}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="PDF Document"
            />
          )}
        </CModalBody>
      
        <div className="d-flex justify-content-between p-3 border-top">
          <div>
            <CButton style={{display:"none"}} color="secondary" size="sm" onClick={resetPosition}>
              <CIcon icon={cilFullscreen} className="me-1" />
              Initialiser
            </CButton>
          </div>
          <div style={{display:"none"}} className="d-flex gap-2 align-items-center">
            <CButton color="light" size="sm" onClick={() => setminw(minw - 10)}>
              <CIcon icon={cilZoomOut} />
            </CButton>
      
            <CButton style={{display:"none"}} color="light" size="sm" onClick={() => setminw(minw + 10)}>
              <CIcon icon={cilZoomIn} />
            </CButton>
          </div>
        </div>
      </CModal>
      

      <CCard className="mt-4 shadow-sm card-border">
        <CCardHeader className="fw-bold text-dark">📌 motifs</CCardHeader>
        <CCardBody>
          <CTable responsive hover>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>Motif</CTableHeaderCell>
                <CTableHeaderCell>dossier recour</CTableHeaderCell>
                <CTableHeaderCell></CTableHeaderCell>
          
              </CTableRow>
            </CTableHead>
            <CTableBody>
           {motifs.map((values, index) => (
  <CTableRow key={index}>
 
    <CTableDataCell>{values.motif || '-'}</CTableDataCell>
    <CTableDataCell>{values.dossier_recour || '-'}</CTableDataCell>
    <CTableDataCell>{values.dossier_recour_ar || '-'}</CTableDataCell>

  </CTableRow>
))}

              
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
{/*
      <CCard className="mt-4 shadow-sm card-border">
        <CCardHeader className="fw-bold text-dark">📌 Affiliations</CCardHeader>
        <CCardBody>
          <CTable responsive hover>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>Statut</CTableHeaderCell>
                <CTableHeaderCell>Employeur</CTableHeaderCell>
                <CTableHeaderCell>Date Affiliation</CTableHeaderCell>
                <CTableHeaderCell>Date Recrutement</CTableHeaderCell>
                <CTableHeaderCell>Salaire</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
           {affiliations.map((values, index) => (
  <CTableRow key={index}>
    <CTableDataCell>
      <CBadge color="success">{values.status}</CBadge>
    </CTableDataCell>
    <CTableDataCell>{values.employeur || '-'}</CTableDataCell>
    <CTableDataCell>{values.date_affiliation || '-'}</CTableDataCell>
    <CTableDataCell>{values.date_recrutement || '-'}</CTableDataCell>
    <CTableDataCell>{values.salaire_cnas_casnos_cnr || '-'}</CTableDataCell>
  </CTableRow>
))}

              
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

    
      <CCard className="mt-4 shadow-sm mb-5 card-border">
        <CCardHeader className="fw-bold text-dark">🔍 Contrôle Filtre</CCardHeader>
        <CCardBody>
          <CTable responsive>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>Type</CTableHeaderCell>
                <CTableHeaderCell>Statut</CTableHeaderCell>
                <CTableHeaderCell>Motif</CTableHeaderCell>
              </CTableRow>
              
            </CTableHead>
            <CTableBody>
             
               {controle.map((values, index) => (
  <CTableRow key={index}>
    <CTableHeaderCell>{values.type}</CTableHeaderCell>
    <CTableHeaderCell></CTableHeaderCell>
    <CTableHeaderCell>{values.motif}</CTableHeaderCell>
  </CTableRow>
))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
*/}
   
      <div className="d-flex justify-content-end" style={{marginTop:"10px"}}>
        <CButton color="warning" style={{marginRight:"5px"}} onClick={openCompleteModal}>❌ Completer</CButton>

       {documentStatus["Recours"]?.conforme === 1 &&
    (
        <CButton color="success" style={{marginRight:"5px"}} onClick={handleFavorableClick}>
          Favorable
        </CButton>
      )
     }
        <CButton color="danger" onClick={openRejectModal}>❌ Rejeter</CButton>

       
      </div>
         <RejectModal
        isOpen={showRejectModal}
        onClose={closeRejectModal}
        souscripteurId={souscripteur.code}
        onSuccess={handleRejetClick}
      />

   <CompleteModal
        isOpen={ShowCompleteModal}
        onClose={closeCompleteModal}
        souscripteurId={souscripteur.code}
        onSuccess={handleRejetClick}
      />

    </div>
  );
};

export default SouscripteurDetailPage;
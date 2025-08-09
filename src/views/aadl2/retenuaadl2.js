import React, { useEffect, useState, useCallback, useMemo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormInput,
  CButton,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormSelect,
} from "@coreui/react";
import ReactPaginate from "react-paginate";

const AddCandidature = lazy(() => import("./AddRetenu"));
import "../../scss/styleC.css"; 
import { fetchAllCandidatures, addCandidaturepr,uploadPdf } from "../../../api/Candidature2";
import { addRH2, fetchRH2ByCandidature } from "../../../api/RH2";
import wilayas from "../../data/wilaya.json";
import Alerte from "../../components/Alerte";
import Gifs  from "../../assets/images/done.gif";

import regionsData from "../../data/regions.json";
import { TailSpin } from "react-loader-spinner";


function getWilayaNameByCode(code) {
  const wilaya = wilayas.find((w) => w.code === code);
  return wilaya ? wilaya.name : "Not Found"; // Handle cases where the code doesn't exist
}
const Project = () => {
  const navigate = useNavigate();
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  //const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading2, setLoading2] = useState(false);
  const [showRHPopup, setShowRHPopup] = useState(false); // State for RH popup
  const [rhData, setRHData] = useState([]); // State for RH data
  const [formData, setFormData] = useState({});
  const [rf, setrf] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [selectedCandidature, setSelectedCandidature] = useState(null);
  const [alertProps, setAlertProps] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10; // Number of items per page

  const [selectedDR, setSelectedDR] = useState(""); // State for selected DR
const [isDRFilterActive, setIsDRFilterActive] = useState(false); // State to track if DR filter is active
  
const [showAddCandidature, setShowAddCandidature] = useState(false); // New state for controlling visibility


  const [file, setFile] = useState(null);
 
  const [filterRetard, setFilterRetard] = useState(false);
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };


  const handleScanUpload = async (id) => {
    if (!file) {
      
      setAlertProps({
        type: "error",
        message: "⚠️ Please select a PDF file.",
      });
      return;
    }

    try {
      const data = await uploadPdf(file,id);
   
      setAlertProps({
        type: "success",
        message: "✅ Succès ! Le fichier a été téléchargé.",
      });
    setrf(1);
    setFile(null);

    } catch (error) {
      
      setAlertProps({
        type: "error",
        message: "Upload failed. Please try again.",
      });
    }
  };


  // Fetch Candidatures
  const getCandidatures = useCallback(async () => {
    try {
      const result = await fetchAllCandidatures();
      setCandidatures(result);
    } catch (error) {
      setError("Failed to fetch candidature data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    getCandidatures();

    const timer = setTimeout(() => {
      setShowAddCandidature(true);
    }, 2000);


  }, [navigate, getCandidatures, rf]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchRHData = useCallback(async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      const flag_step = 0; // Ensure flag_step is set
      const result = await fetchRH2ByCandidature(id, flag_step); // Pass flag_step explicitly

      if (result.success) {
        setRHData(result.data);
        setShowRHPopup(true);
      } else {
        setError(result.message || "Error fetching RH data");
      }
    } catch (error) {
      setError("Error fetching RH data");
      console.error(error);
    }
  }, [navigate]);

  // Filter Data
  const filteredData = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
  
    return candidatures.filter((item) => {
      // DR Filter
      if (isDRFilterActive && selectedDR) {
        const selectedRegion = regionsData.regions.find(
          (region) => parseInt(region.code) == parseInt(selectedDR)
        );
  
        if (!selectedRegion) return false; // If DR not found, exclude the item
  
        // Extract wilaya codes from the selected DR
        const relatedWilayas = selectedRegion.wilayas.map((wilaya) =>
         parseInt(wilaya.code)
        );
  
        // Check if the item's wilaya matches any wilaya in the selected DR
        if (!relatedWilayas.includes(parseInt(item.project.code_wilaya))) {
          return false;
        }
      }

        // Retard Filter
    if (filterRetard && item.retard_depot != 1) {
      return false;
    }

  
      // Search Filter
      return (
        item.id_candidature?.toString().toLowerCase().includes(searchLower) ||
        item.projectId?.toString().toLowerCase().includes(searchLower) ||
        item.project?.wilaya?.toString().toLowerCase().includes(searchLower) ||
        (item.nom_group && item.nom_group.toLowerCase().includes(searchLower)) ||
        (item.project?.project_name && item.project.project_name.toLowerCase().includes(searchLower)) ||
        (item.groupements &&
          item.groupements.some(
            (groupement) =>
              (groupement.name_bureau && groupement.name_bureau.toLowerCase().includes(searchLower)) ||
              (groupement.rc_bureau && groupement.rc_bureau.toLowerCase().includes(searchLower)) ||
              (groupement.wilaya_bureau &&
                getWilayaNameByCode(parseInt(groupement.wilaya_bureau))?.toLowerCase().includes(searchLower))
          )
      ))
    });
  }, [candidatures, searchQuery, selectedDR, isDRFilterActive, filterRetard]);
  

  // Group data by `id_candidature` for row merging
  const groupedCandidatures = useMemo(() => {
    const grouped = {};
    filteredData.forEach((candidature) => {
      if (!grouped[candidature.id_candidature]) {
        grouped[candidature.id_candidature] = {
          ...candidature,
          groupements: [],
        };
      }
      grouped[candidature.id_candidature].groupements.push(...candidature.groupements);
    });
    return grouped;
  }, [filteredData]);

 

  const openForm = (candidature, buttonType) => {
    setSelectedCandidature(candidature);
 
    if (buttonType === "btn1") {
      setFormData({
        id_candidature: candidature.id_candidature,
        project: candidature.projectId,
        nom: "",
        prenom: "",
        daten: "",
        experience: "",
        fonction: "",
        wilaya: "",
      });
    } else if (buttonType === "btn2") {
      setFormData({
        projectId: candidature.id_project,
        name: "",
      });
    }
    setCurrentPhase(buttonType);
  };

  const handleSubmit = async () => {
    // Trim and normalize input data
    const normalizedData = {
      ...formData,
      nom: formData.nom.trim().toLowerCase(),
      prenom: formData.prenom.trim().toLowerCase(),
      daten:"0001-01-01",
    
      flag_step: 0,
      wilaya:1
      
    };

    // Ensure all fields are filled before sending
    if (
      !normalizedData.nom ||
      !normalizedData.prenom ||
      !normalizedData.daten ||
      !normalizedData.id_candidature ||
      !normalizedData.experience ||
      !normalizedData.fonction ||
      !normalizedData.wilaya
    ) {
      setAlertProps({
        type: "error",
        message: "Tous les champs sont obligatoires. Veuillez remplir toutes les informations.",
      });
      return;
    }

    try {
      const result = await addRH2(normalizedData);

      if (result.success) {
        setLoading2(true);
        setTimeout(() => {
          setSelectedCandidature(null);
          setLoading2(false);
        }, 1000);
      } else {
        throw new Error(result.message || "Erreur inconnue");
      }
    } catch (error) {
      setSelectedCandidature(null);

      // Handle API errors
      if (error.response) {
        switch (error.response.status) {
          case 409:
            setAlertProps({
              type: "error",
              message: "Les données RH existent déjà pour cette personne dans cette candidature.",
              details: { nom: normalizedData.nom, prenom: normalizedData.prenom, daten: normalizedData.daten },
            });
            break;
          case 400:
            setAlertProps({
              type: "error",
              message: "Champs obligatoires manquants. Veuillez remplir tous les champs.",
            });
            break;
          case 403:
            setAlertProps({
              type: "error",
              message: "Vous n'avez pas l'autorisation d'ajouter cet RH.",
            });
            break;
          default:
            setAlertProps({
              type: "error",
              message: "Une erreur est survenue lors de l'ajout de l'employé.",
              details: error.response.data || {},
            });
        }
      } else {
        // Handle network errors or unexpected issues
        setAlertProps({
          type: "error",
          message: "Les données RH existent déjà pour cette personne dans cette candidature.",
        });
      }

      console.error("Submission error:", error);
    }
  };

  const handleCloseAlert = () => {
    setAlertProps(null); // Reset alert when closed
  };

  const handlePreselection = async (formData) => {
    try {
      const result = await addCandidaturepr(formData); // Add to preselection table
      if (result.success) {
        setAlertProps({
          type: "success",
          message: "Bureau d'etude preselectioné",
        });
        setrf((prev) => prev + 1);
      } else {
        alert(result.message || "Error adding to preselection");
      }
    } catch (error) {
      console.error("Error during preselection", error);
    }
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };
/*
  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;
*/
  const pageCount = Math.ceil(Object.keys(groupedCandidatures).length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = Object.values(groupedCandidatures).slice(offset, offset + itemsPerPage);

  return (
    <div style={{ position: "relative" }}>
      {alertProps && (
        <Alerte
          type={alertProps.type}
          message={alertProps.message}
          details={alertProps.details}
          open={Boolean(alertProps)}
          onClose={handleCloseAlert} // Close function
        />
      )}
    
      
    {showAddCandidature && <AddCandidature refresh={getCandidatures} />}

      <div className="mb-3 d-flex align-items-center gap-2">
        <CFormInput
          type="text"
          placeholder="Filtrer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 3 }}
        />

          {/* DR Dropdown */}
  <CFormSelect
    value={selectedDR}
    onChange={(e) => {
      setSelectedDR(e.target.value);
      setIsDRFilterActive(!!e.target.value); // Activate DR filter if a DR is selected
   
    }}
    style={{ flex: 1 }}
  >
    <option value="">Sélectionner une DR</option>
    {regionsData.regions.map((region) => (
      <option key={region.name} value={region.code}>
        {region.name}
      </option>
    ))}
  </CFormSelect>

  <div className="form-check">
    <input
      type="checkbox"
      className="form-check-input"
      id="retardCheckbox"
      checked={filterRetard}
      onChange={(e) => setFilterRetard(e.target.checked)}
    />
    <label className="form-check-label" htmlFor="retardCheckbox">
      Retard
    </label>
  </div>
      </div>

      {loading ? (
       <div className="loading-container">
       <TailSpin
         height="80"
         width="80"
         color="#4fa94d"
         ariaLabel="loading"
         visible={true}
       />
     </div>
      ) :(

      <CTable hover responsive className="styled-table">
        <CTableHead>
          <CTableRow style={{fontSize:"11px"}}>
            <CTableHeaderCell>ID Candidature</CTableHeaderCell>
            <CTableHeaderCell>Projet</CTableHeaderCell>
            <CTableHeaderCell>Wilaya</CTableHeaderCell>
            <CTableHeaderCell>N° Logts</CTableHeaderCell>
            <CTableHeaderCell>Type Candidature</CTableHeaderCell>
            <CTableHeaderCell>Date depot</CTableHeaderCell>
            <CTableHeaderCell>Nom Bureaux</CTableHeaderCell>
            <CTableHeaderCell>Ag Bureaux</CTableHeaderCell>
            <CTableHeaderCell>Wilaya Bureaux</CTableHeaderCell>
          
            <CTableHeaderCell></CTableHeaderCell>
            <CTableHeaderCell></CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody style={{fontSize:"11px",fontWeight:"500"}}>
          {currentItems.length > 0 ? (
            currentItems.map((candidature, index) => {
              const groupements = candidature.groupements || [];

              return groupements.map((groupement, gIndex) => (
                <CTableRow key={`${candidature.id_candidature}-${gIndex}`}>
                  {gIndex === 0 && (
                    <>
                      <CTableDataCell className="even2-row" rowSpan={groupements.length}>
                        {candidature.id_candidature}
                      </CTableDataCell>
                      <CTableDataCell className="even2-row" rowSpan={groupements.length}>
                        {candidature.project.project_name}
                      </CTableDataCell>
                      <CTableDataCell className="even2-row" rowSpan={groupements.length}>
                        {candidature.project.wilaya}
                      </CTableDataCell>
                      <CTableDataCell className="even2-row" rowSpan={groupements.length}>
                        {candidature.project.n_logts}
                      </CTableDataCell>
                      <CTableDataCell className="even2-row" rowSpan={groupements.length}>
                        {candidature.type_group === "group" ? `Groupement_${candidature.nom_group}` : "Bureau"}
                      </CTableDataCell>
                      <CTableDataCell className="even2-row" rowSpan={groupements.length}>
                         <CFormInput
                                              name="date_1depot"
                                              value={candidature.date_1depot}
                                              type="date"
                                              disabled
                                              className={(candidature.retard_depot==1) ? ' m-1 alert-box-button show' : 'm-1'}
                                              style={{fontSize:"12px"}}
                                            />

                                           
                     
                      </CTableDataCell>
                    </>
                  )}
                  <CTableDataCell className={gIndex === groupements.length - 1 ? "even2-row" : ""}>
                    {groupement.name_bureau}
                  </CTableDataCell>
                  <CTableDataCell className={gIndex === groupements.length - 1 ? "even2-row" : ""}>
                    {groupement.rc_bureau}
                  </CTableDataCell>
                  <CTableDataCell className={gIndex === groupements.length - 1 ? "even2-row" : ""}>
                    {getWilayaNameByCode(parseInt(groupement.wilaya_bureau))}
                  </CTableDataCell>

                

                  {gIndex === 0 && (
                    <>
                 <CTableDataCell className="even2-row" rowSpan={groupements.length}>
  <div className="d-flex flex-column align-items-start gap-2">
    
    {/* Afficher moyens humains */}
    <CButton
      className="w-100 w-md-auto d-flex align-items-center"
      style={{
        fontSize: "13px",
        padding: "8px 14px",
        background: "rgba(0, 123, 255, 0.15)", // Light transparent blue
        border: "1px solid rgba(0, 123, 255, 0.3)",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(5px)", // Glass effect
        color: "#007bff",
        transition: "0.3s ease-in-out",
      }}
      onClick={() => fetchRHData(candidature.id_candidature)}
      onMouseEnter={(e) => (e.target.style.background = "rgba(0, 123, 255, 0.3)")}
      onMouseLeave={(e) => (e.target.style.background = "rgba(0, 123, 255, 0.15)")}
    >
      ✅ Afficher moyens humains
    </CButton>

    {/* Ajouter moyen humain */}
    <CButton
      className="w-100 w-md-auto d-flex align-items-center"
      style={{
        fontSize: "13px",
        padding: "8px 14px",
        background: "rgba(40, 167, 69, 0.15)", // Light transparent green
        border: "1px solid rgba(40, 167, 69, 0.3)",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(5px)",
        color: "#28a745",
        transition: "0.3s ease-in-out",
      }}
      onClick={() => openForm(candidature, "btn1")}
      onMouseEnter={(e) => (e.target.style.background = "rgba(40, 167, 69, 0.3)")}
      onMouseLeave={(e) => (e.target.style.background = "rgba(40, 167, 69, 0.15)")}
    >
      ➕ Ajouter moyen humain
    </CButton>

    {/* File Upload Input */}
    <CFormInput
      type="file"
      accept="application/pdf"
      onChange={handleFileChange}
      className="form-control"
      style={{
        maxWidth: "300px",
        fontSize: "13px",
        padding: "6px",
        background: "rgba(255, 255, 255, 0.5)", // Semi-transparent white
        border: "1px solid rgba(0, 0, 0, 0.1)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(3px)",
      }}
    />

    {/* Scan & Upload Button */}
    <CButton
      className="w-100 w-md-auto d-flex align-items-center"
      style={{
        fontSize: "13px",
        padding: "8px 14px",
        background: "rgba(108, 117, 125, 0.15)", // Light transparent grey
        border: "1px solid rgba(108, 117, 125, 0.3)",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(5px)",
        color: "#6c757d",
        transition: "0.3s ease-in-out",
      }}
      onClick={() => handleScanUpload(candidature.id_candidature)}
      onMouseEnter={(e) => (e.target.style.background = "rgba(108, 117, 125, 0.3)")}
      onMouseLeave={(e) => (e.target.style.background = "rgba(108, 117, 125, 0.15)")}
    >
      📄 Scan Documents
    </CButton>

  </div>
</CTableDataCell>


                    
                     
 



              
                      <CTableDataCell>
                        {candidature.status_pr === 1 ? (
                          <CButton color="success" size="sm" className="m-1" disabled>
                            Preselectionné
                          </CButton>
                        ) : (
                          <CButton
                            color="info"
                            size="sm"
                            className="m-1"
                            onClick={() =>
                              handlePreselection({
                                id_candidature: candidature.id_candidature, // Corrected key name
                                projectId: candidature.projectId, // Ensure it's using the right projectId
                                type_group: candidature.type_group, // Added missing fields
                                nom_group: candidature.nom_group || "", // Ensure it's always a string
                                avantage: candidature.avantage || 0, // Ensure it's always a number
                              })
                            }
                          >
                            Preselection
                          </CButton>
                        )}
                      </CTableDataCell>
                    </>
                  )}
                </CTableRow>
              ));
            })
          ) : (
            <CTableRow>
              <CTableDataCell colSpan={8} className="text-center">
                No results found.
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable> )}
      {selectedCandidature && currentPhase && (
        <div className="mt-4 form-phase">
          {loading2 && (
            <div className="overlay">
              <img src={Gifs} alt="Success"   loading="lazy" className="gif-center" />
            </div>
          )}
          <h3>
            Projet {selectedCandidature.id_candidature} - {selectedCandidature.name_bureau}
          </h3>
          <CForm>
            {currentPhase === "btn1" && (
              <div className="mb-3">
                <CFormLabel>Nom</CFormLabel>
                <CFormInput
                  type="text"
                  name="nom"
                  value={formData.nom || ""}
                  onChange={handleChange}
                  required
                />

                <CFormLabel>Prenom</CFormLabel>
                <CFormInput
                  type="text"
                  name="prenom"
                  value={formData.prenom || ""}
                  onChange={handleChange}
                  required
                />

             
                <CFormLabel>Experience</CFormLabel>
                <CFormInput
                  type="text"
                  name="experience"
                  value={formData.experience || ""}
                  onChange={handleChange}
                  required
                />

                <CFormLabel>Fonction</CFormLabel>
                <CFormInput
                  type="text"
                  name="fonction"
                  value={formData.fonction || ""}
                  onChange={handleChange}
                  required
                />
               
              </div>
            )}
            {currentPhase === "btn2" && (
              <div className="mb-3">
                <CFormLabel>Name</CFormLabel>
                <CFormInput
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                />
              </div>
            )}
            {currentPhase === "btn3" && (
              <div className="mb-3">
                <CFormLabel>Action 3 Data</CFormLabel>
                <CFormInput
                  type="text"
                  name="action3"
                  value={formData.action3 || ""}
                  onChange={handleChange}
                />
              </div>
            )}
          </CForm>
        

          <CModalFooter className="modal-footer-modern">
                <CButton className="btn-modern cancel-btn" onClick={() => setSelectedCandidature(null)}>
                  ❌ Annuler
                </CButton>
                <CButton className="btn-modern submit-btn" onClick={handleSubmit}>
                  ✅ Valider
                </CButton>
              </CModalFooter>
        </div>
      )}
      {/* Popup for RH List */}
      {showRHPopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>RH details</h4>
            <CTable striped hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Nom</CTableHeaderCell>
                  <CTableHeaderCell>Prenom</CTableHeaderCell>
                 
                  <CTableHeaderCell>Experience</CTableHeaderCell>
                  <CTableHeaderCell>Fonction</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {rhData.map((rh, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>{rh.nom}</CTableDataCell>
                    <CTableDataCell>{rh.prenom}</CTableDataCell>
        
                    <CTableDataCell>{rh.experience}</CTableDataCell>
                    <CTableDataCell>{rh.fonction}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setShowRHPopup(false)}>
                Fermer
              </CButton>
            </CModalFooter>
          </div>
        </div>
      )}
      {/* Pagination */}
      <ReactPaginate
        previousLabel={"<"}
        nextLabel={">"}
        breakLabel={"..."}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName={"pagination"}
        activeClassName={"active"}
        previousClassName={"page-item"}
        nextClassName={"page-item"}
        previousLinkClassName={"page-link"}
        nextLinkClassName={"page-link"}
        pageClassName={"page-item"}
        pageLinkClassName={"page-link"}
        breakClassName={"page-item"}
        breakLinkClassName={"page-link"}
      />
    </div>
  );
};

export default Project;
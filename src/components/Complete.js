import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { fetchMarkAssignmentCompleted } from "../../api/assign_agent";
import { postBulkValidations } from "../../api/souscripteurs";
import { useDispatch } from 'react-redux';
import { updateAssignedSouscripteur } from '../store'; 
import { useNavigate } from 'react-router-dom';
import '../scss/styleC.css';

export default function RejectModal({ isOpen, onClose, souscripteurId, onSuccess, ismembre }) {
  const [selectedMotifs, setSelectedMotifs] = useState([]);
  const [observation, setObservation] = useState(""); // new observation state
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const predefinedMotifs = [
    "Résidence manquante",
    "Cheque manquante",
    "Fiche de paie manquante",
    "Informations incorrectes",
  ];

  const toggleMotif = (motif) => {
    setSelectedMotifs((prev) =>
      prev.includes(motif)
        ? prev.filter((m) => m !== motif)
        : [...prev, motif]
    );
  };

  const handlemembre = async () => {
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

    if (selectedMotifs.length === 0) {
      alert("Veuillez sélectionner au moins un motif.");
      return;
    }

    const finalMotifString = selectedMotifs.join("; ");
    // Observation can be empty, no validation needed

    const decisionsArray = [{
      souscripteurId,
      agentId,
      decision: 'complete',
      motif: finalMotifString,
      observation,  // add observation here
    }];

    const res = await postBulkValidations(decisionsArray);
    if (res?.success) {
      alert('Validations enregistrées.');
      navigate("/liste_traite"); 
    } else {
      alert('Erreur lors de la validation.');
    }
  };

  const handleSubmit = async () => {
    if (selectedMotifs.length === 0) {
      alert("Veuillez sélectionner au moins un motif.");
      return;
    }

    const finalMotifString = selectedMotifs.join("; ");

    const result = await fetchMarkAssignmentCompleted(
      souscripteurId, 
      "complete", 
      finalMotifString,
      observation  // pass observation as param
    );

    if (result) {
      dispatch(updateAssignedSouscripteur(souscripteurId));
      onSuccess();
      onClose();
    } else {
      alert("Échec de la validation. Veuillez réessayer.");
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" onClose={onClose} className="modal-overlay">
        <div className="modal-wrapper">
          <Dialog.Title className="modal-title">Compléter</Dialog.Title>

          <div className="checkbox-list">
            {predefinedMotifs.map((motif) => (
              <label key={motif} className="checkbox-item">
                <input
                  type="checkbox"
                  value={motif}
                  checked={selectedMotifs.includes(motif)}
                  onChange={() => toggleMotif(motif)}
                />
                <span className="checkbox-text">{motif}</span>
              </label>
            ))}
          </div>

          {/* New observation textarea */}
          <label htmlFor="observation" className="modal-label">Observation (optionnelle)</label>
          <textarea
            id="observation"
            placeholder="Écrivez une observation ici..."
            className="modal-textarea"
            rows={3}
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
          />

          <div className="modal-buttons">
            <button className="modal-button-cancel" onClick={onClose}>
              Annuler
            </button>
            <button
              className="modal-button-confirm"
              onClick={ismembre === 1 ? handlemembre : handleSubmit}
            >
              Confirmer
            </button>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

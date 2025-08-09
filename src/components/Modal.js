import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { fetchMarkAssignmentCompleted } from "../../api/assign_agent";
import { postBulkValidations } from "../../api/souscripteurs";
import { useDispatch } from "react-redux";
import { updateAssignedSouscripteur } from "../store";
import { useNavigate } from 'react-router-dom';

import "../scss/styleC.css";

export default function RejectModal({ isOpen, onClose, souscripteurId, onSuccess, ismembre }) {
  const [selectedMotifs, setSelectedMotifs] = useState([]);
  const [observation, setObservation] = useState("");
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

    if (selectedMotifs.length === 0 && !observation.trim()) {
      alert("Veuillez sélectionner au moins un motif ou saisir une observation.");
      return;
    }

    const motifFinal = [...selectedMotifs, observation.trim()].filter(Boolean).join("; ");

    const decisionsArray = [{
      souscripteurId,
      agentId,
      decision: 'rejete',
      motif: motifFinal,
      observation:observation
    }];

    const res = await postBulkValidations(decisionsArray);

    if (res?.success) {
      alert('Validations enregistrées');
      navigate("/liste_traite");
    } else {
      alert('Erreur lors de la validation.');
    }
  };

  const handleSubmit = async () => {
    if (selectedMotifs.length === 0 && !observation.trim()) {
      alert("Veuillez sélectionner au moins un motif ou saisir une observation.");
      return;
    }

    const motifFinal = [...selectedMotifs, observation.trim()].filter(Boolean).join("; ");

    const result = await fetchMarkAssignmentCompleted(souscripteurId, "rejete", motifFinal,observation);
    if (result) {
      dispatch(updateAssignedSouscripteur(souscripteurId));
      onSuccess();
      onClose();
    } else {
      alert("Échec du rejet. Veuillez réessayer.");
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" onClose={onClose} className="modal-overlay">
        <div className="modal-wrapper">
          <Dialog.Title className="modal-title">Rejeter le dossier</Dialog.Title>

          <label className="modal-label">Sélectionnez un ou plusieurs motifs :</label>
          <div className="checkbox-list">
            {predefinedMotifs.map((motif) => (
              <label key={motif} className={`checkbox-item ${selectedMotifs.includes(motif) ? "checked" : ""}`}>
                <input
                  type="checkbox"
                  value={motif}
                  checked={selectedMotifs.includes(motif)}
                  onChange={() => toggleMotif(motif)}
                />
                <span>{motif}</span>
              </label>
            ))}
          </div>

          <label className="modal-label mt-3">Observation (facultative)</label>
          <textarea
            placeholder="Écrivez ici une observation complémentaire..."
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
              Confirmer le rejet
            </button>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

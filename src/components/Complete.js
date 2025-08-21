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
    { code: "A1", text_fr: "Postulant  propriétaire d’un bien à usage d’habitation, en toute  propriété / par possession / sous toute forme de propriété , d’une superficie supérieure à 50 m²", text_ar: "المتقدم مالك لعقار سكني، ملكية كاملة، بمساحة تتجاوز 50 متر مربع." },
    { code: "A2", text_fr: "Conjoint du postulant  propriétaire d’un bien à usage d’habitation, en toute propriété / par possession / sous toute forme de propriété, d’une superficie supérieure à 50 m²", text_ar: "زوج المتقدم مالك لعقار سكني، ملكية كاملة، بمساحة تتجاوز 50 متر مربع." },
    { code: "A3", text_fr: "Postulant  propriétaire  d’un bien à usage d’habitation dans indivision par possession/sous toute forme de propriété d’une superficie supérieure à 70 m²", text_ar: "المتقدم مالك في حالة الشيوع لعقار سكني بمساحة تتجاوز 70 متر مربع." },
    { code: "A4", text_fr: "Le conjoint du postulant propriétaire d’un bien à usage d’habitation  dans l’indivision par possession/sous toute forme de propriété, d’une superficie supérieure à 70 m²", text_ar: "زوج المتقدم مالك لعقار سكني في حالة الشيوع، بمساحة تتجاوز 70 متر مربع." },
    { code: "B1", text_fr: "Postulant   propriétaire d’un lot de terrain en toute propriété / par possession / sous toute forme de propriété", text_ar: "المتقدم مالك لقطعة أرض ملكية كاملة." },

    { code: "B2", text_fr: "Conjoint du postulant  propriétaire d’un lot de terrain en toute  propriété / par possession / sous toute forme de propriété", text_ar: "زوج المتقدم مالك لقطعة أرض ملكية كاملة." },
    
    { code: "B3", text_fr: "Postulant propriétaire d’un lot de terrain dans l’indivision d’une superficie supérieure à 120, 150 ou 200 m².", text_ar: "المتقدم مالك لقطعة أرض في حالة الشيوع بمساحة تتجاوز 120، 150 أو 200 متر مربع." },
    { code: "B4", text_fr: "Conjoint du postulant propriétaire d’un lot de terrain dans indivision d’une superficie supérieure à 120, 150 ou 200 m².", text_ar: "زوج المتقدم مالك لقطعة أرض في حالة الشيوع بمساحة تتجاوز 120، 150 أو 200 متر مربع." },
    
    
    { code: "C1", text_fr: "Retour de la donation postulant/conjoint après inscription au programme AADL3", text_ar: "عودة التبرع، المتقدم/الزوج يمتلكان عقارًا عن طريق التبرع: عودة التبرع بعد التسجيل في برنامج AADL3." },
    { code: "C2", text_fr: "Occupant d’un logement de fonction ou d’astreinte cessible", text_ar: "شغل سكن وظيفي أو سكن احتياطي قابل للتحويل." },
    { code: "D1", text_fr: "Le postulant a bénéficié d’une aide financière dépassant 300.000 dinars", text_ar: "المتقدم استفاد من مساعدة مالية تتجاوز 300,000 دينار." },
    { code: "E1", text_fr: "Le postulant/conjoint détient un permis de construire", text_ar: "المتقدم يمتلك رخصة بناء." },
    { code: "E2", text_fr: "Le postulant/conjoint du postulant détient un permis de construire. (DUAC R )", text_ar: "زوج المتقدم يمتلك رخصة بناء." },
    { code: "F1", text_fr: "Le postulant n’a pas fourni de résidence ou l'adresse fournie est incorrecte.", text_ar: "المتقدم لم يقدم إقامة أو أن العنوان المقدم غير صحيح." },
    { code: "F2", text_fr: "Le postulant n’a pas soumis la déclaration sur l'honneur requise.", text_ar: "المتقدم لم يقدم الإقرار على الشرف المطلوب." },
    { code: "F3", text_fr: "Le postulant n’a pas soumis un chèque barré conforme.", text_ar: "المتقدم لم يقدم شيك مقيد مطابق." },
    { code: "F4", text_fr: "Le postulant n’a pas soumis la fiche de paie requise.", text_ar: "المتقدم لم يقدم قسيمة الدفع المطلوبة." },
    { code: "F5", text_fr: "Le postulant n’a pas fourni de carte Chifa valide.", text_ar: "المتقدم لم يقدم بطاقة شفا صالحة." },
    { code: "F6", text_fr: "Le postulant n’a pas soumis la fiche de famille demandée.", text_ar: "المتقدم لم يقدم وثيقة العائلة المطلوبة." },
    { code: "F7", text_fr: "Le postulant n’a pas soumis l'acte de mariage.", text_ar: "المتقدم لم يقدم عقد الزواج." },
    { code: "F8", text_fr: "Le postulant n’a pas fourni une carte d'identité valide.", text_ar: "المتقدم لم يقدم بطاقة هوية صالحة." },
    { code: "F9", text_fr: "Le conjoint du postulant n’a pas soumis la fiche de paie.", text_ar: "الزوج لم يقدم قسيمة الدفع المطلوبة." },
    { code: "F10", text_fr: "Le postulant a fait un recours mais n’a pas fourni de documents justificatifs.", text_ar: "المتقدم قدم طعنًا ولكن لم يقدم مستندات داعمة." },

    { code: "G1", text_fr: "Salaire supérieur à 120 000 DA", text_ar: "الأجر يفوق 120,000 دج." },
    { code: "G2", text_fr: "Salaire égal ou inférieur à 24 000 DA", text_ar: "الأجر يساوي أو يقل عن 24,000 دج." },
    { code: "G3", text_fr: "Manque affiliation CNAS/CASNOS", text_ar: "غياب الانخراط في CNAS/CASNOS." },
    { code: "G4", text_fr: "Favorable sous réserve de restitution des clés à l’organisme bailleur", text_ar: "مقبول بشرط إرجاع المفاتيح إلى الهيئة المالكة." }


  ];
  

  const toggleMotif = (code) => {
    setSelectedMotifs((prev) =>
      prev.includes(code)
        ? prev.filter((m) => m !== code)
        : [...prev, code]
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
              <label key={motif.code} className={`checkbox-item ${selectedMotifs.includes(motif.code) ? "checked" : ""}`}>
                <input
                  type="checkbox"
                  value={motif.code}  // Use the code here
                  checked={selectedMotifs.includes(motif.code)}
                  onChange={() => toggleMotif(motif.code)}  // Toggle by code
                />
                <span>{"("+motif.code+") "+motif.text_fr}</span>  
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

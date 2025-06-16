import { chargerDonnees, data,urlgroupe,urldiscussion} from "../url_api/environement.js";
import { affiche1, afficherCheckboxMembres } from "./discussion.js";
import { utilisateurSauvegarde} from "./discussion.js";
import { getIdDiscussionActive } from "./discussion.js";
import { getIdDiscussionActiveG } from "./afficheGroupe.js";



export async function afficheMembresGroupe() {
  const nom = document.getElementById('nouveauNom').value.trim();
  const telephone = document.getElementById('nouveauTelephone').value.trim();
  const erreur = document.getElementById('erreurNouveauContact');
  erreur.classList.add('hidden');

  await chargerDonnees();
  if (!nom || !/^\d+$/.test(telephone)) {
    erreur.textContent = "Nom ou téléphone invalide";
    erreur.classList.remove('hidden');
    return;
  }

  const response = await fetch(urldiscussion);
  const contacts = await response.json();
  if (contacts.some(c => c.telephone === telephone)) {
    erreur.textContent = "Ce numéro existe déjà dans vos contacts";
    erreur.classList.remove('hidden');
    return;
  }

  const nouveauContact = {
    nom: nom,
    avatar: nom[0].toUpperCase(),
    dernierMessage: "",
    heure: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    nonLus: 0,
    actus: "J'utilise WhatsApp",
    telephone: telephone,
    noteVocale: false,
    etat: true,
    messages: [],
    contact: [utilisateurSauvegarde]
  };

  try {
    const postResponse = await fetch(urldiscussion, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nouveauContact)
    });

    if (!postResponse.ok) {
      throw new Error("Erreur lors de l'ajout du contact.");
    }

    const contactCree = await postResponse.json();
    if (!contactCree.id) {
      throw new Error("L'ID du contact créé est introuvable.");
    }

    const utilisateurConnecteObj = contacts.find(c => c.id === utilisateurSauvegarde);
    if (utilisateurConnecteObj) {
      if (!Array.isArray(utilisateurConnecteObj.contact)) {
        utilisateurConnecteObj.contact = [];
      }
      utilisateurConnecteObj.contact.push(contactCree.id);

      await fetch(`${urldiscussion}/${utilisateurConnecteObj.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(utilisateurConnecteObj)
        
      });
    }
afficherCheckboxMembres();

    affiche1();

    document.getElementById('nouveauNom').value = '';
    document.getElementById('nouveauTelephone').value = '';
  } catch (error) {
    console.error("Erreur lors de l'ajout du contact :", error);
    alert("Une erreur s'est produite lors de l'ajout du contact. Veuillez réessayer.");
  }
}
import { chargerDonnees, data, urldiscussion } from "../url_api/environement.js";
import { affiche1 } from "./discussion.js";
import { utilisateurSauvegarde } from "./discussion.js";
import { estNumeroUnique, genererNomUnique } from "./utilils.js";

export async function ajouterContact() {
  const nom = document.getElementById('nom').value.trim();
  const telephone = document.getElementById('telephone').value.trim();
  const erreurNom = document.querySelector('.erreurNom');
  const erreurTelephone = document.querySelector('.erreurTelephone');
  const err = document.querySelector('.err');

  const uc = data.find(c => c.id === utilisateurSauvegarde);

  if (!nom || !telephone) {
    erreurNom.classList.remove('hidden');
    erreurTelephone.classList.remove('hidden');
    return;
  }

  if (!/^\d+$/.test(telephone)) {
    err.classList.remove('hidden');
    return;
  }

  if (!uc || !Array.isArray(uc.contact)) {
    console.error("L'utilisateur connecté ou ses contacts sont introuvables :", uc);
    return;
  }

  const contactsUtilisateur = uc.contact
    .map(id => data.find(c => c.id === id))
    .filter(contact => contact !== undefined);

  const contactExistant = estNumeroUnique(telephone, contactsUtilisateur);

  if (contactExistant) {
    console.log("Contact existant trouvé :", contactExistant);
    erreurTelephone.textContent = `Ce numéro est déjà utilisé par "${contactExistant.nom}".`;
    erreurTelephone.classList.remove('hidden');
    return;
  }

  const nomUnique = genererNomUnique(nom, contactsUtilisateur);

  // Mise à jour optimiste
  const contactTemporaire = {
    id: `temp-${Date.now()}`, // ID temporaire unique
    nom: nomUnique,
    avatar: "M",
    dernierMessage: "",
    date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    nonLus: 0,
    etat: true,
    actus: "Mawahibou Nafih",
    telephone: telephone,
    brouillon: "",
    contact: [utilisateurSauvegarde],
    noteVocale: false,
    messages: []
  };

  // Ajouter le contact temporaire à l'interface utilisateur
  uc.contact.push(contactTemporaire.id);
  data.push(contactTemporaire);
  affiche1();

  // Réinitialiser les champs du formulaire
  document.getElementById('nom').value = '';
  document.getElementById('telephone').value = '';

  try {
    // Envoyer la requête au serveur
    const response = await fetch(urldiscussion, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactTemporaire)
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'ajout du contact.");
    }

    const nouveauContact = await response.json();

    // Remplacer l'ID temporaire par l'ID réel
    const indexTemp = uc.contact.indexOf(contactTemporaire.id);
    if (indexTemp !== -1) {
      uc.contact[indexTemp] = nouveauContact.id;
    }

    const indexData = data.findIndex(c => c.id === contactTemporaire.id);
    if (indexData !== -1) {
      data[indexData] = nouveauContact;
    }

    // Mettre à jour l'utilisateur connecté sur le serveur
    await fetch(`${urldiscussion}/${uc.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(uc)
    });

  } catch (error) {
    console.error("Erreur lors de l'ajout du contact :", error);
    alert("Une erreur s'est produite lors de l'ajout du contact. Veuillez réessayer.");
  }
}
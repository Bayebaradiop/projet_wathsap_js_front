import { chargerDonnees, data,urldiscussion} from "../url_api/environement.js";
import { affiche1 } from "./discussion.js";
import { utilisateurSauvegarde } from "./discussion.js";
import { estNumeroUnique,genererNomUnique} from "./utilils.js";

export async function ajouterContact() {
  const nom = document.getElementById('nom').value.trim();
  const telephone = document.getElementById('telephone').value.trim();
  const erreurNom=document.querySelector('.erreurNom');
const erreurTelephone=document.querySelector('.erreurTelephone')
 const uc = data.find(c => c.id === utilisateurSauvegarde);
const err=document.querySelector('.err');
  if (!nom || !telephone) {
    erreurNom.classList.remove('hidden')
    erreurTelephone.classList.remove('hidden')
    return;
  }
    if (!/^\d+$/.test(telephone)) {
    err.classList.remove('hidden');
    return;
  }
  const contactExistant = uc && Array.isArray(uc.contact)
    ? estNumeroUnique(telephone, uc.contact.map(id => data.find(c => c.id === id)) )
    : null;
  if (contactExistant) {
    erreurTelephone.textContent = `Ce numéro est déjà utilisé par "${contactExistant.nom}".`;
    erreurTelephone.classList.remove('hidden');
    return;
  }
  const nomUnique = genererNomUnique(nom,  uc.contact.map(id => data.find(c => c.id === id)));
  try {
    await chargerDonnees();

    const contact = {
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

    const response = await fetch(urldiscussion, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contact)
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'ajout du contact.");
    }

    const nouveauContact = await response.json();

    if (uc) {
      uc.contact.push(nouveauContact.id);

      await fetch(`${urldiscussion}/${uc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(uc)
      });
    }

    document.getElementById('nom').value = '';
    document.getElementById('telephone').value = '';

    affiche1();

  } catch (error) {
    console.error("Erreur lors de l'ajout du contact :", error);
    alert("Une erreur s'est produite lors de l'ajout du contact. Veuillez réessayer.");
  }
}



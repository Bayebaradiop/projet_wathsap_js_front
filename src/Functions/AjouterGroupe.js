
import { chargerDonnees, data,urlgroupe} from "../url_api/environement.js";
import { afficheGroupe } from "./afficheGroupe.js";
import { utilisateurSauvegarde } from "./discussion.js";

const descriptionInput = document.getElementById('Description');
const nomGroupeInput = document.getElementById('nomGroupe');
const formGroupe = document.getElementById('formGroupe');
const erreurNomGroupe = document.querySelector('.erreurNomGroupe');
const erreurDesc = document.querySelector('.erreurDescription');
const erreurMembres = document.querySelector('.erreurMembres');
export async function Ajoutgrouppe() {
  const nomGroupe = nomGroupeInput.value.trim();
  const description = descriptionInput.value.trim();
  const checkboxes = document.querySelectorAll('#checkboxMembres input[type="checkbox"]:checked');

  chargerDonnees();
  if (!nomGroupe) {
    erreurNomGroupe.classList.remove('hidden');
    return;
  } else {
    erreurNomGroupe.classList.add('hidden');
  }

  if (!description) {
    erreurDesc.classList.remove('hidden');
    return;
  } else {
    erreurDesc.classList.add('hidden');
  }

  if (checkboxes.length < 2) {
    erreurMembres.classList.remove('hidden');
    return;
  } else {
    erreurMembres.classList.add('hidden');
  }

  try {
    const membres = Array.from(checkboxes).map(cb => {
      const id = cb.value;
      const contact = data.find(d => d.id === id); 
      if (contact) {
        return {
          id: contact.id,
          nom: contact.nom
        };
      }
      return null;
    }).filter(membre => membre !== null); 

    const nouveauGroupe = {
      nom: nomGroupe,
      description: description,
      dernierMessage: "",
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      membres: membres,
      message: [],
      etat: true,
      admin: [utilisateurSauvegarde] 
    };
    const response = await fetch(urlgroupe, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nouveauGroupe)
    });
    if (!response.ok) {
      throw new Error("Erreur lors de l'ajout du groupe.");
    }
    nomGroupeInput.value = '';
    descriptionInput.value = '';
    checkboxes.forEach(cb => cb.checked = false);
    formGroupe.classList.add('hidden');
    afficheGroupe();
  } catch (error) {
    console.error("Erreur lors de l'ajout du groupe :", error);
    alert("Une erreur s'est produite lors de l'ajout du groupe. Veuillez réessayer.");
  }
}


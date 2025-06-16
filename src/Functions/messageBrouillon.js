

import { affiche1 } from './discussion.js';
import { afficheGroupe } from './afficheGroupe.js';
import { chargerDonnees, data, datag, urldiscussion, urlgroupe } from '../url_api/environement.js';
import { getIdDiscussionActive } from "./discussion.js";
import { getIdDiscussionActiveG } from "./afficheGroupe.js";


  export async function sauvegarderBrouillon() {
  const input = document.getElementById('messageInput');
  const texte = input.value.trim();
  chargerDonnees();
  if (getIdDiscussionActive()) {
    const contact = data.find(c => c.id === getIdDiscussionActive());
    if (contact) {
      contact.brouillon = texte;
      contact.dernierMessage = texte ? `Brouillon : ${texte}` : "";
          await fetch(`${urldiscussion}/${contact.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contact)
      });
      affiche1();
    }
  } else if (getIdDiscussionActiveG()) {
    const groupe = datag.find(g => g.id === getIdDiscussionActiveG());
    if (groupe) {
      groupe.brouillon = texte;
      groupe.dernierMessage = texte ? `Brouillon : ${texte}` : "";
      await fetch(`${urlgroupe}/${groupe.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(groupe)
      });
      afficheGroupe();
    }
  }
}
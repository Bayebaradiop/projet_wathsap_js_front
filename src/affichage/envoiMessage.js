
import { data, datag, urldiscussion, urlgroupe, chargerDonnees } from "../url_api/environement.js";
import { affiche1} from "./discussion.js";
import { afficheGroupe } from "./afficheGroupe.js";
import { afficheMessages } from "./discussion.js";
import {idDiscussionActive,utilisateurSauvegarde} from "./discussion.js";
 export  async function envoyerMessage() {
  const input = document.getElementById('messageInput');
  const texte = input.value.trim();

  if (!texte || !idDiscussionActive) return;
  const heure = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  try {
    await chargerDonnees();
    const groupe = datag.find(g => g.id === idDiscussionActive);

    if (groupe) {
      const message = {
        texte,
        heure,
        envoye: true,
        lu: false,
        auteur: utilisateurSauvegarde
      };
      groupe.message.push(message);
      groupe.dernierMessage = texte;
      groupe.date = heure;
      groupe.brouillon = "";
      await fetch(`${urlgroupe}/${groupe.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(groupe)
      });

      afficheGroupe();

    } else {
      const contact = data.find(c => c.id === idDiscussionActive);

      if (contact) {
        const nouveauMessage = {
          texte,
          heure,
          envoye: true,
          lu: false,
          auteur: utilisateurSauvegarde,
          destinataire: contact.id
        };
        contact.messages.push(nouveauMessage);
        contact.dernierMessage = texte;
        contact.heure = heure;
        contact.brouillon = "";
        await fetch(`${urldiscussion}/${contact.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(contact)
        });

        const utilisateurConnecteObj = data.find(c => c.id === utilisateurSauvegarde);
        if (utilisateurConnecteObj) {
          const messageUtilisateur = {
            texte,
            heure,
            envoye: true,
            lu: true,
            auteur: utilisateurSauvegarde,
            destinataire: contact.id
          };

          utilisateurConnecteObj.messages.push(messageUtilisateur);
          utilisateurConnecteObj.dernierMessage = texte;
          utilisateurConnecteObj.heure = heure;
          await fetch(`${urldiscussion}/${utilisateurConnecteObj.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(utilisateurConnecteObj)
          });
        }

        afficheMessages(contact.id);
      }
    }

    input.value = '';

    affiche1();

  } catch (error) {
    console.error("Erreur lors de l'envoi du message :", error);
    alert("Erreur lors de l'envoi du message. Veuillez réessayer.");
  }
}
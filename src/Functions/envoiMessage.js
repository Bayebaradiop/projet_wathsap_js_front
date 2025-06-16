
import { data, datag, urldiscussion, urlgroupe, chargerDonnees } from "../url_api/environement.js";
import { affiche1 } from "./discussion.js";
import { afficheGroupe,  messageGroupe } from "./afficheGroupe.js";
import { afficheMessages } from "./discussion.js";
import {  utilisateurSauvegarde } from "./discussion.js";
import { sauvegarderBrouillon } from "./messageBrouillon.js";
import { listeNo } from "./afficheNosLues.js";
import { getIdDiscussionActive } from "./discussion.js";
import { getIdDiscussionActiveG } from "./afficheGroupe.js";
export async function envoyerMessage() {
  const input = document.getElementById('messageInput');
  const texte = input.value.trim();
  if (!texte) return;
  const heure = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  try {
    await chargerDonnees();
    if (getIdDiscussionActiveG()) {
      const groupe = datag.find(g => g.id === getIdDiscussionActiveG());
      const recup = data.find(d => d.id === utilisateurSauvegarde);
      if (groupe && recup) {
        const message = {
          texte,
          heure,
          nom: recup.nom,
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
          groupe.brouillon = "";
        messageGroupe(groupe.id);
        afficheGroupe();
      }
    }
    else if (getIdDiscussionActive()) {
      const contact = data.find(c => c.id === getIdDiscussionActive());
      const utilisateurConnecteObj = data.find(c => c.id === utilisateurSauvegarde);

      if (contact && utilisateurConnecteObj) {
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
        utilisateurConnecteObj.nonLus = utilisateurConnecteObj.nonLus + 1;

        await fetch(`${urldiscussion}/${utilisateurConnecteObj.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(utilisateurConnecteObj)
        });
          contact.brouillon = "";
        afficheMessages(contact.id);
        affiche1();
        listeNo();
      }
    } else {
      console.error("Aucun contact ou groupe actif pour envoyer le message.");
    }
    input.value = '';
  } catch (error) {
    console.error("Erreur lors de l'envoi du message :", error);
    alert("Erreur lors de l'envoi du message. Veuillez réessayer.");
  }
}
document.getElementById('messageInput').addEventListener('input', () => {
  sauvegarderBrouillon();
});

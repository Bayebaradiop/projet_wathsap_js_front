
import { data, chargerDonnees,urldiscussion } from '../url_api/environement.js';
import {utilisateurSauvegarde} from './discussion.js';
import { affiche1 } from './discussion.js';

 export async function supprimerContact(contactId) {
  try {
    const utilisateurConnecteObj = data.find(u => u.id === utilisateurSauvegarde);
    utilisateurConnecteObj.contact = utilisateurConnecteObj.contact.filter(id => id !== contactId);

    await fetch(`${urldiscussion}/${contactId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    await affiche1();
    alert("Contact supprimé avec succès !");
  } catch (error) {
    console.error("Erreur lors de la suppression du contact :", error);
    alert("Erreur lors de la suppression du contact.");
  }
}

export async function supprimerMessage(contactId, messageIndex) {
  try {
    const contact = data.find(c => c.id === contactId);
    if (!contact) {
      console.error("Contact introuvable.");
      return;
    }

    contact.messages.splice(messageIndex, 1);

    await fetch(`${urldiscussion}/${contactId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contact)
    });

    await afficheMessages(contactId);
    alert("Message supprimé avec succès !");
  } catch (error) {
    console.error("Erreur lors de la suppression du message :", error);
    alert("Erreur lors de la suppression du message.");
  }
}


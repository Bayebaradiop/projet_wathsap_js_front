import { data, datag, chargerDonnees, urldiscussion, urlgroupe } from "../url_api/environement.js";
import { pourAfficherEntete } from "./afficheEntete.js";
import { envoyerMessage } from "./envoiMessage.js";
import { listeNo } from "./afficheNosLues.js";
import { getIdDiscussionActiveG, setIdDiscussionActiveG } from "./afficheGroupe.js";
import { ajouterContact } from "./ajouterContact.js";
import { Ajoutgrouppe } from "./AjouterGroupe.js";
import { afficheMembresGroupe } from "./AjoutContactGroupe.js";
export let utilisateurSauvegarde = localStorage.getItem('utilisateurConnecte');
import {supprimerContact} from "./supprimer.js";
import { afficheMessages } from "./afficheMessageContact.js"; // Import de la fonction déplacée

let idDiscussionActive = null;

export function setIdDiscussionActive(id) {
  idDiscussionActive = id;
}

export function getIdDiscussionActive() {
  return idDiscussionActive;
}
console.log("Données des discussions :", data);
console.log("Données des groupes :", datag);


export async function affiche1() {
  await chargerDonnees();
  const u = data.find(r => r.id === utilisateurSauvegarde);
  if (!u) {
    console.error("Utilisateur introuvable pour l'ID :", utilisateurSauvegarde);
    return;
  }

  const visible = data.filter(r => u.contact.includes(r.id));
  listeToute.innerHTML = '';
  visible.forEach((d) => {
    const chatItem = document.createElement('div');
    chatItem.className = 'flex items-center p-3 hover:bg-wa-panel cursor-pointer transition-colors chat-item';
    chatItem.innerHTML = `
      <div
        class="w-12 h-12 rounded-full bg-wa-green flex items-center justify-center text-white font-medium mr-3 relative">
        ${d.nom.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
        <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-wa-sidebar"></div>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-center mb-1">
          <h3 class="text-wa-text-primary font-medium truncate">${d.nom}</h3>
          <span class="text-wa-text-secondary text-xs">${d.heure}</span>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-wa-text-secondary text-sm truncate">${d.dernierMessage}</p>
          <span class="bg-wa-green text-white text-xs rounded-full px-2 py-1 ml-2">${d.nonLus}</span>
        </div>
      </div>
      <button class="delete-contact bg-red-500 text-white px-3 py-1 ml-3 mt-5 rounded text-xs" data-id="${d.id}">S</button>
    `;

    // Ajouter un gestionnaire d'événement pour afficher les messages avec un indicateur de chargement
    chatItem.addEventListener('click', async () => {
      const loadingIndicator = document.createElement('div');
      loadingIndicator.id = 'loadingIndicator';
      loadingIndicator.className = 'fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50';
      loadingIndicator.innerHTML = `
        <div class="flex items-center justify-center mt-4">
          <div class="spinner border-4 border-t-transparent border-teal-500 rounded-full w-8 h-8 animate-spin"></div>
          <span class="ml-2 text-teal-500">Connexion en cours...</span>
        </div>
      `;
      document.body.appendChild(loadingIndicator);

      try {
        await afficheMessages(d.id); // Appeler la fonction pour afficher les messages
      } catch (error) {
        console.error("Erreur lors de l'affichage des messages :", error);
        alert("Une erreur s'est produite lors de l'affichage des messages.");
      } finally {
        loadingIndicator.remove(); // Supprimer l'indicateur de chargement
      }
    });

    // Ajouter un gestionnaire d'événement pour supprimer un contact
    const deleteButton = chatItem.querySelector('.delete-contact');
    deleteButton.addEventListener('click', async (event) => {
      event.stopPropagation(); // Empêcher le clic sur le bouton de déclencher l'affichage des messages
      const contactId = event.target.dataset.id;
      await supprimerContact(contactId);
      chatItem.remove(); // Supprimer l'élément de l'interface utilisateur
    });

    listeToute.appendChild(chatItem);
  });
}

window.afficheMessages = afficheMessages;

sendButton.addEventListener('click', envoyerMessage
);

const ajouter = document.getElementById('ajouter');
const ajouterNouveauContact = document.getElementById('ajouterNouveauContact');
ajouter.addEventListener('click', ajouterContact);

validerGroupe.addEventListener('click', () => {
  Ajoutgrouppe();
}
);

export async function afficherCheckboxMembres() {
  await chargerDonnees();
  const u = data.find(r => r.id === utilisateurSauvegarde);
  const visible = data.filter(r => u.contact.includes(r.id));
  const checkboxMembres = document.getElementById("checkboxMembres");
  checkboxMembres.innerHTML = '';
  visible.forEach(contact => {
    checkboxMembres.innerHTML += `
      <label class="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" value="${contact.id}" />
        <span class="font-medium">${contact.nom}</span> 
        <span class="text-xs text-gray-500">(${contact.telephone})</span>
      </label>
    `;
  });
}

document.getElementById('ajouterNouveauContact').addEventListener('click', afficheMembresGroupe)






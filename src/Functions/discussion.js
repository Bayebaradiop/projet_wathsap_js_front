import { data, datag, chargerDonnees, urldiscussion, urlgroupe } from "../url_api/environement.js";
import { pourAfficherEntete } from "./afficheEntete.js";
import { envoyerMessage } from "./envoiMessage.js";
import { listeNo } from "./afficheNosLues.js";
import { ajouterContact } from "./ajouterContact.js";
import { Ajoutgrouppe } from "./AjouterGroupe.js";
import { afficheMembresGroupe } from "./AjoutContactGroupe.js";
export let utilisateurSauvegarde = localStorage.getItem('utilisateurConnecte');
export let idDiscussionActive = null;
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
    listeToute.innerHTML += `
      <div class="flex items-center p-3 hover:bg-wa-panel cursor-pointer transition-colors chat-item" onclick="afficheMessages('${d.id}')">
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
      </div>
    `;
  });
}

export async function afficheMessages(identifiant) {
  try {
    await chargerDonnees();
    const contact = data.find(c => c.id === identifiant);
    if (!contact) {
      console.error("Contact introuvable.");
      return;
    }
    pourAfficherEntete(identifiant, data);
    messagesContainer.innerHTML = "";

    const messages = contact.messages.filter(msg =>
      (msg.auteur === utilisateurSauvegarde && msg.destinataire === contact.id) ||
      (msg.auteur === contact.id && msg.destinataire === utilisateurSauvegarde)
    );
    messages.forEach(msg => {
      const align = msg.auteur === utilisateurSauvegarde ? "justify-end" : "justify-start";
      const bgColor = msg.auteur === utilisateurSauvegarde ? "bg-wa-green text-white" : "bg-white text-color-text";
      const radius = msg.auteur === utilisateurSauvegarde ? "rounded-tr-full rounded-l-full" : "rounded-tl-full rounded-r-full";

      let check = "";
      if (msg.auteur === utilisateurSauvegarde) {
        check = msg.lu
          ? `<span class="text-color-noir ml-2">&#10003;&#10003;</span>`
          : `<span class="text-color-noir ml-2">&#10003;</span>`;
      }
      messagesContainer.innerHTML += `
        <div class="flex ${align} mb-2">
          <div class="${bgColor} max-w-xs px-3 py-2 ${radius}">
            <div class="text-sm">${msg.texte}</div>
            <div class="text-xs opacity-70 mt-1 text-right">
              ${msg.heure} ${check}
            </div>
          </div>
        </div>
      `;
    });

    const input = document.getElementById('messageInput');
    input.value = contact.brouillon || "";

    idDiscussionActive = identifiant;
    contact.nonLus = 0;
    await fetch(`${urldiscussion}/${contact.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contact)
    });

    listeNo();
    affiche1();

  } catch (error) {
    console.error("Erreur lors du chargement des discussions :", error);
  }
}





window.afficheMessages = afficheMessages;
sendButton.addEventListener('click', envoyerMessage
);

const ajouter = document.getElementById('ajouter');
const ajouterNouveauContact = document.getElementById('ajouterNouveauContact');
ajouter.addEventListener('click', ajouterContact);

validerGroupe.addEventListener('click', () => {
  // changerVue('ListeGroupes')
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

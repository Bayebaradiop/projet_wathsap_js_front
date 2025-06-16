
import { data, datag, chargerDonnees } from "../url_api/environement.js";
import { pourAfficherEntete } from "./afficheEntete.js";
import { getIdDiscussionActive, setIdDiscussionActive } from "./discussion.js";
let utilisateurSauvegarde = localStorage.getItem('utilisateurConnecte');
const ListeGroupes = document.getElementById('ListeGroupes');
const messageG = document.getElementById('messageG');
import {afficherAjoutMembre} from "./ajoutMembreGroupe.js";
let idDiscussionActiveG = null;

export function setIdDiscussionActiveG(id) {
  idDiscussionActiveG = id;
}
export function getIdDiscussionActiveG() {
  return idDiscussionActiveG;
}

export async function afficheGroupe() {
  try {
    await chargerDonnees();
    if (!utilisateurSauvegarde) {
      console.error("Aucun utilisateur connecté trouvé dans le localStorage.");
      return;
    }
    const visible = datag.filter(groupe =>
      groupe.membres.some(membre => membre.id === utilisateurSauvegarde) || groupe.admin.includes(utilisateurSauvegarde)
    );
    if (visible.length === 0) {
      console.log("Aucun groupe visible pour l'utilisateur connecté.");
      ListeGroupes.innerHTML = `<p class="text-wa-text-secondary text-sm">Aucun groupe disponible.</p>`;
      return;
    }
    ListeGroupes.innerHTML = '';
    visible.forEach((g) => {
      const estAdmin = g.admin.includes(utilisateurSauvegarde); 

      ListeGroupes.innerHTML += `
        <div class="flex items-center p-3 hover:bg-wa-panel cursor-pointer transition-colors chat-item" onclick="messageGroupe('${g.id}')">
          <div
            class="w-12 h-12 rounded-full bg-wa-green flex items-center justify-center text-white font-medium mr-3 relative">
            ${g.nom.charAt(0).toUpperCase()}${g.nom.charAt(1).toUpperCase()}
            <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-wa-sidebar"></div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center mb-1">
              <h3 class="text-wa-text-primary font-medium truncate">${g.nom}</h3>
              <span class="text-wa-text-secondary text-xs">${g.date || "00:00"}</span>
            </div>
            <div class="flex justify-between items-center">
              <p class="text-wa-text-secondary text-sm truncate">${g.dernierMessage || "Aucun message"}</p>
              ${g.nonLus > 0 ? `<span class="bg-wa-green text-white text-xs rounded-full px-2 py-1 ml-2">${g.nonLus}</span>` : ''}
            </div>
          </div>
          ${estAdmin ? `<button class="text-xs m-3 text-blue-500 underline ajouter-membre" data-id="${g.id}">+</button>` : ''}
        </div>
      `;
    });

    document.querySelectorAll('.ajouter-membre').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idGroupe = btn.dataset.id;
        afficherAjoutMembre(idGroupe);
      });
    });

  } catch (error) {
    console.error("Erreur lors de l'affichage des groupes :", error);
    ListeGroupes.innerHTML = `<p class="text-wa-text-secondary text-sm">Erreur lors du chargement des groupes.</p>`;
  }
}

export function messageGroupe(idg) {
  setIdDiscussionActive(null); 
  setIdDiscussionActiveG(idg); 
  chargerDonnees();
  messagesContainer.innerHTML = '';
  const g = datag.find(g => g.id === idg);
  if (!g) {
    console.error("Groupe introuvable.");
    return;
  }
  pourAfficherEntete(idg, datag);
  const membresContainer = document.getElementById('membresContainer');
  g.message.forEach((gp) => {
    messagesContainer.innerHTML += `
      <div class="flex justify-end mb-2">
        <div class="max-w-xs lg-max-w-md px-4 py-2 rounded-lg bg-wa-message-out text-white">
          <h2 class="text-sm mb-2">${gp.nom}</h2>
          <p class="text-sm">${gp.texte}</p>
          <p class="text-xs text-green-200 mt-1">${gp.heure}</p>
        </div>
      </div> 
    `;
  });
}
window.messageGroupe = messageGroupe;
window.messageGroupe = messageGroupe
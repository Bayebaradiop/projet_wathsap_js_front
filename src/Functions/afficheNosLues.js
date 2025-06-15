
import { utilisateurSauvegarde } from "./discussion.js";
import { data,chargerDonnees} from "../url_api/environement.js";
import {listeNonLues} from "../main.js";

 export async function listeNo() {
   await chargerDonnees(); 
      const u = data.find(r => r.id === utilisateurSauvegarde);
      if (!u) {
        console.error("Utilisateur introuvable pour l'ID :", utilisateurSauvegarde);
        return;
      }
      const visible = data.filter(r => u.contact.includes(r.id) && r.nonLus > 0);
      listeNonLues.innerHTML = '';
      visible.forEach((d) => {
        listeNonLues.innerHTML += `
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


import {data,datag} from "../url_api/environement.js";
 let utilisateurSauvegarde = localStorage.getItem('utilisateurConnecte');

const ListeGroupes=document.getElementById('ListeGroupes')

export function afficheGroupe() {

const visible=datag.filter(r=>r.membres.some(r=>r.id===utilisateurSauvegarde))
    visible.forEach((g)=>{


    ListeGroupes.innerHTML +=`
    
        <div class="flex items-center p-3 hover:bg-wa-panel cursor-pointer transition-colors chat-item ">
          <div
            class="w-12 h-12 rounded-full bg-wa-green flex items-center justify-center text-white font-medium mr-3 relative">
            MD
            <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-wa-sidebar"></div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center mb-1">
              <h3 class="text-wa-text-primary font-medium truncate">${g.nom}</h3>
              <span class="text-wa-text-secondary text-xs">14:32</span>
            </div>
            <div class="flex justify-between items-center">
              <p class="text-wa-text-secondary text-sm truncate">Salut ! Comment ça va ?</p>
              <span class="bg-wa-green text-white text-xs rounded-full px-2 py-1 ml-2">2</span>
            </div>
          </div>
        </div>
    
    `
    })

}

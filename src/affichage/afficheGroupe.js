  
import { data, datag, chargerDonnees } from "../url_api/environement.js";

let utilisateurSauvegarde = localStorage.getItem('utilisateurConnecte');
const ListeGroupes = document.getElementById('ListeGroupes');

export async function afficheGroupe() {
  try {
    await chargerDonnees(); // Charger les données avant de les utiliser

    if (!utilisateurSauvegarde) {
      console.error("Aucun utilisateur connecté trouvé dans le localStorage.");
      return;
    }

    // Filtrer les groupes visibles pour l'utilisateur connecté
    const visible = datag.filter(groupe =>
      groupe.membres.some(membre => membre.id === utilisateurSauvegarde)
    );

    if (visible.length === 0) {
      console.log("Aucun groupe visible pour l'utilisateur connecté.");
      ListeGroupes.innerHTML = `<p class="text-wa-text-secondary text-sm">Aucun groupe disponible.</p>`;
      return;
    }

    // Réinitialiser le contenu de la liste des groupes
    ListeGroupes.innerHTML = '';

    // Générer le HTML pour chaque groupe
    visible.forEach((g) => {
      ListeGroupes.innerHTML += `
        <div class="flex items-center p-3 hover:bg-wa-panel cursor-pointer transition-colors chat-item">
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
        </div>
      `;
    });
  } catch (error) {
    console.error("Erreur lors de l'affichage des groupes :", error);
    ListeGroupes.innerHTML = `<p class="text-wa-text-secondary text-sm">Erreur lors du chargement des groupes.</p>`;
  }
}

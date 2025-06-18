import { data, datag, chargerDonnees, urlgroupe } from '../url_api/environement.js';
import { afficheGroupe, messageGroupe } from './afficheGroupe.js';
import { utilisateurSauvegarde } from './discussion.js';
import { afficheMessages } from './afficheMessageContact.js';
import { pourAfficherEntete } from "./afficheEntete.js";

export async function afficherAjoutMembre(idGroupe) {
  // Ajouter l'indicateur de chargement
  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'loadingIndicator';
  loadingIndicator.className = 'fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50';
  loadingIndicator.innerHTML = `
    <div class="flex items-center justify-center mt-4">
      <div class="spinner border-4 border-t-transparent border-teal-500 rounded-full w-8 h-8 animate-spin"></div>
      <span class="ml-2 text-teal-500">Chargement des membres...</span>
    </div>
  `;
  document.body.appendChild(loadingIndicator);

  try {
    await chargerDonnees();
    const groupe = datag.find(g => g.id === idGroupe);
    if (!groupe) {
      alert("Groupe introuvable.");
      loadingIndicator.remove();
      return;
    }

    const contactsDispo = data.filter(contact => {
      return !groupe.membres.some(m => m.id === contact.id) && contact.id !== utilisateurSauvegarde;
    });

    if (contactsDispo.length === 0) {
      alert("Aucun contact disponible à ajouter.");
      loadingIndicator.remove();
      return;
    }

    const contenu = contactsDispo.map(c => `
      <label class="flex items-center gap-2 text-sm text-gray-700 my-1">
        <input type="checkbox" value="${c.id}">
        <span>${c.nom}</span> 
        <span class="text-xs text-gray-400">(${c.telephone})</span>
      </label>
    `).join('');

    const popup = document.createElement('div');
    popup.className = 'fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50';
    popup.innerHTML = `
      <div class="bg-white p-6 rounded shadow max-w-md w-full">
        <h2 class="text-xl font-semibold mb-4">Ajouter des membres</h2>
        <div class="overflow-y-auto max-h-60 mb-4">
          ${contenu}
        </div>
        <div class="flex justify-end gap-3">
          <button class="bg-gray-300 px-3 py-1 rounded cancel">Annuler</button>
          <button class="bg-blue-500 text-white px-3 py-1 rounded confirm">Ajouter</button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);
    loadingIndicator.remove(); // Supprimer l'indicateur de chargement une fois les membres affichés

    popup.querySelector('.cancel').addEventListener('click', () => popup.remove());
    popup.querySelector('.confirm').addEventListener('click', async () => {
      const selected = popup.querySelectorAll('input[type="checkbox"]:checked');
      
      if (selected.length === 0) {
        alert("Veuillez sélectionner au moins un membre à ajouter.");
        return;
      }
      
      const updateIndicator = document.createElement('div');
      updateIndicator.className = 'fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50';
      updateIndicator.innerHTML = `
        <div class="flex items-center justify-center mt-4">
          <div class="spinner border-4 border-t-transparent border-teal-500 rounded-full w-8 h-8 animate-spin"></div>
          <span class="ml-2 text-teal-500">Mise à jour du groupe...</span>
        </div>
      `;
      document.body.appendChild(updateIndicator);
      
      selected.forEach(cb => {
        const id = cb.value;
        const contact = data.find(c => c.id === id);
        if (contact) {
          const nouveauMembre = {
            id: contact.id,
            nom: contact.nom,
            telephone: contact.telephone,
            role: 'membre'
          };
          groupe.membres.push(nouveauMembre);
        }
      });

      try {
        const response = await fetch(`${urlgroupe}/${idGroupe}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(groupe),
        });

        if (!response.ok) {
          throw new Error(`Erreur lors de la mise à jour du groupe : ${response.status}`);
        }

        console.log("Groupe mis à jour avec succès !");
        
        await chargerDonnees();
        
        popup.remove();
        updateIndicator.remove();
        
        afficheGroupe();
        
        pourAfficherEntete(idGroupe, datag);
        
        messageGroupe(idGroupe);
        
        alert(`${selected.length} membre(s) ajouté(s) avec succès !`);
        
      } catch (error) {
        console.error("Erreur lors de la mise à jour du groupe :", error);
        alert("Une erreur s'est produite lors de la mise à jour du groupe.");
        updateIndicator.remove();
      }
    });
  } catch (error) {
    console.error("Erreur lors du chargement des membres :", error);
    alert("Une erreur s'est produite lors du chargement des membres.");
    loadingIndicator.remove();
  }
}
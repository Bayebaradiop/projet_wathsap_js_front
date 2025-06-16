import { data, datag, chargerDonnees, urlgroupe } from '../url_api/environement.js';
import { afficheGroupe } from './afficheGroupe.js';
import { afficheMessages, utilisateurSauvegarde } from './discussion.js';

export async function afficherAjoutMembre(idGroupe) {
  await chargerDonnees();
  const groupe = datag.find(g => g.id === idGroupe);
  if (!groupe) return;

  const contactsDispo = data.filter(contact => {
    return !groupe.membres.some(m => m.id === contact.id) && contact.id!==utilisateurSauvegarde;
  });

  if (contactsDispo.length === 0) {
    alert("Aucun contact disponible à ajouter.");
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

  // Gestion des boutons
  popup.querySelector('.cancel').addEventListener('click', () => popup.remove());
  popup.querySelector('.confirm').addEventListener('click', async () => {
    const selected = popup.querySelectorAll('input[type="checkbox"]:checked');
    selected.forEach(cb => {
      const id = cb.value;
      const contact = data.find(c => c.id === id);
      if (contact) groupe.membres.push(contact);
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
    } catch (error) {
      console.error("Erreur lors de la mise à jour du groupe :", error);
      alert("Une erreur s'est produite lors de la mise à jour du groupe.");
    }

    popup.remove();
    afficheGroupe(); 
    afficheMessages(idGroupe);
  });
}
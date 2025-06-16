import { data, chargerDonnees,urldiscussion } from "../url_api/environement.js";
import { utilisateurSauvegarde } from "./discussion.js";
import { affiche1 } from "./discussion.js";

export async function afficheDiffusion() {
  const ListeDiffusion = document.getElementById('ListeDiffusion');
  if (!ListeDiffusion) {
    console.error("Élément ListeDiffusion introuvable.");
    return;
  }

  ListeDiffusion.innerHTML = '';

  if (!utilisateurSauvegarde) {
    console.error("Aucun utilisateur connecté.");
    return;
  }

  await chargerDonnees();

  const utilisateurConnecteObj = data.find(c => c.id === utilisateurSauvegarde);
  if (!utilisateurConnecteObj) {
    console.error("Utilisateur connecté introuvable dans les données.");
    return;
  }

  const contactsVisibles = data.filter(e => 
    e.etat && utilisateurConnecteObj.contact.includes(e.id)
  );

  contactsVisibles.forEach((e) => {
    ListeDiffusion.innerHTML += `
      <div class="flex items-center p-3 hover:bg-wa-panel cursor-pointer transition-colors chat-item diffusion-item" data-id="${e.id}" data-type="contact">
        <div
          class="w-12 h-12 rounded-full bg-wa-green flex items-center justify-center text-white font-medium mr-3 relative">
          ${e.nom.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
          <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-wa-sidebar"></div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-center mb-1">
            <h3 class="text-wa-text-primary font-medium truncate">${e.nom}</h3>
            <span class="text-wa-text-secondary text-xs">${e.heure || "00:00"}</span>
          </div>
          <div class="flex justify-between items-center">
            <p class="text-wa-text-secondary text-sm truncate">Dernier message : ${e.dernierMessage || "Aucun message"}</p>
            <input type="checkbox" class="select-diffusion bg-wa-green text-white text-xs rounded-full px-2 py-1 ml-2" data-id="${e.id}" data-type="contact">
          </div>
        </div>
      </div>
    `;
  });

  ListeDiffusion.innerHTML += `
    <span class="error-message text-red-500 hidden">Veuillez sélectionner au moins un contact</span>
        <span class="valide-message text-green-500 hidden">Veuillez sélectionner au moins un contact</span>

    <div class="flex justify-center mb-8">
      <button id="envoyerDiffusion" class="bg-wa-green text-white px-4 py-2 rounded">Envoyer</button>
    </div>
  `;

  const btnEnvoyer = document.getElementById('envoyerDiffusion');
  if (btnEnvoyer) {
    btnEnvoyer.addEventListener('click', envoyerDiffusion);
  } else {
    console.error("Bouton envoyerDiffusion introuvable.");
  }
}

async function envoyerDiffusion() {
  const selectedItems = document.querySelectorAll('.select-diffusion:checked');
  const messageInput = document.getElementById('messageInput');
  const texte = messageInput.value.trim();

  if (!texte) {
    const errorMessage = document.querySelector('.error-message');
    errorMessage.textContent = "Le message ne peut pas être vide.";
    errorMessage.classList.remove('hidden');
    return;
  }

  if (selectedItems.length === 0) {
    const errorMessage = document.querySelector('.error-message');
    errorMessage.classList.remove('hidden');
    return;
  }

  const heure = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  await chargerDonnees();

  const utilisateurConnecteObj = data.find(c => c.id === utilisateurSauvegarde);
  if (!utilisateurConnecteObj) {
    console.error("Utilisateur connecté introuvable.");
    return;
  }

  selectedItems.forEach(item => {
    const id = item.dataset.id;
    const contact = data.find(c => c.id === id);

    if (contact) {
      const messageEnvoye = {
        texte,
        heure,
        envoye: true,
        lu: false,
        auteur: utilisateurSauvegarde,
        destinataire: contact.id
      };

      contact.messages.push(messageEnvoye);
      contact.dernierMessage = texte;
      contact.heure = heure;

      utilisateurConnecteObj.nonLus = (utilisateurConnecteObj.nonLus || 0) + 1;

      fetch(`${urldiscussion}/${contact.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contact)
      }).catch(err => console.error("Erreur lors de la mise à jour du contact :", err));
    }
  });

  messageInput.value = '';
  document.querySelectorAll('.select-diffusion').forEach(checkbox => checkbox.checked = false);

  afficheDiffusion();
  affiche1();
}
import { changerVue } from "../changementVue/changementVue.js";
import { data, chargerDonnees, urldiscussion } from "../url_api/environement.js";
import { utilisateurSauvegarde } from "./discussion.js";
import { envoyerDiffusion } from "./messageDiffusion.js";

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
    <span class="valide-message text-green-500 hidden">Message envoyé avec succès !</span>
    <span class="loading-message text-blue-500 hidden">Envoi en cours...</span>

    <div class="flex justify-center mb-8">
      <button id="envoyerDiffusion" class="bg-wa-green text-white px-4 py-2 rounded">Envoyer</button>
    </div>
  `;

  const btnEnvoyer = document.getElementById('envoyerDiffusion');
  if (btnEnvoyer) {
    btnEnvoyer.addEventListener('click', async () => {
      const loadingMessage = document.querySelector('.loading-message');
      const valideMessage = document.querySelector('.valide-message');
      const errorMessage = document.querySelector('.error-message');

      loadingMessage.classList.remove('hidden');
      btnEnvoyer.disabled = true;

      try {
        await envoyerDiffusion();
        loadingMessage.classList.add('hidden');
        valideMessage.classList.remove('hidden');
      } catch (error) {
        loadingMessage.classList.add('hidden');
        errorMessage.classList.remove('hidden');
      } finally {
        btnEnvoyer.disabled = false;
      }

      changerVue('listeToute');
    });
  } else {
    console.error("Bouton envoyerDiffusion introuvable.");
  }
}
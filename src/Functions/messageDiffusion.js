import { data, chargerDonnees,urldiscussion } from "../url_api/environement.js";
import { utilisateurSauvegarde,affiche1} from "./discussion.js";
import { afficheDiffusion } from "./afficheDiffusion.js";
export async function envoyerDiffusion() {
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
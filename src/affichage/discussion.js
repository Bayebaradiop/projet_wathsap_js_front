import { data, datag, urldiscussion, urlgroupe, chargerDonnees } from "../url_api/environement.js";
import { pourAfficherEntete } from "./afficheEntete.js";

let utilisateurSauvegarde = localStorage.getItem('utilisateurConnecte');
let idDiscussionActive = null;

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
  let html = '';

  visible.forEach((d) => {
    html += `
      <div class="flex items-center p-3 hover:bg-wa-panel cursor-pointer transition-colors chat-item" onclick="afficheMessages('${d.id}')">
        <div class="w-12 h-12 rounded-full bg-wa-green flex items-center justify-center text-white font-medium mr-3 relative">
          BB
          <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-wa-sidebar"></div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-center mb-1">
            <h3 class="text-wa-text-primary font-medium truncate">${d.nom}</h3>
            <span class="text-wa-text-secondary text-xs">${d.heure}</span>
          </div>
          <div class="flex justify-between items-center">
            <p class="text-wa-text-secondary text-sm truncate">${d.dernierMessage}</p>
            ${d.nonLus > 0 ? `<span class="bg-wa-green text-white text-xs rounded-full px-2 py-1 ml-2">${d.nonLus}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  });

  listeToute.innerHTML = html;
}

async function afficheMessages(identifiant) {
  try {
    await chargerDonnees(); // Charger les données avant de les utiliser

    const contact = data.find(c => c.id === identifiant);
    if (!contact) {
      console.error("Contact introuvable pour l'ID :", identifiant);
      return;
    }

    pourAfficherEntete(identifiant);
    messagesContainer.innerHTML = "";

    const messages = contact.messages.filter(msg =>
      (msg.auteur === utilisateurSauvegarde && msg.destinataire === contact.id) ||
      (msg.auteur === contact.id && msg.destinataire === utilisateurSauvegarde)
    );

    let messagesHTML = "";
    messages.forEach(msg => {
      const align = msg.auteur === utilisateurSauvegarde ? "justify-end" : "justify-start";
      const bgColor = msg.auteur === utilisateurSauvegarde ? "bg-wa-green text-white" : "bg-color-blanc text-color-text";
      const radius = msg.auteur === utilisateurSauvegarde ? "rounded-tr-full rounded-l-full" : "rounded-tl-full rounded-r-full";

      let check = "";
      if (msg.auteur === utilisateurSauvegarde) {
        check = msg.lu
          ? `<span class="text-color-noir ml-2">&#10003;&#10003;</span>` 
          : `<span class="text-color-noir ml-2">&#10003;</span>`;
      }

      messagesHTML += `
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

    messagesContainer.innerHTML = messagesHTML;

    const input = document.getElementById('messageInput');
    input.value = contact.brouillon || "";

    idDiscussionActive = identifiant;

  } catch (error) {
    console.error("Erreur lors du chargement des messages :", error);
  }
}

window.afficheMessages = afficheMessages;

const sendButton = document.getElementById('sendButton');
sendButton.addEventListener('click', envoyerMessage);

async function envoyerMessage() {
  const input = document.getElementById('messageInput');
  const texte = input.value.trim();

  if (!texte || !idDiscussionActive) return;

  const heure = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  try {
    await chargerDonnees(); // Charger les données avant de les utiliser

    const groupe = datag.find(g => g.id === idDiscussionActive);

    if (groupe) {
      const message = {
        texte,
        heure,
        envoye: true,
        lu: false,
        auteur: utilisateurSauvegarde
      };

      groupe.message.push(message);
      groupe.dernierMessage = texte;
      groupe.date = heure;
      groupe.brouillon = "";

      await fetch(`${urlgroupe}/${groupe.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(groupe)
      });

      afficheGroupe();

    } else {
      const contact = data.find(c => c.id === idDiscussionActive);

      if (contact) {
        const nouveauMessage = {
          texte,
          heure,
          envoye: true,
          lu: false,
          auteur: utilisateurSauvegarde,
          destinataire: contact.id
        };

        contact.messages.push(nouveauMessage);
        contact.dernierMessage = texte;
        contact.heure = heure;
        contact.brouillon = "";

        await fetch(`${urldiscussion}/${contact.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(contact)
        });

        afficheMessages(contact.id);
      }
    }

    input.value = '';
    affiche1();

  } catch (error) {
    console.error("Erreur lors de l'envoi du message :", error);
    alert("Erreur lors de l'envoi du message. Veuillez réessayer.");
  }
}
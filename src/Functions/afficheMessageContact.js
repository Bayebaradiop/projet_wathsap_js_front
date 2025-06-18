import { data, chargerDonnees, urldiscussion, datag } from "../url_api/environement.js";
import { pourAfficherEntete } from "./afficheEntete.js";
import { utilisateurSauvegarde } from "./discussion.js";
import { listeNo } from "./afficheNosLues.js";
import { setIdDiscussionActiveG } from "./afficheGroupe.js";
import { setIdDiscussionActive } from "./discussion.js";
import { affiche1 } from "./discussion.js";

export async function afficheMessages(identifiant) {
  try {
    await chargerDonnees();
    const contact = data.find(c => c.id === identifiant);
    if (!contact) {
      console.error("Contact introuvable.");
      return;
    }

    setIdDiscussionActiveG(null);

    pourAfficherEntete(identifiant, data);
    messagesContainer.innerHTML = "";

    const messages = contact.messages.filter(msg =>
      (msg.auteur === utilisateurSauvegarde && msg.destinataire === contact.id) ||
      (msg.auteur === contact.id && msg.destinataire === utilisateurSauvegarde)
    );
    
    messages.forEach(msg => {
      const align = msg.auteur === utilisateurSauvegarde ? "justify-end" : "justify-start";
      const bgColor = msg.auteur === utilisateurSauvegarde ? "bg-wa-green text-white" : "bg-white text-color-text";
      const radius = msg.auteur === utilisateurSauvegarde ? "rounded-tr-full rounded-l-full" : "rounded-tl-full rounded-r-full";

      let check = "";
      if (msg.auteur === utilisateurSauvegarde) {
        check = msg.lu
          ? `<span class="text-color-noir ml-2">&#10003;&#10003;</span>`
          : `<span class="text-color-noir ml-2">&#10003;</span>`;
      }
      
      let messageContent = '';
      if (msg.type === 'audio') {
        messageContent = `
          <div class="flex items-center">
            <audio controls class="w-full max-w-[150px]">
              <source src="${msg.url}" type="audio/webm">
              Votre navigateur ne supporte pas la lecture audio.
            </audio>
            <i class="fas fa-headphones ml-2 text-xs"></i>
          </div>
        `;
      } else {
        messageContent = `<div class="text-sm">${msg.texte}</div>`;
      }
      
      messagesContainer.innerHTML += `
        <div class="flex ${align} mb-2">
          <div class="${bgColor} max-w-xs px-3 py-2 ${radius}">
            ${messageContent}
            <div class="text-xs opacity-70 mt-1 text-right">
              ${msg.heure} ${check}
            </div>
          </div>
        </div>
      `;
    });

    // Faire défiler automatiquement vers le dernier message
    if (messagesContainer.lastElementChild) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    const input = document.getElementById('messageInput');
    input.value = contact.brouillon || "";

    setIdDiscussionActive(identifiant); 
    contact.nonLus = 0;
    await fetch(`${urldiscussion}/${contact.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contact)
    });

    listeNo();
    affiche1();

  } catch (error) {
    console.error("Erreur lors du chargement des discussions :", error);
  }
}


export async function afficheAchive() {
  const listeArchive = document.getElementById('ListeArchive');
  listeArchive.innerHTML = '';
  await chargerDonnees();
  const discussions = data.filter(c => c.id !== utilisateurSauvegarde);
  const groupes = datag.filter(g => g.type === 'groupe');
  
  discussions
    .filter(e => e.etat === false)
    .forEach((e) => {
      listeArchive.innerHTML += `
        <div class="flex items-center p-3 hover:bg-wa-panel cursor-pointer transition-colors">
          <div class="w-12 h-12 rounded-full bg-wa-green flex items-center justify-center text-white font-medium mr-3 relative">
            ${e.nom.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            <div class="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-wa-sidebar"></div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center mb-1">
              <h3 class="text-wa-text-primary font-medium truncate">${e.nom}</h3>
              <span class="text-wa-text-secondary text-xs">${e.heure}</span>
            </div>
            <div class="flex justify-between items-center">
              <p class="text-wa-text-secondary text-sm truncate">(${e.telephone})</p>
              <span class="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">Archivé</span>
            </div>
            <p class="text-wa-text-secondary text-xs truncate mt-1">Actus : ${e.actus}</p>
          </div>
          <i class="fas fa-undo text-blue-500 cursor-pointer desarchive-contact ml-3" data-id="${e.id}"></i>
        </div>
      `;
    });

  groupes
    .filter(g => g.etat === false)
    .forEach((g) => {
      listeArchive.innerHTML += `
        <div class="flex items-center p-3 hover:bg-wa-panel cursor-pointer transition-colors">
          <div class="w-12 h-12 rounded-full bg-wa-green flex items-center justify-center text-white font-medium mr-3 relative">
            ${g.nom.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            <div class="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-wa-sidebar"></div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center mb-1">
              <h3 class="text-wa-text-primary font-medium truncate">${g.nom}</h3>
              <span class="text-wa-text-secondary text-xs">${g.date || 'N/A'}</span>
            </div>
            <div class="flex justify-between items-center">
              <p class="text-wa-text-secondary text-sm truncate italic">${g.description}</p>
              <span class="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">Groupe</span>
            </div>
          </div>
          <i class="fas fa-undo text-green-500 cursor-pointer desarchive-groupe ml-3" data-id="${g.id}"></i>
        </div>
      `;
    });

  document.querySelectorAll('.desarchive-contact').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const contact = discussions.find(c => c.id === id);
      if (contact) {
        contact.etat = true;
        
        // Sauvegarder en base de données
        try {
          const response = await fetch(`${urldiscussion}/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(contact)
          });

          if (response.ok) {
            afficheAchive();
            affiche1();
          } else {
            throw new Error('Erreur lors du désarchivage');
          }
        } catch (error) {
          console.error("Erreur lors du désarchivage :", error);
          contact.etat = false;
        }
      }
    });
  });

  document.querySelectorAll('.desarchive-groupe').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const groupe = groupes.find(g => g.id === id);
      if (groupe) {
        groupe.etat = true;
        
        // Sauvegarder en base de données
        try {
          const response = await fetch(`${urlgroupe}/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(groupe)
          });

          if (response.ok) {
            afficheAchive();
            afficheGroupe();
          } else {
            throw new Error('Erreur lors du désarchivage');
          }
        } catch (error) {
          console.error("Erreur lors du désarchivage :", error);
          groupe.etat = false;
        }
      }
    });
  });
}
afficheAchive();
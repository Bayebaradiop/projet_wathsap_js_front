import { data, chargerDonnees, urldiscussion } from "../url_api/environement.js";
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
      messagesContainer.innerHTML += `
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


export async function  afficheAchive() {
  const listeArchive = document.getElementById('ListeArchive');
  listeArchive.innerHTML = '';
    await chargerDonnees();
  const discussions = data.filter(c => c.id !== utilisateurSauvegarde);
  const groupes = data.filter(g => g.type === 'groupe');
  discussions
    .filter(e => e.etat === false)
    .forEach((e) => {
      listeArchive.innerHTML += `
        <div class="">
          <div class="m-3 my-5 w-[95%] h-[10vh] bg-color-gris-clair rounded-lg flex items-center justify-between px-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-color-gris flex justify-center items-center text-white text-xl"> ${e.nom.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}  </div>
              <div class="flex flex-col">
                <h2 class="mx-4 my-1">${e.nom}</h2>
                 <p class="opacity-40 mx-3"> (${e.telephone})</p>

              <p class="opacity-40 mx-3">Actus : ${e.actus}</p>
              </div>
            </div>
            <i class="fas fa-undo text-blue-500 cursor-pointer desarchive-contact" data-id="${e.identifiant}"></i>
          </div>
          <div class="w-full h-px bg-white"></div>
        </div>
      `;
    });



  groupes
    .filter(g => g.etat === false)
    .forEach((g) => {
      listeArchive.innerHTML += `
        <div class="cursor-pointer">
          <div class="m-3 my-5 w-[95%] h-auto bg-color-gris-clair rounded-lg flex items-center justify-between px-4 py-2">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-color-gris flex justify-center items-center text-white text-xl"> ${g.nom.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}  </div>
              <div class="flex flex-col">
                <h2 class="mx-4 my-1">${g.nom}</h2>
                <p class="opacity-40 mx-3 text-sm italic">${g.description}</p>
              </div>
            </div>
            <i class="fas fa-undo text-green-500 cursor-pointer desarchive-groupe" data-id="${g.id}"></i>
          </div>
          <div class="w-full h-px bg-white"></div>
        </div>


        
      `;
    });

  document.querySelectorAll('.desarchive-contact').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const contact = discussions.find(c => c.identifiant === id);
      if (contact) {
        contact.etat = true;
        afficheAchive();
        affiche1();
      }
    });
  });


  document.querySelectorAll('.desarchive-groupe').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const groupe = groupes.find(g => g.id === id);
      if (groupe) {
        groupe.etat = true;
        afficheAchive();
        afficheGroupe();
      }
    });
  });
}
afficheAchive();
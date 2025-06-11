import { data, datag, chargerDonnees,urldiscussion,urlgroupe} from "../url_api/environement.js";
import { pourAfficherEntete } from "./afficheEntete.js";
import { idDiscussionActiveG } from "./afficheGroupe.js";
import { envoyerMessage } from "./envoiMessage.js";
import {listeNo} from "./afficheNosLues.js";
export let utilisateurSauvegarde = localStorage.getItem('utilisateurConnecte');
export let idDiscussionActive = null;console.log("Données des discussions :", data);
console.log("Données des groupes :", datag);

export async function affiche1() {
  await chargerDonnees(); 
  const u = data.find(r => r.id === utilisateurSauvegarde);
  if (!u) {
    console.error("Utilisateur introuvable pour l'ID :", utilisateurSauvegarde);
    return;
  }
  const visible = data.filter(r => u.contact.includes(r.id));
  listeToute.innerHTML = '';
  visible.forEach((d) => {
    listeToute.innerHTML += `
      <div class="flex items-center p-3 hover:bg-wa-panel cursor-pointer transition-colors chat-item" onclick="afficheMessages('${d.id}')">
        <div
          class="w-12 h-12 rounded-full bg-wa-green flex items-center justify-center text-white font-medium mr-3 relative">
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
            <span class="bg-wa-green text-white text-xs rounded-full px-2 py-1 ml-2">2</span>
          </div>
        </div>
      </div>
    `;
  });
}
 export async function afficheMessages(identifiant) {
  try {
    await chargerDonnees();

    const contact = data.find(c => c.id === identifiant);
    if (!contact) {
      console.error("Contact introuvable.");
      return;
    }
    pourAfficherEntete(identifiant,data);
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

    idDiscussionActive = identifiant;
    contact.nonLus=0;
    await fetch(`${urldiscussion}/${contact.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contact)
    });

    listeNo();


  } catch (error) {
    console.error("Erreur lors du chargement des discussions :", error);
  }


}
window.afficheMessages = afficheMessages;

sendButton.addEventListener('click', envoyerMessage ,()=>{
    envoyerMessage(idDiscussionActive, utilisateurSauvegarde,idDiscussionActiveG);
})



const ajouter = document.getElementById('ajouter');
ajouter.addEventListener('click', ajouterContact);
async function ajouterContact() {
  const nom = document.getElementById('nom').value.trim();
  const telephone = document.getElementById('telephone').value.trim();
  const erreurNom=document.querySelector('.erreurNom');
const erreurTelephone=document.querySelector('.erreurTelephone')
const err=document.querySelector('.err');
  if (!nom || !telephone) {
    erreurNom.classList.remove('hidden')
    erreurTelephone.classList.remove('hidden')
    return;
  }
    if (!/^\d+$/.test(telephone)) {
    err.classList.remove('hidden');
    return;
  }
  try {
    await chargerDonnees();

    const contact = {
      nom: nom,
      avatar: "M",
      dernierMessage: "",
      heure: "12:47",
      nonLu: 0,
      etat: true,
      actus: "Mawahibou Nafih",
      telephone: telephone,
      brouillon: "",
      contact: [utilisateurSauvegarde],
      noteVocale: false,
      messages: []
    };

    const response = await fetch(urldiscussion, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contact)
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'ajout du contact.");
    }

    const nouveauContact = await response.json();

    const uc = data.find(c => c.id === utilisateurSauvegarde);
    if (uc) {
      uc.contact.push(nouveauContact.id);

      await fetch(`${urldiscussion}/${uc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(uc)
      });
    }

    document.getElementById('nom').value = '';
    document.getElementById('telephone').value = '';

    affiche1();

  } catch (error) {
    console.error("Erreur lors de l'ajout du contact :", error);
    alert("Une erreur s'est produite lors de l'ajout du contact. Veuillez réessayer.");
  }
}


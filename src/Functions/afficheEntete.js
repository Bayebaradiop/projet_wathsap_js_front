export const tete = document.getElementById('chatHeader');
import { affiche1, utilisateurSauvegarde } from "./discussion.js";
import { afficheGroupe } from "./afficheGroupe.js";
import { data, datag, urldiscussion, urlgroupe } from "../url_api/environement.js";
import { archiverElement } from "./archive.js";
import { getIdDiscussionActive, setIdDiscussionActive } from "./discussion.js";
import { getIdDiscussionActiveG, setIdDiscussionActiveG } from "./afficheGroupe.js";

let globalClickHandler = null;

function isCurrentUserAdmin(groupe) {
  return groupe && groupe.admin && groupe.admin.includes(utilisateurSauvegarde);
}

function isMemberAdmin(groupe, membre) {
  return (membre.role === 'admin') || (groupe.admin && groupe.admin.includes(membre.id));
}

export function pourAfficherEntete(identifiant, sourceData) {
  const recup = sourceData.find(d => d.id === identifiant);

  if (!recup) {
    console.error("Aucun élément trouvé pour l'ID :", identifiant);
    return;
  }

  const isGroupe = sourceData === datag;
  const estAdmin = isGroupe ? isCurrentUserAdmin(recup) : false;

  let membresHTML = "";
  if (isGroupe && recup.membres) {
    membresHTML = `
      <div class="text-xs text-gray-500 italic mt-2">Membres :</div>
      <div class="flex flex-wrap gap-2 mt-2">
    `;
    
    recup.membres.forEach((m, index) => {
      if (m.id !== utilisateurSauvegarde) {
        const isAdmin = isMemberAdmin(recup, m);
                const menuOptions = estAdmin ? `
          <div class="relative">
            <button class="ml-2 text-gray-500 hover:text-gray-700 member-menu-btn" data-member-index="${index}">
              <i class="fas fa-ellipsis-v text-xs"></i>
            </button>
            
            <!-- Menu contextuel -->
            <div class="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[150px] member-menu hidden" data-member-index="${index}">
              ${!isAdmin ? `
                <button class="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm promote-admin" 
                        data-group-id="${identifiant}" data-member-index="${index}">
                  <i class="fas fa-crown mr-2 text-yellow-500"></i>Nommer admin
                </button>
              ` : `
                <button class="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm remove-admin" 
                        data-group-id="${identifiant}" data-member-index="${index}">
                  <i class="fas fa-user-minus mr-2 text-orange-500"></i>Retirer admin
                </button>
              `}
              <button class="w-full text-left px-3 py-2 hover:bg-red-50 text-sm text-red-600 remove-member" 
                      data-group-id="${identifiant}" data-member-index="${index}">
                <i class="fas fa-trash mr-2"></i>Retirer du groupe
              </button>
            </div>
          </div>
        ` : '';

        membresHTML += `
          <div class="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg shadow-sm relative group">
            <span class="${isAdmin ? 'font-bold text-blue-600' : ''}">${m.nom}</span>
            ${isAdmin ? '<i class="fas fa-crown text-yellow-500 text-xs"></i>' : ''}
            ${menuOptions}
          </div>
        `;
      }
    });
  }

  tete.innerHTML = `
    <div class="flex justify-between w-full items-center">
      <div class="flex items-center">
        <div class="text-white bg-red-500 rounded-full w-[40px] h-[40px] flex items-center justify-center">
          ${recup.nom.charAt(0).toUpperCase()}${recup.nom.charAt(1).toUpperCase()}
        </div>
        <div class="flex flex-col mx-3">
          <div class="text-white">${recup.nom}</div>
          ${isGroupe ? `<div class="text-white text-xs">${recup.membres.length} membres</div>` : "En Ligne"}
        </div>
      </div>
      ${membresHTML}

      <div class="flex items-center gap-3">
        <i id="deleteConversationBtn" class="fas fa-trash text-xl text-wa-text-primary hover:text-white cursor-pointer" data-id="${identifiant}" data-type="${isGroupe ? 'groupe' : 'contact'}"></i>
        <i class="fas fa-ellipsis-v text-xl hover:text-wa-text-primary cursor-pointer transition-colors"></i>
        <div class="w-10 h-10 flex items-center justify-center border-2 border-gray-500 rounded-full archive-btn hover:bg-gray-200 transition-colors cursor-pointer"
             data-id="${identifiant}" data-type="${isGroupe ? 'groupe' : 'contact'}">
          <i class="fas fa-archive text-gray-500 text-xl"></i>
        </div>
      </div>
    </div>
  `;

  const archiveBtn = tete.querySelector('.archive-btn');
  if (archiveBtn) {
    archiveBtn.addEventListener('click', () => archiverElement(identifiant, isGroupe));
  }
  
  const deleteBtn = tete.querySelector('#deleteConversationBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => deleteConversation(identifiant, isGroupe));
  }

  if (isGroupe) {
    cleanupEventListeners();
    
    if (estAdmin) {
      setupMemberManagement(identifiant, recup);
    }
  }
}

function cleanupEventListeners() {
  if (globalClickHandler) {
    document.removeEventListener('click', globalClickHandler);
    globalClickHandler = null;
  }
  
  const oldButtons = document.querySelectorAll('.promote-admin, .remove-admin, .remove-member');
  oldButtons.forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
  });
}

function setupMemberManagement(groupeId, groupe) {
  if (!isCurrentUserAdmin(groupe)) {
    return; 
  }
  
  if (globalClickHandler) {
    document.removeEventListener('click', globalClickHandler);
  }
  
  globalClickHandler = function(e) {
    if (e.target.closest('.member-menu-btn')) {
      const btn = e.target.closest('.member-menu-btn');
      const memberIndex = btn.dataset.memberIndex;
      const menu = document.querySelector(`.member-menu[data-member-index="${memberIndex}"]`);
      
      // Masquer tous les autres menus
      document.querySelectorAll('.member-menu').forEach(m => {
        if (m !== menu) m.classList.add('hidden');
      });
      
      // Basculer le menu actuel
      menu.classList.toggle('hidden');
    } else if (!e.target.closest('.member-menu')) {
      // Masquer tous les menus si on clique ailleurs
      document.querySelectorAll('.member-menu').forEach(m => m.classList.add('hidden'));
    }
  };
  
  document.addEventListener('click', globalClickHandler);

  // Gestionnaire pour nommer un admin
  document.querySelectorAll('.promote-admin').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const memberIndex = parseInt(btn.dataset.memberIndex);
      await promoteToAdmin(groupeId, memberIndex);
    });
  });

  // Gestionnaire pour retirer un admin
  document.querySelectorAll('.remove-admin').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const memberIndex = parseInt(btn.dataset.memberIndex);
      await removeFromAdmin(groupeId, memberIndex);
    });
  });

  // Gestionnaire pour retirer un membre
  document.querySelectorAll('.remove-member').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const memberIndex = parseInt(btn.dataset.memberIndex);
      await removeMember(groupeId, memberIndex);
    });
  });
  
  // Gestionnaire pour le bouton ajouter membre
  const addMemberBtn = document.querySelector(`.ajouter-membre[data-id="${groupeId}"]`);
  if (addMemberBtn) {
    addMemberBtn.addEventListener('click', () => {
      // Implémentez ici la logique pour ajouter un membre
      alert("Fonctionnalité d'ajout de membre à implémenter");
    });
  }
}

// Fonction pour rafraîchir les données et l'affichage après modification
async function refreshGroupAndDisplay(groupeId) {
  try {
    // Trouver l'index du groupe dans datag
    const groupeIndex = datag.findIndex(g => g.id === groupeId);
    if (groupeIndex === -1) {
      console.error("Groupe non trouvé dans les données locales");
      return;
    }
    
    // Récupérer les données à jour depuis le serveur
    const response = await fetch(`${urlgroupe}/${groupeId}`);
    if (!response.ok) {
      throw new Error(`Erreur de récupération du groupe: ${response.status}`);
    }
    
    // Mettre à jour l'objet dans le tableau datag
    const updatedGroupe = await response.json();
    datag[groupeIndex] = updatedGroupe;
    
    console.log("Données du groupe mises à jour:", updatedGroupe);
    
    // Rafraîchir l'affichage de l'entête
    pourAfficherEntete(groupeId, datag);
  } catch (error) {
    console.error("Erreur lors du rafraîchissement:", error);
    alert("Erreur lors de la mise à jour de l'affichage");
  }
}

// Fonction pour nommer un membre admin
async function promoteToAdmin(groupeId, memberIndex) {
  try {
    const groupe = datag.find(g => g.id === groupeId);
    if (!groupe || !groupe.membres[memberIndex]) {
      alert('Membre introuvable');
      return;
    }

    // Vérifier que l'utilisateur actuel est admin
    if (!isCurrentUserAdmin(groupe)) {
      alert('Vous n\'avez pas les droits pour effectuer cette action');
      return;
    }

    const membre = groupe.membres[memberIndex];
    const confirmation = confirm(`Voulez-vous nommer "${membre.nom}" comme administrateur ?`);
    
    if (confirmation) {
      // Si le tableau admin n'existe pas, le créer
      if (!groupe.admin) {
        groupe.admin = [];
      }
      
      // Ajouter l'ID du membre aux administrateurs
      if (!groupe.admin.includes(membre.id)) {
        groupe.admin.push(membre.id);
      }
      
      // Mettre à jour le rôle du membre
      groupe.membres[memberIndex].role = 'admin';
      
      // Sauvegarder en base
      const response = await fetch(`${urlgroupe}/${groupeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupe)
      });

      if (response.ok) {
        alert(`${membre.nom} est maintenant administrateur !`);
        // Rafraîchir les données et l'affichage
        await refreshGroupAndDisplay(groupeId);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('Une erreur est survenue');
  }
}

// Fonction pour retirer le statut d'admin
async function removeFromAdmin(groupeId, memberIndex) {
  try {
    const groupe = datag.find(g => g.id === groupeId);
    if (!groupe || !groupe.membres[memberIndex]) {
      alert('Membre introuvable');
      return;
    }

    // Vérifier que l'utilisateur actuel est admin
    if (!isCurrentUserAdmin(groupe)) {
      alert('Vous n\'avez pas les droits pour effectuer cette action');
      return;
    }

    const membre = groupe.membres[memberIndex];
    const confirmation = confirm(`Voulez-vous retirer le statut d'administrateur à "${membre.nom}" ?`);
    
    if (confirmation) {
      // Retirer l'ID du membre des administrateurs
      if (groupe.admin && groupe.admin.includes(membre.id)) {
        groupe.admin = groupe.admin.filter(id => id !== membre.id);
      }
      
      // Mettre à jour le rôle du membre
      groupe.membres[memberIndex].role = 'membre';
      
      // Sauvegarder en base
      const response = await fetch(`${urlgroupe}/${groupeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupe)
      });

      if (response.ok) {
        alert(`${membre.nom} n'est plus administrateur`);
        // Rafraîchir les données et l'affichage
        await refreshGroupAndDisplay(groupeId);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('Une erreur est survenue');
  }
}

// Fonction pour retirer un membre du groupe
async function removeMember(groupeId, memberIndex) {
  try {
    const groupe = datag.find(g => g.id === groupeId);
    if (!groupe || !groupe.membres[memberIndex]) {
      alert('Membre introuvable');
      return;
    }

    // Vérifier que l'utilisateur actuel est admin
    if (!isCurrentUserAdmin(groupe)) {
      alert('Vous n\'avez pas les droits pour effectuer cette action');
      return;
    }

    const membre = groupe.membres[memberIndex];
    const confirmation = confirm(`Voulez-vous retirer "${membre.nom}" du groupe ?`);
    
    if (confirmation) {
      // Retirer également l'ID du membre des administrateurs si nécessaire
      if (groupe.admin && groupe.admin.includes(membre.id)) {
        groupe.admin = groupe.admin.filter(id => id !== membre.id);
      }
      
      // Retirer le membre de la liste des membres
      groupe.membres.splice(memberIndex, 1);
      
      // Sauvegarder en base
      const response = await fetch(`${urlgroupe}/${groupeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupe)
      });

      if (response.ok) {
        alert(`${membre.nom} a été retiré du groupe`);
        // Rafraîchir les données et l'affichage
        await refreshGroupAndDisplay(groupeId);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('Une erreur est survenue');
  }
}

// Fonction pour supprimer une conversation
async function deleteConversation(identifiant, isGroupe) {
  try {
    let confirmation;
    if (isGroupe) {
      confirmation = confirm("Êtes-vous sûr de vouloir supprimer tous les messages de ce groupe ?");
    } else {
      confirmation = confirm("Êtes-vous sûr de vouloir supprimer cette conversation ?");
    }
    
    if (!confirmation) return;
    
    // Afficher un indicateur de chargement
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50';
    loadingIndicator.textContent = 'Suppression en cours...';
    document.body.appendChild(loadingIndicator);
    
    if (isGroupe) {
      // Supprimer les messages du groupe
      const groupe = datag.find(g => g.id === identifiant);
      if (!groupe) {
        throw new Error("Groupe non trouvé");
      }
      
      // Vider les messages du groupe
      groupe.message = [];
      groupe.dernierMessage = "";
      
      // Mettre à jour en base de données
      const response = await fetch(`${urlgroupe}/${identifiant}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupe)
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du groupe");
      }
      
      // Réinitialiser l'ID de discussion active
      setIdDiscussionActiveG(null);
      
      // Mettre à jour l'affichage
      document.getElementById('messagesContainer').innerHTML = '';
      afficheGroupe();
      
    } else {
      // Supprimer la conversation individuelle
      const contact = data.find(c => c.id === identifiant);
      const utilisateur = data.find(c => c.id === utilisateurSauvegarde);
      
      if (!contact || !utilisateur) {
        throw new Error("Contact ou utilisateur non trouvé");
      }
      
      // Filtrer les messages pour ne garder que ceux qui ne sont pas entre ces deux utilisateurs
      contact.messages = contact.messages.filter(msg => 
        !(msg.auteur === utilisateurSauvegarde && msg.destinataire === contact.id) && 
        !(msg.auteur === contact.id && msg.destinataire === utilisateurSauvegarde)
      );
      
      utilisateur.messages = utilisateur.messages.filter(msg => 
        !(msg.auteur === utilisateurSauvegarde && msg.destinataire === contact.id) && 
        !(msg.auteur === contact.id && msg.destinataire === utilisateurSauvegarde)
      );
      
      // Réinitialiser les informations de derniers messages
      contact.dernierMessage = "";
      contact.nonLus = 0;
      
      // Réinitialiser l'ID de discussion active
      setIdDiscussionActive(null);
      
      // Mettre à jour en base de données
      const response1 = await fetch(`${urldiscussion}/${identifiant}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
      });
      
      const response2 = await fetch(`${urldiscussion}/${utilisateurSauvegarde}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(utilisateur)
      });
      
      if (!response1.ok || !response2.ok) {
        throw new Error("Erreur lors de la mise à jour des contacts");
      }
      
      // Mettre à jour l'affichage
      document.getElementById('messagesContainer').innerHTML = '';
      affiche1();
    }
    
    // Mettre à jour l'entête
    tete.innerHTML = `<div class="text-center w-full text-white">Sélectionnez une conversation</div>`;
    
    // Afficher un message de succès
    loadingIndicator.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
    loadingIndicator.textContent = 'Conversation supprimée avec succès !';
    
    // Faire disparaître le message après quelques secondes
    setTimeout(() => {
      loadingIndicator.remove();
    }, 3000);
    
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    
    // Afficher un message d'erreur
    const errorIndicator = document.createElement('div');
    errorIndicator.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
    errorIndicator.textContent = 'Erreur lors de la suppression. Veuillez réessayer.';
    document.body.appendChild(errorIndicator);
    
    // Faire disparaître le message après quelques secondes
    setTimeout(() => {
      errorIndicator.remove();
    }, 3000);
  }
}
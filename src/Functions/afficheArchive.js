import { data, datag, chargerDonnees, urldiscussion, urlgroupe } from "../url_api/environement.js";
import { utilisateurSauvegarde } from "./discussion.js";
import { affiche1 } from "./discussion.js";
import { afficheGroupe } from "./afficheGroupe.js";

export async function afficheAchive() {
  const listeArchive = document.getElementById('ListeArchive');
  listeArchive.innerHTML = '';
  await chargerDonnees();
  
  const discussions = data.filter(c => c.id !== utilisateurSauvegarde);
  const groupes = datag.filter(g => g.type === 'groupe');
  
  // Affichage des contacts archivés
  discussions
    .filter(e => e.etat === false)
    .forEach((e) => {
      listeArchive.innerHTML += `
        <div class="">
          <div class="m-3 my-5 w-[95%] h-[10vh] bg-color-gris-clair rounded-lg flex items-center justify-between px-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-color-gris flex justify-center items-center text-white text-xl"> 
                ${e.nom.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()} 
              </div>
              <div class="flex flex-col">
                <h2 class="mx-4 my-1">${e.nom}</h2>
                <p class="opacity-40 mx-3"> (${e.telephone})</p>
                <p class="opacity-40 mx-3">Actus : ${e.actus}</p>
              </div>
            </div>
            <i class="fas fa-undo text-blue-500 cursor-pointer desarchive-contact" data-id="${e.id}"></i>
          </div>
          <div class="w-full h-px bg-white"></div>
        </div>
      `;
    });

  // Affichage des groupes archivés
  groupes
    .filter(g => g.etat === false)
    .forEach((g) => {
      listeArchive.innerHTML += `
        <div class="cursor-pointer">
          <div class="m-3 my-5 w-[95%] h-auto bg-color-gris-clair rounded-lg flex items-center justify-between px-4 py-2">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-color-gris flex justify-center items-center text-white text-xl"> 
                ${g.nom.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()} 
              </div>
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

  // Gestionnaire pour désarchiver les contacts
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
            throw new Error('Erreur lors de la désarchivage');
          }
        } catch (error) {
          console.error("Erreur lors du désarchivage :", error);
          contact.etat = false; // Restaurer l'état en cas d'erreur
        }
      }
    });
  });

  // Gestionnaire pour désarchiver les groupes
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
            throw new Error('Erreur lors de la désarchivage');
          }
        } catch (error) {
          console.error("Erreur lors du désarchivage :", error);
          groupe.etat = false; // Restaurer l'état en cas d'erreur
        }
      }
    });
  });
}

// Appel automatique


const tete=document.getElementById('chatHeader');

import { data, datag } from "../url_api/environement.js";

export function pourAfficherEntete(identifiant, sourceData) {
  const recup = sourceData.find(d => d.id === identifiant);

  if (!recup) {
    console.error("Aucun élément trouvé pour l'ID :", identifiant);
    return;
  }

  const isGroupe = sourceData === datag;

  let membresHTML = "";
  if (isGroupe && recup.membres) {
    membresHTML = `
      <div class="text-xs text-gray-500 italic mt-2">Membres :</div>
      <div class="flex flex-wrap gap-2 mt-2">
    `;
    recup.membres.forEach(m => {
      membresHTML += `
        <div class="flex h-[20px] items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg shadow-sm">
          <span>${m.nom}</span>
        </div>
      `;
    });
    membresHTML += `</div>`;
  }

  tete.innerHTML = `
    <div class="flex justify-between items-center">
      <div class="flex items-center">
        <div class="text-white bg-red-500 rounded-full w-[40px] h-[40px] flex items-center justify-center">
          ${recup.nom.charAt(0).toUpperCase()}${recup.nom.charAt(1).toUpperCase()}
        </div>
        <div class="flex flex-col mx-3">
          <div class="text-white">${recup.nom}</div>
          ${isGroupe ? `<div class="text-wa-color-icones text-xs">${recup.membres.length} membres</div>` : "En Ligne"}
        </div>
      </div>
      <div class="text-wa-div-icones">
        <i class="fas fa-search text-xl hover:text-white cursor-pointer"></i>
        <i class="fas fa-ellipsis-v text-xl hover:text-wa-text-primary cursor-pointer transition-colors mx-2"></i>
      </div>
    </div>
    ${membresHTML}
  `;
}

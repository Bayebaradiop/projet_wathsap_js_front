
import {data,datag} from "../url_api/environement.js";
const tete=document.getElementById('chatHeader');

export function pourAfficherEntete(identifiant) {
  const id=data.find(d=>d.id===identifiant);

  tete.innerHTML=`

      <div class="flex">
              <div class=" text-white bg-red-500 rounded-full w-[40px] h-[40px] flex items-center justify-center">
                    ${id.avatar}
                </div >


                <div class="flex flex-col  mx-3">
                <div class="text-white">${id.nom}</div>
                <div class="text-wa-color-icones text-xs flex ">
                  En Ligne
                </div>
                </div>
          </div>
          <div class="text-wa-div-icones">
             <i class="fas fa-search text-xl hover:text-white cursor-pointer "></i>
              <i class="fas fa-ellipsis-v text-xl hover:text-wa-text-primary cursor-pointer transition-colors mx-2"></i>
          </div>
  `
}


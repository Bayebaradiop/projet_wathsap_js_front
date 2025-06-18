
import { urldiscussion,urlgroupe,data,datag } from "../url_api/environement.js";
import { afficheGroupe } from "./afficheGroupe.js";
import { affiche1 } from "./discussion.js";
import {tete} from "./afficheEntete.js";
export async function archiverElement(identifiant, isGroupe) {
  try {
    const confirmation = confirm(`Êtes-vous sûr de vouloir archiver ce ${isGroupe ? 'groupe' : 'contact'} ?`);
    if (!confirmation) return;

    const sourceData = isGroupe ? datag : data;
    const element = sourceData.find(d => d.id === identifiant);
    
    if (!element) {
      console.error("Élément introuvable pour l'ID :", identifiant);
      alert("Erreur : élément introuvable.");
      return;
    }

    element.etat = false;
    
    const url = isGroupe 
      ? `${urlgroupe}/${identifiant}` 
      : `${urldiscussion}/${identifiant}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(element)
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    alert(`${isGroupe ? 'Groupe' : 'Contact'} "${element.nom}" archivé avec succès.`);
    
    if (isGroupe) {
      afficheGroupe(); 
    } else {
      affiche1(); 
    }

    tete.innerHTML = '';
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
    }

  } catch (error) {
    console.error("Erreur lors de l'archivage :", error);
    alert("Une erreur s'est produite lors de l'archivage.");
    
    const sourceData = isGroupe ? datag : data;
    const element = sourceData.find(d => d.id === identifiant);
    if (element) {
      element.etat = true; 
    }
  }
  
}
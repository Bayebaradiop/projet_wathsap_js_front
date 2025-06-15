import { chargerDonnees, data } from "../url_api/environement.js";
import { afficheGroupe } from "./afficheGroupe.js";
import { affiche1 } from "./discussion.js";

export async function verifierNouveauxMessages() {
  try {
    console.log("Appel de la fonction verifierNouveauxMessages...");
    await chargerDonnees();
    console.log("Données chargées :", data);
    affiche1();
    afficheGroupe();
  } catch (error) {
    console.error("Erreur lors de la vérification des nouveaux messages :", error);
  }
}
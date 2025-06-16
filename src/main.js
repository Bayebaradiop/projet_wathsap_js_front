import { chargerDonnees, data, datag } from "./url_api/environement.js";
import { changerVue } from "./changementVue/changementVue.js";
import { affiche1, afficherCheckboxMembres } from "./Functions/discussion.js";
import { listeNo } from "./Functions/afficheNosLues.js";
import { afficheGroupe } from "./Functions/afficheGroupe.js";
import { verifierNouveauxMessages } from "./Functions/actualiseNavigateur.js";
import './style.css';
import { deconnexion } from "./Functions/auth.js";
import { gererConnexion } from "./Functions/auth.js";
import { afficheDiffusion} from "./Functions/afficheDiffusion.js";

let utilisateurConnecte = null;
const btnNoLues = document.getElementById('btnNoLues');
export const listeNonLues = document.getElementById('listeNonLues');
const btnFavoris = document.getElementById('btnFavoris');
const ListeDiffusion = document.getElementById('ListeDiffusion');
const ListeGroupes = document.getElementById('ListeGroupes');
const btnGroupes = document.getElementById('btnGroupes');
const pageParametres = document.getElementById('pageParametres');
const btnParametres = document.getElementById('btnParametres');
const recherche = document.querySelector('.recherche');
const btnListe = document.querySelector('.btnListe');
const btnmessage = document.getElementById('btnmessage');
const listeToute = document.getElementById('listeToute');
const btnTous = document.getElementById('btnTous');
const h1 = document.querySelector('.h1');
const h2 = document.querySelector('.h2');
const login = document.querySelector('.login');
const messagesContainer = document.getElementById('messagesContainer');
const sendButton = document.getElementById('sendButton');
const btnLogout = document.getElementById('btnLogout');
const form = document.getElementById('loginForm');
const btnAjouterContact = document.getElementById('btnAjouterContact');
const formGroupe = document.getElementById('formGroupe');
const btnGroupe = document.getElementById('btnGroupe');


btnGroupe.addEventListener('click', async () => {
  changerVue('formGroupe');
  await afficherCheckboxMembres();
});
btnAjouterContact.addEventListener('click', () => changerVue('form'));
btnNoLues.addEventListener('click', () => changerVue('listeNonLues'));
btnmessage.addEventListener('click', () => {
  changerVue('listeNonLues');
  recherche.classList.remove('hidden');
  btnListe.classList.remove('hidden');
});
btnFavoris.addEventListener('click', () => changerVue('ListeDiffusion'));
btnGroupes.addEventListener('click', () => changerVue('ListeGroupes'));
btnParametres.addEventListener('click', () => {
  changerVue('pageParametres');
  recherche.classList.add('hidden');
  btnListe.classList.add('hidden');
});
btnTous.addEventListener('click', () => changerVue('listeToute'));

document.getElementById('btnLogin').addEventListener('click', gererConnexion);
btnLogout.addEventListener('click', deconnexion);



setInterval(() => {
  verifierNouveauxMessages();
}, 10000);


chargerDonnees().then(() => {
  console.log("Données initiales chargées :", data, datag);
  const utilisateurSauvegarde = localStorage.getItem('utilisateurConnecte');
  if (utilisateurSauvegarde) {
    utilisateurConnecte = utilisateurSauvegarde;
    const user = data.find(c => c.id === utilisateurConnecte);
    if (user) {
      document.getElementById('loginForm').style.display = 'none';
      h1.classList.remove('hidden');
      h2.classList.remove('hidden');
      affiche1();
      afficheGroupe();
      listeNo();
      afficheDiffusion();
    } else {
      console.error("Utilisateur introuvable pour l'ID :", utilisateurConnecte);
    }
  }
});
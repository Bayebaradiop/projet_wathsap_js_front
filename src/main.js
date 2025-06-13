import { changerVue } from "./changementVue/changementVue.js";
import { affiche1, utilisateurSauvegarde,afficherCheckboxMembres } from "./Functions/discussion.js";
import { listeNo } from "./Functions/afficheNosLues.js";
import { afficheGroupe } from "./Functions/afficheGroupe.js";
import './style.css';
import { deconnexion } from "./Functions/auth.js";
import { urldiscussion, urlgroupe} from "./url_api/environement.js";
let utilisateurConnecte = null;
let data = [];
const btnNoLues = document.getElementById('btnNoLues');
export const listeNonLues = document.getElementById('listeNonLues');
const btnFavoris = document.getElementById('btnFavoris');
const listeFavoris = document.getElementById('listeFavoris');
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
const form= document.getElementById('loginForm');
const btnAjouterContact = document.getElementById('btnAjouterContact');
const formGroupe= document.getElementById('formGroupe');
const btnGroupe = document.getElementById('btnGroupe');
btnGroupe.addEventListener('click', async () => {
  changerVue('formGroupe');
  await afficherCheckboxMembres();
});
btnAjouterContact.addEventListener('click',()=>changerVue('form')); 
btnNoLues.addEventListener('click', () => changerVue('listeNonLues'));
btnmessage.addEventListener('click', () => {
  changerVue('listeNonLues');
  recherche.classList.remove('hidden');
  btnListe.classList.remove('hidden');
});
btnFavoris.addEventListener('click', () => changerVue('listeFavoris'));
btnGroupes.addEventListener('click', () => changerVue('ListeGroupes'));
btnParametres.addEventListener('click', () => {
  changerVue('pageParametres');
  recherche.classList.add('hidden');
  btnListe.classList.add('hidden');
});
btnTous.addEventListener('click', () => changerVue('listeToute'))

async function chargerDonnees() {
  try {
    const response = await fetch(urldiscussion);
    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des discussions : ${response.status}`);
    }
    data = await response.json();
    console.log("Données chargées :", data);
    let utilisateurSauvegarde = localStorage.getItem('utilisateurConnecte');
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
          // afficherCheckboxMembres();
      } else {
        console.error("Utilisateur introuvable pour l'ID :", utilisateurConnecte);
      }
    }
  } catch (error) {
    console.error("Erreur lors du chargement des données :", error);
    alert("Impossible de charger les données. Veuillez réessayer plus tard.");
  }
}

document.getElementById('btnLogin').addEventListener('click', () => {
  const tel = document.getElementById('loginTelephone').value.trim();
  const error = document.getElementById('loginError');
  error.classList.add('hidden');
  if (!tel) {
    error.textContent = "Veuillez entrer un numéro de téléphone.";
    error.classList.remove('hidden');
    return;
  }
  const user = data.find(c => c.telephone === tel);
  if (user) {
    utilisateurConnecte = user.id;
    localStorage.setItem('utilisateurConnecte', utilisateurConnecte);
    location.reload();
  } else {
    error.textContent = "Numéro de téléphone introuvable.";
    error.classList.remove('hidden');
  }
});

btnLogout.addEventListener('click', deconnexion);
chargerDonnees();
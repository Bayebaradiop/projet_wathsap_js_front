import { changerVue } from "./changementVue/changementVue.js";
import { affiche1, utilisateurSauvegarde } from "./affichage/discussion.js";
import { afficheGroupe } from "./affichage/afficheGroupe.js";
import './style.css';
import { urldiscussion, urlgroupe} from "./url_api/environement.js";
let utilisateurConnecte = null;
let data = [];
// Sélection des éléments DOM
const btnNoLues = document.getElementById('btnNoLues');
const listeNonLues = document.getElementById('listeNonLues');
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


// Gestion des vues


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
btnTous.addEventListener('click', () => changerVue('listeToute'));
async function chargerDonnees() {
  try {
    const response = await fetch(urldiscussion);
    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des discussions : ${response.status}`);
    }
    data = await response.json();
    console.log("Données chargées :", data);
    // Vérifiez si un utilisateur est connecté
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
// Gestion de la déconnexion
btnLogout.addEventListener('click', () => {
  utilisateurConnecte = null;
  localStorage.removeItem('utilisateurConnecte');
  h1.classList.add('hidden');
  h2.classList.add('hidden');
  document.getElementById('loginForm').style.display = 'flex';
  listeToute.innerHTML = ''; 
  ListeGroupes.innerHTML = ''; 
  alert('Vous êtes déconnecté.');
});
chargerDonnees();



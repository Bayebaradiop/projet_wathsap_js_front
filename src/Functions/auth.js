


export function deconnexion() {
  const h1 = document.querySelector('.h1');
  const h2 = document.querySelector('.h2');
  const listeToute = document.getElementById('listeToute');
  const ListeGroupes = document.getElementById('ListeGroupes');

  localStorage.removeItem('utilisateurConnecte');
  h1.classList.add('hidden');
  h2.classList.add('hidden');
  document.getElementById('loginForm').style.display = 'flex';
  listeToute.innerHTML = ''; 
  ListeGroupes.innerHTML = ''; 
  alert('Vous êtes déconnecté.');
}


import { data } from "../url_api/environement.js";

export function gererConnexion() {
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
    const utilisateurConnecte = user.id;
    localStorage.setItem('utilisateurConnecte', utilisateurConnecte);
    location.reload();
  } else {
    error.textContent = "Numéro de téléphone introuvable.";
    error.classList.remove('hidden');
  }
}
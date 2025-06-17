
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



import { data, chargerDonnees } from "../url_api/environement.js";


export async function gererConnexion() {
  const tel = document.getElementById('loginTelephone').value.trim();
  const error = document.getElementById('loginError');
  const loadingIndicator = document.getElementById('loadingIndicator');
  error.classList.add('hidden');

  if (!tel) {
    error.textContent = "Veuillez entrer un numéro de téléphone.";
    error.classList.remove('hidden');
    return;
  }

  try {
    // Afficher l'indicateur de chargement
    loadingIndicator.classList.remove('hidden');

    // Attendre que les données soient chargées
    await chargerDonnees();

    const user = data.find(c => c.telephone === tel);
    if (user) {
      const utilisateurConnecte = user.id;
      localStorage.setItem('utilisateurConnecte', utilisateurConnecte);
      location.reload();
    } else {
      error.textContent = "Numéro de téléphone introuvable.";
      error.classList.remove('hidden');
    }
  } catch (error) {
    console.error("Erreur lors du chargement des données :", error);
    error.textContent = "Erreur lors de la connexion. Veuillez réessayer.";
    error.classList.remove('hidden');
  } finally {
    // Masquer l'indicateur de chargement
    loadingIndicator.classList.add('hidden');
  }
}
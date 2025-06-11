


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
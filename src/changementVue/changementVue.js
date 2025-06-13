
export function changerVue(vue) {
  const sections = {
 
    ListeGroupes: ListeGroupes,
    listeNonLues: listeNonLues,
    listeFavoris: listeFavoris,
    pageParametres: pageParametres,
    listeToute,
    form: form,
    formGroupe: formGroupe,
  };

  Object.values(sections).forEach(section => section.classList.add('hidden'));
  if (sections[vue]) {
    sections[vue].classList.remove('hidden')
  }
}


export function changerVue(vue) {
  const sections = {
 
    ListeGroupes: ListeGroupes,
    listeNonLues: listeNonLues,
    ListeDiffusion: ListeDiffusion,
    pageParametres: pageParametres,
    listeToute,
    form: form,
    formGroupe: formGroupe,
    ListeArchive: ListeArchive
  };

  Object.values(sections).forEach(section => section.classList.add('hidden'));
  if (sections[vue]) {
    sections[vue].classList.remove('hidden')
  }
}

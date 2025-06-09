
export function changerVue(vue) {
  const sections = {
    // liste: liste,
    // form: form,
    // formGroupe: formGroupe,
    // listeGroupe: listeGroupe,
    // listeArchive: listeArchive,
    // listeDiffusion: listeDiffusion,
    ListeGroupes: ListeGroupes,
    listeNonLues: listeNonLues,
    listeFavoris: listeFavoris,
    pageParametres: pageParametres,
    listeToute,
  };

  Object.values(sections).forEach(section => section.classList.add('hidden'));
  if (sections[vue]) {
    sections[vue].classList.remove('hidden')
    // if (vue === "liste"){
    //   //  affiche1();
       
    // }
    // if (vue === "listeGroupe"){
    //   // afficheGroupe();
    // }
    // if (vue === "listeArchive"){
    //   // afficheAchive();
    // } 
    // if (vue === "formGroupe") {
    //   // afficheFormGroupe();
    // }

  }
}

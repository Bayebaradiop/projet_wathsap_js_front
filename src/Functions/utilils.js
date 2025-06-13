
export function estNumeroUnique(telephone, tableauContacts) {
  return tableauContacts.find(contact => contact.telephone === telephone) || null;
}





export function genererNomUnique(baseNom, tableauContacts) {
  let compteur = 0;

    tableauContacts.forEach(contact => {
    const nomActuel = contact.nom;

    if (nomActuel === baseNom) {
      compteur = Math.max(compteur, 1);
    } else if (nomActuel.startsWith(baseNom + '(') && nomActuel.endsWith(')')) {
      const partieEntreParentheses = nomActuel.slice(baseNom.length + 1, -1); 
      const numero = parseInt(partieEntreParentheses);

      if (!isNaN(numero) && numero >= compteur) {
        compteur = numero + 1;
      }
    }
  });

  return compteur === 0 ? baseNom : `${baseNom}(${compteur})`;
}


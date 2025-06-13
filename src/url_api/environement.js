// export const urldiscussion='http://localhost:3000/discussions';
// export const urlgroupe='http://localhost:3000/groupes';

export const urldiscussion = 'https://projet-wathsap-js-backend-1.onrender.com/discussions';
export const urlgroupe = 'https://projet-wathsap-js-backend-1.onrender.com/groupes';

    let data = [];
    let datag = [];

    export async function chargerDonnees() {
      try {
        const discussionsResponse = await fetch(urldiscussion);
        data = await discussionsResponse.json();

        const groupesResponse = await fetch(urlgroupe);
        datag = await groupesResponse.json();

        console.log("Données des discussions chargées :", data);
        console.log("Données des groupes chargées :", datag);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      }
    }

    export { data, datag };
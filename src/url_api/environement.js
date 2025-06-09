export const urldiscussion='http://localhost:3000/discussions'

export const urlgroupe='http://localhost:3000/groupes'


 const a= await fetch(urldiscussion)

export const data=await a.json();
 const g=await fetch(urlgroupe)
export const datag=await g.json();
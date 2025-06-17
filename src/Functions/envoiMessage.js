import { data, datag, urldiscussion, urlgroupe, chargerDonnees } from "../url_api/environement.js";
import { affiche1 } from "./discussion.js";
import { afficheGroupe, messageGroupe } from "./afficheGroupe.js";
import { afficheMessages } from "./discussion.js";
import { utilisateurSauvegarde } from "./discussion.js";
import { sauvegarderBrouillon } from "./messageBrouillon.js";
import { listeNo } from "./afficheNosLues.js";
import { getIdDiscussionActive } from "./discussion.js";
import { getIdDiscussionActiveG } from "./afficheGroupe.js";

export async function envoyerMessage() {
  const input = document.getElementById('messageInput');
  const texte = input.value.trim();
  if (!texte) return;

  const heure = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  try {
    input.removeEventListener('input', sauvegarderBrouillon);

    if (getIdDiscussionActiveG()) {
      const groupe = datag.find(g => g.id === getIdDiscussionActiveG());
      const recup = data.find(d => d.id === utilisateurSauvegarde);
      if (groupe && recup) {
        const message = {
          texte,
          heure,
          nom: recup.nom,
          envoye: true,
          lu: false,
          auteur: utilisateurSauvegarde
        };

        groupe.message.push(message);
        groupe.dernierMessage = texte;
        groupe.date = heure;
        groupe.brouillon = ""; 

        messageGroupe(groupe.id);
        afficheGroupe();

        fetch(`${urlgroupe}/${groupe.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(groupe)
        }).catch(err => console.error("Erreur lors de la mise à jour du groupe :", err));
      }
    } else if (getIdDiscussionActive()) {
      const contact = data.find(c => c.id === getIdDiscussionActive());
      const utilisateurConnecteObj = data.find(c => c.id === utilisateurSauvegarde);

      if (contact && utilisateurConnecteObj) {
        const nouveauMessage = {
          texte,
          heure,
          envoye: true,
          lu: false,
          auteur: utilisateurSauvegarde,
          destinataire: contact.id
        };

        contact.messages.push(nouveauMessage);
        contact.dernierMessage = texte;
        contact.heure = heure;
        contact.brouillon = ""; 

        const messageUtilisateur = {
          texte,
          heure,
          envoye: true,
          lu: true,
          auteur: utilisateurSauvegarde,
          destinataire: contact.id
        };

        utilisateurConnecteObj.messages.push(messageUtilisateur);
        utilisateurConnecteObj.dernierMessage = texte;
        utilisateurConnecteObj.heure = heure;
        utilisateurConnecteObj.nonLus = (utilisateurConnecteObj.nonLus || 0) + 1;

        afficheMessages(contact.id);
        affiche1();
        listeNo();

        fetch(`${urldiscussion}/${contact.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(contact)
        }).catch(err => console.error("Erreur lors de la mise à jour du contact :", err));

        fetch(`${urldiscussion}/${utilisateurConnecteObj.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(utilisateurConnecteObj)
        }).catch(err => console.error("Erreur lors de la mise à jour de l'utilisateur connecté :", err));
      }
    } else {
      console.error("Aucun contact ou groupe actif pour envoyer le message.");
    }

    input.value = '';
  } catch (error) {
    console.error("Erreur lors de l'envoi du message :", error);
    alert("Erreur lors de l'envoi du message. Veuillez réessayer.");
  } finally {
    input.addEventListener('input', sauvegarderBrouillon);
  }
}

document.getElementById('messageInput').addEventListener('input', () => {
  sauvegarderBrouillon();
});



const recordButton = document.getElementById('recordButton');
const sendAudioButton = document.getElementById('sendAudioButton');
const recordingIndicator = document.getElementById('recordingIndicator');

let mediaRecorder;
let audioChunks = [];

// Fonction pour démarrer l'enregistrement
recordButton.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.start();
    recordingIndicator.classList.remove('hidden');
    recordButton.disabled = true;
    sendAudioButton.classList.remove('hidden');

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      recordingIndicator.classList.add('hidden');
      recordButton.disabled = false;
    };
  } catch (error) {
    console.error("Erreur lors de l'accès au microphone :", error);
    alert("Impossible d'accéder au microphone.");
  }
});

// Fonction pour arrêter l'enregistrement et envoyer l'audio
sendAudioButton.addEventListener('click', async () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }

  const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
  const formData = new FormData();
  formData.append('audio', audioBlob);

  try {
    const response = await fetch(`${urldiscussion}/sendAudio`, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      alert("Message vocal envoyé avec succès !");
    } else {
      console.error("Erreur lors de l'envoi du message vocal :", response.statusText);
      alert("Erreur lors de l'envoi du message vocal.");
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi du message vocal :", error);
    alert("Erreur lors de l'envoi du message vocal.");
  } finally {
    audioChunks = []; // Réinitialiser les données audio
    sendAudioButton.classList.add('hidden');
  }
});
import { data, datag, urldiscussion, urlgroupe } from "../url_api/environement.js";
import { affiche1 } from "./discussion.js";
import { afficheGroupe, messageGroupe } from "./afficheGroupe.js";
import { afficheMessages, fixAudioPlayback } from './afficheMessageContact.js';
import { utilisateurSauvegarde } from "./discussion.js";
import { listeNo } from "./afficheNosLues.js";
import { getIdDiscussionActive } from "./discussion.js";
import { getIdDiscussionActiveG } from "./afficheGroupe.js";
import { pourAfficherEntete } from "./afficheEntete.js";

let mediaRecorder;
let audioChunks = [];
let audioStream;
let recordingTimer;

export function initAudioRecording() {
  const recordButton = document.getElementById('recordButton');
  const sendAudioButton = document.getElementById('sendAudioButton');
  const recordingIndicator = document.getElementById('recordingIndicator');
  const cancelRecordingButton = document.getElementById('cancelRecording');

  if (!recordButton || !sendAudioButton || !recordingIndicator) {
    console.error("Certains éléments d'interface pour l'enregistrement audio sont manquants");
    return;
  }

  // Gestionnaire d'événement pour démarrer l'enregistrement
  recordButton.addEventListener('click', startRecording);

  // Gestionnaire d'événement pour annuler l'enregistrement
  if (cancelRecordingButton) {
    cancelRecordingButton.addEventListener('click', cancelRecording);
  }

  // Gestionnaire d'événement pour envoyer l'audio
  sendAudioButton.addEventListener('click', sendAudio);
}

// Fonction pour démarrer l'enregistrement
async function startRecording() {
  const recordButton = document.getElementById('recordButton');
  const sendAudioButton = document.getElementById('sendAudioButton');
  const recordingIndicator = document.getElementById('recordingIndicator');
  const cancelRecordingButton = document.getElementById('cancelRecording');

  try {
    audioChunks = []; // Réinitialiser les chunks audio précédents
    
    // Demander l'accès au microphone
    audioStream = await navigator.mediaDevices.getUserMedia({ 
      audio: true,
      echoCancellation: true,
      noiseSuppression: true
    });
    
    // Configurer le MediaRecorder avec des options audio améliorées
    const options = { mimeType: 'audio/webm;codecs=opus' };
    try {
      mediaRecorder = new MediaRecorder(audioStream, options);
    } catch (e) {
      console.log('MediaRecorder avec options spécifiques non pris en charge, utilisation des options par défaut');
      mediaRecorder = new MediaRecorder(audioStream);
    }

    // Définir un intervalle de collecte de données (toutes les 1000ms)
    mediaRecorder.start(1000);
    console.log("Enregistrement démarré...");
    
    // Afficher l'interface d'enregistrement
    recordingIndicator.classList.remove('hidden');
    recordButton.classList.add('hidden');
    sendAudioButton.classList.remove('hidden');
    if (cancelRecordingButton) cancelRecordingButton.classList.remove('hidden');
    
    // Afficher une minuterie d'enregistrement
    let seconds = 0;
    recordingTimer = setInterval(() => {
      seconds++;
      recordingIndicator.textContent = `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
    }, 1000);

    // Collecter les données audio
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
        console.log("Chunk audio capturé, taille:", event.data.size);
      }
    };

    // Gérer l'arrêt de l'enregistrement
    mediaRecorder.onstop = () => {
      // Arrêter toutes les pistes audio
      audioStream.getTracks().forEach(track => track.stop());
      
      // Arrêter la minuterie
      if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
      }
      
      // Réinitialiser l'interface
      recordingIndicator.classList.add('hidden');
      recordingIndicator.textContent = '';
      recordButton.classList.remove('hidden');
      
      console.log("Enregistrement terminé, chunks:", audioChunks.length);
    };
  } catch (error) {
    console.error("Erreur lors de l'accès au microphone :", error);
    alert("Impossible d'accéder au microphone. Assurez-vous d'avoir autorisé l'accès au microphone dans les paramètres de votre navigateur.");
  }
}

// Fonction pour annuler l'enregistrement
function cancelRecording() {
  const sendAudioButton = document.getElementById('sendAudioButton');
  const cancelRecordingButton = document.getElementById('cancelRecording');
  
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  audioChunks = [];
  sendAudioButton.classList.add('hidden');
  cancelRecordingButton.classList.add('hidden');
  
  if (recordingTimer) {
    clearInterval(recordingTimer);
    recordingTimer = null;
  }
}

// Fonction pour envoyer l'audio enregistré
async function sendAudio() {
  const sendAudioButton = document.getElementById('sendAudioButton');
  const cancelRecordingButton = document.getElementById('cancelRecording');
  
  // Arrêter l'enregistrement s'il est en cours
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    
    // Attendre un court instant pour que les derniers chunks soient collectés
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Masquer les boutons
  sendAudioButton.classList.add('hidden');
  if (cancelRecordingButton) cancelRecordingButton.classList.add('hidden');
  
  console.log("Tentative d'envoi, nombre de chunks:", audioChunks.length);
  
  if (audioChunks.length === 0) {
    alert("Aucun enregistrement disponible. Veuillez réessayer.");
    return;
  }

  // Afficher un indicateur de traitement
  const processingIndicator = document.createElement('div');
  processingIndicator.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50';
  processingIndicator.textContent = 'Traitement du message vocal...';
  document.body.appendChild(processingIndicator);

  try {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    
    if (audioBlob.size < 100) {
      throw new Error("Enregistrement audio trop court ou incomplet");
    }
    
    // Créer une URL pour l'audio
    const audioUrl = URL.createObjectURL(audioBlob);
    const heure = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    console.log("Blob audio créé, taille:", audioBlob.size);
    
    // Envoyer le message audio selon le contexte
    if (getIdDiscussionActiveG()) {
      await envoyerMessageVocalGroupe(audioUrl, audioBlob, heure);
    } else if (getIdDiscussionActive()) {
      await envoyerMessageVocalIndividuel(audioUrl, audioBlob, heure);
    } else {
      alert("Aucune discussion active pour envoyer le message vocal.");
    }
    
    processingIndicator.remove();
  } catch (error) {
    console.error("Erreur lors de l'envoi du message vocal :", error);
    alert("Erreur lors de l'envoi du message vocal : " + error.message);
    processingIndicator.remove();
  } finally {
    audioChunks = []; // Réinitialiser les données audio
  }
}

// Fonction pour envoyer un message vocal dans un groupe
async function envoyerMessageVocalGroupe(audioUrl, audioBlob, heure) {
  const groupe = datag.find(g => g.id === getIdDiscussionActiveG());
  const recup = data.find(d => d.id === utilisateurSauvegarde);
  
  if (!groupe || !recup) {
    console.error("Groupe ou utilisateur introuvable");
    return;
  }
  
  // En production, vous devriez uploader le fichier audio à votre serveur
  // et stocker l'URL renvoyée par le serveur dans le message
  
  // Pour cette démonstration, nous utilisons l'URL locale
  const message = {
    type: 'audio',
    url: audioUrl, // Normalement, ce serait l'URL renvoyée par le serveur
    heure,
    nom: recup.nom,
    envoye: true,
    lu: false,
    auteur: utilisateurSauvegarde
  };
  
  // Ajouter le message au groupe
  if (!groupe.message) groupe.message = [];
  groupe.message.push(message);
  groupe.dernierMessage = "Message vocal";
  groupe.date = heure;
  
  // Mettre à jour l'affichage
  try {
    // Mettre à jour l'affichage des messages
    afficherMessagesGroupe(groupe.id);
    
    // Mettre à jour la liste des groupes
    afficheGroupe();
    
    // Mettre à jour l'entête
    pourAfficherEntete(groupe.id, datag);
    
    // Enregistrer les modifications sur le serveur
    const response = await fetch(`${urlgroupe}/${groupe.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(groupe)
    });
    
    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour du groupe");
    }
    
    // Ajouter cette ligne pour corriger la lecture audio
    fixAudioPlayback();
  } catch (error) {
    console.error("Erreur lors de l'envoi du message vocal :", error);
    alert("Erreur lors de l'envoi du message vocal.");
  }
}

// Fonction pour envoyer un message vocal à un contact individuel
async function envoyerMessageVocalIndividuel(audioUrl, audioBlob, heure) {
  const contact = data.find(c => c.id === getIdDiscussionActive());
  const utilisateurConnecteObj = data.find(c => c.id === utilisateurSauvegarde);
  
  if (!contact || !utilisateurConnecteObj) {
    console.error("Contact ou utilisateur introuvable");
    return;
  }
  
  // En production, vous devriez uploader le fichier audio à votre serveur
  // et stocker l'URL renvoyée par le serveur dans le message
  
  // Pour cette démonstration, nous utilisons l'URL locale
  const nouveauMessage = {
    type: 'audio',
    url: audioUrl, // Normalement, ce serait l'URL renvoyée par le serveur
    heure,
    envoye: true,
    lu: false,
    auteur: utilisateurSauvegarde,
    destinataire: contact.id
  };
  
  // Ajouter le message au contact
  if (!contact.messages) contact.messages = [];
  contact.messages.push(nouveauMessage);
  contact.dernierMessage = "Message vocal";
  contact.heure = heure;
  
  // Ajouter le message à l'utilisateur connecté
  const messageUtilisateur = {
    type: 'audio',
    url: audioUrl, // Normalement, ce serait l'URL renvoyée par le serveur
    heure,
    envoye: true,
    lu: true,
    auteur: utilisateurSauvegarde,
    destinataire: contact.id
  };
  
  if (!utilisateurConnecteObj.messages) utilisateurConnecteObj.messages = [];
  utilisateurConnecteObj.messages.push(messageUtilisateur);
  utilisateurConnecteObj.dernierMessage = "Message vocal";
  utilisateurConnecteObj.heure = heure;
  utilisateurConnecteObj.nonLus = (utilisateurConnecteObj.nonLus || 0) + 1;
  
  // Mettre à jour l'affichage
  try {
    // Mettre à jour l'affichage des messages
    afficheMessages(contact.id);
    
    // Mettre à jour la liste des contacts
    affiche1();
    
    // Mettre à jour la liste des non lus
    listeNo();
    
    // Enregistrer les modifications sur le serveur
    const response1 = await fetch(`${urldiscussion}/${contact.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contact)
    });
    
    const response2 = await fetch(`${urldiscussion}/${utilisateurConnecteObj.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(utilisateurConnecteObj)
    });
    
    if (!response1.ok || !response2.ok) {
      throw new Error("Erreur lors de la mise à jour des contacts");
    }
    
    // Ajouter cette ligne pour corriger la lecture audio
    fixAudioPlayback();
  } catch (error) {
    console.error("Erreur lors de l'envoi du message vocal :", error);
    alert("Erreur lors de l'envoi du message vocal.");
  }
}

// Fonction pour afficher les messages d'un groupe avec les messages vocaux
export function afficherMessagesGroupe(groupeId) {
  const messagesContainer = document.getElementById('messagesContainer');
  if (!messagesContainer) return;
  
  const groupe = datag.find(g => g.id === groupeId);
  if (!groupe || !groupe.message) return;
  
  messagesContainer.innerHTML = '';
  
  groupe.message.forEach((msg) => {
    const isCurrentUser = msg.auteur === utilisateurSauvegarde;
    const alignClass = isCurrentUser ? 'justify-end' : 'justify-start';
    const bgClass = isCurrentUser ? 'bg-wa-message-out text-white' : 'bg-gray-100 text-gray-800';
    
    let messageContent = '';
    
    if (msg.type === 'audio') {
      messageContent = `
        <audio controls class="w-full max-w-[200px]">
          <source src="${msg.url}" type="audio/webm">
          Votre navigateur ne supporte pas la lecture audio.
        </audio>
      `;
    } else {
      messageContent = `<p class="text-sm">${msg.texte}</p>`;
    }
    
    messagesContainer.innerHTML += `
      <div class="flex ${alignClass} mb-2">
        <div class="max-w-xs lg-max-w-md px-4 py-2 rounded-lg ${bgClass}">
          <h2 class="text-sm mb-2">${msg.nom || 'Utilisateur'}</h2>
          ${messageContent}
          <p class="text-xs ${isCurrentUser ? 'text-green-200' : 'text-gray-500'} mt-1">${msg.heure}</p>
        </div>
      </div> 
    `;
  });
  
  // Faire défiler vers le bas pour voir le dernier message
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
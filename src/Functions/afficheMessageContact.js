import { data, chargerDonnees, urldiscussion, datag } from "../url_api/environement.js";
import { pourAfficherEntete } from "./afficheEntete.js";
import { utilisateurSauvegarde } from "./discussion.js";
import { listeNo } from "./afficheNosLues.js";
import { setIdDiscussionActiveG } from "./afficheGroupe.js";
import { setIdDiscussionActive } from "./discussion.js";
import { affiche1 } from "./discussion.js";

export async function afficheMessages(identifiant) {
  try {
    await chargerDonnees();
    const contact = data.find(c => c.id === identifiant);
    if (!contact) {
      console.error("Contact introuvable.");
      return;
    }

    setIdDiscussionActiveG(null);

    pourAfficherEntete(identifiant, data);
    messagesContainer.innerHTML = "";

    const messages = contact.messages.filter(msg =>
      (msg.auteur === utilisateurSauvegarde && msg.destinataire === contact.id) ||
      (msg.auteur === contact.id && msg.destinataire === utilisateurSauvegarde)
    );
    
    messages.forEach(msg => {
      const align = msg.auteur === utilisateurSauvegarde ? "justify-end" : "justify-start";
      const bgColor = msg.auteur === utilisateurSauvegarde ? "bg-wa-green text-white" : "bg-white text-color-text";
      const radius = msg.auteur === utilisateurSauvegarde ? "rounded-tr-full rounded-l-full" : "rounded-tl-full rounded-r-full";
      const isCurrentUser = msg.auteur === utilisateurSauvegarde;

      let check = "";
      if (isCurrentUser) {
        check = msg.lu
          ? `<span class="text-color-noir ml-2">&#10003;&#10003;</span>`
          : `<span class="text-color-noir ml-2">&#10003;</span>`;
      }
      
      let messageContent = '';
      if (msg.type === 'audio') {
        const audioId = `audio-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        messageContent = `
          <div class="flex items-center">
            <div class="audio-message relative w-full max-w-[180px] flex items-center">
              <button class="play-button absolute left-0 w-8 h-8 flex items-center justify-center rounded-full ${isCurrentUser ? 'bg-teal-700' : 'bg-gray-200'} ${isCurrentUser ? 'text-white' : 'text-teal-600'}" 
                     onclick="toggleAudio('${audioId}')">
                <i class="fas fa-play play-icon-${audioId}"></i>
              </button>
              
              <div class="w-full pl-10">
                <div class="waveform h-6 mx-2 ${isCurrentUser ? 'bg-teal-700' : 'bg-gray-200'} opacity-50 rounded-full flex items-center">
                  <div class="waveform-inner flex justify-between items-center w-full px-2">
                    ${Array(8).fill().map(() => `<div class="h-${Math.floor(Math.random() * 4 + 1)} w-0.5 ${isCurrentUser ? 'bg-white' : 'bg-teal-600'} rounded-full"></div>`).join('')}
                  </div>
                </div>
                
                <audio id="${audioId}" class="hidden" controls preload="none">
                  <source src="${msg.url}" type="audio/webm">
                  Votre navigateur ne supporte pas la lecture audio.
                </audio>
                
                <div class="text-xs text-right mt-1 duration-${audioId}">0:00</div>
              </div>
            </div>
          </div>
          <script>
            // Initialiser la durée lorsque les métadonnées sont chargées
            document.getElementById('${audioId}').addEventListener('loadedmetadata', function() {
              const duration = Math.round(this.duration);
              const minutes = Math.floor(duration / 60);
              const seconds = duration % 60;
              document.querySelector('.duration-${audioId}').textContent = minutes + ':' + (seconds < 10 ? '0' + seconds : seconds);
            });
            
            // Charger les métadonnées
            document.getElementById('${audioId}').load();
          </script>
        `;
      } else {
        messageContent = `<div class="text-sm">${msg.texte}</div>`;
      }
      
      messagesContainer.innerHTML += `
        <div class="flex ${align} mb-2">
          <div class="${bgColor} max-w-xs px-3 py-2 ${radius}">
            ${messageContent}
            <div class="text-xs opacity-70 mt-1 text-right">
              ${msg.heure} ${check}
            </div>
          </div>
        </div>
      `;
    });

    if (!window.toggleAudio) {
      window.toggleAudio = function(audioId) {
        const audio = document.getElementById(audioId);
        const playIcon = document.querySelector(`.play-icon-${audioId}`);
        
        // Arrêter tous les autres audios
        document.querySelectorAll('audio').forEach(a => {
          if (a.id !== audioId && !a.paused) {
            a.pause();
            const otherIcon = document.querySelector(`.play-icon-${a.id}`);
            if (otherIcon) otherIcon.className = otherIcon.className.replace('fa-pause', 'fa-play');
          }
        });
        
        if (audio.paused) {
          audio.play()
            .then(() => {
              playIcon.className = playIcon.className.replace('fa-play', 'fa-pause');
              
              // Afficher la progression
              const updateTime = () => {
                if (!audio.paused) {
                  const currentTime = Math.round(audio.currentTime);
                  const minutes = Math.floor(currentTime / 60);
                  const seconds = currentTime % 60;
                  document.querySelector(`.duration-${audioId}`).textContent = 
                    minutes + ':' + (seconds < 10 ? '0' + seconds : seconds);
                  requestAnimationFrame(updateTime);
                }
              };
              updateTime();
            })
            .catch(err => {
              console.error("Erreur lors de la lecture audio:", err);
              alert("Impossible de lire l'audio. Veuillez réessayer.");
            });
        } else {
          audio.pause();
          playIcon.className = playIcon.className.replace('fa-pause', 'fa-play');
        }
        
        // Réinitialiser l'affichage à la fin de la lecture
        audio.onended = function() {
          playIcon.className = playIcon.className.replace('fa-pause', 'fa-play');
          const duration = Math.round(audio.duration);
          const minutes = Math.floor(duration / 60);
          const seconds = duration % 60;
          document.querySelector(`.duration-${audioId}`).textContent = 
            minutes + ':' + (seconds < 10 ? '0' + seconds : seconds);
        };
      };
    }

    // Faire défiler automatiquement vers le dernier message
    if (messagesContainer.lastElementChild) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    const input = document.getElementById('messageInput');
    input.value = contact.brouillon || "";

    setIdDiscussionActive(identifiant); 
    contact.nonLus = 0;
    await fetch(`${urldiscussion}/${contact.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contact)
    });

    listeNo();
    affiche1();

  } catch (error) {
    console.error("Erreur lors du chargement des discussions :", error);
  }
}

// Pour corriger le problème de lecture audio, nous devons également modifier le code d'envoi
// Assurez-vous que cette fonction est appelée depuis le fichier messageVocal.js
export function fixAudioPlayback() {
  // Force le rechargement des audios après envoi
  setTimeout(() => {
    document.querySelectorAll('audio').forEach(audio => {
      // Précharger l'audio
      audio.load();
      
      // S'assurer que l'URL est correctement définie
      const source = audio.querySelector('source');
      if (source && source.src) {
        const originalSrc = source.src;
        source.src = ''; // Réinitialiser
        setTimeout(() => {
          source.src = originalSrc; // Rétablir
          audio.load(); // Recharger
        }, 100);
      }
    });
  }, 500);
}

// Le reste du code reste inchangé
export async function afficheAchive() {
  // ... code existant ...
}
afficheAchive();
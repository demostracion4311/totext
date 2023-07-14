// Obtener referencia al elemento de entrada de archivo y al contenedor de transcripción
const fileInput = document.getElementById('file-input');
const transcriptionContainer = document.getElementById('transcription-container');
const transcriptionDiv = document.getElementById('transcription');
const copyButton = document.getElementById('copy-button');
const messagesDiv = document.getElementById('messages');

// Función para transcribir el audio a texto
async function transcribeAudio(file) {
  logMessage('Iniciando transcripción de audio...');

  const audioData = await readFileAsArrayBuffer(file);
  logMessage('Audio cargado.');

  const audioBuffer = await decodeAudioData(audioData);
  logMessage('Audio decodificado.');

  const result = await transcribeSpeech(audioBuffer);
  logMessage('Transcripción completada.');

  // Mostrar transcripción en la interfaz
  showTranscription(result);
}

// Función para leer el archivo como ArrayBuffer
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (event) => reject(event.target.error);

    reader.readAsArrayBuffer(file);
  });
}

// Función para decodificar el audio como AudioBuffer
async function decodeAudioData(audioData) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  return await audioContext.decodeAudioData(audioData);
}

// Función para transcribir el audio utilizando la API de reconocimiento de voz
function transcribeSpeech(audioBuffer) {
  return new Promise((resolve) => {
    const speechRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    speechRecognition.lang = 'es-ES';
    speechRecognition.continuous = true;
    speechRecognition.interimResults = false;

    let transcription = '';

    speechRecognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcription += event.results[i][0].transcript + ' ';
      }
    };

    speechRecognition.onend = () => resolve(transcription);

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.connect(audioContext.destination);
    audioSource.start();
    speechRecognition.start();
  });
}

// Función para mostrar la transcripción en la interfaz
function showTranscription(transcription) {
  transcriptionDiv.textContent = transcription;
  transcriptionContainer.classList.remove('hidden');
}

// Función para copiar el texto de la transcripción al portapapeles
function copyTranscription() {
  const range = document.createRange();
  range.selectNode(transcriptionDiv);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  document.execCommand('copy');
  window.getSelection().removeAllRanges();
  logMessage('¡Transcripción copiada al portapapeles!');
}

// Función para mostrar mensajes en la interfaz
function logMessage(message) {
  const p = document.createElement('p');
  p.textContent = message;
  messagesDiv.appendChild(p);
}

// Manejar el evento de cambio de archivo
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  transcriptionContainer.classList.add('hidden');
  transcriptionDiv.textContent = '';
  messagesDiv.innerHTML = '';
  transcribeAudio(file);
});

// Manejar el evento de clic en el botón de copiar
copyButton.addEventListener('click', () => {
  copyTranscription();
});

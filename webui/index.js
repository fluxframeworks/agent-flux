import * as msgs from "./messages.js"

const leftPanel = document.getElementById('left-panel');
const rightPanel = document.getElementById('right-panel');
const container = document.querySelector('.container');
const chatInput = document.getElementById('chat-input');
const chatHistory = document.getElementById('chat-history');
const sendButton = document.getElementById('send-button');
const inputSection = document.getElementById('input-section');
const statusSection = document.getElementById('status-section');
const chatsSection = document.getElementById('chats-section');
const scrollbarThumb = document.querySelector('#chat-history::-webkit-scrollbar-thumb');
const progressBar = document.getElementById('progress-bar');
const autoScrollSwitch = document.getElementById('auto-scroll-switch');
const microphoneButton = document.getElementById('microphone-button');


let autoScroll = true;
let context = "";
let microphoneInput = null;
let isProcessingClick = false;


// Initialize the toggle button 
setupSidebarToggle();

function isMobile() {
    return window.innerWidth <= 768;
}

function toggleSidebar() {
    leftPanel.classList.toggle('hidden');
    rightPanel.classList.toggle('expanded');
}

function handleResize() {
    if (isMobile()) {
        leftPanel.classList.add('hidden');
        rightPanel.classList.add('expanded');
    } else {
        leftPanel.classList.remove('hidden');
        rightPanel.classList.remove('expanded');
    }
}

// Run on startup and window resize
window.addEventListener('load', handleResize);
window.addEventListener('resize', handleResize);

function setupSidebarToggle() {
    const leftPanel = document.getElementById('left-panel');
    const rightPanel = document.getElementById('right-panel');
    const toggleSidebarButton = document.getElementById('toggle-sidebar');
    if (toggleSidebarButton) {
        toggleSidebarButton.addEventListener('click', toggleSidebar);
    } else {
        console.error('Toggle sidebar button not found');
        setTimeout(setupSidebarToggle, 100);
    }
}
// Make sure to call this function
document.addEventListener('DOMContentLoaded', setupSidebarToggle);

   // index.js
async function sendMessage() {
    try {
        const message = chatInput.value.trim();
        const inputAD = Alpine.$data(inputSection);
        const attachments = inputAD.attachments;
        const hasAttachments = attachments && attachments.length > 0;

        if (message || hasAttachments) {
            let response;
            const messageId = generateGUID();

            // Only render immediately for attachments
            if (hasAttachments) {
                const attachmentsWithUrls = attachments.map(attachment => ({
                    ...attachment,
                    url: URL.createObjectURL(attachment.file)
                }));
                
                // Only render if there's text content or it's an image-only message
                setMessage(messageId, 'user', '', message, false, {
                    attachments: attachmentsWithUrls
                });

                const formData = new FormData();
                formData.append('text', message);
                formData.append('context', context);
                formData.append('message_id', messageId);

                for (let i = 0; i < attachments.length; i++) {
                    formData.append('attachments', attachments[i].file);
                }

                response = await fetch('/msg', {
                    method: 'POST',
                    body: formData
                });
            } else {
                // For text-only messages, let polling handle the rendering
                const data = { 
                    text: message, 
                    context,
                    message_id: messageId 
                };
                response = await fetch('/msg', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            }

            // Handle response
            const jsonResponse = await response.json();
            if (!jsonResponse) {
                toast("No response returned.", "error");
            } else if (!jsonResponse.ok) {
                if (jsonResponse.message) {
                    toast(jsonResponse.message, "error");
                } else {
                    toast("Undefined error.", "error");
                }
            } else {
                setContext(jsonResponse.context);
            }

            // Clear input and attachments
            chatInput.value = '';
            inputAD.attachments = [];
            inputAD.hasAttachments = false;
            adjustTextareaHeight();
        }
    } catch (e) {
        toast(e.message, "error");
    }
}

chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendButton.addEventListener('click', sendMessage);


// MICROPHONE INPUT


class MicrophoneInput {
    /**
     * Voice Input Handler with Whisper Transcription
     * 
     * Whisper Model Size Configuration:
     * - 'tiny':   Smallest model, fastest, lowest accuracy (~32MB)
     *   - Best for: Quick prototyping, low-resource environments
     *   - Pros: Very fast, low memory usage
     *   - Cons: Lowest transcription accuracy
     * 
     * - 'base':   Small model, good balance of speed and accuracy (~74MB)
     *   - Best for: General-purpose voice input
     *   - Pros: Reasonable accuracy, moderate resource usage
     *   - Cons: Less accurate than larger models
     * 
     * - 'small':  Medium-sized model, better accuracy (~244MB)
     *   - Best for: More precise transcription needs
     *   - Pros: Improved accuracy over base model
     *   - Cons: Slower, more memory-intensive
     * 
     * - 'medium': Large model with high accuracy (~769MB)
     *   - Best for: Professional transcription, multi-language support
     *   - Pros: Very high accuracy
     *   - Cons: Significant computational resources required
     * 
     * - 'large':  Largest model, highest accuracy (~1.5GB)
     *   - Best for: Professional, multi-language transcription
     *   - Pros: Highest possible accuracy
     *   - Cons: Slowest, most resource-intensive
     * 
     * Recommended Default: 'base' for most web applications
     */
    constructor(updateCallback, options = {}) {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.updateCallback = updateCallback;
        this.isFinalizing = false;
        this.messageSent = false; // move messageSent into class

        // New properties for silence detection
        this.audioContext = null;
        this.mediaStreamSource = null;
        this.analyserNode = null;
        this.silenceTimer = null;
        this.silenceThreshold = options.silenceThreshold || 0.01; // Adjust as needed
        this.silenceDuration = options.silenceDuration || 2000;   // Duration in milliseconds

        this.options = {
            modelSize: 'base',
            language: null,
            chunkDuration: 3000,
            ...options
        };
    }

    async initialize() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    channelCount: 1
                }
            });

            // Configure MediaRecorder
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            // Handle audio data availability
            this.mediaRecorder.ondataavailable = async (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                    // await this.processAudioChunk(event.data);
                }
            };

            // Handle recording stop
            this.mediaRecorder.onstop = async () => {
                await this.finalizeRecording();
            };

            // Set up AudioContext and AnalyserNode for silence detection
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
            this.analyserNode = this.audioContext.createAnalyser();
            this.analyserNode.minDecibels = -90;
            this.analyserNode.maxDecibels = -10;
            this.analyserNode.smoothingTimeConstant = 0.85;

            this.mediaStreamSource.connect(this.analyserNode);
        } catch (error) {
            console.error('Microphone initialization error:', error);
            toast('Failed to access microphone. Please check permissions.', 'error');
        }
    }

    startSilenceDetection() {
        const dataArray = new Uint8Array(this.analyserNode.fftSize);
        const checkSilence = () => {
            this.analyserNode.getByteTimeDomainData(dataArray);

            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                const amplitude = (dataArray[i] - 128) / 128;
                sum += amplitude * amplitude;
            }
            const rms = Math.sqrt(sum / dataArray.length);

            if (rms < this.silenceThreshold) {
                if (!this.silenceTimer) {
                    this.silenceTimer = setTimeout(() => {
                        if (this.isRecording) {
                            console.log('Silence detected. Stopping recording.');
                            this.stopRecording();
                            microphoneButton.classList.remove('recording');
                            microphoneButton.classList.remove('mic-pulse');
                        }
                    }, this.silenceDuration);
                }
            } else {
                if (this.silenceTimer) {
                    clearTimeout(this.silenceTimer);
                    this.silenceTimer = null;
                }
            }

            if (this.isRecording) {
                requestAnimationFrame(checkSilence);
            }
        };

        if (this.isRecording) {
            requestAnimationFrame(checkSilence);
        }
    }

    startRecording() {
        if (this.mediaRecorder && this.audioContext) {
            this.isRecording = true;
            this.audioChunks = [];
            this.messageSent = false;
            this.mediaRecorder.start(this.options.chunkDuration);
            this.audioContext.resume();
            this.startSilenceDetection();
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.isRecording = false;
            if (!this.isFinalizing) {
                this.isFinalizing = true;
                this.mediaRecorder.stop();
                this.audioContext.suspend();
                if (this.silenceTimer) {
                    clearTimeout(this.silenceTimer);
                    this.silenceTimer = null;
                }
            }
        }
    }


    async finalizeRecording() {
        if (this.isFinalizing) {
            this.isFinalizing = false;
    
            if (this.audioChunks.length > 0) {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                this.audioChunks = [];  // Clear for next recording
    
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64Data = reader.result.split(',')[1];
    
                    try {
                        const response = await fetch('/transcribe', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                audio_data: base64Data,
                                model_size: this.options.modelSize,
                                language: this.options.language,
                                is_final: true
                            })
                        });
    
                        const result = await response.json();
    
                        if (result.text) {
                            console.log('Final transcription received:', result.text);
                            await this.updateCallback(result.text, true);
                        } else {
                            console.warn('Final transcription returned empty text.');
                        }
                    } catch (transcribeError) {
                        console.error('Final transcription error:', transcribeError);
                        toast('Final transcription failed.', 'error');
                    } finally {
                        // Reset the microphone button state
                        microphoneButton.classList.remove('recording');
                        microphoneButton.classList.remove('mic-pulse');
                        microphoneButton.style.backgroundColor = '';
                    }
                };
                reader.readAsDataURL(audioBlob);
            }
        }
    }
}

export default MicrophoneInput;


async function initializeMicrophoneInput() {
    console.log('Initializing microphone input');

    microphoneInput = new MicrophoneInput(
        async (text, isFinal) => {
            if (isFinal) {
                console.log('Final transcription callback received:', text);
                chatInput.value = text;
                adjustTextareaHeight();

                if (!microphoneInput.messageSent) {
                    microphoneInput.messageSent = true;
                    console.log('Sending message');
                    await sendMessage();

                    // Clear the chat input after sending the message
                    chatInput.value = '';
                    adjustTextareaHeight();
                }
            }
        },
        {
            modelSize: 'base',
            language: 'en',
            silenceThreshold: 0.07, // Adjust as needed
            silenceDuration: 2000,  // Adjust as needed
            onError: (error) => {
                console.error('Microphone input error:', error);
                toast('Microphone error: ' + error.message, 'error');
                // Reset recording state
                if (microphoneButton.classList.contains('recording')) {
                    microphoneButton.classList.remove('recording');
                }
            }
        }
    );

    await microphoneInput.initialize();
}

function updateChatInput(text) {
    console.log('updateChatInput called with:', text);
    
    // Ensure the text is not undefined or null
    if (!text) {
        console.warn('Received empty transcription text');
        return;
    }
    
    // Append text with proper spacing
    const currentValue = chatInput.value;
    const needsSpace = currentValue.length > 0 && !currentValue.endsWith(' ');
    chatInput.value = currentValue + (needsSpace ? ' ' : '') + text + ' ';
    
    // Adjust height and trigger input event
    adjustTextareaHeight();
    chatInput.dispatchEvent(new Event('input'));
    
    console.log('Updated chat input value:', chatInput.value);
}


function toggleRecording() {
    console.log('toggleRecording called, isRecording:', microphoneInput.isRecording);
    
    if (microphoneInput.isRecording) {
        microphoneInput.stopRecording();
        microphoneButton.classList.remove('recording');
        // Add pulsing animation class
        microphoneButton.classList.remove('mic-pulse');
    } else {
        microphoneInput.startRecording();
        microphoneButton.classList.add('recording');
        // Add pulsing animation class
        microphoneButton.classList.add('mic-pulse');
    }
    
    // Add visual feedback
    microphoneButton.style.backgroundColor = microphoneInput.isRecording ? '#ff4444' : '';
    console.log('New recording state:', microphoneInput.isRecording);
}

// Some error handling for microphone input
async function requestMicrophonePermission() {
    try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        return true;
    } catch (err) {
        console.error('Error accessing microphone:', err);
        toast('Microphone access denied. Please enable microphone access in your browser settings.', 'error');
        return false;
    }
}
// microphoneButton click event listener modifier
microphoneButton.addEventListener('click', async () => {
    console.log('Microphone button clicked');
    if (isProcessingClick) {
        console.log('Click already being processed, ignoring');
        return;
    }
    isProcessingClick = true;

    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) return;

    if (!microphoneInput) {
        await initializeMicrophoneInput();
    }

    await toggleRecording();

    setTimeout(() => {
        isProcessingClick = false;
    }, 300); // Add a 300ms delay before allowing another click
});

function updateUserTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;

    // Format the time
    const timeString = `${formattedHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;

    // Format the date
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const dateString = now.toLocaleDateString(undefined, options);

    // Update the HTML
    const userTimeElement = document.getElementById('time-date');
    userTimeElement.innerHTML = `${timeString}<br><span id="user-date">${dateString}</span>`;
}

updateUserTime();
setInterval(updateUserTime, 1000);

function setMessage(id, type, heading, content, temp, kvps = null) {
    // Search for the existing message container by id
    let messageContainer = document.getElementById(`message-${id}`);

    if (messageContainer) {
        // Clear the existing container's content if found
        messageContainer.innerHTML = '';
    } else {
        // Create a new container if not found
        const sender = type === 'user' ? 'user' : 'ai';
        messageContainer = document.createElement('div');
        messageContainer.id = `message-${id}`;
        messageContainer.classList.add('message-container', `${sender}-container`);
        if (temp) messageContainer.classList.add("message-temp")

    }

    const handler = msgs.getHandler(type);
    handler(messageContainer, id, type, heading, content, temp, kvps);

    // If the container was found, it was already in the DOM, no need to append again
    if (!document.getElementById(`message-${id}`)) {
        chatHistory.appendChild(messageContainer);
    }

    if (autoScroll) chatHistory.scrollTop = chatHistory.scrollHeight;
}


async function handleFileUpload(event) {
    const files = event.target.files;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('file', files[i]);
    }

    const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
    });

    const data = await response.json();
    if (!data.ok) {
        toast(data.message, "error");
    } else {
        toast("Files uploaded: " + data.filenames.join(", "), "success");
    }
}


window.loadKnowledge = async function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.pdf,.csv,.html,.json,.md';
    input.multiple = true;

    input.onchange = async () => {
        const formData = new FormData();
        for (let file of input.files) {
            formData.append('files[]', file);
        }

        const response = await fetch('/import_knowledge', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        if (!data.ok) {
            toast(data.message, "error");
        } else {
            toast("Knowledge files imported: " + data.filenames.join(", "), "success");
        }
    };

    input.click();
}


const workDirModalProxy = {
    isOpen: false,
    files: [],

    async openModal() { // Define openModal
        // Inside openModal, call the existing open method:
        await this.open(); // Or directly include the fetching logic here
    },

    async open() {
        const response = await sendJsonData('/work_dir');
        if (response.ok) {
            this.files = response.files;
            this.isOpen = true;
        } else {
            toast(response.message, 'error');
        }
    },

    close() {
        this.isOpen = false;
    }
};

// Make the proxy available globally
window.workDirModalProxy = workDirModalProxy; 

// Ensure correct setup for Alpine.js x-data.
window.workDirModal = function() {
    return workDirModalProxy; // Returns the proxy object for the Work Dir modal
}


document.addEventListener('alpine:init', () => {
    // Make workDirModalProxy available as an Alpine component/store
    Alpine.data('workDirModal', workDirModal); 
});


function adjustTextareaHeight() {
    chatInput.style.height = 'auto';
    chatInput.style.height = (chatInput.scrollHeight) + 'px';
}

window.sendJsonData = async function (url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const jsonResponse = await response.json();
    return jsonResponse;
}

function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

let lastLogVersion = 0;
let lastLogGuid = ""

async function poll() {
    let updated = false
    try {
        const response = await sendJsonData("/poll", { log_from: lastLogVersion, context });
        //console.log(response)

        if (response.ok) {

            if (!context) setContext(response.context)
            if (response.context != context) return //skip late polls after context change

            if (lastLogGuid != response.log_guid) {
                chatHistory.innerHTML = ""
                lastLogVersion = 0
            }

            if (lastLogVersion != response.log_version) {
                updated = true
                for (const log of response.logs) {
                    setMessage(log.no, log.type, log.heading, log.content, log.temp, log.kvps);
                }
            }

            updateProgress(response.log_progress)

            //set ui model vars from backend
            const inputAD = Alpine.$data(inputSection);
            inputAD.paused = response.paused;
            const statusAD = Alpine.$data(statusSection);
            statusAD.connected = response.ok;
            const chatsAD = Alpine.$data(chatsSection);
            chatsAD.contexts = response.contexts;

            lastLogVersion = response.log_version;
            lastLogGuid = response.log_guid;


        }

    } catch (error) {
        console.error('Error:', error);
        const statusAD = Alpine.$data(statusSection);
        statusAD.connected = false;
    }

    return updated
}

function updateProgress(progress) {
    if (!progress) progress = "Waiting for input"

    if (progressBar.innerHTML != progress) {
        progressBar.innerHTML = progress
    }
}

function updatePauseButtonState(isPaused) {
    const pauseButton = document.getElementById('pause-button');
    const unpauseButton = document.getElementById('unpause-button');

    if (isPaused) {
        pauseButton.style.display = 'none';
        unpauseButton.style.display = 'flex';
    } else {
        pauseButton.style.display = 'flex';
        unpauseButton.style.display = 'none';
    }
}

window.pauseAgent = async function (paused) {
    const resp = await sendJsonData("/pause", { paused: paused, context });
    updatePauseButtonState(paused);
}

window.resetChat = async function () {
    const resp = await sendJsonData("/reset", { context });
    updateAfterScroll()
}

window.newChat = async function () {
    setContext(generateGUID());
    updateAfterScroll()
}

window.killChat = async function (id) {


    const chatsAD = Alpine.$data(chatsSection);
    let found, other
    for (let i = 0; i < chatsAD.contexts.length; i++) {
        if (chatsAD.contexts[i].id == id) {
            found = true
        } else {
            other = chatsAD.contexts[i]
        }
        if (found && other) break
    }

    if (context == id && found) {
        if (other) setContext(other.id)
        else setContext(generateGUID())
    }

    if (found) sendJsonData("/remove", { context: id });

    updateAfterScroll()
}

window.selectChat = async function (id) {
    setContext(id)
    updateAfterScroll()
}

const setContext = function (id) {
    if (id == context) return
    context = id
    lastLogGuid = ""
    lastLogVersion = 0
    const chatsAD = Alpine.$data(chatsSection);
    chatsAD.selected = id
}

window.toggleAutoScroll = async function (_autoScroll) {
    autoScroll = _autoScroll;
}

window.toggleJson = async function (showJson) {
    // add display:none to .msg-json class definition
    toggleCssProperty('.msg-json', 'display', showJson ? 'block' : 'none');
}

window.toggleThoughts = async function (showThoughts) {
    // add display:none to .msg-json class definition
    toggleCssProperty('.msg-thoughts', 'display', showThoughts ? undefined : 'none');
}

window.toggleUtils = async function (showUtils) {
    // add display:none to .msg-json class definition
    toggleCssProperty('.message-util', 'display', showUtils ? undefined : 'none');
    // toggleCssProperty('.message-util .msg-kvps', 'display', showUtils ? undefined : 'none');
    // toggleCssProperty('.message-util .msg-content', 'display', showUtils ? undefined : 'none');
}

window.toggleDarkMode = function (isDark) {
    if (isDark) {
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.add('light-mode');
    }
    console.log("Dark mode:", isDark);
    localStorage.setItem('darkMode', isDark);
};

// Modify this part
document.addEventListener('DOMContentLoaded', () => {
    const isDarkMode = localStorage.getItem('darkMode') !== 'false';
    toggleDarkMode(isDarkMode);
});

window.toggleDarkMode = function (isDark) {
    if (isDark) {
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.add('light-mode');
    }
    console.log("Dark mode:", isDark);
    localStorage.setItem('darkMode', isDark);
};

function toggleCssProperty(selector, property, value) {
    // Get the stylesheet that contains the class
    const styleSheets = document.styleSheets;

    // Iterate through all stylesheets to find the class
    for (let i = 0; i < styleSheets.length; i++) {
        const styleSheet = styleSheets[i];
        const rules = styleSheet.cssRules || styleSheet.rules;

        for (let j = 0; j < rules.length; j++) {
            const rule = rules[j];
            if (rule.selectorText == selector) {
                // Check if the property is already applied
                if (value === undefined) {
                    rule.style.removeProperty(property);
                } else {
                    rule.style.setProperty(property, value);
                }
                return;
            }
        }
    }
}

window.loadChats = async function () {
    try {
        const fileContents = await readJsonFiles();
        const response = await sendJsonData("/loadChats", { chats: fileContents });

        if (!response) {
            toast("No response returned.", "error")
        } else if (!response.ok) {
            if (response.message) {
                toast(response.message, "error")
            } else {
                toast("Undefined error.", "error")
            }
        } else {
            setContext(response.ctxids[0])
            toast("Chats loaded.", "success")
        }

    } catch (e) {
        toast(e.message, "error")
    }
}

window.saveChat = async function () {
    try {
        const response = await sendJsonData("/exportChat", { ctxid: context });

        if (!response) {
            toast("No response returned.", "error")
        } else if (!response.ok) {
            if (response.message) {
                toast(response.message, "error")
            } else {
                toast("Undefined error.", "error")
            }
        } else {
            downloadFile(response.ctxid + ".json", response.content)
            toast("Chat file downloaded.", "success")
        }

    } catch (e) {
        toast(e.message, "error")
    }
}

function downloadFile(filename, content) {
    // Create a Blob with the content to save
    const blob = new Blob([content], { type: 'application/json' });
    
    // Create a link element
    const link = document.createElement('a');
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    link.href = url;
    
    // Set the file name for download
    link.download = filename;
    
    // Programmatically click the link to trigger the download
    link.click();
    
    // Clean up by revoking the object URL
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 0);
}


function readJsonFiles() {
    return new Promise((resolve, reject) => {
        // Create an input element of type 'file'
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json'; // Only accept JSON files
        input.multiple = true;  // Allow multiple file selection

        // Trigger the file dialog
        input.click();

        // When files are selected
        input.onchange = async () => {
            const files = input.files;
            if (!files.length) {
                resolve([]); // Return an empty array if no files are selected
                return;
            }

            // Read each file as a string and store in an array
            const filePromises = Array.from(files).map(file => {
                return new Promise((fileResolve, fileReject) => {
                    const reader = new FileReader();
                    reader.onload = () => fileResolve(reader.result);
                    reader.onerror = fileReject;
                    reader.readAsText(file);
                });
            });

            try {
                const fileContents = await Promise.all(filePromises);
                resolve(fileContents);
            } catch (error) {
                reject(error); // In case of any file reading error
            }
        };
    });
}


function toast(text, type = 'info') {
    const toast = document.getElementById('toast');

    // Update the toast content and type
    toast.querySelector('#toast .toast__message').textContent = text;
    toast.className = `toast toast--${type}`;
    toast.style.display = 'flex';

    // Add the close button event listener
    const closeButton = toast.querySelector('#toast .toast__close');
    closeButton.onclick = () => {
        toast.style.display = 'none';
        clearTimeout(toast.timeoutId);
    };

    // Add the copy button event listener
    const copyButton = toast.querySelector('#toast .toast__copy');
    copyButton.onclick = () => {
        navigator.clipboard.writeText(text);
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
            copyButton.textContent = 'Copy';
        }, 2000);
    };

    // Clear any existing timeout
    clearTimeout(toast.timeoutId);

    // Automatically close the toast after 5 seconds
    toast.timeoutId = setTimeout(() => {
        toast.style.display = 'none';
    }, 10000);
}

function scrollChanged(isAtBottom) {
    const inputAS = Alpine.$data(autoScrollSwitch);
    inputAS.autoScroll = isAtBottom
    // autoScrollSwitch.checked = isAtBottom
}

function updateAfterScroll() {
    // const toleranceEm = 1; // Tolerance in em units
    // const tolerancePx = toleranceEm * parseFloat(getComputedStyle(document.documentElement).fontSize); // Convert em to pixels
    const tolerancePx = 50;
    const chatHistory = document.getElementById('chat-history');
    const isAtBottom = (chatHistory.scrollHeight - chatHistory.scrollTop) <= (chatHistory.clientHeight + tolerancePx);

    scrollChanged(isAtBottom);
}

chatHistory.addEventListener('scroll', updateAfterScroll);

chatInput.addEventListener('input', adjustTextareaHeight);

// setInterval(poll, 250);

async function startPolling() {
    const shortInterval = 25
    const longInterval = 250
    const shortIntervalPeriod = 100
    let shortIntervalCount = 0

    async function _doPoll() {
        let nextInterval = longInterval

        try {
            const result = await poll();
            if (result) shortIntervalCount = shortIntervalPeriod; // Reset the counter when the result is true
            if (shortIntervalCount > 0) shortIntervalCount--; // Decrease the counter on each call
            nextInterval = shortIntervalCount > 0 ? shortInterval : longInterval;
        } catch (error) {
            console.error('Error:', error);
        }

        // Call the function again after the selected interval
        setTimeout(_doPoll.bind(this), nextInterval);
    }

    _doPoll();
}

document.addEventListener("DOMContentLoaded", startPolling);
// १. मोफत रिअल-टाईम क्लाऊड सर्व्हरशी कनेक्ट व्हा
const client = mqtt.connect('wss://broker.emqx.io:8084/mqtt');
const topic = 'chatbox/room/public_2026';

// २. UI घटक मिळवणे
const messagesContainer = document.getElementById('messages');
const chatForm = document.getElementById('chat-form');
const messageText = document.getElementById('message-text');
const usernameInput = document.getElementById('username');

// युझरचे नाव सेव्ह ठेवणे
let myName = localStorage.getItem('chatbox_user') || 'मित्र_' + Math.floor(1000 + Math.random() * 9000);
usernameInput.value = myName;

usernameInput.addEventListener('change', () => {
  if (usernameInput.value.trim() !== '') {
    myName = usernameInput.value.trim();
    localStorage.setItem('chatbox_user', myName);
  }
});

// ३. कनेक्ट झाल्यावर चॅट रूम जॉईन करा
client.on('connect', () => {
  console.log('Connected to Chatbox server!');
  client.subscribe(topic);
});

// ४. दुसरा कोणी मेसेज पाठवला की तो स्क्रीनवर दाखवणे
client.on('message', (t, payload) => {
  try {
    const data = JSON.parse(payload.toString());
    displayMessage(data);
  } catch (e) {
    console.error('Invalid msg format', e);
  }
});

// ५. मेसेज स्क्रीनवर जोडण्याचे फंक्शन
function displayMessage(data) {
  const isMe = data.sender === myName;
  const bubble = document.createElement('div');
  bubble.className = `msg-bubble ${isMe ? 'msg-me' : 'msg-other'}`;
  
  bubble.innerHTML = `
    <div class="user-name">${isMe ? 'तुम्ही' : data.sender}</div>
    <div class="text">${data.text}</div>
  `;
  
  messagesContainer.appendChild(bubble);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ६. 'पाठवा' बटनावर क्लिक केल्यावर मेसेज पाठवणे
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = messageText.value.trim();
  if (!text) return;

  const payload = {
    sender: myName,
    text: text,
    time: Date.now()
  };

  // मेसेज सर्व्हरवर पाठवा
  client.publish(topic, JSON.stringify(payload));
  messageText.value = '';
});

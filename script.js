document.addEventListener('DOMContentLoaded', function() {
    // Toggle Dark Mode
    const toggleDarkMode = document.getElementById('toggleDarkMode');
    toggleDarkMode.addEventListener('change', function() {
        document.body.classList.toggle('dark-mode', this.checked);
        document.querySelector('header').classList.toggle('dark-mode', this.checked);
        document.querySelectorAll('nav ul li a').forEach(link => {
            link.classList.toggle('dark-mode', this.checked);
        });
    });

    // Show the Safar Buddy guide profiles based on the location input
    window.toggleSafarBuddy = function() {
        const locationInput = document.getElementById('locationInput').value.toLowerCase();
        const guideProfiles = document.getElementById('guide-profiles');
        const victoriaGuide = document.getElementById('victoriaGuide');

        if (locationInput.includes('victoria memorial')) {
            victoriaGuide.style.display = 'block';
            guideProfiles.style.display = 'block';
        } else {
            victoriaGuide.style.display = 'none';
            guideProfiles.style.display = 'block';
        }
    };

    // Show Places based on user search input
    window.searchPlaces = function() {
        const searchInput = document.getElementById('placesSearchInput').value.toLowerCase();
        const categories = document.querySelectorAll('.category-item');
        
        categories.forEach(category => {
            const sectionId = category.getAttribute('onclick').split("'")[1];
            const section = document.getElementById(sectionId);
            if (searchInput) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    };

    // Search Places by Location
    window.searchPlacesByLocation = function() {
        const locationInput = document.getElementById('locationPlacesInput').value.toLowerCase();
        const sections = document.querySelectorAll('.place-section');

        sections.forEach(section => {
            const places = section.querySelectorAll('.place');
            let found = false;

            places.forEach(place => {
                const placeText = place.textContent.toLowerCase();
                if (placeText.includes(locationInput)) {
                    place.style.display = 'flex';
                    found = true;
                } else {
                    place.style.display = 'none';
                }
            });

            if (found) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    };

    // Show section based on category click
    window.showSection = function(sectionId) {
        const sections = document.querySelectorAll('.place-section');
        sections.forEach(section => {
            section.style.display = 'none';
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
    };
});
document.querySelector('a[href="#Sign In"]').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default anchor behavior
    document.getElementById('sign-in-form').style.display = 'flex';
});

function closeForm() {
    document.getElementById('sign-in-form').style.display = 'none';
}
// Toggle the chatbot visibility
function toggleChatbot() {
    const chatbot = document.getElementById('chatbot');
    chatbot.style.display = chatbot.style.display === 'none' || chatbot.style.display === '' ? 'flex' : 'none';
}

// Handle sending a message
function sendMessage() {
    const userInput = document.getElementById('userInput');
    const chatlog = document.getElementById('chatlog');

    const userMessage = userInput.value;
    if (userMessage.trim() === '') return;

    // Add user message to chatlog
    const userDiv = document.createElement('div');
    userDiv.className = 'user-message';
    userDiv.textContent = userMessage;
    chatlog.appendChild(userDiv);

    // Clear user input
    userInput.value = '';

    // Simulate bot response
    const botResponse = getBotResponse(userMessage);
    const botDiv = document.createElement('div');
    botDiv.className = 'bot-message';
    botDiv.textContent = botResponse;
    chatlog.appendChild(botDiv);

    // Scroll to the bottom of the chatlog
    chatlog.scrollTop = chatlog.scrollHeight;
}

// Get bot response based on user input
function getBotResponse(userMessage) {
    const lowerCaseMessage = userMessage.toLowerCase();
    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
        return 'Hello! How can I help you today?';
    } else if (lowerCaseMessage.includes('transport') || lowerCaseMessage.includes('fare')) {
        return 'You can find transport fare information on the Transport Fares section.';
    } else if (lowerCaseMessage.includes('guide') || lowerCaseMessage.includes('safar buddy')) {
        return 'You can find tour guides in the Safar Buddy section.';
    } else if (lowerCaseMessage.includes('place') || lowerCaseMessage.includes('search')) {
        return 'Use the search bar to explore places of interest or offbeat destinations.';
    } else {
        return 'I am not sure how to respond to that. Please ask another question!';
    }
}
// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

// Example data
const places = {
    'Kapil Kundala Mandir': 'A beautiful temple located in [location].',
    'Kalna 108 Mandir': 'An ancient temple known for its unique architecture in [location].',
    'Sundarban': 'A large mangrove forest in [location], famous for its wildlife.',
    'Shantipur': 'A historic town in [location] with many cultural sites.'
};

const transportFares = {
    'Ola': 'Available for booking at [link].',
    'Uber': 'Available for booking at [link].',
    'Rapido': 'Available for booking at [link].'
};

app.use(bodyParser.json());

// Route for chat responses
app.post('/chat', async (req, res) => {
    const { message } = req.body;

    if (message.toLowerCase().includes('places')) {
        res.json({ reply: 'Here are some places you can visit: ' + Object.keys(places).join(', ') });
    } else if (message.toLowerCase().includes('transport')) {
        res.json({ reply: 'Available transport options: ' + Object.keys(transportFares).join(', ') });
    } else if (places[message]) {
        res.json({ reply: places[message] });
    } else if (transportFares[message]) {
        res.json({ reply: transportFares[message] });
    } else {
        // Call OpenAI API for general chat
        const apiKey = 'YOUR_OPENAI_API_KEY';
        const endpoint = 'https://api.openai.com/v1/chat/completions';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: message }]
                })
            });

            const data = await response.json();
            res.json({ reply: data.choices[0].message.content });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Something went wrong.' });
        }
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
// script.js
document.getElementById('chatbot-icon').addEventListener('click', function() {
    const chatbotWindow = document.getElementById('chatbot-window');
    chatbotWindow.style.display = chatbotWindow.style.display === 'none' || chatbotWindow.style.display === '' ? 'flex' : 'none';
});

document.getElementById('send-button').addEventListener('click', function() {
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim()) {
        appendMessage('user', userInput);
        sendToChatGPT(userInput);
        document.getElementById('user-input').value = '';
    }
});

function appendMessage(sender, text) {
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add(sender);
    messageDiv.textContent = text;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

async function sendToChatGPT(message) {
    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        const reply = data.reply;
        appendMessage('bot', reply);
    } catch (error) {
        console.error('Error:', error);
        appendMessage('bot', 'Sorry, something went wrong.');
    }
}

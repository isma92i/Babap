class ChatInterface {
    constructor() {
        this.messagesContainer = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendMessage');
        this.messageHistory = [{
            role: 'system',
            content: `You are a knowledgeable and enthusiastic travel assistant. Your expertise includes:
            - Detailed knowledge of tourist destinations worldwide
            - Cultural insights and local customs
            - Travel recommendations based on interests and preferences
            - Practical travel tips and best times to visit
            - Must-see attractions and hidden gems
            - Local cuisine and dining recommendations
            - Safety considerations and travel advisories
            
            Always provide specific, actionable advice and try to include:
            - Specific locations that can be shown on a map
            - Seasonal recommendations when relevant
            - Cultural context and interesting facts
            - Practical tips for visitors
            
            Keep responses concise but informative, and always maintain an enthusiastic, friendly tone.`
        }];
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;
        messageDiv.textContent = text;
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    generateResponse(userMessage) {
        const destinations = {
            'paris': "Paris is a beautiful city known for its iconic Eiffel Tower, world-class museums like the Louvre, and exquisite cuisine. The best time to visit is during spring (April-June) or fall (September-October) when the weather is mild. Don't miss the charming Montmartre district and take a Seine River cruise for spectacular city views!",
            'london': "London offers a perfect blend of history and modernity. Visit the Tower of London, Buckingham Palace, and the British Museum. The city's diverse neighborhoods like Shoreditch and Notting Hill each have their unique character. Consider using the Oyster Card for easy public transport!",
            'djanet': "Djanet, located in Algeria's Sahara Desert, is a gateway to the stunning Tassili n'Ajjer National Park. This UNESCO World Heritage site features remarkable rock art and stunning desert landscapes. The best time to visit is between October and March when temperatures are more moderate.",
            'kota kinabalu': "Kota Kinabalu in Malaysia offers amazing experiences from climbing Mount Kinabalu to exploring the vibrant night markets. Don't miss the stunning sunsets at Tanjung Aru Beach or island hopping in the Tunku Abdul Rahman Marine Park.",
            'surabaya': "Surabaya, Indonesia's second-largest city, offers a fascinating mix of colonial heritage and modern urban life. Visit the historic House of Sampoerna, explore the vibrant Arab Quarter, and enjoy local delicacies at the Pasar Atom night market."
        };

        // Convert message to lowercase for matching
        const messageLower = userMessage.toLowerCase();
        
        // Check for destination mentions
        for (const [destination, response] of Object.entries(destinations)) {
            if (messageLower.includes(destination)) {
                // If the message mentions a destination, use the prepared response
                return response;
            }
        }

        // Default responses for different types of queries
        if (messageLower.includes('weather')) {
            return "I recommend checking local weather forecasts closer to your travel date. Weather conditions can vary significantly by season and location.";
        } else if (messageLower.includes('hotel') || messageLower.includes('stay')) {
            return "I can suggest looking at accommodations in various price ranges. Consider factors like location, amenities, and proximity to attractions when choosing where to stay.";
        } else if (messageLower.includes('food') || messageLower.includes('eat')) {
            return "Each destination offers unique culinary experiences. I recommend trying local specialties and street food, but also make sure to check reviews and food safety ratings.";
        } else {
            return "I'd be happy to help you plan your trip! Feel free to ask about specific destinations, attractions, or travel tips. You can also explore our interactive map to discover exciting locations.";
        }
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessage(message, true);
        this.chatInput.value = '';

        // Add typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message ai typing';
        typingIndicator.textContent = '...';
        this.messagesContainer.appendChild(typingIndicator);

        // Simulate API delay
        setTimeout(() => {
            // Remove typing indicator
            this.messagesContainer.removeChild(typingIndicator);
            
            // Generate and add AI response
            const aiResponse = this.generateResponse(message);
            this.addMessage(aiResponse);

            // Add AI response to history
            this.messageHistory.push({
                role: 'assistant',
                content: aiResponse
            });

            // Keep history at a reasonable size (last 10 messages)
            if (this.messageHistory.length > 11) {
                this.messageHistory = [
                    this.messageHistory[0],
                    ...this.messageHistory.slice(-10)
                ];
            }

            // Check if the message contains a location and fly to it on the map
            const locations = ['paris', 'london', 'djanet', 'kota kinabalu', 'surabaya'];
            const messageLower = message.toLowerCase();
            for (const location of locations) {
                if (messageLower.includes(location)) {
                    // Capitalize first letter of each word
                    const formattedLocation = location
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                    window.mapInterface?.flyToLocation(formattedLocation);
                    break;
                }
            }
        }, 1000);
    }
}

// Initialize chat interface
const chat = new ChatInterface();

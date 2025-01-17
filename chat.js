class ChatInterface {
    constructor() {
        this.messagesContainer = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendMessage');
        this.apiKey = 'sk-proj-TUPmOl9mnrjd9MWt4O6cT3BlbkFJ2jE6b06vojYGuoaAVYxl';
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

        try {
            // Check if the message contains a location query
            const isLocationQuery = message.toLowerCase().includes('visit') || 
                                  message.toLowerCase().includes('travel to') ||
                                  message.toLowerCase().includes('go to') ||
                                  message.toLowerCase().includes('explore') ||
                                  message.toLowerCase().includes('show me');

            // Add user message to history with location context if needed
            this.messageHistory.push({
                role: 'user',
                content: isLocationQuery ? 
                    `${message} Please start your response by clearly stating the destination name, then provide travel information.` :
                    message
            });

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: this.messageHistory,
                    temperature: 0.7
                })
            });

            const data = await response.json();
            
            // Remove typing indicator
            this.messagesContainer.removeChild(typingIndicator);

            if (data.choices && data.choices[0]) {
                const aiResponse = data.choices[0].message.content;
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

                // If it was a location query, try to extract and fly to the location
                if (isLocationQuery && window.mapInterface) {
                    // Extract the first line which should contain the destination
                    const firstLine = aiResponse.split('\n')[0];
                    const locationName = firstLine.replace(/^(Welcome to|Let's explore|Discovering|Visit|In) /, '').trim();
                    const placeName = await window.mapInterface.flyToLocation(locationName);
                    
                    if (placeName) {
                        console.log(`Successfully located and focused on: ${placeName}`);
                    }
                }
            } else {
                this.addMessage('I apologize, but I encountered an error processing your request.');
            }
        } catch (error) {
            console.error('Error:', error);
            // Remove typing indicator in case of error
            if (typingIndicator.parentNode) {
                this.messagesContainer.removeChild(typingIndicator);
            }
            this.addMessage('I apologize, but I encountered an error processing your request.');
        }
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// Initialize chat interface
const chat = new ChatInterface();

// Chat.js - Handles frontend chat interactions

class NetworkSecurityChatbot {
    constructor() {
        this.chatContainer = document.getElementById('chat-container');
        this.queryInput = document.getElementById('user-query');
        this.sendButton = document.getElementById('send-button');

        // Initialize event listeners
        this.initEventListeners();
    }

    initEventListeners() {
        // Send button click event
        this.sendButton.addEventListener('click', () => this.sendQuery());

        // Enter key press event
        this.queryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendQuery();
            }
        });
    }

    addUserMessage(message) {
        const userMessageElement = document.createElement('div');
        userMessageElement.classList.add('text-right', 'mb-2');
        userMessageElement.innerHTML = `
            <div class="inline-block bg-blue-100 rounded-lg p-2 max-w-[80%] text-left">
                ${this.escapeHtml(message)}
            </div>
        `;
        this.chatContainer.appendChild(userMessageElement);
        this.scrollToBottom();
    }

    addBotMessage(message, context = null) {
        const botMessageElement = document.createElement('div');
        botMessageElement.classList.add('text-left', 'mb-2');
        
        // Prepare context details if available
        const contextDetails = context ? this.createContextDetails(context) : '';

        botMessageElement.innerHTML = `
            <div class="inline-block bg-gray-200 rounded-lg p-2 max-w-[80%] text-left">
                ${this.escapeHtml(message)}
                ${contextDetails}
            </div>
        `;
        this.chatContainer.appendChild(botMessageElement);
        this.scrollToBottom();
    }

    createContextDetails(context) {
        if (!context || context.length === 0) return '';

        const contextHtml = context.map(item => 
            `<pre class="text-xs bg-gray-100 p-1 rounded mt-2">${JSON.stringify(item, null, 2)}</pre>`
        ).join('');

        return `
            <details class="mt-2 text-xs text-gray-600">
                <summary>Retrieved Contexts</summary>
                ${contextHtml}
            </details>
        `;
    }

    sendQuery() {
        const query = this.queryInput.value.trim();
        if (!query) return;

        // Clear input
        this.queryInput.value = '';

        // Add user message to chat
        this.addUserMessage(query);

        // Send query to backend
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: query })
        })
        .then(response => response.json())
        .then(data => {
            // Add bot response
            this.addBotMessage(data.response, data.context);
        })
        .catch(error => {
            console.error('Error:', error);
            this.addBotMessage('Sorry, there was an error processing your request.');
        });
    }

    scrollToBottom() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    // Utility method to prevent XSS
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize the chatbot when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatbot = new NetworkSecurityChatbot();
});
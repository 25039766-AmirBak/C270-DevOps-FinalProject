import React, { useState, useRef, useEffect } from 'react';

const AiChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'ai', text: 'Hi! I am the SharePlate Assistant. How can I help you navigate the platform or package donations safely?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to the bottom when a new message appears
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // 1. Render user message instantly
        const userMsg = { sender: 'user', text: input };
        setMessages((prev) => [...prev, userMsg]);
        const currentInput = input; 
        setInput(''); // Clear the input field
        setIsTyping(true);

        try {
            // 2. Send the message to Node.js backend
            // Note: Make sure 5000 matches the port your backend actually runs on!
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: currentInput })
            });

            if (!response.ok) {
                throw new Error("Backend connection failed");
            }

            const data = await response.json();

            // 3. Render the real AI's response
            const aiResponse = { sender: 'ai', text: data.reply };
            setMessages((prev) => [...prev, aiResponse]);
            
        } catch (error) {
            console.error("Chat Integration Error:", error);
            const errorResponse = { 
                sender: 'ai', 
                text: "I am having trouble connecting to the server. Please ensure the backend is running!" 
            };
            setMessages((prev) => [...prev, errorResponse]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="chatbot-wrapper">
            {/* The Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h4>SharePlate Assistant</h4>
                        <button onClick={() => setIsOpen(false)} className="close-btn">×</button>
                    </div>
                    
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-bubble ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="message-bubble ai typing-indicator">
                                <span>.</span><span>.</span><span>.</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chatbot-input-area" onSubmit={handleSend}>
                        <input 
                            type="text" 
                            placeholder="Ask a question..." 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" className="send-btn">Send</button>
                    </form>
                    
                    <div className="chatbot-disclaimer">
                        Reminder: AI can make mistakes. Please use human critical thinking as the final filter to verify important information.
                    </div>
                </div>
            )}

            {/* The Floating Toggle Button */}
            {!isOpen && (
                <button className="chatbot-toggle-btn" onClick={() => setIsOpen(true)}>
                    💬 Ask AI
                </button>
            )}
        </div>
    );
};

export default AiChatbotWidget;
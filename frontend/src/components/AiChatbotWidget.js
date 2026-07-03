import React, { useState, useRef, useEffect } from 'react';
import '../global.css';

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

        // Add user message to UI
        const userMsg = { sender: 'user', text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // TODO: Replace this simulated delay with your actual LLM API fetch() call
        setTimeout(() => {
            const aiResponse = { 
                sender: 'ai', 
                text: "That is a great question. As a demo assistant, I recommend checking our 'How it Works' section on the homepage for standard donation guidelines!" 
            };
            setMessages((prev) => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
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
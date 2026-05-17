import { useMemo, useState } from 'react';

const CHATBOT_API_URL = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:8000';

const starterPrompts = [
  'How do I start swapping?',
  'Is Skillswap free?',
  'How do I find a skill?',
];

const ChatbotAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi, I am your Skillswap assistant. Ask me how to find skills, register, or start your first swap.',
    },
  ]);

  const hasConversation = useMemo(() => messages.length > 1, [messages.length]);

  const sendMessage = async (messageText = input) => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || isSending) return;

    setInput('');
    setMessages((current) => [...current, { role: 'user', text: trimmedMessage }]);
    setIsSending(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch(`${CHATBOT_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedMessage }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('Chatbot request failed');
      }

      const data = await response.json();
      setMessages((current) => [
        ...current,
        { role: 'assistant', text: data.reply || 'I am here to help with Skillswap.' },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: 'I could not reach the Python assistant. From the project folder, run start_app.bat or python python_chatbot/chatbot_server.py and keep that terminal open.',
        },
      ]);
    } finally {
      window.clearTimeout(timeoutId);
      setIsSending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <div className="chatbot-assistant" aria-live="polite">
      {isOpen && (
        <section className="chatbot-panel" aria-label="Skillswap AI assistant">
          <div className="chatbot-header">
            <div>
              <span className="chatbot-kicker">AI Assistant</span>
              <h3>Skillswap Helper</h3>
            </div>
            <button
              type="button"
              className="chatbot-icon-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              x
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div className={`chatbot-message chatbot-message-${message.role}`} key={`${message.role}-${index}`}>
                {message.text}
              </div>
            ))}
            {isSending && <div className="chatbot-message chatbot-message-assistant">Thinking...</div>}
          </div>

          {!hasConversation && (
            <div className="chatbot-prompts">
              {starterPrompts.map((prompt) => (
                <button type="button" key={prompt} onClick={() => sendMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <form className="chatbot-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about Skillswap..."
              aria-label="Message the Skillswap assistant"
            />
            <button type="submit" disabled={isSending || !input.trim()}>
              Send
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="chatbot-launcher"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
      >
        AI
      </button>
    </div>
  );
};

export default ChatbotAssistant;

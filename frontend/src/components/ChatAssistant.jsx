import React, { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import api from '../services/api';

export function ChatAssistant({ onClose, addAuditLog, caseData }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I\'m your AI forensic assistant. I can help you analyze evidence, find patterns, and generate insights. What would you like to investigate?',
      timestamp: new Date().toLocaleString(),
      citations: []
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleString(),
      citations: []
    };

    setMessages(prev => [...prev, userMessage]);
    addAuditLog('AI Query Sent', `User query: "${inputMessage}"`);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Use real API call if we have case data with UFDR file ID
      if (caseData && caseData.id) {
        const response = await api.get(`/chat/conv/${caseData.id}`, {
          params: { q: inputMessage }
        });
        
        const aiResponse = {
          id: messages.length + 2,
          type: 'assistant',
          content: response.data.answer,
          timestamp: new Date().toLocaleString(),
          citations: [`Found ${response.data.num_matches} matches`]
        };
        
        setMessages(prev => [...prev, aiResponse]);
        addAuditLog('AI Response Generated', `Response to query about: "${inputMessage}"`);
      } else {
        // Fallback to simulated response
        const aiResponse = generateAIResponse(inputMessage);
        setMessages(prev => [...prev, aiResponse]);
        addAuditLog('AI Response Generated', `Response to query about: "${inputMessage}"`);
      }
    } catch (error) {
      console.error('API call failed:', error);
      const errorResponse = {
        id: messages.length + 2,
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toLocaleString(),
        citations: []
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = (query) => {
    const responses = {
      'crypto': {
        content: 'I found 3 cryptocurrency addresses in your evidence. The most significant is 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa which appears in 5 different conversations. This address received transactions totaling approximately $45,000 during the investigation period.',
        citations: ['MSG_001', 'MSG_047', 'MSG_089', 'TXN_002', 'TXN_015']
      },
      'timeline': {
        content: 'Based on the communication patterns, I can see increased activity on January 14th between 2-4 PM. There were 23 messages exchanged, 4 phone calls, and location data showing movement between two key addresses. This appears to be a critical timeframe.',
        citations: ['MSG_001', 'MSG_002', 'CALL_001', 'CALL_002', 'LOC_001', 'LOC_002']
      },
      'default': {
        content: 'I\'ve analyzed the current evidence and found several interesting patterns. There are strong connections between the primary suspects based on communication frequency and timing. I can provide more specific insights if you ask about particular aspects like locations, financial transactions, or communication patterns.',
        citations: ['MSG_001', 'CALL_001', 'CONTACT_001']
      }
    };

    const lowerQuery = query.toLowerCase();
    let response = responses.default;
    
    if (lowerQuery.includes('crypto') || lowerQuery.includes('bitcoin')) {
      response = responses.crypto;
    } else if (lowerQuery.includes('timeline') || lowerQuery.includes('time')) {
      response = responses.timeline;
    }

    return {
      id: messages.length + 2,
      type: 'assistant',
      content: response.content,
      timestamp: new Date().toLocaleString(),
      citations: response.citations
    };
  };

  const renderCitations = (citations) => {
    if (!citations || citations.length === 0) return null;

    return (
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Sources:</p>
        <div className="flex flex-wrap gap-1">
          {citations.map((citation, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="text-xs font-mono cursor-pointer hover:bg-accent"
              title="Click to view source artifact"
            >
              {citation}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed right-6 bottom-20 w-96 h-[600px] bg-card border border-border rounded-lg shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3>AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Forensic Analysis</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-muted text-foreground'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
              {message.type === 'assistant' && renderCitations(message.citations)}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about evidence, patterns, or insights..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isTyping}
            className="bg-input-background"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!inputMessage.trim() || isTyping}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
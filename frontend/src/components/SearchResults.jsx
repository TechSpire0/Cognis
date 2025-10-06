import React, { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import api from '../services/api';

export function SearchResults({ caseData, addAuditLog }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: '✨ My top forensic analysis capabilities for your investigation would be:\n\n• **Evidence Correlation** (cross-reference + timeline analysis)\n• **Pattern Recognition** (behavioral + anomaly detection)\n• **Network Mapping** (relationships + communication patterns)\n• **Timeline Reconstruction** (chronological + causal chains)\n• **Artifact Analysis** (metadata + content examination)',
      timestamp: new Date().toLocaleString(),
      citations: []
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
    const lowerQuery = query.toLowerCase();
    
    const responses = {
      'evidence': {
        content: '✨ I found several key pieces of evidence in your case:\n\n• **Digital Messages** (23 text messages showing coordination between suspects)\n• **Call Records** (15 phone calls during critical investigation period)\n• **Location Intelligence** (GPS coordinates revealing movement patterns)\n• **File Transfers** (8 documents including images and encrypted files)\n• **Metadata Analysis** (timestamps, device fingerprints, network traces)\n\nWould you like me to deep-dive into any specific evidence category?',
        citations: ['MSG_001', 'CALL_001', 'LOC_001', 'FILE_001']
      },
      'timeline': {
        content: '✨ Based on forensic analysis, here\'s the reconstructed timeline:\n\n**January 14, 2024 - Critical Window:**\n• **2:15 PM** - Initial suspicious contact established\n• **3:30 PM** - Encrypted meeting coordination via secure messaging\n• **4:45 PM** - Physical movement to predetermined location\n• **5:15 PM** - Data transfer and evidence creation detected\n• **6:00 PM** - Network activity spike indicating file sharing\n\nThis 3-hour window appears to be the focal point of criminal activity. Shall I analyze the digital footprint in greater detail?',
        citations: ['MSG_001', 'CALL_001', 'LOC_001', 'TXN_001']
      },
      'connections': {
        content: '✨ Network analysis reveals sophisticated relationship patterns:\n\n**Primary Hub:**\n• **John Doe** ↔ Phone +1-555-0123 (15 encrypted interactions)\n• **John Doe** ↔ NYC Financial District (12 documented visits)\n• **Device Network** ↔ File ecosystem (8 transfer instances)\n\n**Secondary Nodes:**\n• 3 burner phone numbers with tactical communication patterns\n• 2 safe house locations with surveillance countermeasures\n• Multiple digital wallets with transaction correlations\n\nThe network exhibits classic organized crime hierarchy. Would you like me to map the command structure?',
        citations: ['CONTACT_001', 'MSG_001', 'CALL_001', 'LOC_001']
      },
      'default': {
        content: '✨ I\'ve processed your query against the case database. I can assist with:\n\n• **Evidence Analysis** - Deep forensic examination of digital artifacts\n• **Timeline Reconstruction** - Chronological event mapping with causal relationships\n• **Network Intelligence** - Relationship mapping and communication pattern analysis\n• **Behavioral Profiling** - Suspect activity patterns and anomaly detection\n• **Legal Documentation** - Evidence chain preparation for court proceedings\n\nWhat specific aspect of the investigation would you like me to focus on?',
        citations: ['MSG_001', 'CALL_001', 'CONTACT_001']
      }
    };

    let response = responses.default;
    
    if (lowerQuery.includes('evidence') || lowerQuery.includes('proof')) {
      response = responses.evidence;
    } else if (lowerQuery.includes('timeline') || lowerQuery.includes('time') || lowerQuery.includes('when')) {
      response = responses.timeline;
    } else if (lowerQuery.includes('connection') || lowerQuery.includes('relationship') || lowerQuery.includes('network')) {
      response = responses.connections;
    }

    return {
      id: messages.length + 2,
      type: 'assistant',
      content: response.content,
      timestamp: new Date().toLocaleString(),
      citations: response.citations
    };
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Main Chat Area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-4">
          {messages.map((message) => (
            <div key={message.id} className="py-6 border-b border-border/50 last:border-b-0">
              <div className="flex gap-4">
                {/* Avatar placeholder - keeping it minimal like ChatGPT */}
                <div className="flex-shrink-0 w-8 h-8">
                  {message.type === 'assistant' && (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="whitespace-pre-line leading-relaxed text-foreground">
                      {message.content}
                    </div>
                  </div>
                  
                  {/* Citations */}
                  {message.citations && message.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/30">
                      <p className="text-xs text-muted-foreground mb-2">Evidence Sources:</p>
                      <div className="flex flex-wrap gap-1">
                        {message.citations.map((citation, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs font-mono cursor-pointer hover:bg-accent/50 transition-colors"
                            title="Click to view source artifact"
                          >
                            {citation}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="py-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Larger and more prominent */}
      <div className="border-t border-border bg-background">
        <div className="max-w-3xl mx-auto p-4">
          <div className="relative bg-muted/30 rounded-2xl border border-border/50 focus-within:border-border transition-colors">
            <Input
              ref={inputRef}
              placeholder="Ask anything"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              className="border-0 bg-transparent resize-none min-h-[60px] text-base px-4 py-4 pr-16 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
            />
            
            {/* Input Controls */}
            <div className="absolute right-2 bottom-2 flex items-center gap-2">
              {/* Microphone Icon */}
              <button 
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent/50"
                disabled
                title="Voice input (coming soon)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              
              {/* Send Button */}
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputMessage.trim() || isTyping}
                size="sm"
                className="bg-foreground hover:bg-foreground/90 text-background rounded-lg p-2 h-auto disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </Button>
            </div>
          </div>
          
          {/* Footer Text */}
          <div className="text-center mt-3">
            <span className="text-xs text-muted-foreground">
              AI Forensic Assistant can make mistakes. Check important info.{' '}
              <button className="underline hover:no-underline">
                Evidence Preferences
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Send, Bot, User, ChevronDown } from "lucide-react";

export function ChatAI() {
  const [selectedCase, setSelectedCase] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const textareaRef = useRef(null);

  const caseOptions = [
    { value: "2025-047", label: "Case #2025-047 - Operation Thunder" },
    { value: "2025-046", label: "Case #2025-046 - Crypto Investigation" },
    { value: "2025-045", label: "Case #2025-045 - Border Surveillance" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [inputMessage]);

  const handleCaseSelect = (caseId) => {
    setSelectedCase(caseId);
    const selectedLabel = caseOptions.find((c) => c.value === caseId)?.label;
    setMessages([
      {
        id: 1,
        role: "assistant",
        content: `I've loaded ${selectedLabel}. I have access to all UFDR data including call logs, messages, media files, location data, and crypto transactions. How can I assist with this investigation?`,
      },
    ]);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedCase) return;

    const userMessage = {
      id: messages.length + 1,
      role: "user",
      content: inputMessage,
    };

    const assistantMessage = {
      id: messages.length + 2,
      role: "assistant",
      content: `Based on the UFDR data for "${inputMessage}", I found:\n\n• 347 call records in the specified timeframe\n• 5 key contacts with high interaction frequency\n• 23 recovered deleted messages\n• 12 location clusters from GPS data\n\nWould you like me to provide more detailed analysis on any of these findings?`,
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setInputMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0D1117]">
      {/* Case Selector Bar */}
      <div className="flex-shrink-0 border-b border-[#30363D] bg-[#0D1117] px-8 py-4">
        <div className="max-w-4xl mx-auto">
          <Select value={selectedCase} onValueChange={handleCaseSelect}>
            <SelectTrigger className="w-full bg-[#161B22] border-[#30363D] text-[#E6EDF3] hover:bg-[#1c2128] transition-colors h-12 text-base">
              <div className="flex items-center justify-between w-full">
                <SelectValue placeholder="Select a case to begin analysis..." />
                <ChevronDown className="w-4 h-4 text-[#9BA1A6] ml-2" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-[#161B22] border-[#30363D]">
              {caseOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-[#E6EDF3] focus:bg-[#00BFA5]/10 focus:text-[#E6EDF3] py-3 text-base"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
        style={{ scrollBehavior: "smooth" }}
      >
        <style>
          {`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #0D1117;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #30363D;
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #484f58;
            }
          `}
        </style>
        <div className="custom-scrollbar h-full">
          {!selectedCase ? (
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-full bg-[#00BFA5]/10 flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-[#00BFA5]" />
                </div>
                <h2 className="text-[#E6EDF3] text-xl mb-2">AI Case Assistant</h2>
                <p className="text-[#9BA1A6]">
                  Select a case from the dropdown above to start analyzing UFDR data with AI assistance.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-8 py-12">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 mb-8 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-[#00BFA5]/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-5 h-5 text-[#00BFA5]" />
                    </div>
                  )}

                  <div className={`flex-1 ${message.role === "user" ? "max-w-[80%]" : ""}`}>
                    <div
                      className={`${
                        message.role === "user"
                          ? "bg-[#161B22] px-4 py-3 rounded-2xl"
                          : ""
                      }`}
                    >
                      <p className="text-[#E6EDF3] leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>

                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-[#6C63FF]/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-5 h-5 text-[#6C63FF]" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-[#30363D] bg-[#0D1117] px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-[#161B22] border border-[#30363D] rounded-3xl focus-within:border-[#00BFA5] transition-colors">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={selectedCase ? "Message AI Assistant..." : "Select a case first"}
              disabled={!selectedCase}
              className="min-h-[60px] max-h-[200px] bg-transparent border-0 text-[#E6EDF3] placeholder:text-[#9BA1A6] resize-none py-5 px-5 pr-14 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!selectedCase || !inputMessage.trim()}
              size="icon"
              className="absolute right-3 bottom-3 h-10 w-10 bg-[#00BFA5] hover:bg-[#03DAC6] text-[#0D1117] disabled:opacity-30 disabled:bg-[#30363D] rounded-lg"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-[#9BA1A6] text-xs mt-3 text-center">
            AI can make mistakes. Verify important information from UFDR data.
          </p>
        </div>
      </div>
    </div>
  );
}

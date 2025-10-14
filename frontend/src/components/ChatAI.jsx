import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Send, Bot, User, ChevronDown } from "lucide-react";
import { getCases, getUfdrFiles, askChat } from "../services/api";

export function ChatAI() {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState("");
  const [ufdrFiles, setUfdrFiles] = useState([]);
  const [selectedUfdr, setSelectedUfdr] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingUfdrs, setLoadingUfdrs] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [inputMessage]);

  // Fetch cases on mount
  useEffect(() => {
    const loadCases = async () => {
      try {
        const data = await getCases();
        setCases(data || []);
      } catch (err) {
        console.error("Failed to load cases:", err);
      } finally {
        setLoadingCases(false);
      }
    };
    loadCases();
  }, []);

  // Handle case selection
  const handleCaseSelect = async (caseId) => {
    setSelectedCase(caseId);
    setSelectedUfdr("");
    setMessages([]);
    setUfdrFiles([]);
    setLoadingUfdrs(true);

    try {
      const files = await getUfdrFiles(caseId);
      setUfdrFiles(files || []);
      if (files.length === 1) {
        setSelectedUfdr(files[0].id);
        setMessages([
          {
            id: 1,
            role: "assistant",
            content: `Loaded ${files[0].filename}. I have access to all UFDR artifacts for this case. How can I assist?`,
          },
        ]);
      }
    } catch (e) {
      console.error("Failed to load UFDR files:", e);
    } finally {
      setLoadingUfdrs(false);
    }
  };

  // Handle UFDR selection
  const handleUfdrSelect = (ufdrId) => {
    const file = ufdrFiles.find((f) => f.id === ufdrId);
    setSelectedUfdr(ufdrId);
    setMessages([
      {
        id: 1,
        role: "assistant",
        content: `Loaded ${file?.filename}. You can now ask questions related to this UFDR file.`,
      },
    ]);
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedCase || !selectedUfdr) return;

    const userMsg = {
      id: messages.length + 1,
      role: "user",
      content: inputMessage.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setSending(true);

    try {
      // Temporary placeholder
      const thinkingMsg = {
        id: messages.length + 2,
        role: "assistant",
        content: "Analyzing UFDR data... please wait ⏳",
      };
      setMessages((prev) => [...prev, thinkingMsg]);

      const res = await askChat(selectedUfdr, userMsg.content);

      // Replace placeholder with response
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingMsg.id
            ? { ...m, content: res.answer || "[No response received.]" }
            : m
        )
      );
    } catch (e) {
      console.error("Chat failed:", e);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: "assistant",
          content: "⚠️ Error: Failed to get AI response. Please try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

 return (
  <div className="flex flex-col h-full bg-[#0D1117]">
    {/* Case & UFDR Selector */}
    <div className="flex-shrink-0 border-b border-[#30363D] bg-[#0D1117] px-8 py-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Case Dropdown */}
        <Select
          value={selectedCase}
          onValueChange={handleCaseSelect}
          disabled={loadingCases}
        >
          <SelectTrigger className="w-full bg-[#161B22] border-[#30363D] text-[#E6EDF3] hover:bg-[#1c2128] transition-colors h-12 text-base">
            <div className="flex items-center justify-between w-full">
              <SelectValue
                placeholder={
                  loadingCases
                    ? "Loading cases..."
                    : "Select a case to begin analysis..."
                }
              />
              <ChevronDown className="w-4 h-4 text-[#9BA1A6] ml-2" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-[#161B22] border-[#30363D]">
            {cases.length === 0 && !loadingCases ? (
              <div className="px-4 py-3 text-[#9BA1A6] text-sm">
                No cases assigned.
              </div>
            ) : (
              cases.map((c) => (
                <SelectItem
                  key={c.id}
                  value={c.id}
                  className="text-[#E6EDF3] focus:bg-[#00BFA5]/10 focus:text-[#E6EDF3] py-3 text-base"
                >
                  {c.title || `Case ${c.id.slice(0, 8)}`}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {/* UFDR Dropdown */}
        {selectedCase && (
          <Select
            value={selectedUfdr}
            onValueChange={handleUfdrSelect}
            disabled={loadingUfdrs}
          >
            <SelectTrigger className="w-full bg-[#161B22] border-[#30363D] text-[#E6EDF3] hover:bg-[#1c2128] transition-colors h-12 text-base">
              <div className="flex items-center justify-between w-full">
                <SelectValue
                  placeholder={
                    loadingUfdrs
                      ? "Loading UFDR files..."
                      : "Select UFDR file..."
                  }
                />
                <ChevronDown className="w-4 h-4 text-[#9BA1A6] ml-2" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-[#161B22] border-[#30363D]">
              {ufdrFiles.length === 0 && !loadingUfdrs ? (
                <div className="px-4 py-3 text-[#9BA1A6] text-sm">
                  No UFDR files found for this case.
                </div>
              ) : (
                ufdrFiles.map((f) => (
                  <SelectItem
                    key={f.id}
                    value={f.id}
                    className="text-[#E6EDF3] focus:bg-[#00BFA5]/10 py-3 text-base"
                  >
                    {f.filename}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>

    {/* Chat Messages */}
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto custom-scrollbar"
      style={{ scrollBehavior: "smooth" }}
    >
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 8px; }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #30363D;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #484f58; }
          .fade-in {
            animation: fadeIn 0.4s ease;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {!selectedCase ? (
          <div className="text-center text-[#9BA1A6] mt-20">
            Select a case to start your AI forensic analysis.
          </div>
        ) : !selectedUfdr ? (
          <div className="text-center text-[#9BA1A6] mt-20">
            {loadingUfdrs
              ? "Fetching UFDR files..."
              : "Select a UFDR file to continue."}
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 mb-8 fade-in ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-[#00BFA5]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-5 h-5 text-[#00BFA5]" />
                  </div>
                )}

                <div
                  className={`flex-1 ${
                    message.role === "user" ? "max-w-[80%]" : ""
                  }`}
                >
                  <div
                    className={`${
                      message.role === "user"
                        ? "bg-[#161B22] px-4 py-3 rounded-2xl"
                        : "bg-[#0D1117] border border-[#2D333B] rounded-2xl px-5 py-4 shadow-sm"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="text-[#E6EDF3] leading-relaxed prose prose-invert max-w-none">
                        {message.content.split("\n").map((line, i) => {
                          if (line.startsWith("*")) {
                            return (
                              <div
                                key={i}
                                className="text-sm text-[#C9D1D9] border-l border-[#2D333B] pl-3 py-1"
                              >
                                {line.replace(/^\*\s*/, "")}
                              </div>
                            );
                          } else if (line.match(/^[A-Z].*:/)) {
                            return (
                              <p
                                key={i}
                                className="font-medium text-[#E6EDF3] mt-2"
                              >
                                {line}
                              </p>
                            );
                          } else if (line.trim().length === 0) {
                            return <div key={i} className="h-2" />;
                          } else {
                            return (
                              <p
                                key={i}
                                className="text-[#C9D1D9] text-[15px] leading-relaxed"
                              >
                                {line}
                              </p>
                            );
                          }
                        })}
                      </div>
                    ) : (
                      <p className="text-[#E6EDF3] leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-[#6C63FF]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-5 h-5 text-[#6C63FF]" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {sending && (
              <div className="flex items-center gap-2 text-[#9BA1A6] text-sm mt-2 ml-2">
                <Bot className="w-4 h-4 text-[#00BFA5]" />
                <span>Analyzing UFDR data...</span>
                <span className="animate-pulse">⏳</span>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
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
            placeholder={
              selectedCase && selectedUfdr
                ? "Message AI Assistant..."
                : "Select case and UFDR file first"
            }
            disabled={!selectedCase || !selectedUfdr || sending}
            className="min-h-[60px] max-h-[200px] bg-transparent border-0 text-[#E6EDF3] placeholder:text-[#9BA1A6] resize-none py-5 px-5 pr-14 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={
              !selectedCase || !selectedUfdr || !inputMessage.trim() || sending
            }
            size="icon"
            className="absolute right-3 bottom-3 h-10 w-10 bg-[#00BFA5] hover:bg-[#03DAC6] text-[#0D1117] disabled:opacity-30 disabled:bg-[#30363D] rounded-lg"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  </div>
);
}
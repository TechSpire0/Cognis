import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, Phone, MessageSquare, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const suggestedQueries = [
    "Show me all calls with international numbers",
    "Find messages containing crypto keywords",
    "Show Telegram chats from last week",
    "Find all deleted messages",
    "Show calls longer than 10 minutes",
  ];

  const callResults = [
    { id: 1, number: "+44 20 7946 0958", duration: "15:32", date: "2025-10-07 14:23", type: "Incoming" },
    { id: 2, number: "+92 21 3456 7890", duration: "03:45", date: "2025-10-07 16:45", type: "Outgoing" },
    { id: 3, number: "+1 555 123 4567", duration: "21:18", date: "2025-10-06 09:12", type: "Incoming" },
  ];

  const chatResults = [
    { id: 1, app: "WhatsApp", contact: "John Smith", preview: "Meet at the usual place...", date: "2025-10-08 10:15" },
    { id: 2, app: "Telegram", contact: "Anonymous", preview: "Transfer complete, check wallet...", date: "2025-10-07 22:30" },
    { id: 3, app: "Signal", contact: "+92 300 1234567", preview: "Package delivered successfully", date: "2025-10-06 18:45" },
  ];

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="p-14">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[#E6EDF3] mb-2">Advanced Search</h1>
          <p className="text-[#9BA1A6]">Natural language queries and advanced filters</p>
        </div>

        {/* Search Input */}
        <Card className="bg-[#161B22] border-[#30363D] mb-8 card-glow">
          <CardContent className="pt-6">
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-[#9BA1A6]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ask anything: 'Show me calls to Pakistan' or 'Find crypto addresses'"
                  className="pl-12 h-12 bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#9BA1A6]/60"
                />
              </div>
              <Button className="h-12 px-8 bg-[#00BFA5] text-[#0D1117] hover:bg-[#03DAC6]">
                Search
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-[#9BA1A6] text-sm">Suggested queries:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQueries.map((query) => (
                  <Button
                    key={query}
                    onClick={() => setSearchQuery(query)}
                    variant="outline"
                    size="sm"
                    className="border-[#30363D] text-[#9BA1A6] hover:bg-[#00BFA5]/10 hover:text-[#00BFA5] hover:border-[#00BFA5]"
                  >
                    {query}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Tabs */}
        <Card className="bg-[#161B22] border-[#30363D] card-glow">
          <CardHeader>
            <CardTitle className="text-[#E6EDF3]">Search Results</CardTitle>
            <CardDescription className="text-[#9BA1A6]">
              All results from UFDR database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="calls" className="w-full">
              <TabsList className="bg-[#0D1117] border border-[#30363D]">
                <TabsTrigger value="calls" className="data-[state=active]:bg-[#00BFA5] data-[state=active]:text-[#0D1117]">
                  <Phone className="w-4 h-4 mr-2" />
                  Calls ({callResults.length})
                </TabsTrigger>
                <TabsTrigger value="chats" className="data-[state=active]:bg-[#00BFA5] data-[state=active]:text-[#0D1117]">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chats ({chatResults.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calls" className="space-y-3 mt-6">
                {callResults.map((call) => (
                  <div
                    key={call.id}
                    className="p-4 bg-[#0D1117] border border-[#30363D] rounded-lg hover:border-[#00BFA5] transition-all cursor-pointer glow-hover"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#00BFA5]/10 border border-[#00BFA5] flex items-center justify-center">
                          <Phone className="w-5 h-5 text-[#00BFA5]" />
                        </div>
                        <div>
                          <p className="text-[#E6EDF3]">{call.number}</p>
                          <p className="text-[#9BA1A6] text-sm">Duration: {call.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={
                          call.type === "Incoming" 
                            ? "bg-[#00BFA5]/20 text-[#00BFA5] border-[#00BFA5]"
                            : "bg-[#6C63FF]/20 text-[#6C63FF] border-[#6C63FF]"
                        }>
                          {call.type}
                        </Badge>
                        <div className="flex items-center gap-2 text-[#9BA1A6] text-sm">
                          <Calendar className="w-4 h-4" />
                          {call.date}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="chats" className="space-y-3 mt-6">
                {chatResults.map((chat) => (
                  <div
                    key={chat.id}
                    className="p-4 bg-[#0D1117] border border-[#30363D] rounded-lg hover:border-[#6C63FF] transition-all cursor-pointer glow-hover"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#6C63FF]/10 border border-[#6C63FF] flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-[#6C63FF]" />
                        </div>
                        <div>
                          <p className="text-[#E6EDF3]">{chat.contact}</p>
                          <Badge className="bg-[#9BA1A6]/20 text-[#9BA1A6] border-[#9BA1A6] text-xs">
                            {chat.app}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[#9BA1A6] text-sm">
                        <Calendar className="w-4 h-4" />
                        {chat.date}
                      </div>
                    </div>
                    <p className="text-[#9BA1A6] ml-13">{chat.preview}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

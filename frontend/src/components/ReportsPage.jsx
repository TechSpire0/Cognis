import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { FileText, Download, ChevronDown } from "lucide-react";

export function ReportsPage() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleGenerateReport = () => {
    setShowDropdown(!showDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="p-14">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[#E6EDF3] mb-2">Generate Reports</h1>
          <p className="text-[#9BA1A6]">Export analysis results with customizable sections</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Report Configuration - Left Column (spans 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-[#161B22] border-[#30363D] card-glow">
              <CardHeader>
                <CardTitle className="text-[#E6EDF3]">Report Details</CardTitle>
                <CardDescription className="text-[#9BA1A6]">
                  Configure your forensic report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="report-title" className="text-[#E6EDF3]">Report Title</Label>
                  <Input
                    id="report-title"
                    type="text"
                    placeholder="e.g., UFDR Analysis Report - Case #2025-001"
                    className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#9BA1A6]/60"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="case-id" className="text-[#E6EDF3]">Case ID</Label>
                    <Input
                      id="case-id"
                      type="text"
                      placeholder="Case #"
                      className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#9BA1A6]/60"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="investigator" className="text-[#E6EDF3]">Investigator</Label>
                    <Input
                      id="investigator"
                      type="text"
                      defaultValue="John Doe"
                      className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#9BA1A6]/60"
                    />
                  </div>
                </div>

                {/* Generate Report Button with Dropdown */}
                <div className="pt-4 relative" ref={dropdownRef}>
                  <Button 
                    onClick={handleGenerateReport}
                    className="w-full h-14 bg-[#00BFA5] text-[#E6EDF3] hover:bg-[#03DAC6] flex items-center justify-center gap-2 transition-colors duration-200"
                  >
                    <FileText className="w-5 h-5" />
                    Generate Report
                    <ChevronDown className={`w-4 h-4 ml-auto transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                  </Button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div 
                      className="absolute top-full left-0 w-full mt-2 bg-[#161B22] border border-[#30363D] rounded-lg shadow-xl z-10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                      style={{
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 191, 165, 0.1)'
                      }}
                    >
                      <button
                        onClick={() => {
                          // Handle PDF export
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-3.5 text-left text-[#E6EDF3] hover:bg-[#03DAC6]/20 hover:text-[#03DAC6] transition-all duration-200 flex items-center gap-3"
                      >
                        <Download className="w-5 h-5" />
                        Export as PDF
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports - Right Column */}
          <div className="space-y-6">
            <Card className="bg-[#161B22] border-[#30363D] card-glow">
              <CardHeader>
                <CardTitle className="text-[#E6EDF3]">Recent Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-3 bg-[#0D1117] border border-[#30363D] rounded-lg hover:border-[#00BFA5] transition-all cursor-pointer glow-hover">
                  <p className="text-[#E6EDF3]">Case #2025-001</p>
                  <p className="text-[#9BA1A6]/80">Generated 2 days ago</p>
                </div>
                <div className="p-3 bg-[#0D1117] border border-[#30363D] rounded-lg hover:border-[#00BFA5] transition-all cursor-pointer glow-hover">
                  <p className="text-[#E6EDF3]">Case #2025-002</p>
                  <p className="text-[#9BA1A6]/80">Generated 5 days ago</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/components/ReportsPage.jsx
import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  FileText,
  Download,
  Eye,
  ChevronDown,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { getCases, getUfdrFiles } from "../services/api";

export function ReportsPage() {
  const [cases, setCases] = useState([]);
  const [ufdrFiles, setUfdrFiles] = useState([]);
  const [selectedCase, setSelectedCase] = useState("");
  const [selectedUfdr, setSelectedUfdr] = useState("");
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingUfdrs, setLoadingUfdrs] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  const [toast, setToast] = useState(null);
  const dropdownRef = useRef(null);

  // Load all cases
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await getCases();
        setCases(res || []);
      } catch (e) {
        showToast("Failed to load cases.", "error");
      } finally {
        setLoadingCases(false);
      }
    };
    fetchCases();
  }, []);

  // Load UFDR files for selected case
  const handleCaseSelect = async (caseId) => {
    setSelectedCase(caseId);
    setSelectedUfdr("");
    setUfdrFiles([]);
    setLoadingUfdrs(true);

    try {
      const files = await getUfdrFiles(caseId);
      setUfdrFiles(files || []);
    } catch (e) {
      showToast("Failed to fetch UFDR files.", "error");
    } finally {
      setLoadingUfdrs(false);
    }
  };

  // Toggle dropdown
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

  // Toast helper
  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Generate report (download or preview)
  const handleReportAction = async (mode = "download") => {
    if (!selectedUfdr) {
      showToast("Please select a UFDR file first.", "error");
      return;
    }

    const ufdr = ufdrFiles.find((f) => f.id === selectedUfdr);
    if (!ufdr) {
      showToast("Invalid UFDR file selected.", "error");
      return;
    }

    setGenerating(true);
    setShowDropdown(false);

    const token = localStorage.getItem("cognis_token");
    const url = `http://localhost:8000/api/v1/report/${selectedUfdr}`;

    try {
      const resp = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resp.ok) {
        throw new Error(`Failed (${resp.status})`);
      }

      const blob = await resp.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      if (mode === "preview") {
        window.open(blobUrl, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `Cognis_Report_${ufdr.filename || "Report"}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      setRecentReports((prev) => [
        {
          id: ufdr.id,
          caseId: selectedCase,
          filename: ufdr.filename,
          time: new Date().toLocaleString(),
        },
        ...prev.slice(0, 4),
      ]);

      showToast(
        mode === "preview"
          ? "Preview opened successfully."
          : "Report downloaded successfully.",
        "success"
      );
    } catch (err) {
      console.error(err);
      showToast("Failed to generate report.", "error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto relative">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-5 py-3 rounded-lg text-sm shadow-lg transition-all duration-300 z-50 ${
            toast.type === "success"
              ? "bg-[#00BFA5]/20 border border-[#00BFA5] text-[#00BFA5]"
              : toast.type === "error"
              ? "bg-red-500/20 border border-red-500 text-red-400"
              : "bg-[#161B22] border border-[#30363D] text-[#E6EDF3]"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
            {toast.type === "error" && <XCircle className="w-4 h-4" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="p-14">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[#E6EDF3] mb-2">Generate Reports</h1>
          <p className="text-[#9BA1A6]">
            Export analysis results with customizable sections
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-[#161B22] border-[#30363D] card-glow">
              <CardHeader>
                <CardTitle className="text-[#E6EDF3]">Report Details</CardTitle>
                <CardDescription className="text-[#9BA1A6]">
                  Select case and UFDR file to generate report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Case Dropdown */}
                <div>
                  <Label className="text-[#E6EDF3] mb-2 block">Case</Label>
                  <Select
                    value={selectedCase}
                    onValueChange={handleCaseSelect}
                    disabled={loadingCases}
                  >
                    <SelectTrigger className="w-full bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-12">
                      <SelectValue
                        placeholder={
                          loadingCases
                            ? "Loading cases..."
                            : "Select a case..."
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-[#161B22] border-[#30363D]">
                      {cases.map((c) => (
                        <SelectItem
                          key={c.id}
                          value={c.id}
                          className="text-[#E6EDF3] hover:bg-[#00BFA5]/10"
                        >
                          {c.title || `Case ${c.id.slice(0, 8)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* UFDR Dropdown */}
                {selectedCase && (
                  <div>
                    <Label className="text-[#E6EDF3] mb-2 block">UFDR File</Label>
                    <Select
                      value={selectedUfdr}
                      onValueChange={setSelectedUfdr}
                      disabled={loadingUfdrs}
                    >
                      <SelectTrigger className="w-full bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-12">
                        <SelectValue
                          placeholder={
                            loadingUfdrs
                              ? "Fetching UFDR files..."
                              : "Select UFDR file..."
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-[#161B22] border-[#30363D]">
                        {ufdrFiles.map((f) => (
                          <SelectItem
                            key={f.id}
                            value={f.id}
                            className="text-[#E6EDF3] hover:bg-[#00BFA5]/10"
                          >
                            {f.filename}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Generate Button */}
                <div className="pt-4 relative" ref={dropdownRef}>
                  <Button
                    onClick={handleGenerateReport}
                    disabled={!selectedUfdr || generating}
                    className="w-full h-14 bg-[#00BFA5] text-[#0D1117] hover:bg-[#03DAC6] flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        Generate Report
                        <ChevronDown
                          className={`w-4 h-4 ml-auto transition-transform ${
                            showDropdown ? "rotate-180" : ""
                          }`}
                        />
                      </>
                    )}
                  </Button>

                  {showDropdown && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-[#161B22] border border-[#30363D] rounded-lg shadow-xl z-10 overflow-hidden">
                      <button
                        onClick={() => handleReportAction("download")}
                        className="w-full px-4 py-3 text-left text-[#E6EDF3] hover:bg-[#00BFA5]/10 flex items-center gap-3"
                      >
                        <Download className="w-5 h-5" /> Export as PDF
                      </button>
                      <button
                        onClick={() => handleReportAction("preview")}
                        className="w-full px-4 py-3 text-left text-[#E6EDF3] hover:bg-[#00BFA5]/10 flex items-center gap-3"
                      >
                        <Eye className="w-5 h-5" /> Preview PDF
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports */}
          <div className="space-y-6">
            <Card className="bg-[#161B22] border-[#30363D] card-glow">
              <CardHeader>
                <CardTitle className="text-[#E6EDF3]">Recent Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentReports.length === 0 ? (
                  <p className="text-[#9BA1A6] text-sm">
                    No reports generated yet.
                  </p>
                ) : (
                  recentReports.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 bg-[#0D1117] border border-[#30363D] rounded-lg hover:border-[#00BFA5] transition-all cursor-pointer"
                      onClick={() => handleReportAction("preview", r.id)}
                    >
                      <p className="text-[#E6EDF3]">{r.filename}</p>
                      <p className="text-[#9BA1A6]/80 text-sm">{r.time}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

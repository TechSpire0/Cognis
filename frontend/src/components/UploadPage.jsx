import { useEffect, useState, useRef } from "react";
import { getCurrentUser, getCases, apiGet } from "../services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Upload, FileText, CheckCircle, Loader2, Calendar } from "lucide-react";

/**
 * UploadPage
 * - Real upload to POST /api/v1/ufdr/upload
 * - Live progress bar (per-file)
 * - Recent uploads pulled from GET /api/v1/ufdr/list
 * - Case selection dropdown (investigator required; admin optional)
 *
 * Notes:
 * - Uses XMLHttpRequest for upload progress.
 * - Uses localStorage token keys "cognis_token" or "token" for Authorization.
 */

export function UploadPage() {
  const [user, setUser] = useState(null);
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState("");
  const [recentUploads, setRecentUploads] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loadingUploads, setLoadingUploads] = useState(false);
  const fileInputRef = useRef();

  const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api/v1";

  useEffect(() => {
    async function init() {
      try {
        const [me, myCases] = await Promise.all([getCurrentUser(), getCases()]);
        setUser(me);
        setCases(myCases || []);
        // default selectedCase: for investigators if only one assigned case choose it
        if (me?.role === "investigator" && myCases?.length === 1) {
          setSelectedCase(myCases[0].id);
        }
      } catch (err) {
        console.error("Failed to initialize upload page:", err);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helper: get auth token for XHR
  function getAuthToken() {
    return (
      localStorage.getItem("cognis_token") ||
      localStorage.getItem("token") ||
      ""
    );
  }

  // Add files via input or drop
  function handleFilesSelected(files) {
    const arr = Array.from(files).map((f) => ({
      id: cryptoRandomId(),
      file: f,
      progress: 0,
      status: "queued",
      response: null,
    }));
    setQueue((q) => [...q, ...arr]);
  }

  // Start uploads for all queued items
  async function startUploads() {
    if (!getAuthToken()) {
      alert("You must be logged in to upload files.");
      return;
    }

    // Investigators must select a case
    if (user?.role === "investigator" && !selectedCase) {
      alert(
        "Please select a case before uploading (investigator requirement)."
      );
      return;
    }

    setLoadingUploads(true);
    const queued = queue.filter((q) => q.status === "queued");

    for (const item of queued) {
      await uploadSingle(item);
    }
  }

  // Upload a single file using XMLHttpRequest to capture progress
  function uploadSingle(item) {
    return new Promise((resolve) => {
      const url = `${BASE}/ufdr/upload`;
      const xhr = new XMLHttpRequest();
      const form = new FormData();

      form.append("file", item.file);
      if (selectedCase) form.append("case_id", selectedCase);

      xhr.open("POST", url, true);

      const token = getAuthToken();
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      // On success
      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          let resp = null;
          try {
            resp = JSON.parse(xhr.responseText);
          } catch {
            resp = xhr.responseText;
          }
          setQueue((q) =>
            q.map((x) =>
              x.id === item.id
                ? { ...x, status: "completed", response: resp }
                : x
            )
          );
        } else {
          // error
          let msg = xhr.responseText || `Upload failed (${xhr.status})`;
          setQueue((q) =>
            q.map((x) =>
              x.id === item.id ? { ...x, status: "error", response: msg } : x
            )
          );
        }
        resolve();
      };

      xhr.onerror = () => {
        setQueue((q) =>
          q.map((x) =>
            x.id === item.id
              ? { ...x, status: "error", response: "Network error" }
              : x
          )
        );
        resolve();
      };

      // mark as processing and send
      setQueue((q) =>
        q.map((x) => (x.id === item.id ? { ...x, status: "processing" } : x))
      );
      xhr.send(form);
    });
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length) {
      handleFilesSelected(dt.files);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // small utility to generate short random id for queue items
  function cryptoRandomId() {
    // fallback if crypto not available
    try {
      return crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2, 9);
    } catch {
      return Math.random().toString(36).slice(2, 9);
    }
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="p-14">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[#E6EDF3] mb-2">Upload UFDR Reports</h1>
          <p className="text-[#9BA1A6]">
            Upload and process User Full Device Reports for analysis
          </p>
        </div>

        {/* Case Selection */}
        {cases && cases.length > 0 && (
          <div className="mb-8">
            <Card className="bg-[#161B22]/80 border border-[#30363D] card-glow backdrop-blur-sm">
              <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#00BFA5]/10 flex items-center justify-center flex-shrink-0">
                    <Upload className="w-5 h-5 text-[#00BFA5]" />
                  </div>
                  <div>
                    <h2 className="text-[#E6EDF3] text-lg font-medium">
                      Upload to Case
                    </h2>
                    <p className="text-[#9BA1A6] text-sm">
                      Choose a case before uploading UFDR files
                    </p>
                  </div>
                </div>

                <div className="flex flex-col">
                  <select
                    value={selectedCase}
                    onChange={(e) => setSelectedCase(e.target.value)}
                    className="bg-[#0D1117] border border-[#30363D] text-[#E6EDF3] rounded-md px-4 py-2 w-64 focus:border-[#00BFA5] focus:ring-1 focus:ring-[#00BFA5] transition-all"
                  >
                    <option value="">Select a case</option>
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title || c.id}
                      </option>
                    ))}
                  </select>

                  {user?.role === "investigator" && !selectedCase && (
                    <p className="text-xs text-[#FFB4A2] mt-2"></p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upload Area */}
        <Card className="bg-[#161B22] border-[#30363D] mb-8 card-glow">
          <CardHeader>
            <CardTitle className="text-[#E6EDF3]">Drop Files Here</CardTitle>
            <CardDescription className="text-[#9BA1A6]">
              Supported formats: ZIP (containing XML/CSV/MP4/etc) • Max size:
              500MB per file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed border-[#30363D] rounded-lg p-16 text-center hover:border-[#00BFA5] transition-colors cursor-pointer bg-[#0D1117] glow-hover"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-16 h-16 text-[#00BFA5] mx-auto mb-4" />
              <h3 className="text-[#E6EDF3] mb-2">
                Drag and drop UFDR ZIP files here
              </h3>
              <p className="text-[#9BA1A6] mb-6">
                or click to browse your files
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFilesSelected(e.target.files);
                  e.target.value = "";
                }}
              />
              <Button
                className="bg-[#00BFA5] text-[#0D1117] hover:bg-[#03DAC6]"
                onClick={() => fileInputRef.current?.click()}
              >
                Select Files
              </Button>
            </div>

            <div className="mt-6 p-4 bg-[#00BFA5]/10 border border-[#00BFA5]/30 rounded-lg">
              <h4 className="text-[#E6EDF3] mb-2">Upload Guidelines:</h4>
              <ul className="text-[#9BA1A6] space-y-1 list-disc list-inside text-sm">
                <li>Ensure files are in a supported UFDR ZIP format</li>
                <li>Files will be processed automatically after upload</li>
                <li>
                  Upload and AI analysis typically takes 50-70 seconds per UFDR
                  depending on the file size
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Queue & Controls */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-[#E6EDF3] mb-1">Upload Queue</h2>
            <p className="text-[#9BA1A6] text-sm">Files selected for upload</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="bg-[#00BFA5] text-[#0D1117] hover:bg-[#03DAC6]"
              onClick={startUploads}
              disabled={queue.length === 0 || loadingUploads}
            >
              Start Upload
            </Button>
          </div>
        </div>

        {/* Queue items */}
        <div className="grid gap-6 mb-8">
          {queue.length === 0 ? (
            <p className="text-[#9BA1A6] text-sm">
              No files queued for upload.
            </p>
          ) : (
            queue.map((fileItem) => (
              <Card
                key={fileItem.id}
                className="bg-[#161B22] border-[#30363D] card-glow overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left side: icon + file info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {fileItem.status === "completed"
                        ? "Analyzed"
                        : fileItem.status === "error"
                        ? "Error"
                        : fileItem.status === "processing"
                        ? "Uploading..."
                        : "Queued"}

                      <div className="min-w-0">
                        <p className="text-[#E6EDF3] font-medium truncate max-w-[250px]">
                          {fileItem.file.name}
                        </p>
                      </div>
                    </div>

                    {/* Right side: status or button */}
                    <div className="flex flex-col items-end">
                      <div
                        className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                          fileItem.status === "completed"
                            ? "bg-[#00BFA5]/20 text-[#00BFA5]"
                            : fileItem.status === "error"
                            ? "bg-[#FFB4A2]/20 text-[#FF5252]"
                            : "bg-transparent text-transparent"
                        }`}
                      ></div>

                      {fileItem.status === "error" && (
                        <p className="text-[#FFB4A2] text-xs mt-2 max-w-[200px] text-right">
                          Upload failed — {String(fileItem.response)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Recent Uploads (live from backend) */}
        <div className="mb-4">
          <h2 className="text-[#E6EDF3] mb-2">Recent Uploads</h2>
          <p className="text-[#9BA1A6] text-sm mb-4">
            {recentUploads.length} most recent uploads
          </p>
        </div>

        <div className="grid gap-6">
          {recentUploads.length === 0 ? (
            <p className="text-[#9BA1A6]">No recent uploads found.</p>
          ) : (
            recentUploads.map((file, idx) => (
              <Card
                key={file.id}
                className="bg-[#161B22] border-[#30363D] card-glow"
              >
                <CardContent>
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-[#E6EDF3]">{file.filename}</p>
                      <p className="text-[#9BA1A6] text-xs">
                        {file.uploaded_at
                          ? new Date(file.uploaded_at).toLocaleString("en-IN")
                          : "—"}
                      </p>
                      {file.case_id && (
                        <p className="text-[#9BA1A6] text-xs mt-1">
                          Case: {file.case_id}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Upload, FileText, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Progress } from "./ui/progress";

export function UploadPage() {
  const [recentUploads] = useState([
    { id: 1, name: "UFDR_2025_001.xml", size: "2.4 MB", status: "completed", progress: 100, uploadedAt: "2 min ago" },
    { id: 2, name: "UFDR_2025_002.xml", size: "3.1 MB", status: "processing", progress: 67, uploadedAt: "5 min ago" },
    { id: 3, name: "UFDR_2025_003.xml", size: "1.8 MB", status: "processing", progress: 34, uploadedAt: "8 min ago" },
  ]);

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="p-14">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[#E6EDF3] mb-2">Upload UFDR Reports</h1>
          <p className="text-[#9BA1A6]">Upload and process User Full Device Reports for analysis</p>
        </div>

        {/* Upload Area */}
        <Card className="bg-[#161B22] border-[#30363D] mb-8 card-glow">
          <CardHeader>
            <CardTitle className="text-[#E6EDF3]">Drop Files Here</CardTitle>
            <CardDescription className="text-[#9BA1A6]">
              Supported formats: XML, JSON, CSV • Max size: 500MB per file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-[#30363D] rounded-lg p-16 text-center hover:border-[#00BFA5] transition-colors cursor-pointer bg-[#0D1117] glow-hover">
              <Upload className="w-16 h-16 text-[#00BFA5] mx-auto mb-4" />
              <h3 className="text-[#E6EDF3] mb-2">Drag and drop UFDR files here</h3>
              <p className="text-[#9BA1A6] mb-6">or click to browse your files</p>
              <Button className="bg-[#00BFA5] text-[#0D1117] hover:bg-[#03DAC6]">
                Select Files
              </Button>
            </div>

            <div className="mt-6 p-4 bg-[#00BFA5]/10 border border-[#00BFA5]/30 rounded-lg">
              <h4 className="text-[#E6EDF3] mb-2">Upload Guidelines:</h4>
              <ul className="text-[#9BA1A6] space-y-1 list-disc list-inside text-sm">
                <li>Ensure files are in standard UFDR XML format</li>
                <li>Files will be processed automatically after upload</li>
                <li>AI analysis typically takes 2-5 minutes per report</li>
                <li>You'll receive notifications when processing is complete</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Recent Uploads */}
        <div className="mb-4">
          <h2 className="text-[#E6EDF3] mb-4">Recent Uploads</h2>
          <p className="text-[#9BA1A6] text-sm mb-6">3 most recent file uploads</p>
        </div>

        <div className="grid gap-6">
          {recentUploads.map((file) => (
            <Card key={file.id} className="bg-[#161B22] border-[#30363D] card-glow overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      file.status === "completed" 
                        ? "bg-[#00BFA5]/10 border border-[#00BFA5]" 
                        : "bg-[#6C63FF]/10 border border-[#6C63FF]"
                    }`}>
                      {file.status === "completed" ? (
                        <CheckCircle className="w-6 h-6 text-[#00BFA5]" />
                      ) : (
                        <Loader2 className="w-6 h-6 text-[#6C63FF] animate-spin" />
                      )}
                    </div>

                    {/* File Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-[#E6EDF3] mb-1">{file.name}</p>
                          <p className="text-[#9BA1A6] text-sm">{file.size} • {file.uploadedAt}</p>
                        </div>

                        {/* Status Badge */}
                        <div className={`px-3 py-1 rounded-full text-xs flex items-center gap-2 ${
                          file.status === "completed"
                            ? "bg-[#00BFA5]/20 text-[#00BFA5]"
                            : "bg-[#6C63FF]/20 text-[#6C63FF]"
                        }`}>
                          {file.status === "completed" ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Analyzed
                            </>
                          ) : (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Processing
                            </>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {file.status === "processing" && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[#9BA1A6] text-sm">Analyzing... {file.progress}%</p>
                          </div>
                          <Progress value={file.progress} className="h-2" />
                        </div>
                      )}

                      {/* Action Buttons */}
                      {file.status === "completed" && (
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" className="bg-[#00BFA5] text-[#0D1117] hover:bg-[#03DAC6]">
                            View Report
                          </Button>
                          <Button size="sm" variant="outline" className="border-[#30363D] text-[#E6EDF3] hover:bg-[#161B22] hover:border-[#6C63FF]">
                            Download
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Full-width Progress Bar at Bottom */}
                {file.status === "processing" && (
                  <div className="relative h-1 bg-[#30363D] overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-[#6C63FF] transition-all duration-300" style={{ width: `${file.progress}%` }} />
                  </div>
                )}
                {file.status === "completed" && (
                  <div className="relative h-1 bg-[#00BFA5]/20 overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-full bg-[#00BFA5]" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

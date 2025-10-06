// src/components/LandingUpload.jsx
import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import api from "../services/api"; // <-- axios instance with baseURL=http://localhost:8000

export function LandingUpload({ onUpload, addAuditLog }) {
  const [dragActive, setDragActive] = useState(false);
  const [recentIngestions, setRecentIngestions] = useState([]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    // Add token from login
    const token = localStorage.getItem("token");
    console.log("Token being sent:", token);
    // Show initial "Processing" state
    const newIngestion = {
      id: Date.now(),
      name: file.name,
      status: "Processing",
      uploadTime: new Date().toLocaleString(),
    };
    setRecentIngestions([newIngestion, ...recentIngestions.slice(0, 2)]);

    try {
      const response = await api.post("/ufdr/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });



      addAuditLog("File Uploaded", `${file.name} uploaded successfully`);
      onUpload(response.data);

      // Mark as Complete
      setRecentIngestions((prev) =>
        prev.map((item) =>
          item.id === newIngestion.id ? { ...item, status: "Complete" } : item
        )
      );
    } catch (error) {
      console.error("Upload failed:", error.response || error.message);
      addAuditLog("File Upload Failed", file.name);

      setRecentIngestions((prev) =>
        prev.map((item) =>
          item.id === newIngestion.id ? { ...item, status: "Error" } : item
        )
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Complete":
        return "bg-green-600";
      case "Processing":
        return "bg-yellow-600";
      case "Error":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    
    <div className="p-8 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">UFDR Data Ingestion</h1>
        <p className="text-muted-foreground">
          Upload forensic data files for analysis and processing
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Zone */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div
              className={`h-full border-2 border-dashed rounded-lg transition-all duration-200 flex flex-col items-center justify-center p-8 ${
                dragActive
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-border hover:border-blue-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-xl mb-2">Drop UFDR files here</h3>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop your forensic data files or click to browse
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <Badge variant="outline">.zip</Badge>
                    <Badge variant="outline">.xml</Badge>
                    <Badge variant="outline">.csv</Badge>
                  </div>
                </div>

                <Button
                  onClick={() => document.getElementById("fileInput").click()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Browse Files
                </Button>

                <input
                  id="fileInput"
                  type="file"
                  accept=".zip,.xml,.csv"
                  onChange={(e) =>
                    e.target.files[0] && handleFileUpload(e.target.files[0])
                  }
                  className="hidden"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Ingestions */}
        <div>
          <Card className="h-full p-6">
            <h3 className="mb-4">Recent Ingestions</h3>
            <div className="space-y-4">
              {recentIngestions.map((ingestion) => (
                <div
                  key={ingestion.id}
                  className="border border-border rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm truncate">{ingestion.name}</p>
                    <Badge
                      className={`text-white ${getStatusColor(
                        ingestion.status
                      )}`}
                    >
                      {ingestion.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {ingestion.uploadTime}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <svg
                  className="w-4 h-4 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Supported formats: UFDR packages, mobile extractions,
                  communication logs
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

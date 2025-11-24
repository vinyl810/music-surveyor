"use client";

import { useEffect, useState } from "react";

interface SubmissionData {
  filename: string;
  timestamp: string;
  data: Record<string, Record<string, string | number>>;
}

export default function ResultPage() {
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<number>(0);

  useEffect(() => {
    fetch("/api/results")
      .then((res) => res.json())
      .then((data) => {
        setSubmissions(data.submissions || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load results:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-200">Loading results...</div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-400">No submissions found</div>
      </div>
    );
  }

  const currentSubmission = submissions[selectedSubmission];
  const trackIds = Object.keys(currentSubmission.data).sort((a, b) => Number(a) - Number(b));

  // Get all unique question IDs across all tracks
  const allQuestionIds = new Set<string>();
  trackIds.forEach(trackId => {
    Object.keys(currentSubmission.data[trackId]).forEach(qId => {
      allQuestionIds.add(qId);
    });
  });
  const questionIds = Array.from(allQuestionIds).sort();

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-[95vw] mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-4">
          <h1 className="text-2xl font-bold mb-4 text-white">Survey Results</h1>

          {/* Submission Selector */}
          <div className="flex items-center gap-4">
            <label className="font-medium text-gray-200">Select Submission:</label>
            <select
              value={selectedSubmission}
              onChange={(e) => setSelectedSubmission(Number(e.target.value))}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 min-w-[300px] text-gray-200"
            >
              {submissions.map((sub, idx) => (
                <option key={idx} value={idx}>
                  {sub.filename} - {sub.timestamp}
                </option>
              ))}
            </select>
            <div className="text-sm text-gray-400">
              Total: {submissions.length} submission{submissions.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-700 text-white">
                  <th className="border border-gray-600 px-4 py-2 sticky left-0 bg-gray-700 z-10">
                    Track ID
                  </th>
                  {questionIds.map((qId) => (
                    <th key={qId} className="border border-gray-600 px-4 py-2 min-w-[120px]">
                      {qId}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trackIds.map((trackId, idx) => (
                  <tr
                    key={trackId}
                    className={idx % 2 === 0 ? "bg-gray-800" : "bg-gray-700"}
                  >
                    <td className="border border-gray-600 px-4 py-2 font-semibold sticky left-0 bg-inherit text-gray-200">
                      {trackId}
                    </td>
                    {questionIds.map((qId) => {
                      const value = currentSubmission.data[trackId]?.[qId];
                      return (
                        <td
                          key={qId}
                          className="border border-gray-600 px-4 py-2 text-center text-gray-200"
                        >
                          {value !== undefined ? value : "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Download Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              const dataStr = JSON.stringify(currentSubmission.data, null, 2);
              const dataBlob = new Blob([dataStr], { type: "application/json" });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement("a");
              link.href = url;
              link.download = currentSubmission.filename;
              link.click();
              URL.revokeObjectURL(url);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow"
          >
            Download JSON
          </button>
        </div>
      </div>
    </div>
  );
}

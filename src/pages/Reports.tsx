import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../components/ui';
import { FileSpreadsheet, Download, RefreshCw, Bot } from 'lucide-react';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

export default function Reports() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const fetchDriveFiles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/drive/files');
      if (!response.ok) {
        throw new Error('Failed to fetch files from Google Drive. Ensure you have authorized the app.');
      }
      const data = await response.json();
      setFiles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriveFiles();
  }, []);

  const handleAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponse('');
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiQuery })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get AI response');
      setAiResponse(data.text);
    } catch (err: any) {
      setAiResponse(`Error: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Reports & Insights</h1>
        <Button onClick={fetchDriveFiles} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Drive Files
        </Button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Google Drive Imports</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <div className="text-center py-8 text-slate-500">Loading files from Drive...</div>}
            {!loading && files.length === 0 && !error && (
              <div className="text-center py-8 text-slate-500">
                <FileSpreadsheet className="h-12 w-12 mx-auto text-slate-300 mb-2" />
                <p>No spreadsheets found in your Google Drive.</p>
              </div>
            )}
            {!loading && files.length > 0 && (
              <ul className="divide-y divide-slate-200">
                {files.map((file) => (
                  <li key={file.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <FileSpreadsheet className="h-6 w-6 text-emerald-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{file.name}</p>
                        <p className="text-xs text-slate-500">ID: {file.id}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="h-8 px-3 text-xs">
                      Import Data
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-slate-900 text-white rounded-t-lg">
            <CardTitle className="flex items-center">
              <Bot className="h-5 w-5 text-indigo-400 mr-2" />
              Advanced Analytics (Thinking Mode)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 mb-4">
              Ask complex queries about driver performance, predictive stock alerts, or financial reconciliations. Powered by Gemini Pro with high thinking mode.
            </p>
            <form onSubmit={handleAiQuery} className="space-y-4">
              <textarea
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="w-full rounded-md border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                placeholder="e.g., Analyze the expected driver churn rate based on current idle metrics and suggest retention strategies..."
                disabled={aiLoading}
              />
              <Button type="submit" disabled={aiLoading || !aiQuery.trim()} className="w-full">
                {aiLoading ? 'Thinking deeply...' : 'Analyze'}
              </Button>
            </form>

            {aiResponse && (
              <div className="mt-6 p-4 rounded-md bg-slate-50 border border-slate-200">
                <div className="prose prose-sm prose-slate max-w-none whitespace-pre-wrap">
                  {aiResponse}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

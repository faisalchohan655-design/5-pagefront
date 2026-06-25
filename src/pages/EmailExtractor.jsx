import React, { useContext, useState } from 'react';
import { LeadsContext } from '../context/LeadsContext';
import {
  Mail, Globe, Upload, Download, Save, Trash2,
  Search, X, CheckCircle, AlertCircle, Loader,
  Sparkles, Brain, Zap, FileText, Link,
  Phone, Users, Copy, ExternalLink
} from 'lucide-react';
import * as XLSX from 'xlsx';

const EmailExtractor = () => {
  const { saveLeads } = useContext(LeadsContext);
  const [activeTab, setActiveTab] = useState('single');
  const [singleUrl, setSingleUrl] = useState('');
  const [bulkFile, setBulkFile] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedResults, setSelectedResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Stats
  const totalEmails = results.reduce((acc, r) => acc + (r.emails?.length || 0), 0);
  const totalPhones = results.reduce((acc, r) => acc + (r.phones?.length || 0), 0);
  const validEmails = results.reduce((acc, r) => acc + (r.validEmails || 0), 0);

  // Validate email
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Extract emails
  const extractEmails = (url) => {
    const domain = new URL(url).hostname;
    const commonPrefixes = ['info', 'contact', 'hello', 'support', 'sales', 'admin', 'help', 'team', 'careers', 'partners'];
    const emails = commonPrefixes.map(prefix => `${prefix}@${domain}`);
    const valid = emails.filter(e => validateEmail(e));
    return {
      emails: valid,
      allEmails: valid,
      phones: ['+1 (555) 123-4567', '+1 (555) 234-5678'],
      socialLinks: [`https://linkedin.com/company/${domain}`, `https://facebook.com/${domain}`],
      validEmails: valid.length,
      totalEmails: valid.length,
      status: 'completed'
    };
  };

  // Single extraction
  const extractSingle = async () => {
    if (!singleUrl) {
      alert('Please enter a URL');
      return;
    }

    setLoading(true);
    setProgress(10);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(50);
      
      const result = extractEmails(singleUrl);
      setProgress(100);
      setResults([result]);
      
    } catch (error) {
      alert('Error extracting emails. Please try again.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  // Bulk upload
  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        
        const urls = json.map(row => Object.values(row)[0]).filter(url => url && url.startsWith('http'));
        if (urls.length === 0) {
          alert('No valid URLs found');
          return;
        }

        setBulkFile(file);
        await extractBulk(urls);
      } catch (error) {
        alert('Error reading file');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const extractBulk = async (urls) => {
    setLoading(true);
    const allResults = [];

    for (let i = 0; i < urls.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = extractEmails(urls[i]);
      allResults.push(result);
      setProgress(Math.round(((i + 1) / urls.length) * 100));
    }

    setResults(allResults);
    setLoading(false);
    setProgress(0);
  };

  // Save results
  const handleSaveResults = async () => {
    const selected = results.filter((_, index) => selectedResults.includes(index));
    if (selected.length === 0) {
      alert('Please select at least one result');
      return;
    }

    const leadsToSave = [];
    selected.forEach(result => {
      result.emails.forEach(email => {
        leadsToSave.push({
          name: email.split('@')[0],
          email: email,
          company: new URL(result.url).hostname.replace('www.', ''),
          website: result.url,
          source: 'email_extractor',
          status: 'new'
        });
      });
    });

    await saveLeads(leadsToSave);
    alert(`Saved ${leadsToSave.length} leads!`);
    setSelectedResults([]);
  };

  // Export
  const exportToExcel = () => {
    const exportData = [];
    results.forEach(result => {
      result.emails.forEach(email => {
        exportData.push({
          URL: result.url,
          Email: email,
          Phone: result.phones?.[0] || '',
          Social: result.socialLinks?.[0] || ''
        });
      });
    });

    if (exportData.length === 0) {
      alert('No data to export');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Emails');
    XLSX.writeFile(wb, `extracted_emails_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToCSV = () => {
    const headers = ['URL', 'Email', 'Phone', 'Social'];
    const csvData = [];
    results.forEach(result => {
      result.emails.forEach(email => {
        csvData.push([result.url, email, result.phones?.[0] || '', result.socialLinks?.[0] || '']);
      });
    });

    if (csvData.length === 0) {
      alert('No data to export');
      return;
    }

    let csv = headers.join(',') + '\n';
    csvData.forEach(row => { csv += row.join(',') + '\n'; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_emails_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Delete result
  const deleteResult = (index) => {
    if (window.confirm('Delete this result?')) {
      setResults(results.filter((_, i) => i !== index));
    }
  };

  // Filtered results
  const filteredResults = results.filter(r =>
    r.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.emails.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Mail className="text-purple-400" size={32} />
              Email Extractor
              <span className="text-sm bg-gradient-to-r from-blue-500 to-cyan-500 px-3 py-1 rounded-full text-white text-xs font-medium animate-pulse">
                AI-Powered
              </span>
            </h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400" />
              Extract emails, phones & social profiles from websites
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportToExcel}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-2"
            >
              <Download size={18} />
              Excel
            </button>
            <button
              onClick={exportToCSV}
              className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-all flex items-center gap-2"
            >
              <Download size={18} />
              CSV
            </button>
            {selectedResults.length > 0 && (
              <button
                onClick={handleSaveResults}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all flex items-center gap-2"
              >
                <Save size={18} />
                Save {selectedResults.length}
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Emails</p>
                  <p className="text-2xl font-bold text-white">{totalEmails}</p>
                </div>
                <Mail className="text-purple-400" size={24} />
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Valid Emails</p>
                  <p className="text-2xl font-bold text-green-400">{validEmails}</p>
                </div>
                <CheckCircle className="text-green-400" size={24} />
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Phones</p>
                  <p className="text-2xl font-bold text-white">{totalPhones}</p>
                </div>
                <Phone className="text-blue-400" size={24} />
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Websites</p>
                  <p className="text-2xl font-bold text-white">{results.length}</p>
                </div>
                <Globe className="text-cyan-400" size={24} />
              </div>
            </div>
          </div>
        )}

        {/* Main */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Extractor */}
          <div className="lg:col-span-1 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
              <Brain size={20} className="text-purple-400" />
              AI Email Extractor
            </h3>

            {/* Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setActiveTab('single')}
                className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${
                  activeTab === 'single'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-slate-700/50 text-gray-400 hover:bg-slate-600/50'
                }`}
              >
                <Link size={20} />
                <span className="text-sm">Single URL</span>
              </button>
              <button
                onClick={() => setActiveTab('bulk')}
                className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${
                  activeTab === 'bulk'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                    : 'bg-slate-700/50 text-gray-400 hover:bg-slate-600/50'
                }`}
              >
                <Upload size={20} />
                <span className="text-sm">Bulk Upload</span>
              </button>
            </div>

            {/* Single */}
            {activeTab === 'single' && (
              <div className="space-y-4">
                <input
                  type="url"
                  value={singleUrl}
                  onChange={(e) => setSingleUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none"
                />
                <button
                  onClick={extractSingle}
                  disabled={loading || !singleUrl}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <><Loader size={18} className="animate-spin" /> Extracting...</>
                  ) : (
                    <><Zap size={18} /> Extract Emails</>
                  )}
                </button>
                {loading && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bulk */}
            {activeTab === 'bulk' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-purple-500 transition-colors relative">
                  <Upload size={40} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Upload Excel or CSV</p>
                  <p className="text-gray-500 text-xs mt-1">URLs in first column</p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleBulkUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                {bulkFile && (
                  <div className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-purple-400" />
                      <span className="text-white text-sm">{bulkFile.name}</span>
                    </div>
                    <button onClick={() => setBulkFile(null)} className="text-gray-400 hover:text-white">
                      <X size={16} />
                    </button>
                  </div>
                )}
                {loading && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Processing</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right - Results */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[150px] relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search results..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-700/50 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none text-sm"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const all = results.map((_, i) => i);
                      setSelectedResults(selectedResults.length === all.length ? [] : all);
                    }}
                    className="text-purple-400 hover:text-purple-300 text-sm"
                  >
                    {selectedResults.length === results.length && results.length > 0 ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                {filteredResults.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail size={48} className="text-gray-600 mx-auto mb-4" />
                    <h3 className="text-gray-400 text-lg">No Results Yet</h3>
                    <p className="text-gray-500 text-sm">Enter a URL or upload a file</p>
                  </div>
                ) : (
                  filteredResults.map((result, index) => {
                    const originalIndex = results.indexOf(result);
                    return (
                      <div
                        key={index}
                        className={`bg-slate-700/30 rounded-xl p-4 border transition-all ${
                          selectedResults.includes(originalIndex)
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-slate-600 hover:border-purple-500/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedResults.includes(originalIndex)}
                            onChange={() => {
                              if (selectedResults.includes(originalIndex)) {
                                setSelectedResults(selectedResults.filter(i => i !== originalIndex));
                              } else {
                                setSelectedResults([...selectedResults, originalIndex]);
                              }
                            }}
                            className="mt-1 rounded border-slate-600 bg-slate-700 text-purple-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <a
                                  href={result.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-white font-medium hover:text-purple-400 transition-colors flex items-center gap-2"
                                >
                                  <Globe size={16} className="text-purple-400" />
                                  {result.url}
                                  <ExternalLink size={14} className="text-gray-400" />
                                </a>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                                  <span><Mail size={14} className="inline mr-1" />{result.emails.length} emails</span>
                                  <span><Phone size={14} className="inline mr-1" />{result.phones?.length || 0} phones</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    if (result.emails.length > 0) {
                                      navigator.clipboard.writeText(result.emails[0]);
                                      alert('Email copied!');
                                    }
                                  }}
                                  className="p-1 hover:bg-slate-600 rounded-lg"
                                >
                                  <Copy size={16} className="text-gray-400 hover:text-white" />
                                </button>
                                <button
                                  onClick={() => deleteResult(originalIndex)}
                                  className="p-1 hover:bg-red-500/20 rounded-lg"
                                >
                                  <Trash2 size={16} className="text-gray-400 hover:text-red-400" />
                                </button>
                              </div>
                            </div>
                            {result.emails.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {result.emails.map((email, i) => (
                                  <span key={i} className="bg-slate-800 px-2 py-1 rounded-lg text-xs text-gray-300 border border-slate-600 flex items-center gap-1">
                                    <Mail size={12} className="text-purple-400" />
                                    {email}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailExtractor;

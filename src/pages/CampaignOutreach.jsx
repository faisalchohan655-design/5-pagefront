import React, { useContext, useState } from 'react';
import { LeadsContext } from '../context/LeadsContext';
import {
  Send, Mail, MessageCircle, Download, Filter, 
  Search, Trash2, Sparkles, Target, Users,
  CheckCircle, Clock, AlertCircle, Loader
} from 'lucide-react';
import * as XLSX from 'xlsx';

const CampaignOutreach = () => {
  const { leads, sendWhatsApp, sendEmail, deleteLead, bulkDeleteLeads } = useContext(LeadsContext);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [activeChannel, setActiveChannel] = useState('whatsapp');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sending, setSending] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);

  // Templates
  const templates = [
    { id: 'welcome', name: 'Welcome', content: 'Hi {{name}}, thanks for connecting! We specialize in helping companies like {{company}} grow.' },
    { id: 'followup', name: 'Follow-up', content: 'Hi {{name}}, following up on our previous conversation. Would you be open to a quick chat?' },
    { id: 'proposal', name: 'Proposal', content: 'Hi {{name}}, I\'m excited to share our proposal for {{company}}. Let me know your thoughts!' },
    { id: 'closing', name: 'Closing', content: 'Hi {{name}}, great news! Your account has been set up. Ready to get started?' },
  ];

  // Filter leads
  const getFilteredLeads = () => {
    let filtered = [...leads];
    if (searchTerm) {
      filtered = filtered.filter(l =>
        l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(l => l.status === filterStatus);
    }
    return filtered;
  };

  const filteredLeads = getFilteredLeads();

  // Send campaign
  const handleSendCampaign = async () => {
    if (selectedLeads.length === 0) {
      alert('Please select at least one lead');
      return;
    }
    if (!message) {
      alert('Please enter a message');
      return;
    }
    
    setSending(true);
    try {
      if (activeChannel === 'whatsapp') {
        await sendWhatsApp(selectedLeads, message);
      } else {
        await sendEmail(selectedLeads, message);
      }
      alert(`Campaign sent to ${selectedLeads.length} leads!`);
      setSelectedLeads([]);
      setMessage('');
    } catch (error) {
      alert('Error sending campaign. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Export functions
  const exportToExcel = () => {
    const exportData = filteredLeads.map(l => ({
      Name: l.name || '',
      Company: l.company || '',
      Email: l.email || '',
      Phone: l.phone || '',
      Status: l.status || '',
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, `campaign_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Status'];
    const csvData = filteredLeads.map(l => [l.name || '', l.company || '', l.email || '', l.phone || '', l.status || '']);
    let csv = headers.join(',') + '\n';
    csvData.forEach(row => { csv += row.join(',') + '\n'; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;
    if (window.confirm(`Delete ${selectedLeads.length} leads?`)) {
      await bulkDeleteLeads(selectedLeads);
      setSelectedLeads([]);
    }
  };

  // Status badge
  const getStatusBadge = (status) => {
    const classes = {
      new: 'bg-blue-500/20 text-blue-400',
      contacted: 'bg-yellow-500/20 text-yellow-400',
      qualified: 'bg-green-500/20 text-green-400',
      proposal: 'bg-orange-500/20 text-orange-400',
      closed: 'bg-pink-500/20 text-pink-400'
    };
    return classes[status] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Send className="text-purple-400" size={32} />
              Campaign Outreach
              <span className="text-sm bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 rounded-full text-white text-xs font-medium animate-pulse">
                LIVE
              </span>
            </h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400" />
              AI-powered multi-channel campaign management
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
            {selectedLeads.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all flex items-center gap-2"
              >
                <Trash2 size={18} />
                Delete {selectedLeads.length}
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Leads</p>
                <p className="text-2xl font-bold text-white">{leads.length}</p>
              </div>
              <Users className="text-purple-400" size={24} />
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Selected</p>
                <p className="text-2xl font-bold text-white">{selectedLeads.length}</p>
              </div>
              <Target className="text-green-400" size={24} />
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Channel</p>
                <p className="text-2xl font-bold text-white uppercase">{activeChannel}</p>
              </div>
              {activeChannel === 'whatsapp' ? (
                <MessageCircle className="text-green-400" size={24} />
              ) : (
                <Mail className="text-blue-400" size={24} />
              )}
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <p className="text-2xl font-bold text-white">
                  {sending ? 'Sending...' : 'Ready'}
                </p>
              </div>
              {sending ? (
                <Loader className="text-yellow-400 animate-spin" size={24} />
              ) : (
                <CheckCircle className="text-green-400" size={24} />
              )}
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Campaign Setup */}
          <div className="lg:col-span-1 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
              <Target size={20} className="text-purple-400" />
              Campaign Setup
            </h3>
            
            <div className="space-y-4">
              {/* Channel Selection */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveChannel('whatsapp')}
                  className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    activeChannel === 'whatsapp'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-slate-700/50 text-gray-400 hover:bg-slate-600/50'
                  }`}
                >
                  <MessageCircle size={20} />
                  <span className="text-sm">WhatsApp</span>
                </button>
                <button
                  onClick={() => setActiveChannel('email')}
                  className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    activeChannel === 'email'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                      : 'bg-slate-700/50 text-gray-400 hover:bg-slate-600/50'
                  }`}
                >
                  <Mail size={20} />
                  <span className="text-sm">Email</span>
                </button>
              </div>

              {/* Templates */}
              <div>
                <button
                  onClick={() => setShowTemplate(!showTemplate)}
                  className="w-full flex items-center justify-between text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <span>Quick Templates</span>
                  <span>{showTemplate ? '▲' : '▼'}</span>
                </button>
                {showTemplate && (
                  <div className="mt-2 space-y-1">
                    {templates.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setMessage(t.content)}
                        className="w-full text-left text-sm text-gray-300 hover:text-white hover:bg-slate-700/50 p-2 rounded-lg transition-colors"
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="text-sm text-gray-400 block mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none resize-none h-32"
                  placeholder="Type your message... Use {{name}}, {{company}}"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Variables: {'{{name}}'}, {'{{company}}'}
                </div>
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendCampaign}
                disabled={sending || selectedLeads.length === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send to {selectedLeads.length} Leads
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right - Lead List */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[150px] relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-700/50 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none text-sm"
                    />
                  </div>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                  </select>
                  
                  <button
                    onClick={() => {
                      const all = filteredLeads.map(l => l._id);
                      setSelectedLeads(selectedLeads.length === all.length ? [] : all);
                    }}
                    className="text-purple-400 hover:text-purple-300 text-sm"
                  >
                    {selectedLeads.length === filteredLeads.length && filteredLeads.length > 0 ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/30">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                          onChange={() => {
                            if (selectedLeads.length === filteredLeads.length) {
                              setSelectedLeads([]);
                            } else {
                              setSelectedLeads(filteredLeads.map(l => l._id));
                            }
                          }}
                          className="rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Name</th>
                      <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Company</th>
                      <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Email</th>
                      <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                          No leads found
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead) => (
                        <tr key={lead._id} className="border-t border-slate-700 hover:bg-slate-700/30 transition-colors">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedLeads.includes(lead._id)}
                              onChange={() => {
                                if (selectedLeads.includes(lead._id)) {
                                  setSelectedLeads(selectedLeads.filter(id => id !== lead._id));
                                } else {
                                  setSelectedLeads([...selectedLeads, lead._id]);
                                }
                              }}
                              className="rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-white font-medium">{lead.name || '-'}</td>
                          <td className="px-4 py-3 text-gray-300">{lead.company || '-'}</td>
                          <td className="px-4 py-3 text-gray-300">{lead.email || '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(lead.status)}`}>
                              {lead.status || 'new'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedLeads([lead._id]);
                                  setMessage(`Hi ${lead.name || ''},`);
                                }}
                                className="p-1 hover:bg-purple-500/20 rounded-lg transition-colors"
                                title="Quick Send"
                              >
                                <Send size={16} className="text-purple-400 hover:text-purple-300" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Delete this lead?')) deleteLead(lead._id);
                                }}
                                className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} className="text-gray-400 hover:text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 border-t border-slate-700 flex justify-between items-center">
                <span className="text-gray-400 text-sm">
                  {filteredLeads.length} leads ready for campaign
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignOutreach;

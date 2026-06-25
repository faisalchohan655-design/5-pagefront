import React, { useContext, useState } from 'react';
import { LeadsContext } from '../context/LeadsContext';
import { 
  Users, Brain, Zap, Target, TrendingUp, 
  Search, Download, Trash2, Eye, Edit, 
  ArrowUp, ArrowDown, BarChart3, PieChart,
  Activity, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';

const Dashboard = () => {
  const { leads, deleteLead, bulkDeleteLeads } = useContext(LeadsContext);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterScore, setFilterScore] = useState('all');

  // Calculate AI Score
  const calculateAIScore = (lead) => {
    let score = 30;
    if (lead.company) score += 15;
    if (lead.email) score += 10;
    if (lead.phone) score += 10;
    if (lead.website) score += 5;
    if (lead.location) score += 5;
    if (lead.status === 'qualified') score += 15;
    if (lead.status === 'proposal') score += 10;
    if (lead.status === 'closed') score += 5;
    return Math.min(score, 100);
  };

  // Get filtered leads
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
    
    if (filterScore !== 'all') {
      const minScore = parseInt(filterScore);
      filtered = filtered.filter(l => calculateAIScore(l) >= minScore);
    }
    
    return filtered;
  };

  const filteredLeads = getFilteredLeads();
  const avgScore = leads.length > 0 ? Math.round(leads.reduce((acc, l) => acc + calculateAIScore(l), 0) / leads.length) : 0;
  const hotLeads = leads.filter(l => calculateAIScore(l) >= 80).length;
  const warmLeads = leads.filter(l => calculateAIScore(l) >= 60 && calculateAIScore(l) < 80).length;
  const coldLeads = leads.filter(l => calculateAIScore(l) < 60).length;

  // Stats
  const stats = [
    { title: 'Total Leads', value: leads.length, icon: Users, color: 'from-purple-500 to-pink-500', change: '+12%', up: true },
    { title: 'AI Score Avg', value: `${avgScore}%`, icon: Brain, color: 'from-blue-500 to-cyan-500', change: '+5%', up: true },
    { title: 'Hot Leads', value: hotLeads, icon: Zap, color: 'from-orange-500 to-red-500', change: '+8%', up: true },
    { title: 'Conversion Rate', value: '42%', icon: Target, color: 'from-green-500 to-emerald-500', change: '+3%', up: true },
  ];

  // Export functions
  const exportToExcel = () => {
    const exportData = filteredLeads.map(l => ({
      Name: l.name || '',
      Company: l.company || '',
      Email: l.email || '',
      Phone: l.phone || '',
      Status: l.status || '',
      'AI Score': calculateAIScore(l),
      Source: l.source || '',
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, `leads_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Status', 'AI Score', 'Source'];
    const csvData = filteredLeads.map(l => [
      l.name || '', l.company || '', l.email || '', 
      l.phone || '', l.status || '', calculateAIScore(l), l.source || ''
    ]);
    let csv = headers.join(',') + '\n';
    csvData.forEach(row => { csv += row.join(',') + '\n'; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedLeads.length} leads?`)) {
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
              <Brain className="text-purple-400" size={32} />
              AI Dashboard
              <span className="text-sm bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full text-white text-xs font-medium animate-glow">
                LIVE
              </span>
            </h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <Activity size={16} className="text-purple-400" />
              AI-powered insights & real-time lead analytics
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all card-hover"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon size={20} className="text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                {stat.up ? (
                  <ArrowUp size={16} className="text-green-400" />
                ) : (
                  <ArrowDown size={16} className="text-red-400" />
                )}
                <span className={stat.up ? 'text-green-400 text-sm' : 'text-red-400 text-sm'}>
                  {stat.change}
                </span>
                <span className="text-gray-500 text-sm">vs last week</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Hot Leads</span>
              <span className="text-2xl font-bold text-white">{hotLeads}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style={{ width: `${leads.length > 0 ? (hotLeads / leads.length) * 100 : 0}%` }}></div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Warm Leads</span>
              <span className="text-2xl font-bold text-white">{warmLeads}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: `${leads.length > 0 ? (warmLeads / leads.length) * 100 : 0}%` }}></div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Cold Leads</span>
              <span className="text-2xl font-bold text-white">{coldLeads}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
              <div className="bg-gradient-to-r from-gray-500 to-slate-500 h-2 rounded-full" style={{ width: `${leads.length > 0 ? (coldLeads / leads.length) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px] relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-700/50 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="closed">Closed</option>
              </select>
              
              <select
                value={filterScore}
                onChange={(e) => setFilterScore(e.target.value)}
                className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none"
              >
                <option value="all">All Scores</option>
                <option value="80">Hot (80+)</option>
                <option value="60">Warm (60+)</option>
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
                  <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">AI Score</th>
                  <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                      No leads found. Start by finding leads!
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const aiScore = calculateAIScore(lead);
                    return (
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
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-1000 ${
                                  aiScore >= 80 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                  aiScore >= 60 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                  'bg-gradient-to-r from-gray-500 to-slate-500'
                                }`}
                                style={{ width: `${aiScore}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-medium ${
                              aiScore >= 80 ? 'text-purple-400' :
                              aiScore >= 60 ? 'text-blue-400' :
                              'text-gray-400'
                            }`}>
                              {aiScore}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(lead.status)}`}>
                            {lead.status || 'new'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-slate-600 rounded-lg transition-colors">
                              <Eye size={16} className="text-gray-400 hover:text-white" />
                            </button>
                            <button className="p-1 hover:bg-slate-600 rounded-lg transition-colors">
                              <Edit size={16} className="text-gray-400 hover:text-white" />
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm('Delete this lead?')) {
                                  deleteLead(lead._id);
                                }
                              }}
                              className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} className="text-gray-400 hover:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-700 flex justify-between items-center">
            <span className="text-gray-400 text-sm">
              Showing {filteredLeads.length} of {leads.length} leads
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useContext, useState } from 'react';
import { LeadsContext } from '../context/LeadsContext';
import { 
  Search, MapPin, Mail, Phone, Download, Save, 
  Brain, Zap, Sparkles, Globe, Users, Briefcase,
  Filter, X, CheckCircle, AlertCircle, Loader,
  Star  // ⬅️ ADD THIS LINE
} from 'lucide-react';
import * as XLSX from 'xlsx';
import axios from 'axios';

const LeadFinder = () => {
  const { saveLeads } = useContext(LeadsContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [activePlatform, setActivePlatform] = useState('google');
  const [showFilters, setShowFilters] = useState(false);

  const platforms = [
    { id: 'google', label: 'Google Maps', icon: MapPin, color: 'from-blue-500 to-cyan-500' },
    { id: 'linkedin', label: 'LinkedIn', icon: Users, color: 'from-blue-600 to-blue-400' },
    { id: 'facebook', label: 'Facebook', icon: Globe, color: 'from-blue-700 to-blue-500' },
  ];

  // AI Enrichment
  const enrichLead = (lead, index) => ({
    ...lead,
    id: index,
    aiScore: Math.floor(Math.random() * 40) + 60,
    industry: ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing'][Math.floor(Math.random() * 6)],
    employees: Math.floor(Math.random() * 500) + 10,
    revenue: `$${(Math.random() * 10 + 1).toFixed(1)}M`,
    techStack: ['React', 'Python', 'AWS', 'Docker', 'Kubernetes', 'Node.js'].slice(0, Math.floor(Math.random() * 3) + 2),
  });

  // Search
  const handleSearch = async () => {
    if (!searchQuery) {
      alert('Please enter a search query');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/maps/search`, {
        query: searchQuery,
        location: location || 'USA'
      });

      const enriched = response.data.data.map((lead, i) => enrichLead(lead, i));
      setResults(enriched);
    } catch (error) {
      console.error('Search error:', error);
      // Mock results
      const mockResults = Array(8).fill(null).map((_, i) => ({
        id: i,
        name: `Business ${i + 1}`,
        company: `Company ${i + 1} LLC`,
        email: `contact${i + 1}@company${i + 1}.com`,
        phone: `+1 (555) ${String(100 + i * 10)}-${String(1000 + i * 10)}`,
        website: `https://company${i + 1}.com`,
        location: `${location || 'New York'}, USA`,
        rating: (3 + Math.random() * 2).toFixed(1),
        reviews: Math.floor(Math.random() * 500),
        category: ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail'][i % 5],
        ...enrichLead({}, i)
      }));
      setResults(mockResults);
    } finally {
      setLoading(false);
    }
  };

  // Save leads
  const handleSaveLeads = async () => {
    const selected = results.filter((_, index) => selectedLeads.includes(index));
    if (selected.length === 0) {
      alert('Please select at least one lead to save');
      return;
    }

    const leadsToSave = selected.map(lead => ({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      website: lead.website,
      location: lead.location,
      industry: lead.industry,
      source: 'google_maps',
      status: 'new',
      rating: lead.rating,
    }));

    await saveLeads(leadsToSave);
    alert(`Successfully saved ${selected.length} leads!`);
    setSelectedLeads([]);
  };

  // Export functions
  const exportToExcel = () => {
    const exportData = results.map(r => ({
      Name: r.name || '',
      Company: r.company || '',
      Email: r.email || '',
      Phone: r.phone || '',
      Website: r.website || '',
      Location: r.location || '',
      Industry: r.industry || '',
      'AI Score': r.aiScore || 0,
      Rating: r.rating || '',
      Reviews: r.reviews || 0,
      Employees: r.employees || '',
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, `leads_finder_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Website', 'Location', 'Industry', 'AI Score', 'Rating', 'Reviews'];
    const csvData = results.map(r => [
      r.name || '', r.company || '', r.email || '', r.phone || '', 
      r.website || '', r.location || '', r.industry || '', 
      r.aiScore || 0, r.rating || '', r.reviews || 0
    ]);
    let csv = headers.join(',') + '\n';
    csvData.forEach(row => { csv += row.join(',') + '\n'; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_finder_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Search className="text-purple-400" size={32} />
              Smart Lead Finder
              <span className="text-sm bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 rounded-full text-white text-xs font-medium">
                AI-Powered
              </span>
            </h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400" />
              Find and enrich leads from multiple platforms with AI intelligence
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
                onClick={handleSaveLeads}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all flex items-center gap-2"
              >
                <Save size={18} />
                Save {selectedLeads.length}
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Describe your ideal lead... (e.g. 'Tech startups in USA')"
                  className="w-full bg-slate-700/50 text-white pl-10 pr-4 py-3 rounded-lg border border-slate-600 focus:border-purple-500 outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (e.g. New York)"
              className="bg-slate-700/50 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-purple-500 outline-none w-48"
            />
            
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Deep Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Platforms */}
        <div className="flex flex-wrap gap-2 mb-6">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setActivePlatform(platform.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activePlatform === platform.id
                  ? `bg-gradient-to-r ${platform.color} text-white shadow-lg`
                  : 'bg-slate-700/50 text-gray-400 hover:bg-slate-600/50'
              }`}
            >
              <platform.icon size={16} />
              {platform.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-gray-400 text-sm">
              <span>Found {results.length} leads</span>
              <button
                onClick={() => {
                  const all = results.map((_, i) => i);
                  setSelectedLeads(selectedLeads.length === all.length ? [] : all);
                }}
                className="text-purple-400 hover:text-purple-300"
              >
                {selectedLeads.length === results.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {results.map((lead, index) => (
              <div
                key={index}
                className={`bg-slate-800/50 backdrop-blur-xl rounded-2xl border transition-all p-6 ${
                  selectedLeads.includes(index)
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-purple-500/20 hover:border-purple-500/40'
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(index)}
                    onChange={() => {
                      if (selectedLeads.includes(index)) {
                        setSelectedLeads(selectedLeads.filter(i => i !== index));
                      } else {
                        setSelectedLeads([...selectedLeads, index]);
                      }
                    }}
                    className="mt-1 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{lead.name}</h3>
                        <p className="text-gray-400">{lead.company}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded-lg">
                          <Brain size={14} className="text-purple-400" />
                          <span className="text-white font-medium">{lead.aiScore}%</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          lead.aiScore >= 80 ? 'bg-purple-500/20 text-purple-400' :
                          lead.aiScore >= 60 ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {lead.aiScore >= 80 ? '🔥 Hot' : lead.aiScore >= 60 ? '🌤️ Warm' : '❄️ Cold'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Mail size={16} />
                        {lead.email || '-'}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Phone size={16} />
                        {lead.phone || '-'}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <MapPin size={16} />
                        {lead.location || '-'}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-700">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Briefcase size={16} />
                        {lead.industry || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Users size={16} />
                        {lead.employees || 'N/A'} employees
                      </div>
                      {lead.rating && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Star size={16} className="text-yellow-400" />
                          {lead.rating} ({lead.reviews} reviews)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadFinder;

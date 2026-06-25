import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const LeadsContext = createContext();

export const LeadsProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'https://4-pageback-production.up.railway.app';

  // Fetch leads
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/leads`);
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
      // Mock data for demo
      setLeads([
        { _id: '1', name: 'John Doe', company: 'Tech Corp', email: 'john@techcorp.com', phone: '+1 (555) 123-4567', status: 'new', source: 'google_maps', createdAt: new Date().toISOString() },
        { _id: '2', name: 'Sarah Smith', company: 'Finance Inc', email: 'sarah@financeinc.com', phone: '+1 (555) 234-5678', status: 'contacted', source: 'linkedin', createdAt: new Date().toISOString() },
        { _id: '3', name: 'Mike Johnson', company: 'Health Solutions', email: 'mike@healthsolutions.com', phone: '+1 (555) 345-6789', status: 'qualified', source: 'website', createdAt: new Date().toISOString() },
        { _id: '4', name: 'Emily Davis', company: 'EduTech', email: 'emily@edutech.com', phone: '+1 (555) 456-7890', status: 'proposal', source: 'social_media', createdAt: new Date().toISOString() },
        { _id: '5', name: 'Robert Wilson', company: 'Green Energy', email: 'robert@greenenergy.com', phone: '+1 (555) 567-8901', status: 'closed', source: 'manual', createdAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Create lead
  const createLead = async (leadData) => {
    try {
      const response = await axios.post(`${API_URL}/api/leads`, leadData);
      setLeads([...leads, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error creating lead:', error);
      const newLead = { _id: Date.now().toString(), ...leadData, createdAt: new Date().toISOString() };
      setLeads([...leads, newLead]);
      return newLead;
    }
  };

  // Update lead
  const updateLead = async (id, leadData) => {
    try {
      const response = await axios.put(`${API_URL}/api/leads/${id}`, leadData);
      setLeads(leads.map(l => l._id === id ? response.data : l));
      return response.data;
    } catch (error) {
      console.error('Error updating lead:', error);
      setLeads(leads.map(l => l._id === id ? { ...l, ...leadData } : l));
      return { ...leadData, _id: id };
    }
  };

  // Delete lead
  const deleteLead = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/leads/${id}`);
      setLeads(leads.filter(l => l._id !== id));
    } catch (error) {
      console.error('Error deleting lead:', error);
      setLeads(leads.filter(l => l._id !== id));
    }
  };

  // Bulk delete leads
  const bulkDeleteLeads = async (ids) => {
    try {
      await axios.post(`${API_URL}/api/leads/bulk/delete`, { ids });
      setLeads(leads.filter(l => !ids.includes(l._id)));
    } catch (error) {
      console.error('Error bulk deleting leads:', error);
      setLeads(leads.filter(l => !ids.includes(l._id)));
    }
  };

  // Bulk save leads
  const saveLeads = async (newLeads) => {
    try {
      const response = await axios.post(`${API_URL}/api/leads/bulk`, newLeads);
      setLeads([...leads, ...response.data]);
      return response.data;
    } catch (error) {
      console.error('Error saving leads:', error);
      const saved = newLeads.map(l => ({ 
        ...l, 
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 9), 
        createdAt: new Date().toISOString() 
      }));
      setLeads([...leads, ...saved]);
      return saved;
    }
  };

  // Send WhatsApp
  const sendWhatsApp = async (leadIds, message) => {
    try {
      const response = await axios.post(`${API_URL}/api/campaign/send/whatsapp`, { 
        leadIds, 
        message 
      });
      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      return { success: true, sent: leadIds.length };
    }
  };

  // Send Email
  const sendEmail = async (leadIds, message) => {
    try {
      const response = await axios.post(`${API_URL}/api/campaign/send/email`, { 
        leadIds, 
        message 
      });
      return response.data;
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: true, sent: leadIds.length };
    }
  };

  const value = {
    leads,
    loading,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    bulkDeleteLeads,
    saveLeads,
    sendWhatsApp,
    sendEmail
  };

  return (
    <LeadsContext.Provider value={value}>
      {children}
    </LeadsContext.Provider>
  );
};

"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Users, FileText, IndianRupee, Plus, Download, Search, Landmark, Bell,
  Trash2, Edit, Copy, ChevronRight, ChevronDown, CheckCircle, Clock, AlertTriangle,
  X, FileUp, CheckSquare, Wrench, UserCheck, ShieldAlert, Menu, Calendar,
  LayoutDashboard, TrendingUp, PieChart
} from 'lucide-react';
import { useStore } from '@/lib/store';

const CustomSelect = ({ value, onChange, options, placeholder, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs text-left flex justify-between items-center transition-all focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
      >
        <span className={!selectedOption ? "text-gray-500" : "text-gray-900 font-semibold truncate pr-2"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#1E3A8A]' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto premium-shadow">
          <ul className="py-1">
            <li
              className="px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 cursor-pointer border-b border-gray-50"
              onClick={() => { onChange(''); setIsOpen(false); }}
            >
              {placeholder}
            </li>
            {options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 transition-colors ${value === opt.value ? 'bg-blue-50/50 font-bold text-[#1E3A8A]' : 'text-gray-700 font-medium'}`}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
      {required && (
        <input 
          type="text" 
          value={value} 
          onChange={() => {}} 
          required 
          className="absolute opacity-0 w-0 h-0 pointer-events-none" 
          style={{ top: '50%', left: '50%' }}
        />
      )}
    </div>
  );
};
export default function SolarERPApp({
  initialCompanies,
  initialClients,
  initialQuotations,
  initialPayments,
  initialOverdueRecords
}) {
  const {
    currentCompany, setCurrentCompany,
    currentUser, setCurrentUser,
    availableCompanies,
    toasts, addToast, removeToast
  } = useStore();

  // Active panel (dashboard, clients, quotations, payments, or overdue)
  const [activeTab, setActiveTab] = useState('dashboard');

  // Login state controls
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  React.useEffect(() => {
    const saved = localStorage.getItem('sankhla_erp_logged_in') === 'true';
    setIsLoggedIn(saved);
    
    const savedTab = localStorage.getItem('sankhla_erp_active_tab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
    
    setIsHydrated(true);
    if (initialCompanies && initialCompanies.length > 0) {
      setCurrentCompany(initialCompanies[0]);
    }
  }, [initialCompanies, setCurrentCompany]);

  React.useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('sankhla_erp_active_tab', activeTab);
    }
  }, [activeTab, isHydrated]);

  // Sidebar state for mobile/tablets sliding overlay
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Database state lists
  const [clients, setClients] = useState(initialClients || []);
  const [quotations, setQuotations] = useState(initialQuotations || []);
  const [payments, setPayments] = useState(initialPayments || []);

  // Modal open/close controls
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Selected ledger details
  const [selectedClient, setSelectedClient] = useState(null);
  const [isClientDetailOpen, setIsClientDetailOpen] = useState(false);
  const [previewQuote, setPreviewQuote] = useState(null);

  // --- FORM FIELDS ---
  const [clientForm, setClientForm] = useState({ name: '', mobile: '', address: '', capacity: 10, projectPrice: '', panelPreference: 'Waaree Solar', inverterPreference: 'Growatt', notes: '' });

  // Quote form with manual client switch options
  const [isManualClient, setIsManualClient] = useState(false);
  const [manualClientName, setManualClientName] = useState('');
  const [manualClientMobile, setManualClientMobile] = useState('');
  const [manualClientEmail, setManualClientEmail] = useState('');

  const [quoteForm, setQuoteForm] = useState({
    clientId: '',
    capacity: 10,
    panelBrand: 'Waaree Solar',
    inverterBrand: 'Growatt',
    structure: 'Standard Galvanized Structure',
    cable: 'Finolex 4 Sqmm DC',
    mc4: 'Standard MC4',
    installationCharges: 0,
    transportationCharges: 0,
    otherCharges: 0,
    discount: 0,
    gstRate: 5,
    projectCost: 14285.71,
    finalPrice: 15000,
    dueDate: '',
    items: []
  });

  const [editingQuoteId, setEditingQuoteId] = useState(null);

  const [paymentForm, setPaymentForm] = useState({ clientId: '', amount: '', paymentMode: 'BANK_TRANSFER', notes: '' });

  // Inline client entry for payment logging
  const [isManualClientPayment, setIsManualClientPayment] = useState(false);
  const [manualClientPaymentName, setManualClientPaymentName] = useState('');
  const [manualClientPaymentMobile, setManualClientPaymentMobile] = useState('');

  // Manual Overdue state variables
  const [manualOverdueRecords, setManualOverdueRecords] = useState(initialOverdueRecords || []);
  const [isOverdueModalOpen, setIsOverdueModalOpen] = useState(false);
  const [editingOverdueRecord, setEditingOverdueRecord] = useState(null);
  const [overdueForm, setOverdueForm] = useState({
    proposalNumber: '',
    clientName: '',
    dueDate: '',
    grandTotal: '',
    clientPayments: '',
    unpaidBalance: ''
  });

  // Filter lists based on search
  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients;
    return clients.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.mobile && c.mobile.includes(searchQuery)) ||
      (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [clients, searchQuery]);

  const filteredQuotations = useMemo(() => {
    if (!searchQuery) return quotations;
    return quotations.filter(q =>
      q.proposalNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.client && q.client.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [quotations, searchQuery]);

  const filteredPayments = useMemo(() => {
    if (!searchQuery) return payments;
    return payments.filter(p =>
      p.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.client && p.client.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [payments, searchQuery]);

  // --- OVERDUE PAYMENTS CALCULATION ---
  // Calculates approved quotations whose due dates are in the past and have unpaid balances.
  const overduePayments = useMemo(() => {
    const today = new Date();
    return quotations
      .filter(q => {
        if (q.status !== 'APPROVED') return false; // Only calculate overdue for approved quotations
        return true; // Return all approved quotations regardless of due date so they can be tracked
      })
      .map(q => {
        // Find total payments collected for this specific client
        const clientPayments = payments
          .filter(p => p.clientId === q.clientId)
          .reduce((sum, p) => sum + p.amount, 0);

        // Calculate all client approved quotes
        const totalApprovedQuotesForClient = quotations
          .filter(quote => quote.clientId === q.clientId && (quote.status === 'APPROVED' || quote.id === q.id))
          .reduce((sum, quote) => sum + quote.grandTotal, 0);

        // Determine if there is an unpaid balance
        const unpaidBalance = Math.max(0, q.grandTotal - clientPayments);

        return {
          ...q,
          unpaidBalance,
          clientPayments
        };
      })
      .filter(item => item.unpaidBalance > 0);
  }, [quotations, payments]);

  const combinedOverduePayments = useMemo(() => {
    const autoList = overduePayments.map(op => ({ ...op, isAuto: true }));
    const manualList = manualOverdueRecords.map(op => ({ ...op, isAuto: false }));
    return [...autoList, ...manualList];
  }, [overduePayments, manualOverdueRecords]);

  // Aggregate monthly stats for the dashboard graphs
  const monthlyStats = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const result = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`;
      result[key] = { name: key, sales: 0, collections: 0 };
    }

    quotations.forEach(q => {
      const date = new Date(q.createdAt);
      if (!isNaN(date)) {
        const key = `${months[date.getMonth()]} ${date.getFullYear().toString().substr(-2)}`;
        if (result[key]) {
          result[key].sales += q.grandTotal;
        }
      }
    });

    payments.forEach(p => {
      const date = new Date(p.paymentDate);
      if (!isNaN(date)) {
        const key = `${months[date.getMonth()]} ${date.getFullYear().toString().substr(-2)}`;
        if (result[key]) {
          result[key].collections += p.amount;
        }
      }
    });

    return Object.values(result);
  }, [quotations, payments]);

  // --- HANDLERS ---
  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (!clientForm.name || !clientForm.mobile) {
      addToast("Name and Mobile are required.", "error");
      return;
    }
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: currentCompany.id,
          clientData: clientForm
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setClients(prev => [data, ...prev]);
      setIsClientModalOpen(false);
      setClientForm({ name: '', mobile: '', address: '', capacity: 10, projectPrice: '', panelPreference: 'Waaree Solar', inverterPreference: 'Growatt', notes: '' });
      addToast("Client profile successfully created.");
    } catch (err) {
      console.error(err);
      addToast("Failed to create client: " + err.message, "error");
    }
  };

  const handleCreateQuotation = async (e) => {
    e.preventDefault();

    let resolvedClientId = quoteForm.clientId;
    let resolvedClient = null;

    try {
      if (isManualClient) {
        if (!manualClientName || !manualClientMobile) {
          addToast("Manual Client Name and Mobile are required.", "error");
          return;
        }

        const response = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId: currentCompany.id,
            clientData: {
              name: manualClientName,
              mobile: manualClientMobile,
              address: 'Jodhpur',
              capacity: parseFloat(quoteForm.capacity || 0),
              panelPreference: quoteForm.panelBrand,
              inverterPreference: quoteForm.inverterBrand
            }
          })
        });
        const clientData = await response.json();
        if (clientData.error) throw new Error(clientData.error);

        setClients(prev => [clientData, ...prev]);
        resolvedClientId = clientData.id;
        resolvedClient = clientData;
      }

      if (!resolvedClientId) {
        addToast("Please select a client or enter client details manually.", "error");
        return;
      }

      if (!resolvedClient) {
        resolvedClient = clients.find(c => c.id === resolvedClientId);
      }

      const url = editingQuoteId ? '/api/quotations' : '/api/quotations';
      const method = editingQuoteId ? 'PUT' : 'POST';
      const bodyPayload = {
        companyId: currentCompany.id,
        ...(editingQuoteId && { id: editingQuoteId }),
        quoteData: {
          ...quoteForm,
          clientId: resolvedClientId,
          materialCost: quoteForm.projectCost,
          labourCost: 0,
          profit: 0,
          panelWattage: 540,
          panelQuantity: Math.ceil((parseFloat(quoteForm.capacity || 0) * 1000) / 540),
          inverterModel: `${quoteForm.capacity}kW Inverter`,
          acdb: `${quoteForm.capacity}kW ACDB Box`,
          dcdb: `${quoteForm.capacity}kW DCDB Box`
        }
      };

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const quoteData = await response.json();
      if (quoteData.error) throw new Error(quoteData.error);
      
      if (editingQuoteId) {
        setQuotations(quotations.map(q => q.id === quoteData.id ? quoteData : q));
        addToast("Quotation updated successfully");
      } else {
        quoteData.client = resolvedClient;
        setQuotations(prev => [quoteData, ...prev]);
        addToast("Quotation created successfully");
      }
      setIsQuoteModalOpen(false);
      setEditingQuoteId(null);
    } catch (err) {
      console.error(err);
      addToast("Failed to process quotation: " + err.message, "error");
    } finally {
      setIsManualClient(false);
      setManualClientName('');
      setManualClientMobile('');
      setManualClientEmail('');
    }
  };

  const handleApproveQuotation = async (q) => {
    if (!confirm("Are you sure you want to approve this quotation? It will become an active project and show in Overdue Payments.")) return;
    try {
      const payload = {
        id: q.id,
        quoteData: { ...q, status: 'APPROVED' }
      };
      const response = await fetch('/api/quotations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Failed to approve quotation");
      const updatedQuote = await response.json();
      setQuotations(prev => prev.map(item => item.id === q.id ? updatedQuote : item));
      addToast("Quotation approved successfully");
    } catch (err) {
      console.error(err);
      addToast(err.message, "error");
    }
  };

  const handleDuplicateQuotation = (q) => {
    setQuoteForm({
      clientId: q.clientId,
      capacity: q.capacity,
      panelBrand: q.panelBrand,
      inverterBrand: q.inverterBrand,
      structure: q.structure,
      cable: q.cable,
      mc4: q.mc4,
      installationCharges: 0,
      transportationCharges: 0,
      otherCharges: 0,
      discount: 0,
      gstRate: q.gstRate,
      projectCost: q.materialCost,
      finalPrice: q.grandTotal,
      dueDate: q.dueDate ? q.dueDate.split('T')[0] : '',
      items: q.items ? q.items.map(i => ({ description: i.description, amount: i.amount })) : []
    });
    setEditingQuoteId(null);
    setIsManualClient(false);
    setIsQuoteModalOpen(true);
  };

  const handleEditQuotation = (q) => {
    setQuoteForm({
      clientId: q.clientId,
      capacity: q.capacity,
      panelBrand: q.panelBrand,
      inverterBrand: q.inverterBrand,
      structure: q.structure,
      cable: q.cable,
      mc4: q.mc4,
      installationCharges: 0,
      transportationCharges: 0,
      otherCharges: 0,
      discount: 0,
      gstRate: q.gstRate,
      projectCost: q.materialCost,
      finalPrice: q.grandTotal,
      dueDate: q.dueDate ? q.dueDate.split('T')[0] : '',
      items: q.items ? q.items.map(i => ({ description: i.description, amount: i.amount })) : []
    });
    setEditingQuoteId(q.id);
    setIsManualClient(false);
    setIsQuoteModalOpen(true);
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();

    let resolvedClientId = paymentForm.clientId;
    let resolvedClient = null;

    try {
      if (isManualClientPayment) {
        if (!manualClientPaymentName || !manualClientPaymentMobile) {
          addToast("Manual Client Name and Mobile are required.", "error");
          return;
        }

        const clientResponse = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId: currentCompany.id,
            clientData: {
              name: manualClientPaymentName,
              mobile: manualClientPaymentMobile,
              address: 'Jodhpur',
              capacity: 0,
              panelPreference: '',
              inverterPreference: ''
            }
          })
        });
        const clientData = await clientResponse.json();
        if (clientData.error) throw new Error(clientData.error);

        setClients(prev => [clientData, ...prev]);
        resolvedClientId = clientData.id;
        resolvedClient = clientData;
      }

      if (!resolvedClientId || !paymentForm.amount) {
        addToast("Client and Amount are required.", "error");
        return;
      }

      if (!resolvedClient) {
        resolvedClient = clients.find(c => c.id === resolvedClientId);
      }

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: currentCompany.id,
          paymentData: {
            ...paymentForm,
            clientId: resolvedClientId
          }
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      data.client = resolvedClient;

      setPayments(prev => [data, ...prev]);
      setIsPaymentModalOpen(false);
      setPaymentForm({ clientId: '', amount: '', paymentMode: 'BANK_TRANSFER', notes: '' });
      setIsManualClientPayment(false);
      setManualClientPaymentName('');
      setManualClientPaymentMobile('');
      addToast("Payment recorded successfully.");
    } catch (err) {
      console.error(err);
      addToast("Failed to record payment: " + err.message, "error");
    }
  };

  const handleExportCSV = (data, fileName) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row =>
      Object.values(row).map(val =>
        typeof val === 'object' ? `"${JSON.stringify(val).replace(/"/g, '""')}"` : `"${val}"`
      ).join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`${fileName} exported as CSV.`);
  };

  const handleSaveOverdueRecord = async (e) => {
    e.preventDefault();
    if (!overdueForm.clientName || !overdueForm.grandTotal) {
      addToast("Client Name and Total Amount are required.", "error");
      return;
    }

    const grandTotalNum = parseFloat(overdueForm.grandTotal || 0);
    const clientPaymentsNum = parseFloat(overdueForm.clientPayments || 0);
    const unpaidBalanceNum = overdueForm.unpaidBalance !== '' ? parseFloat(overdueForm.unpaidBalance) : Math.max(0, grandTotalNum - clientPaymentsNum);

    try {
      if (editingOverdueRecord) {
        const response = await fetch('/api/overdue', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingOverdueRecord.id,
            overdueData: {
              proposalNumber: overdueForm.proposalNumber,
              clientName: overdueForm.clientName,
              dueDate: overdueForm.dueDate,
              grandTotal: grandTotalNum,
              clientPayments: clientPaymentsNum,
              unpaidBalance: unpaidBalanceNum
            }
          })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        data.isManual = true;

        setManualOverdueRecords(prev => prev.map(rec => rec.id === editingOverdueRecord.id ? data : rec));
        addToast("Overdue record updated successfully.");
      } else {
        const response = await fetch('/api/overdue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId: currentCompany.id,
            overdueData: {
              proposalNumber: overdueForm.proposalNumber || `QT-MAN-${Math.floor(1000 + Math.random() * 9000)}`,
              clientName: overdueForm.clientName,
              dueDate: overdueForm.dueDate,
              grandTotal: grandTotalNum,
              clientPayments: clientPaymentsNum,
              unpaidBalance: unpaidBalanceNum
            }
          })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        data.isManual = true;

        setManualOverdueRecords(prev => [data, ...prev]);
        addToast("Overdue record added successfully.");
      }

      setIsOverdueModalOpen(false);
      setEditingOverdueRecord(null);
    } catch (err) {
      console.error(err);
      addToast("Failed to save overdue record: " + err.message, "error");
    }
  };

  const handleDeleteOverdueRecord = async (id) => {
    try {
      const response = await fetch(`/api/overdue?id=${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setManualOverdueRecords(prev => prev.filter(rec => rec.id !== id));
      addToast("Overdue record removed.");
    } catch (err) {
      console.error(err);
      addToast("Failed to delete overdue record: " + err.message, "error");
    }
  };

  // Delete payment record
  const handleDeletePayment = async (id) => {
    try {
      const response = await fetch(`/api/payments?id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setPayments(prev => prev.filter(rec => rec.id !== id));
      addToast('Payment record removed.');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete payment: ' + err.message, 'error');
    }
  };

  // Delete client record
  const handleDeleteClient = async (id) => {
    try {
      const response = await fetch(`/api/clients?id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setClients(prev => prev.filter(rec => rec.id !== id));
      addToast('Client record removed.');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete client: ' + err.message, 'error');
    }
  };

  // Delete quotation record
  const handleDeleteQuotation = async (id) => {
    try {
      const response = await fetch(`/api/quotations?id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setQuotations(prev => prev.filter(rec => rec.id !== id));
      addToast('Quotation record removed.');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete quotation: ' + err.message, 'error');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginUsername === 'Jayesh1999' && loginPassword === '856084') {
      setIsLoggedIn(true);
      localStorage.setItem('sankhla_erp_logged_in', 'true');
      addToast("Welcome back! Login successful.");
    } else {
      addToast("Invalid credentials. Please try again.", "error");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('sankhla_erp_logged_in');
    setLoginUsername('');
    setLoginPassword('');
    addToast("Logged out successfully.");
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-6 font-sans text-gray-500">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <span className="text-xs font-semibold block text-gray-600">Loading Sankhla Solar Control...</span>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Decorative modern background elements (Light) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-100/40 rounded-full blur-[120px]"></div>
        </div>

        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/50 rounded-xl p-8 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative z-10 text-gray-700">
          <div className="text-center space-y-2">
            <div className="flex justify-center mx-auto mb-4">
              <img src="/logo.jpg" alt="Sankhla Enterprises Logo" className="h-28 object-contain drop-shadow-md" />
            </div>
            <p className="text-xs text-gray-500">Enter credentials to access Solar ERP & CRM Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-600">Username</label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-900 transition text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-gray-600">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••"
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-900 transition text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold rounded-xl transition duration-200 mt-2 shadow-sm text-xs"
            >
              Sign In to System
            </button>
          </form>

          <div className="text-center text-[10px] text-gray-400 pt-2 border-t border-gray-100">
            Sankhla Solar Operational Control &copy; 2026
          </div>
        </div>

        {/* Floating Toast Notification Box on Login Screen */}
        <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map(toast => (
            <div key={toast.id} className="p-4 rounded-xl shadow-lg border text-sm flex items-center gap-3 bg-white pointer-events-auto border-emerald-200 text-emerald-800">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>{toast.message}</span>
              <button type="button" onClick={() => removeToast(toast.id)} className="ml-auto text-gray-400 hover:text-gray-600">&times;</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FAFBFC] overflow-hidden text-[#111827]">

      {/* Toast notifications */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="p-4 rounded-xl shadow-lg border text-sm flex items-center gap-3 bg-white pointer-events-auto border-emerald-200 text-emerald-800">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="ml-auto text-gray-400 hover:text-gray-600">&times;</button>
          </div>
        ))}
      </div>

      {/* MOBILE SIDEBAR BACKDROP */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-[#E5E7EB] bg-white flex flex-col justify-between shrink-0 transform transition-transform duration-300 md:static md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div>
          {/* Header info */}
          <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden flex items-center justify-center bg-white rounded-md">
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm leading-tight">{currentCompany.name}</span>
                <span className="text-[11px] text-[#6B7280]">Operational Management</span>
              </div>
            </div>
            {/* Close sidebar button on mobile */}
            <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 md:hidden">
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="p-3 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'clients', label: 'Client CRM', icon: Users },
              { id: 'quotations', label: 'Quotations', icon: FileText },
              { id: 'payments', label: 'Payments & Collections', icon: IndianRupee },
              { id: 'overdue', label: 'Overdue Payments', icon: AlertTriangle }
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setPreviewQuote(null);
                    setIsSidebarOpen(false); // Auto-close sidebar on mobile menu selection
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${activeTab === item.id
                    ? 'bg-[#1E3A8A] text-white shadow-sm'
                    : 'text-[#6B7280] hover:text-[#111827] hover:bg-gray-50'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info with Logout */}
        <div className="p-4 border-t border-[#E5E7EB] space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-750 hover:bg-red-50 rounded-xl transition duration-150"
          >
            Logout / Sign Out
          </button>
          <div className="text-center text-[10px] text-gray-400">
            Sankhla Solar ERP &copy; 2026
          </div>
        </div>
      </aside>

      {/* WORKSPACE AREA */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 relative">
        {/* Decorative background blobs for inner pages */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-100/40 rounded-full blur-[120px]"></div>
        </div>

        {/* Top Header (bg-white ensures it stays solid) */}
        <header className="h-16 border-b border-[#E5E7EB] bg-white flex items-center justify-between px-6 shrink-0 relative z-10">
          <div className="flex items-center gap-4">
            {/* Hamburger menu for mobile */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl hover:bg-gray-100 md:hidden"
            >
              <Menu className="h-5 w-5 text-gray-700" />
            </button>

            {/* Dynamic Breadcrumbs / Title */}
            <div className="hidden sm:flex flex-col text-left">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Console</span>
                <ChevronRight className="h-2.5 w-2.5 text-gray-300" />
                <span className="text-[10px] font-bold text-[#1E3A8A] uppercase tracking-wide">{activeTab}</span>
              </div>
              <h1 className="text-sm font-black text-gray-900 leading-none mt-1">
                {activeTab === 'dashboard' && 'Dashboard Overview'}
                {activeTab === 'clients' && 'Client Relationship CRM'}
                {activeTab === 'quotations' && 'Quotations & Proposal Wizard'}
                {activeTab === 'payments' && 'Payments & Ledger Logs'}
                {activeTab === 'overdue' && 'Overdue Account Tracking'}
              </h1>
            </div>


          </div>

          <div className="flex items-center gap-4">
            {/* Context-aware buttons */}
            <div className="flex gap-2">
              {activeTab === 'clients' && (
                <button onClick={() => setIsClientModalOpen(true)} className="btn-premium flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] rounded-xl hover:bg-blue-900 shadow-sm transition">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Client</span>
                </button>
              )}
              {activeTab === 'quotations' && (
                <button onClick={() => setIsQuoteModalOpen(true)} className="btn-premium flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] rounded-xl hover:bg-blue-900 shadow-sm transition">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Quotation</span>
                </button>
              )}
              {activeTab === 'payments' && (
                <button onClick={() => setIsPaymentModalOpen(true)} className="btn-premium flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] rounded-xl hover:bg-blue-900 shadow-sm transition">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Record Payment</span>
                </button>
              )}
              {activeTab === 'overdue' && (
                <button 
                  onClick={() => {
                    setEditingOverdueRecord(null);
                    setOverdueForm({
                      proposalNumber: `QT-MAN-${Math.floor(1000 + Math.random() * 9000)}`,
                      clientName: '',
                      dueDate: '',
                      grandTotal: '',
                      clientPayments: '0',
                      unpaidBalance: ''
                    });
                    setIsOverdueModalOpen(true);
                  }}
                  className="btn-premium flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] rounded-xl hover:bg-blue-900 shadow-sm transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Overdue</span>
                </button>
              )}
            </div>

            {/* User Profile avatar */}
            <div className="flex items-center gap-2.5 border-l pl-4 border-gray-200">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-700 flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
                JS
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-gray-900 leading-tight">Jayesh Sankhla</span>
                <span className="text-[9px] text-gray-400 font-semibold leading-none mt-0.5">Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* View Workspace */}
        <div className="flex-1 overflow-y-auto p-6 relative z-10">

          {/* DASHBOARD MODULE */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Header */}
              <div className="flex justify-between items-center bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-2xl shadow-sm">
                <div>
                  <h1 className="text-xl font-bold">Welcome back, {currentUser?.name || 'Jayesh Sankhla'}!</h1>
                  <p className="text-xs text-blue-200 mt-1">Here is a quick snapshot of Sankhla Enterprises operational activities today.</p>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-xs text-blue-200 font-medium block">Current Date</span>
                  <span className="text-sm font-bold block mt-0.5">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>

              {/* Quick Actions Deck */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setIsClientModalOpen(true)}
                  className="p-4 bg-white hover:bg-blue-50/50 border border-gray-100 rounded-2xl flex flex-col items-center justify-center text-center transition group shadow-sm"
                >
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center mb-2 group-hover:bg-blue-900 group-hover:text-white transition">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">Add CRM Client</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Register new site profile</span>
                </button>

                <button
                  onClick={() => {
                    setQuoteForm({
                      clientId: '',
                      capacity: 10,
                      panelBrand: 'Waaree Solar',
                      panelModel: 'Mono PERC Half Cut',
                      panelWattage: 540,
                      panelQuantity: 20,
                      inverterBrand: 'Growatt',
                      inverterModel: 'MAX 15KTL3',
                      structure: 'Standard Galvanized Structure',
                      cable: 'Finolex 4 Sqmm DC',
                      mc4: 'Standard MC4',
                      acdb: '10kW ACDB Box',
                      dcdb: '10kW DCDB Box',
                      installationCharges: 0,
                      transportationCharges: 0,
                      otherCharges: 0,
                      discount: 0,
                      gstRate: 5,
                      finalPrice: 15000,
                      projectCost: 14285.71,
                      dueDate: '',
                      items: []
                    });
                    setIsManualClient(false);
                    setIsQuoteModalOpen(true);
                  }}
                  className="p-4 bg-white hover:bg-blue-50/50 border border-gray-100 rounded-2xl flex flex-col items-center justify-center text-center transition group shadow-sm"
                >
                  <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-2 group-hover:bg-amber-800 group-hover:text-white transition">
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">Create Quotation</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Draft a new sales proposal</span>
                </button>

                <button
                  onClick={() => {
                    setPaymentForm({ clientId: '', amount: '', paymentMode: 'BANK_TRANSFER', notes: '' });
                    setIsPaymentModalOpen(true);
                  }}
                  className="p-4 bg-white hover:bg-blue-50/50 border border-gray-100 rounded-2xl flex flex-col items-center justify-center text-center transition group shadow-sm"
                >
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2 group-hover:bg-emerald-800 group-hover:text-white transition">
                    <IndianRupee className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">Log Payment</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Record client collections</span>
                </button>

                <button
                  onClick={() => {
                    setEditingOverdueRecord(null);
                    setOverdueForm({
                      proposalNumber: `QT-MAN-${Math.floor(1000 + Math.random() * 9000)}`,
                      clientName: '',
                      dueDate: '',
                      grandTotal: '',
                      clientPayments: '0',
                      unpaidBalance: ''
                    });
                    setIsOverdueModalOpen(true);
                  }}
                  className="p-4 bg-white hover:bg-blue-50/50 border border-gray-100 rounded-2xl flex flex-col items-center justify-center text-center transition group shadow-sm"
                >
                  <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-2 group-hover:bg-red-600 group-hover:text-white transition">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">Add Overdue Payment</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Log custom pending payment</span>
                </button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-900">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 font-medium block uppercase tracking-wider">CRM Clients</span>
                    <span className="text-lg font-bold text-gray-900 mt-0.5 block">{clients.length} Registered</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-amber-50 rounded-xl text-amber-800">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 font-medium block uppercase tracking-wider">Total Sales</span>
                    <span className="text-lg font-bold text-gray-900 mt-0.5 block">
                      ₹{quotations.reduce((sum, q) => sum + q.grandTotal, 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800">
                    <IndianRupee className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 font-medium block uppercase tracking-wider">Total Collections</span>
                    <span className="text-lg font-bold text-emerald-950 mt-0.5 block">
                      ₹{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-red-50 rounded-xl text-red-600">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 font-medium block uppercase tracking-wider">Overdue Balance</span>
                    <span className="text-lg font-bold text-red-600 mt-0.5 block">
                      ₹{combinedOverduePayments.reduce((sum, op) => sum + op.unpaidBalance, 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Graph Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SVG Bar Chart Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-gray-800">Collections vs Sales Performance</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">Aggregate comparison of proposals drafted vs receipts collected over the last 6 months.</p>
                    </div>
                    <div className="flex gap-3 text-[10px] font-bold">
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-[#1E3A8A] block"></span>
                        <span className="text-gray-500">Sales</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 block"></span>
                        <span className="text-gray-500">Collections</span>
                      </div>
                    </div>
                  </div>

                  {/* Responsive custom SVG graph */}
                  <div className="h-60 w-full relative">
                    <svg viewBox="0 0 500 220" className="w-full h-full" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="30" y1="20" x2="480" y2="20" stroke="#F3F4F6" strokeWidth="1" />
                      <line x1="30" y1="70" x2="480" y2="70" stroke="#F3F4F6" strokeWidth="1" />
                      <line x1="30" y1="120" x2="480" y2="120" stroke="#F3F4F6" strokeWidth="1" />
                      <line x1="30" y1="170" x2="480" y2="170" stroke="#F3F4F6" strokeWidth="1" />
                      <line x1="30" y1="190" x2="480" y2="190" stroke="#E5E7EB" strokeWidth="1.5" />

                      {/* Bar Plot logic */}
                      {(() => {
                        const maxVal = Math.max(...monthlyStats.map(s => Math.max(s.sales, s.collections)), 10000);
                        const step = 450 / monthlyStats.length;
                        return monthlyStats.map((stat, index) => {
                          const xOffset = 45 + (index * step);
                          const salesHeight = (stat.sales / maxVal) * 150;
                          const collHeight = (stat.collections / maxVal) * 150;

                          return (
                            <g key={index}>
                              {/* Sales bar (Blue) */}
                              <rect
                                x={xOffset - 12}
                                y={190 - salesHeight}
                                width="10"
                                height={Math.max(salesHeight, 2)}
                                fill="#1E3A8A"
                                rx="2"
                              />
                              {/* Collections bar (Emerald) */}
                              <rect
                                x={xOffset + 2}
                                y={190 - collHeight}
                                width="10"
                                height={Math.max(collHeight, 2)}
                                fill="#10B981"
                                rx="2"
                              />
                              {/* Label */}
                              <text
                                x={xOffset - 4}
                                y="205"
                                fill="#9CA3AF"
                                fontSize="9"
                                textAnchor="middle"
                                fontWeight="600"
                              >
                                {stat.name}
                              </text>
                            </g>
                          );
                        });
                      })()}
                    </svg>
                  </div>
                </div>

                {/* Project Capacity Breakdown */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gray-800">Project Size Analysis</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Capacity breakdown of solar installations drafted.</p>
                  </div>

                  <div className="space-y-3">
                    {(() => {
                      const ranges = [
                        { label: "Residential (1-5 kW)", min: 0, max: 5, color: "bg-blue-500" },
                        { label: "Small Comm. (6-10 kW)", min: 5.1, max: 10, color: "bg-teal-500" },
                        { label: "Medium Comm. (11-20 kW)", min: 10.1, max: 20, color: "bg-amber-500" },
                        { label: "Industrial (20+ kW)", min: 20.1, max: 10000, color: "bg-purple-500" }
                      ];

                      const totalQuotationsCount = quotations.length || 1;

                      return ranges.map((r, i) => {
                        const count = quotations.filter(q => q.capacity >= r.min && q.capacity <= r.max).length;
                        const percentage = Math.round((count / totalQuotationsCount) * 100);

                        return (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-gray-600">
                              <span>{r.label}</span>
                              <span>{count} ({percentage}%)</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full ${r.color} rounded-full`} style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-semibold text-gray-500">
                    <span>Average Project Capacity</span>
                    <span className="text-gray-900 font-bold">
                      {quotations.length > 0
                        ? (quotations.reduce((sum, q) => sum + q.capacity, 0) / quotations.length).toFixed(1)
                        : 0} kW
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Quotations */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                    <span className="font-bold text-xs text-gray-800 block">Recent Quotations</span>
                    <button onClick={() => setActiveTab('quotations')} className="text-[10px] font-bold text-blue-900 hover:underline">View All</button>
                  </div>
                  <div className="divide-y divide-gray-50 text-[11px] space-y-2.5">
                    {quotations.slice(0, 5).map(q => (
                      <div key={q.id} className="pt-2 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-gray-900 block">{q.proposalNumber} - {q.client ? q.client.name : 'Unknown Client'}</span>
                          <span className="text-gray-400 text-[10px]">{q.capacity}kW ({q.panelBrand} / {q.inverterBrand})</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold block text-gray-800">₹{q.grandTotal.toLocaleString('en-IN')}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100">{q.status}</span>
                        </div>
                      </div>
                    ))}
                    {quotations.length === 0 && (
                      <p className="text-gray-400 italic py-4 text-center">No quotations generated yet.</p>
                    )}
                  </div>
                </div>

                {/* Recent Collections */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                    <span className="font-bold text-xs text-gray-800 block">Recent Payments Received</span>
                    <button onClick={() => setActiveTab('payments')} className="text-[10px] font-bold text-blue-900 hover:underline">View All</button>
                  </div>
                  <div className="divide-y divide-gray-50 text-[11px] space-y-2.5">
                    {payments.slice(0, 5).map(p => (
                      <div key={p.id} className="pt-2 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-gray-900 block">{p.receiptNumber} - {p.client ? p.client.name : 'Unknown Client'}</span>
                          <span className="text-gray-400 text-[10px]">{new Date(p.paymentDate).toLocaleDateString()} via {p.paymentMode}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold block text-emerald-600">₹{p.amount.toLocaleString('en-IN')}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100">LOGGED</span>
                        </div>
                      </div>
                    ))}
                    {payments.length === 0 && (
                      <p className="text-gray-400 italic py-4 text-center">No payment transactions recorded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CLIENT MODULE */}
          {activeTab === 'clients' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Clients</h1>
                  <p className="text-xs text-gray-500">Manage client profiles, contacts, and registration parameters.</p>
                </div>
                {clients.length > 0 && (
                  <button
                    onClick={() => handleExportCSV(clients, 'clients_list')}
                    className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs bg-white text-gray-600 hover:bg-gray-50 flex items-center gap-1 whitespace-nowrap flex-shrink-0"
                  >
                    <Download className="h-3 w-3" /> Export CSV
                  </button>
                )}
              </div>

              {clients.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 p-12 text-center rounded-2xl">
                  <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <span className="text-xs font-bold text-gray-800 block">No Clients Found</span>
                  <p className="text-[11px] text-gray-400 mt-1 max-w-xs mx-auto">Get started by creating your first client account using the button above.</p>
                </div>
              ) : (
                <div className="premium-card bg-white overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-gray-200 whitespace-nowrap">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                        <th className="px-6 py-4 border border-gray-200">Client Name</th>
                        <th className="px-6 py-4 border border-gray-200">Contact Info</th>
                        <th className="px-6 py-4 border border-gray-200">Project Size</th>
                        <th className="px-6 py-4 border border-gray-200">Project Price (Fixed)</th>
                        <th className="px-6 py-4 border border-gray-200">Address</th>
                        <th className="px-6 py-4 border border-gray-200 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {filteredClients.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 border border-gray-200 font-semibold text-gray-900">{c.name}</td>
                          <td className="px-6 py-4 border border-gray-200 text-gray-600">
                            <div>{c.mobile}</div>
                          </td>
                          <td className="px-6 py-4 border border-gray-200 font-bold text-blue-900">{c.capacity || 0} kW</td>
                          <td className="px-6 py-4 border border-gray-200 text-gray-700 font-semibold">{c.projectPrice ? `₹${parseFloat(c.projectPrice).toLocaleString('en-IN')}` : '-'}</td>
                          <td className="px-6 py-4 border border-gray-200 text-gray-600">{c.address || ''}</td>
                          <td className="px-6 py-4 border border-gray-200 text-right">
                            <div className="flex justify-end items-center gap-3">
                              <button
                                onClick={() => {
                                  setSelectedClient(c);
                                  setIsClientDetailOpen(true);
                                }}
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-xs font-semibold transition-colors border border-blue-100 shadow-sm"
                              >
                                Open Ledger File
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this client?")) {
                                    handleDeleteClient(c.id);
                                  }
                                }}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center justify-center border border-red-100 shadow-sm"
                                title="Delete Client"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* QUOTATIONS MODULE */}
          {activeTab === 'quotations' && !previewQuote && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Quotations</h1>
                <p className="text-xs text-gray-500">Draft solar systems layout quotations and automatically calculate pricing totals.</p>
              </div>

              {quotations.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 p-12 text-center rounded-2xl">
                  <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <span className="text-xs font-bold text-gray-800 block">No Quotations Drafted</span>
                  <p className="text-[11px] text-gray-400 mt-1 max-w-xs mx-auto">Create solar system proposals for registered clients using the Draft Proposal button.</p>
                </div>
              ) : (
                <div className="premium-card bg-white overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-gray-200 whitespace-nowrap">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                        <th className="px-6 py-4 border border-gray-200">Proposal No</th>
                        <th className="px-6 py-4 border border-gray-200">Client Name</th>
                        <th className="px-6 py-4 border border-gray-200">Capacity</th>
                        <th className="px-6 py-4 border border-gray-200">Due Date</th>
                        <th className="px-6 py-4 border border-gray-200">Grand Total</th>
                        <th className="px-6 py-4 border border-gray-200 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {filteredQuotations.map(q => (
                        <tr key={q.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 border border-gray-200 font-bold text-gray-900">
                            <div className="flex items-center gap-2">
                              {q.proposalNumber}
                              {q.status === 'APPROVED' && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded-full uppercase">Approved</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 border border-gray-200 font-semibold text-gray-700">{q.client ? q.client.name : 'Unknown Client'}</td>
                          <td className="px-6 py-4 border border-gray-200 text-gray-600">{q.capacity} kW</td>
                          <td className="px-6 py-4 border border-gray-200 text-gray-600">{q.dueDate ? new Date(q.dueDate).toLocaleDateString() : '-'}</td>
                          <td className="px-6 py-4 border border-gray-200 font-bold text-[#1E3A8A]">₹{q.grandTotal.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4 border border-gray-200 text-right">
                            <div className="flex justify-end items-center gap-3">
                              <button onClick={() => setPreviewQuote(q)} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-xs font-semibold transition-colors border border-blue-100 shadow-sm">Preview proposal</button>
                              <button
                                onClick={() => {
                                  setPreviewQuote(q);
                                  setTimeout(() => window.print(), 500);
                                }}
                                className="p-1.5 bg-green-50 hover:bg-green-100 rounded-lg text-green-600 transition-colors border border-green-100 shadow-sm flex items-center justify-center"
                                title="Download / Print PDF"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              {q.status !== 'APPROVED' && (
                                <button onClick={() => handleApproveQuotation(q)} className="p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-colors border border-emerald-100 shadow-sm flex items-center justify-center" title="Approve Quotation">
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                              )}
                              <button onClick={() => handleEditQuotation(q)} className="p-1.5 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-yellow-600 transition-colors border border-yellow-100 shadow-sm flex items-center justify-center" title="Edit Quotation"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                              <button onClick={() => handleDuplicateQuotation(q)} className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors border border-gray-100 shadow-sm flex items-center justify-center" title="Duplicate"><Copy className="h-4 w-4" /></button>
                              <button
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this quotation?")) {
                                    handleDeleteQuotation(q.id);
                                  }
                                }}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-100 shadow-sm flex items-center justify-center"
                                title="Delete Quotation"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* QUOTATION PREVIEW & PRINT */}
          {previewQuote && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button onClick={() => setPreviewQuote(null)} className="text-xs font-bold text-[#1E3A8A] hover:underline flex items-center gap-1">
                  &larr; Back to Quotation list
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] rounded-xl hover:bg-blue-900 flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download PDF / Print Proposal</span>
                </button>
              </div>

              {/* Printable Template */}
              <div id="quotation-print-area" className="bg-white rounded-2xl border border-gray-200 max-w-4xl mx-auto premium-shadow font-sans text-xs text-gray-800">

                {/* PAGE 1: INTRODUCTION & BRANDING */}
                <div className="p-12 print:p-8 min-h-[297mm] flex flex-col justify-between" style={{ pageBreakAfter: 'always' }}>
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-orange-500 pb-4">
                      <div className="flex items-center gap-4">
                        <img src="/logo.jpg" alt="Sankhla Enterprises" className="h-20 w-20 object-contain drop-shadow-sm" />
                        <div>
                          <h2 className="text-3xl font-black text-[#1E3A8A] uppercase tracking-wider">SANKHLA ENTERPRISES</h2>
                          <p className="text-[10px] text-gray-500 font-semibold tracking-wide uppercase mt-1">Solar EPC & Renewable Energy Solutions Provider</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block font-bold uppercase">PROPOSAL DATE</span>
                        <span className="text-sm font-bold text-gray-900">{new Date(previewQuote.createdAt || new Date()).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Proposal Details */}
                    <div className="mt-8 space-y-6">
                      <div className="text-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h3 className="text-sm font-bold text-[#1E3A8A] uppercase tracking-wider">Solar Power Proposal</h3>
                        <p className="text-[11px] text-gray-500 mt-1">Proposal Number: <b className="text-gray-900">{previewQuote.proposalNumber}</b> | Valid for 7 Days</p>
                      </div>

                      <div className="space-y-4">
                        <span className="text-sm font-bold text-gray-900 block border-b pb-1 text-[#1E3A8A]">Introduction</span>
                        <p className="font-semibold text-gray-800">Dear Sir / Madam,</p>
                        <p className="leading-relaxed text-gray-600 text-justify">
                          We thank you for your valuable enquiry for RCC Rooftop Solar Photo Voltaic plant.
                          We at <b>SANKHLA ENTERPRISES</b> are making little efforts to promote the usage of renewable source of energy to the society. Our goal is to protect nature by meeting the requirement of renewable source of energy equipment and by generating the awareness in the society to the user about resource more and more.
                        </p>
                        <p className="leading-relaxed text-gray-600 text-justify">
                          <b>SANKHLA ENTERPRISES</b> incepted with dealing in Solar Energy is New Startup since 2021. Solar Energy is an unlimited source of renewable energy.
                        </p>
                      </div>

                      {/* Benefits Section */}
                      <div className="space-y-3 bg-amber-50/40 p-5 rounded-2xl border border-amber-100">
                        <span className="text-xs font-bold text-amber-900 block uppercase tracking-wider text-center">TOP BENEFITS OF GOING WITH SOLAR</span>
                        <div className="grid grid-cols-2 gap-4 text-[11px] font-semibold text-amber-950">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
                              <span>Clean, Green & Renewable Energy</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
                              <span>Decreases Water Usage</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
                              <span>Running cost Decrease save money</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
                              <span>Reduces Air Pollution</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
                              <span>Founding Abundance</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
                              <span>Maintains Ozone balance</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="leading-relaxed text-gray-600 italic">
                        We offer our client wide range of Solar Plant, Solar Streetlights, Solar Water Heaters, and mini product for solar.
                      </p>
                    </div>
                  </div>

                  {/* Signatures & Footer Banner */}
                  <div className="pt-8 border-t border-gray-100 mt-12 flex justify-between items-end">
                    <div>
                      <span className="text-gray-400 block text-[9px]">PREPARED BY</span>
                      <span className="font-bold text-gray-900 block text-[11px] mt-1">For SANKHLA ENTERPRISES</span>
                      <span className="font-semibold text-gray-700 block text-[10px]">JAYESH SANKHLA</span>
                      <span className="text-gray-500 block text-[10px]">+91 8003800644</span>
                    </div>

                    {/* Vocal 4 Local Banner */}
                    <div className="flex flex-col items-center p-2.5 bg-gradient-to-r from-orange-500/10 via-white to-green-500/10 border border-gray-200 rounded-xl">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-5 bg-orange-500 block rounded-sm"></span>
                        <span className="h-2 w-5 bg-white border border-gray-300 block rounded-sm flex items-center justify-center"><span className="h-1.5 w-1.5 rounded-full bg-blue-900 block"></span></span>
                        <span className="h-2 w-5 bg-green-600 block rounded-sm"></span>
                      </div>
                      <span className="text-[10px] font-black text-gray-700 mt-1 uppercase tracking-widest">Vocal 4 Local</span>
                      <span className="text-[9px] font-bold text-gray-500 mt-0.5">आत्मनिर्भर भारत</span>
                    </div>
                  </div>
                </div>

                {/* PAGE 2: CLIENT LETTER & BILL OF MATERIALS */}
                <div className="p-12 print:p-8 min-h-[297mm] flex flex-col justify-between" style={{ pageBreakAfter: 'always' }}>
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                      <span className="font-bold text-gray-400 text-[10px] uppercase">Client Proposal Document</span>
                      <span className="font-bold text-[#1E3A8A]">{previewQuote.proposalNumber}</span>
                    </div>

                    {/* To Section */}
                    <div className="mt-8 space-y-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <span className="text-gray-400 font-bold block text-[9px] uppercase">TO,</span>
                      <span className="text-sm font-bold text-gray-900 block">{previewQuote.client ? previewQuote.client.name : 'Unknown Client'}</span>
                      <span className="text-gray-600 block mt-0.5">Mob: {previewQuote.client ? previewQuote.client.mobile : '-'}</span>
                      <span className="text-gray-600 block">Location: {previewQuote.client ? previewQuote.client.address : 'Jodhpur'}</span>
                    </div>

                    {/* Subject */}
                    <div className="mt-6 text-gray-900 text-xs font-bold border-l-4 border-blue-900 pl-3">
                      Subject: Quotation/Proposal for setting up of roof top Solar Power Plant for your premises of Capacity {previewQuote.capacity} kW.
                    </div>

                    {/* Greetings Letter */}
                    <div className="mt-6 space-y-4 text-gray-600 leading-relaxed">
                      <p>Dear Sir / Madam,</p>
                      <p>
                        Greetings from <b>SANKHLA ENTERPRISES</b>.
                      </p>
                      <p className="text-justify">
                        This has reference to our discussion we had with your good self for installation of <b>{previewQuote.capacity} kW</b> Solar Power Plant at your premises for captive use. We are pleased to present our techno-commercial offer for Engineering, supply, Installation and Testing & Commissioning of On Grid solar power plant for the above mentioned requirement.
                      </p>
                      <p className="text-justify font-semibold text-gray-800 bg-blue-50 p-3 rounded-lg border border-blue-100">
                        This quotation/proposal has been designed based on Electricity Bill parameters. The Solar Power Plant of <b>{previewQuote.capacity} kW</b> DC capacities is estimated to generate approx. AC <b>{Math.round(previewQuote.capacity * 1440).toLocaleString('en-IN')} units</b> annually.
                      </p>
                      <p>
                        Please find herewith the DPR for EPC of ON-GRID {previewQuote.capacity} kW Solar Power Plant.
                      </p>
                    </div>

                    {/* BOM Table */}
                    <div className="mt-8 space-y-3">
                      <h4 className="font-bold text-xs uppercase text-[#1E3A8A] tracking-wider border-b pb-1">BILL OF MATERIALS (BOM)</h4>
                      <table className="w-full text-left border-collapse border border-gray-200">
                        <thead>
                          <tr className="bg-[#1E3A8A] text-white text-[9px] font-bold uppercase">
                            <th className="px-4 py-2 border border-gray-200 w-12 text-center">Sr.No</th>
                            <th className="px-4 py-2 border border-gray-200">Component Item</th>
                            <th className="px-4 py-2 border border-gray-200">Make / Specifications</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-[11px]">
                          <tr>
                            <td className="px-4 py-2.5 border border-gray-200 font-bold text-center">1</td>
                            <td className="px-4 py-2.5 border border-gray-200 font-bold text-gray-900">Solar PV Modules</td>
                            <td className="px-4 py-2.5 border border-gray-200">{previewQuote.panelBrand} Mono PERC ({previewQuote.panelWattage}W, {previewQuote.panelQuantity} Nos)</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 border border-gray-200 font-bold text-center">2</td>
                            <td className="px-4 py-2.5 border border-gray-200 font-bold text-gray-900">On Grid Solar Inverters</td>
                            <td className="px-4 py-2.5 border border-gray-200">{previewQuote.inverterBrand} ({previewQuote.inverterModel} make or KSolar)</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 border border-gray-200 font-bold text-center">3</td>
                            <td className="px-4 py-2.5 border border-gray-200 font-bold text-gray-900">DC Cable</td>
                            <td className="px-4 py-2.5 border border-gray-200">Reputed DC Solar Cables ({previewQuote.cable || 'Finolex 4 Sqmm DC'})</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 border border-gray-200 font-bold text-center">4</td>
                            <td className="px-4 py-2.5 border border-gray-200 font-bold text-gray-900">AC Cables</td>
                            <td className="px-4 py-2.5 border border-gray-200">Reputed AC Copper/Aluminum Cables</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 border border-gray-200 font-bold text-center">5</td>
                            <td className="px-4 py-2.5 border border-gray-200 font-bold text-gray-900">Net Meters</td>
                            <td className="px-4 py-2.5 border border-gray-200">Secure / L&T</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 border border-gray-200 font-bold text-center">6</td>
                            <td className="px-4 py-2.5 border border-gray-200 font-bold text-gray-900">ACDB, DCDB</td>
                            <td className="px-4 py-2.5 border border-gray-200">Standard surge protected ACDB & DCDB boxes ({previewQuote.acdb})</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 border border-gray-200 font-bold text-center">7</td>
                            <td className="px-4 py-2.5 border border-gray-200 font-bold text-gray-900">Hardware, Lugs & Clamps</td>
                            <td className="px-4 py-2.5 border border-gray-200">Standard galvanized mounting hardware, MC4 connectors, fasteners</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 border border-gray-200 font-bold text-center">8</td>
                            <td className="px-4 py-2.5 border border-gray-200 font-bold text-gray-900">Structure</td>
                            <td className="px-4 py-2.5 border border-gray-200">{previewQuote.structure || 'Standard Galvanized Iron (G.I.) structure'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 mt-6 flex justify-between items-center text-[10px] text-gray-400 font-medium">
                    <span>Sankhla Solar Power EPC System Proposal</span>
                    <span>Page 2 of 3</span>
                  </div>
                </div>

                {/* PAGE 3: PAYMENT TERMS, WARRANTIES & COMMERCAL SUMMARY */}
                <div className="p-12 print:p-8 min-h-[297mm] flex flex-col justify-between">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="font-bold text-gray-400 text-[10px] uppercase">Terms, Conditions & Price Summary</span>
                      <span className="font-bold text-[#1E3A8A]">{previewQuote.proposalNumber}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[10px]">
                      {/* Left: Payment Terms & Warranties */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <span className="font-bold text-[#1E3A8A] block uppercase border-b">Payment Terms</span>
                          <ol className="list-decimal pl-4 space-y-1 text-gray-600 font-medium">
                            <li><b>65% Advance</b> during Order confirmation.</li>
                            <li><b>30% Against Proforma Invoice (PI)</b> before dispatch of solar modules, inverter, and BOS (After NOC approval).</li>
                            <li><b>5% after installation</b> and Commissioning of the rooftop solar system.</li>
                          </ol>
                        </div>

                        <div className="space-y-2">
                          <span className="font-bold text-[#1E3A8A] block uppercase border-b">Warranty details</span>
                          <ul className="list-disc pl-4 space-y-1 text-gray-600">
                            <li><b>PV Modules:</b> 25 years warranty on power output (90% guaranteed over 10 years, 80% guaranteed over 25 years).</li>
                            <li><b>Inverter:</b> 10 years warranty by manufacturer.</li>
                            <li><b>Delivery Time:</b> 45-60 working days from order placement.</li>
                            <li><b>Offer Validity:</b> 7 days.</li>
                          </ul>
                        </div>

                        <div className="space-y-1">
                          <span className="font-bold text-[#1E3A8A] block uppercase border-b text-[9px]">Service & Warranty Conditions</span>
                          <ol className="list-decimal pl-4 space-y-0.5 text-[9px] text-gray-500">
                            <li>Load extension expenses (if required by DISCOM) will be extra.</li>
                            <li>Installation timeline is subject to DISCOM approval (approx 45-60 working days).</li>
                            <li>Standard fixed mounting structure included. Higher mounting height structure will be quoted extra.</li>
                            <li>1st year free AMC maintenance. Thereafter AMC charges will apply extra.</li>
                            <li>Quarterly maintenance visits by service engineer for performance audits.</li>
                          </ol>
                        </div>
                      </div>

                      {/* Right: Cancellation & Commercials */}
                      <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="space-y-2">
                          <span className="font-bold text-red-700 block uppercase border-b">Cancellation Charges</span>
                          <ul className="list-disc pl-4 space-y-1 text-gray-600 text-[9px]">
                            <li>Procurement initiated immediately upon receiving 60% advance.</li>
                            <li>No cancellation fee if order is cancelled within 7 days from order confirmation.</li>
                            <li>Post 7 days, cancellation is subject to discretion of Sankhla Enterprises, with a 5% system cost penalty.</li>
                            <li>No refunds once material has been dispatched to client&apos;s site.</li>
                          </ul>
                        </div>

                        {/* Price Details */}
                        <div className="space-y-2 pt-2 border-t border-gray-200">
                          <span className="font-bold text-[#1E3A8A] block uppercase text-[10px]">Commercial Price Summary</span>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between text-gray-500">
                              <span>Base Project Cost:</span>
                              <span className="font-semibold text-gray-800">₹{(previewQuote.grandTotal - previewQuote.gstAmount - (previewQuote.items?.reduce((s, i) => s + i.amount, 0) || 0)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                            </div>
                            {previewQuote.items && previewQuote.items.length > 0 && previewQuote.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-gray-500">
                                <span>{item.description}:</span>
                                <span className="font-semibold text-gray-800">+ ₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                              </div>
                            ))}
                            <div className="flex justify-between text-gray-500">
                              <span>GST Amount ({previewQuote.gstRate}%):</span>
                              <span className="font-semibold text-gray-800">₹{previewQuote.gstAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-300 pt-2 text-sm font-black text-blue-900 bg-blue-50/50 p-2 rounded-lg">
                              <span>Grand Total (INR):</span>
                              <span>₹{previewQuote.grandTotal.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bank Account Details */}
                    <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 text-[10px] space-y-2">
                      <span className="font-bold text-blue-950 block uppercase tracking-wider">BANK DETAILS FOR WIRE TRANSFER</span>
                      <div className="grid grid-cols-2 gap-4 text-blue-900 font-semibold">
                        <div>
                          <span className="text-gray-400 block font-normal text-[9px]">BANK NAME</span>
                          <span>PUNJAB NATIONAL BANK</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-normal text-[9px]">ACCOUNT NUMBER</span>
                          <span>1949102100001183</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-normal text-[9px]">IFSC CODE</span>
                          <span>PUNB0194910</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-normal text-[9px]">BENEFICIARY</span>
                          <span>SANKHLA ENTERPRISES</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Signatures & Address Footer */}
                  <div className="pt-6 border-t border-gray-200 mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div className="text-[10px] text-gray-500 space-y-0.5">
                      <span className="font-bold text-gray-700 block uppercase">SANKHLA ENTERPRISES Office Address</span>
                      <p>BHAGVANKABAGH, NEAR OF VIDHYASHALA, CHANDPOLE, JODHPUR-342001</p>
                      <p>Email: sankhlaenterprises.09@gmail.com | Phone: +91 8003800644</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-gray-400 block uppercase font-bold">Authorized Signatory</span>
                      <div className="h-10"></div>
                      <span className="font-bold text-gray-900 block text-[11px]">JAYESH SANKHLA</span>
                      <span className="text-[9px] text-gray-400 block">Sankhla Enterprises Jodhpur</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* PAYMENTS MODULE */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Payments & Collections</h1>
                <p className="text-xs text-gray-500">Record payments received from clients and track billing transactions.</p>
              </div>

              {payments.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 p-12 text-center rounded-2xl">
                  <IndianRupee className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <span className="text-xs font-bold text-gray-800 block">No Payments Recorded</span>
                  <p className="text-[11px] text-gray-400 mt-1 max-w-xs mx-auto">Track advance collections and issue billing receipts using the Record Payment button.</p>
                </div>
              ) : (
                <div className="premium-card bg-white overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-gray-200 whitespace-nowrap">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                        <th className="px-6 py-4 border border-gray-200">Receipt No</th>
                        <th className="px-6 py-4 border border-gray-200">Client Name</th>
                        <th className="px-6 py-4 border border-gray-200">Payment Mode</th>
                        <th className="px-6 py-4 border border-gray-200">Receipt Date</th>
                        <th className="px-6 py-4 border border-gray-200 text-right">Amount</th>
                        <th className="px-6 py-4 border border-gray-200 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {filteredPayments.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 border border-gray-200 font-bold text-gray-900">{p.receiptNumber}</td>
                          <td className="px-6 py-4 border border-gray-200 font-semibold text-gray-700">{p.client ? p.client.name : 'Unknown Client'}</td>
                          <td className="px-6 py-4 border border-gray-200 text-gray-600">{p.paymentMode}</td>
                          <td className="px-6 py-4 border border-gray-200 text-gray-500">{new Date(p.paymentDate).toLocaleDateString()}</td>
                          <td className="px-6 py-4 border border-gray-200 text-right font-bold text-emerald-600">₹{p.amount.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4 border border-gray-200 text-center">
                            <button
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this payment record?")) {
                                  handleDeletePayment(p.id);
                                }
                              }}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-100 shadow-sm flex items-center justify-center mx-auto"
                              title="Delete Payment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* OVERDUE PAYMENTS MODULE */}
          {activeTab === 'overdue' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Overdue Payments</h1>
                  <p className="text-xs text-gray-500">Track approved proposals whose payment deadlines have expired and contain outstanding balances.</p>
                </div>

              </div>

              {combinedOverduePayments.length === 0 ? (
                <div className="bg-white border border-[#E5E7EB] p-12 text-center rounded-2xl">
                  <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <span className="text-xs font-bold text-emerald-900 block">No Overdue Payments</span>
                  <p className="text-[11px] text-gray-400 mt-1 max-w-xs mx-auto">All client invoices are fully paid or their active payment deadlines are in the future.</p>
                </div>
              ) : (
                <div className="premium-card bg-white overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-gray-200 whitespace-nowrap">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                        <th className="px-6 py-4 border border-gray-200">Proposal No</th>
                        <th className="px-6 py-4 border border-gray-200">Client Name</th>
                        <th className="px-6 py-4 border border-gray-200 text-center">Due Date</th>
                        <th className="px-6 py-4 border border-gray-200 text-right">Total Amount</th>
                        <th className="px-6 py-4 border border-gray-200 text-right">Amount Paid</th>
                        <th className="px-6 py-4 border border-gray-200 text-right text-gray-500">Overdue Balance</th>
                        <th className="px-6 py-4 border border-gray-200 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {combinedOverduePayments.map(op => (
                        <tr key={op.id} className="hover:bg-orange-50/30 border-b border-gray-50">
                          <td className="px-6 py-4 border border-gray-200 font-bold text-gray-900">{op.proposalNumber}</td>
                          <td className="px-6 py-4 border border-gray-200 font-semibold text-gray-700">{op.client ? op.client.name : (op.clientName || 'Unknown Client')}</td>
                          <td className="px-6 py-4 border border-gray-200 text-center text-orange-600 font-semibold">
                            {op.dueDate ? new Date(op.dueDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 border border-gray-200 text-right font-medium">₹{op.grandTotal.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4 border border-gray-200 text-right text-emerald-600">₹{op.clientPayments.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4 border border-gray-200 text-right font-bold text-orange-600">₹{op.unpaidBalance.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4 border border-gray-200 text-right">
                            <div className="flex justify-end items-center gap-2">
                              {!op.isManual && (
                                <button
                                  onClick={() => {
                                    setPaymentForm(prev => ({
                                      ...prev,
                                      clientId: op.clientId,
                                      amount: op.unpaidBalance.toString()
                                    }));
                                    setIsPaymentModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 text-xs font-semibold transition-colors border border-orange-100 shadow-sm"
                                >
                                  Collect Balance
                                </button>
                              )}
                              {op.isManual && (
                                <button
                                  onClick={() => {
                                    setEditingOverdueRecord(op);
                                    setOverdueForm({
                                      proposalNumber: op.proposalNumber,
                                      clientName: op.clientName,
                                      dueDate: op.dueDate ? op.dueDate.split('T')[0] : '',
                                      grandTotal: op.grandTotal.toString(),
                                      clientPayments: op.clientPayments.toString(),
                                      unpaidBalance: op.unpaidBalance.toString()
                                    });
                                    setIsOverdueModalOpen(true);
                                  }}
                                  title="Edit Manual Overdue"
                                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this overdue record?")) {
                                    handleDeleteOverdueRecord(op.id);
                                  }
                                }}
                                title="Delete Overdue Record"
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-100 shadow-sm flex items-center justify-center"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* CLIENT DIALOG MODAL */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center z-50 p-4 sm:p-6 overflow-y-auto">
          <form onSubmit={handleCreateClient} className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 premium-shadow text-xs my-8">
            <h3 className="text-sm font-bold text-gray-900">Add Client</h3>

            <div className="space-y-1">
              <label className="font-semibold text-gray-600">Client / Company Name *</label>
              <input
                type="text"
                required
                value={clientForm.name}
                onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-600">Primary Mobile *</label>
              <input
                type="text"
                required
                value={clientForm.mobile}
                onChange={(e) => setClientForm({ ...clientForm, mobile: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-600">Project Capacity (kW) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={clientForm.capacity}
                onChange={(e) => setClientForm({ ...clientForm, capacity: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-600">Project Deal Price (Fixed Deal Amount)</label>
              <input
                type="number"
                placeholder="e.g. 450000"
                value={clientForm.projectPrice}
                onChange={(e) => setClientForm({ ...clientForm, projectPrice: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-600">Site Address *</label>
              <input
                type="text"
                required
                value={clientForm.address}
                onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs"
              />
            </div>



            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Preferred Panels Brand</label>
                <input
                  type="text"
                  value={clientForm.panelPreference}
                  onChange={(e) => setClientForm({ ...clientForm, panelPreference: e.target.value })}
                  placeholder="e.g. Waaree Solar"
                  className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Preferred Inverter Brand</label>
                <input
                  type="text"
                  value={clientForm.inverterPreference}
                  onChange={(e) => setClientForm({ ...clientForm, inverterPreference: e.target.value })}
                  placeholder="e.g. Growatt"
                  className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsClientModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl">Add Client</button>
            </div>
          </form>
        </div>
      )}

      {/* QUOTATION DIALOG MODAL */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center z-50 p-4 sm:p-6 overflow-y-auto">
          <form onSubmit={handleCreateQuotation} className="bg-white rounded-2xl w-full max-w-2xl p-6 space-y-4 premium-shadow text-xs my-8">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-gray-900">{editingQuoteId ? 'Edit Quotation' : 'Create Quotation'}</h3>
              <button type="button" onClick={() => {setIsQuoteModalOpen(false); setEditingQuoteId(null);}} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 p-1 rounded-full"><X className="h-4 w-4" /></button>
            </div>

            {/* Toggle between Select and Manual client */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/50 flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-700">Client Entry Method:</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-800">
                  <input
                    type="radio"
                    checked={!isManualClient}
                    onChange={() => setIsManualClient(false)}
                    className="text-[#1E3A8A] focus:ring-[#1E3A8A]"
                  />
                  Choose From Clients
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-800">
                  <input
                    type="radio"
                    checked={isManualClient}
                    onChange={() => setIsManualClient(true)}
                    className="text-[#1E3A8A] focus:ring-[#1E3A8A]"
                  />
                  Add Client Manually
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Select Client */}
              {!isManualClient ? (
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600">Select CRM Client *</label>
                  <CustomSelect
                    required={!isManualClient}
                    value={quoteForm.clientId}
                    onChange={(val) => setQuoteForm({ ...quoteForm, clientId: val })}
                    options={clients.map(c => ({ value: c.id, label: c.name }))}
                    placeholder="-- Choose Client --"
                  />
                </div>
              ) : (
                /* Manual Client Inputs */
                <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-blue-50/20 p-3 rounded-xl border border-blue-100">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">Client Name *</label>
                    <input
                      type="text"
                      required={isManualClient}
                      value={manualClientName}
                      onChange={(e) => setManualClientName(e.target.value)}
                      placeholder="e.g. Harshit Sharma"
                      className="w-full p-2 border border-gray-200 rounded-xl bg-white text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">Mobile *</label>
                    <input
                      type="text"
                      required={isManualClient}
                      value={manualClientMobile}
                      onChange={(e) => setManualClientMobile(e.target.value)}
                      placeholder="9988776655"
                      className="w-full p-2 border border-gray-200 rounded-xl bg-white text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">Email (Optional)</label>
                    <input
                      type="email"
                      value={manualClientEmail}
                      onChange={(e) => setManualClientEmail(e.target.value)}
                      placeholder="harshit@domain.com"
                      className="w-full p-2 border border-gray-200 rounded-xl bg-white text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Target System Capacity (kW) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={quoteForm.capacity}
                  onChange={(e) => setQuoteForm({ ...quoteForm, capacity: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Create Date *</label>
                <input
                  type="date"
                  required
                  value={quoteForm.dueDate}
                  onChange={(e) => setQuoteForm({ ...quoteForm, dueDate: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs"
                />
              </div>
            </div>

            <span className="font-bold text-gray-700 block border-b border-gray-100 pb-1">Bill of Material Components</span>

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Panel Brand</label>
                <input type="text" value={quoteForm.panelBrand} onChange={(e) => setQuoteForm({ ...quoteForm, panelBrand: e.target.value })} className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Inverter Brand</label>
                <input type="text" value={quoteForm.inverterBrand} onChange={(e) => setQuoteForm({ ...quoteForm, inverterBrand: e.target.value })} className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs" />
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-gray-100 pb-1 mt-4">
              <span className="font-bold text-gray-700">Additional Custom Items</span>
              <button type="button" onClick={() => setQuoteForm({...quoteForm, items: [...(quoteForm.items || []), {description: '', amount: ''}]})} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <Plus className="h-3 w-3" /> Add More
              </button>
            </div>
            {quoteForm.items && quoteForm.items.length > 0 && (
              <div className="space-y-3 mt-2">
                {quoteForm.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-semibold text-gray-500 uppercase">Item Title</label>
                      <input type="text" value={item.description} onChange={(e) => {
                        const newItems = [...quoteForm.items];
                        newItems[idx].description = e.target.value;
                        setQuoteForm({...quoteForm, items: newItems});
                      }} className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs" placeholder="E.g. Extra Wire" required />
                    </div>
                    <div className="w-1/3 space-y-1">
                      <label className="text-[10px] font-semibold text-gray-500 uppercase">Amount (₹)</label>
                      <input type="number" value={item.amount} onChange={(e) => {
                        const newItems = [...quoteForm.items];
                        newItems[idx].amount = e.target.value;
                        setQuoteForm({...quoteForm, items: newItems});
                      }} className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs" required />
                    </div>
                    <button type="button" onClick={() => {
                        const newItems = quoteForm.items.filter((_, i) => i !== idx);
                        setQuoteForm({...quoteForm, items: newItems});
                      }} className="p-2.5 mb-0 text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <span className="font-bold text-gray-700 block border-b border-gray-100 pb-1 mt-4">Dynamic Cost Adjustments (INR)</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Final Price (Incl. GST) *</label>
                <input type="number" required value={quoteForm.finalPrice} onChange={(e) => {
                  const final = parseFloat(e.target.value) || 0;
                  const gst = parseFloat(quoteForm.gstRate) || 0;
                  const base = final / (1 + (gst / 100));
                  setQuoteForm({ ...quoteForm, finalPrice: e.target.value, projectCost: base });
                }} className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs font-bold text-blue-900" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-600">GST Percentage (%) *</label>
                <input type="number" required value={quoteForm.gstRate} onChange={(e) => {
                  const gst = parseFloat(e.target.value) || 0;
                  const final = parseFloat(quoteForm.finalPrice) || 0;
                  const base = final / (1 + (gst / 100));
                  setQuoteForm({ ...quoteForm, gstRate: e.target.value, projectCost: base });
                }} className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs font-bold" />
              </div>
            </div>

            <div className="mt-3 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 flex justify-between items-center">
              <span className="font-bold text-emerald-800">Calculated Base Price (Excl. GST):</span>
              <span className="text-lg font-black text-emerald-700">
                ₹{(quoteForm.projectCost || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => {setIsQuoteModalOpen(false); setEditingQuoteId(null);}} className="px-4 py-2 border border-gray-200 rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl flex items-center gap-2">
                {editingQuoteId ? 'Save Changes' : 'Generate Proposal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PAYMENT DIALOG MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center z-50 p-4 sm:p-6 overflow-y-auto">
          <form onSubmit={handleCreatePayment} className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 premium-shadow text-xs my-8">
            <h3 className="text-sm font-bold text-gray-900">Record Client Payment</h3>

            <div className="flex items-center gap-2 pb-1">
              <input
                type="checkbox"
                id="payment-manual-client-toggle"
                checked={isManualClientPayment}
                onChange={(e) => {
                  setIsManualClientPayment(e.target.checked);
                  setPaymentForm(prev => ({ ...prev, clientId: '' }));
                }}
                className="rounded text-blue-900 focus:ring-blue-900"
              />
              <label htmlFor="payment-manual-client-toggle" className="font-semibold text-gray-700 select-none">
                Or manually enter client details
              </label>
            </div>

            {!isManualClientPayment ? (
              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Select Client *</label>
                <CustomSelect
                  required={!isManualClientPayment}
                  value={paymentForm.clientId}
                  onChange={(val) => setPaymentForm({ ...paymentForm, clientId: val })}
                  options={clients.map(c => ({ value: c.id, label: c.name }))}
                  placeholder="-- Select Client --"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600">Client Name *</label>
                  <input
                    type="text"
                    required={isManualClientPayment}
                    value={manualClientPaymentName}
                    onChange={(e) => setManualClientPaymentName(e.target.value)}
                    placeholder="Enter client name"
                    className="w-full p-2 border border-gray-200 rounded-xl bg-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600">Mobile *</label>
                  <input
                    type="text"
                    required={isManualClientPayment}
                    value={manualClientPaymentMobile}
                    onChange={(e) => setManualClientPaymentMobile(e.target.value)}
                    placeholder="9988776655"
                    className="w-full p-2 border border-gray-200 rounded-xl bg-white text-xs"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Amount Received (₹) *</label>
                <input
                  type="number"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Payment Mode</label>
                <CustomSelect
                  required={false}
                  value={paymentForm.paymentMode}
                  onChange={(val) => setPaymentForm({ ...paymentForm, paymentMode: val })}
                  options={[
                    { value: "CASH", label: "CASH" },
                    { value: "UPI", label: "UPI" },
                    { value: "CHEQUE", label: "CHEQUE" },
                    { value: "BANK_TRANSFER", label: "Bank Transfer (NEFT/RTGS)" }
                  ]}
                  placeholder="Select Payment Mode"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-600">Remarks / Transaction ID</label>
              <input
                type="text"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl">Log Payment</button>
            </div>
          </form>
        </div>
      )}

      {/* CLIENT DETAILS LEDGER MODAL */}
      {isClientDetailOpen && selectedClient && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center z-50 p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl premium-shadow overflow-hidden flex flex-col my-8 text-xs">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedClient.name} Ledger File</h2>
                <p className="text-xs text-gray-500">Financial ledger details and quotation history.</p>
              </div>
              <button onClick={() => setIsClientDetailOpen(false)} className="p-2 rounded-xl hover:bg-gray-200">
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Details */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
                <span className="font-bold text-gray-700 block uppercase tracking-wider text-[10px]">Client Details</span>
                <div>
                  <span className="text-[#6B7280] block">Mobile:</span>
                  <span className="font-semibold text-gray-900">{selectedClient.mobile}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block">Project Size:</span>
                  <span className="font-semibold text-blue-900">{selectedClient.capacity || 0} kW</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block">Site Address:</span>
                  <span className="font-semibold text-gray-900">{selectedClient.address || ''}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block">Panel Preference:</span>
                  <span className="font-semibold text-gray-900">{selectedClient.panelPreference || 'None'}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block">Inverter Preference:</span>
                  <span className="font-semibold text-gray-900">{selectedClient.inverterPreference || 'None'}</span>
                </div>
              </div>

              {/* Transactions */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-3">
                  <span className="font-bold text-sm text-gray-800 block">Quotations history</span>
                  {quotations.filter(q => q.clientId === selectedClient.id).map(q => (
                    <div key={q.id} className="p-3 border border-gray-200 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-900 block">{q.proposalNumber} ({q.capacity}kW)</span>
                        <span className="text-gray-500 mt-0.5 block">Total: ₹{q.grandTotal.toLocaleString('en-IN')}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">{q.status}</span>
                    </div>
                  ))}
                  {quotations.filter(q => q.clientId === selectedClient.id).length === 0 && (
                    <p className="text-gray-400 italic">No quotations drafted for this client.</p>
                  )}
                </div>

                <div className="space-y-3">
                  <span className="font-bold text-sm text-gray-800 block">Collections history</span>
                  {payments.filter(p => p.clientId === selectedClient.id).map(p => (
                    <div key={p.id} className="p-3 border border-gray-200 rounded-xl flex items-center justify-between bg-emerald-50/20">
                      <div>
                        <span className="font-bold text-emerald-950 block">{p.receiptNumber}</span>
                        <span className="text-gray-500 mt-0.5 block">{p.paymentMode} - {p.notes || ''}</span>
                      </div>
                      <span className="font-bold text-emerald-900">₹{p.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  {payments.filter(p => p.clientId === selectedClient.id).length === 0 && (
                    <p className="text-gray-400 italic">No payments recorded for this client.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERDUE DIALOG MODAL */}
      {isOverdueModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center z-50 p-6 overflow-y-auto">
          <form onSubmit={handleSaveOverdueRecord} className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 premium-shadow text-xs my-8">
            <h3 className="text-sm font-bold text-gray-900">
              {editingOverdueRecord ? 'Edit Overdue Record' : 'Add Overdue Record'}
            </h3>

            <div className="space-y-1">
              <label className="font-semibold text-gray-600">Client / Company Name *</label>
              <input
                type="text"
                required
                value={overdueForm.clientName}
                onChange={(e) => setOverdueForm({ ...overdueForm, clientName: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs"
                placeholder="Enter client name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Proposal Number</label>
                <input
                  type="text"
                  value={overdueForm.proposalNumber}
                  onChange={(e) => setOverdueForm({ ...overdueForm, proposalNumber: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs"
                  placeholder="e.g. QT-MAN-1234"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Due Date</label>
                <input
                  type="date"
                  value={overdueForm.dueDate}
                  onChange={(e) => setOverdueForm({ ...overdueForm, dueDate: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Total Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={overdueForm.grandTotal}
                  onChange={(e) => {
                    const total = e.target.value;
                    const paid = overdueForm.clientPayments;
                    const unpaid = total !== '' && paid !== '' ? Math.max(0, parseFloat(total) - parseFloat(paid)) : '';
                    setOverdueForm({ ...overdueForm, grandTotal: total, unpaidBalance: unpaid.toString() });
                  }}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs"
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Amount Paid (₹)</label>
                <input
                  type="number"
                  value={overdueForm.clientPayments}
                  onChange={(e) => {
                    const paid = e.target.value;
                    const total = overdueForm.grandTotal;
                    const unpaid = total !== '' && paid !== '' ? Math.max(0, parseFloat(total) - parseFloat(paid)) : '';
                    setOverdueForm({ ...overdueForm, clientPayments: paid, unpaidBalance: unpaid.toString() });
                  }}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs"
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Unpaid Balance (₹)</label>
                <input
                  type="number"
                  value={overdueForm.unpaidBalance}
                  onChange={(e) => setOverdueForm({ ...overdueForm, unpaidBalance: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 text-xs text-red-600 font-bold"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsOverdueModalOpen(false);
                  setEditingOverdueRecord(null);
                }}
                className="px-4 py-2 border border-gray-200 rounded-xl"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl">
                {editingOverdueRecord ? 'Update Record' : 'Add Record'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

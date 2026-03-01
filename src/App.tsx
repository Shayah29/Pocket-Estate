import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  Plus, 
  ChevronRight, 
  MapPin, 
  Home, 
  DollarSign, 
  Calendar,
  Upload,
  Loader2,
  Search,
  MoreVertical,
  ArrowLeft,
  MessageSquare,
  CreditCard,
  Bell,
  Settings,
  Newspaper,
  ExternalLink,
  PieChart,
  TrendingUp,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  CalendarDays,
  Pencil,
  Trash2,
  Menu,
  X,
  Bot,
  Send,
  CheckCircle2,
  Sun,
  Moon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import Markdown from 'react-markdown';
import { Property, Unit, Tenant, Document, Payment, Message, LateFeeRule, Expense, Vendor, MaintenanceRequest, ScheduledMaintenance, Communication } from './types';

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab, isOpen, onClose, theme, toggleTheme }: { activeTab: string, setActiveTab: (t: string) => void, isOpen: boolean, onClose: () => void, theme: 'light' | 'dark', toggleTheme: () => void }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'properties', icon: Building2, label: 'Properties' },
    { id: 'financials', icon: PieChart, label: 'Financials' },
    { id: 'maintenance', icon: Wrench, label: 'Maintenance' },
    { id: 'assistant', icon: Bot, label: 'AI Assistant' },
    { id: 'news', icon: Newspaper, label: 'Market News' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={onClose} 
      />
      
      {/* Sidebar Content */}
      <div className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 ease-in-out dark:bg-slate-900 dark:border-slate-800
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 dark:text-white">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white dark:bg-white dark:text-slate-900">
              <DollarSign size={18} />
            </div>
            Pocket Estate
          </h1>
          <button onClick={onClose} className="md:hidden p-1 rounded-lg hover:bg-slate-100 text-slate-500 dark:hover:bg-slate-800">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === item.id 
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 dark:bg-white dark:text-slate-900' 
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <span className="flex items-center gap-2">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'}`}>
              <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-300 ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>

          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold dark:bg-slate-700 dark:text-white">JD</div>
            <div>
              <p className="text-sm font-medium dark:text-white">John Doe</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Landlord</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const PropertyCard = ({ property, onClick }: { property: Property, onClick: () => void, key?: any }) => {
  const [unitCount, setUnitCount] = useState(0);

  useEffect(() => {
    fetch(`/api/properties/${property.id}/units`)
      .then(res => res.json())
      .then(data => setUnitCount(data.length))
      .catch(err => console.error(err));
  }, [property.id]);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="card cursor-pointer hover:border-slate-300 transition-all group dark:hover:border-slate-600"
    >
      <div className="h-40 bg-slate-100 relative overflow-hidden dark:bg-slate-800">
        <img 
          src={`https://picsum.photos/seed/${property.id}/800/600`} 
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-bold uppercase tracking-wider dark:bg-slate-900/90 dark:text-white">
          {property.type}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg mb-1 dark:text-white">{property.name}</h3>
        <p className="text-slate-500 text-sm flex items-center gap-1 mb-4 dark:text-slate-400">
          <MapPin size={14} /> {property.address}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-tighter dark:text-slate-500">Monthly Rent</span>
            <span className="font-bold text-slate-900 dark:text-white">${property.rent_price}</span>
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-tighter dark:text-slate-500">Units</span>
            <span className="font-bold text-slate-900 dark:text-white">{unitCount}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DocumentUpload = ({ entityType, entityId, onUploadSuccess }: { entityType: string, entityId: number, onUploadSuccess: () => void }) => {
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entity_type', entityType);
    formData.append('entity_id', entityId.toString());

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setSummary(data.summary);
      onUploadSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input 
          type="file" 
          onChange={handleFileChange}
          className="hidden" 
          id="file-upload" 
          disabled={uploading}
        />
        <label 
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {uploading ? (
            <Loader2 className="animate-spin text-slate-400" />
          ) : (
            <>
              <Upload className="text-slate-400 mb-2" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Click to upload document</span>
              <span className="text-xs text-slate-400">PDF, JPG, PNG (AI analysis included)</span>
            </>
          )}
        </label>
      </div>

      {summary && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white">
              <FileText size={12} />
            </div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">AI Summary</span>
          </div>
          <p className="text-sm text-emerald-900 leading-relaxed">{summary}</p>
        </motion.div>
      )}
    </div>
  );
};

// --- Views ---

const AssistantView = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Hello! I'm your property management assistant. I can help you send rent reminders, maintenance updates, or answer questions about your properties. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    const res = await fetch('/api/communications');
    const data = await res.json();
    setCommunications(data);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      
      if (data.actions && data.actions.length > 0) {
        fetchCommunications();
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error processing your request." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-8rem)]">
      {/* Chat Interface */}
      <div className="lg:col-span-2 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-full dark:bg-slate-900 dark:border-slate-800">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3 dark:bg-slate-900 dark:border-slate-800">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-none">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">AI Assistant</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Always here to help</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-tr-none dark:bg-slate-700' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-indigo-600" />
                <span className="text-xs text-slate-500 font-medium">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your request..."
              className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-indigo-200"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* Communications Log */}
      <div className="flex flex-col h-full space-y-4 overflow-hidden">
        <h3 className="font-bold text-lg px-1">Recent Activity</h3>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4">
          {communications.length === 0 ? (
            <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-400 text-sm">No messages sent yet.</p>
            </div>
          ) : (
            communications.map(comm => (
              <div key={comm.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    comm.type === 'rent_reminder' ? 'bg-amber-100 text-amber-700' :
                    comm.type === 'maintenance_update' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {comm.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {format(new Date(comm.sent_at), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900">To: {comm.tenant_name}</p>
                <p className="text-xs text-slate-600 line-clamp-3 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                  "{comm.content}"
                </p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                  <CheckCircle2 size={12} /> Sent
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const FinancialsView = () => {
  const [summary, setSummary] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>([]);
  const [rentRoll, setRentRoll] = useState<any[]>([]);
  const [projections, setProjections] = useState<any>(null);

  useEffect(() => {
    fetch('/api/financials/summary').then(res => res.json()).then(setSummary);
    fetch('/api/financials/monthly').then(res => res.json()).then(setMonthlyData);
    fetch('/api/financials/expenses-by-category').then(res => res.json()).then(setExpensesByCategory);
    fetch('/api/financials/rent-roll').then(res => res.json()).then(setRentRoll);
    fetch('/api/financials/projections').then(res => res.json()).then(setProjections);
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (!summary) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Financial Overview</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <p className="text-sm text-slate-500 font-medium">Total Income (YTD)</p>
          <p className="text-2xl font-bold text-emerald-600">${summary.income.toLocaleString()}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-slate-500 font-medium">Total Expenses (YTD)</p>
          <p className="text-2xl font-bold text-rose-600">${summary.expenses.toLocaleString()}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-slate-500 font-medium">Net Profit (YTD)</p>
          <p className={`text-2xl font-bold ${summary.net_profit >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
            ${summary.net_profit.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-lg">Income vs Expenses</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#f43f5e" name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-lg">Expenses by Category</h3>
          <div className="h-64">
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="category"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <PieChart size={48} className="mb-2 opacity-20" />
                <p>No expenses recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projections */}
      {projections && (
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <TrendingUp size={20} /> 12-Month Cash Flow Projection
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-slate-500 text-sm">Projected Income</p>
              <p className="text-xl font-bold text-emerald-600">${projections.projected_income.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Estimated Expenses</p>
              <p className="text-xl font-bold text-rose-600">${projections.projected_expenses.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Projected Cash Flow</p>
              <p className="text-xl font-bold text-blue-600">${projections.projected_cash_flow.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            *Based on current active leases and average historical expenses.
          </p>
        </div>
      )}

      {/* Rent Roll */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-lg">Rent Roll</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Property</th>
                <th className="px-6 py-3">Unit</th>
                <th className="px-6 py-3">Tenant</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Lease End</th>
                <th className="px-6 py-3 text-right">Rent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rentRoll.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium">{item.property_name}</td>
                  <td className="px-6 py-3">{item.unit_number}</td>
                  <td className="px-6 py-3">{item.tenant_name || '-'}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      item.status === 'occupied' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">{item.lease_end ? new Date(item.lease_end).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-3 text-right font-mono">${item.rent_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MaintenanceView = ({ properties, selectedProperty }: { properties: Property[], selectedProperty: Property | null }) => {
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'scheduled' | 'vendors'>('requests');
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledMaintenance[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isAddingRequest, setIsAddingRequest] = useState(false);
  const [isAddingScheduled, setIsAddingScheduled] = useState(false);
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  
  // Edit states
  const [editingRequest, setEditingRequest] = useState<MaintenanceRequest | null>(null);
  const [editingScheduled, setEditingScheduled] = useState<ScheduledMaintenance | null>(null);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqsRes, schedRes, vendRes] = await Promise.all([
        fetch('/api/maintenance/requests'),
        fetch('/api/maintenance/scheduled'),
        fetch('/api/vendors')
      ]);
      setRequests(await reqsRes.json());
      setScheduled(await schedRes.json());
      setVendors(await vendRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (id: number, status: string) => {
    await fetch(`/api/maintenance/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchData();
  };

  const handleVendorAssign = async (id: number, vendorId: number) => {
    await fetch(`/api/maintenance/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendor_id: vendorId })
    });
    fetchData();
  };
  
  const handleDeleteRequest = async (id: number) => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    await fetch(`/api/maintenance/requests/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleDeleteScheduled = async (id: number) => {
    if (!confirm('Are you sure you want to delete this scheduled task?')) return;
    await fetch(`/api/maintenance/scheduled/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleDeleteVendor = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
    fetchData();
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Maintenance</h1>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 overflow-x-auto">
          {[
            { id: 'requests', label: 'Requests' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'vendors', label: 'Vendors' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSubTab === tab.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => { setEditingRequest(null); setIsAddingRequest(true); }} className="btn-primary flex items-center gap-2">
              <Plus size={18} /> New Request
            </button>
          </div>
          
          <div className="grid gap-4">
            {requests.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-2xl border border-slate-200">
                <Wrench className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No maintenance requests</h3>
                <p className="text-slate-500">Tenants haven't submitted any requests yet.</p>
              </div>
            ) : (
              requests.map(req => (
                <div key={req.id} className="card p-6 flex flex-col md:flex-row gap-6 group relative">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingRequest(req); setIsAddingRequest(true); }} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-600">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDeleteRequest(req.id)} className="p-2 bg-rose-50 rounded-lg hover:bg-rose-100 text-rose-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        req.priority === 'Emergency' ? 'bg-rose-100 text-rose-700' :
                        req.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                        req.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {req.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        req.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        req.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {req.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        {format(new Date(req.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg">{req.title}</h3>
                    <p className="text-slate-600 text-sm">{req.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
                      <span className="flex items-center gap-1"><Home size={14} /> {req.property_name}, Unit {req.unit_number}</span>
                      <span className="flex items-center gap-1"><Users size={14} /> {req.tenant_name}</span>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-64 space-y-3 border-l border-slate-100 pl-0 md:pl-6">
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Status</label>
                      <select 
                        value={req.status}
                        onChange={(e) => handleStatusUpdate(req.id, e.target.value)}
                        className="w-full p-2 text-sm border border-slate-200 rounded-lg"
                      >
                        <option>Pending</option>
                        <option>Approved</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Assigned Vendor</label>
                      <select 
                        value={req.vendor_id || ''}
                        onChange={(e) => handleVendorAssign(req.id, parseInt(e.target.value))}
                        className="w-full p-2 text-sm border border-slate-200 rounded-lg"
                      >
                        <option value="">Unassigned</option>
                        {vendors.map(v => (
                          <option key={v.id} value={v.id}>{v.name} ({v.category})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'scheduled' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => { setEditingScheduled(null); setIsAddingScheduled(true); }} className="btn-primary flex items-center gap-2">
              <Plus size={18} /> Schedule Maintenance
            </button>
          </div>

          <div className="grid gap-4">
            {scheduled.map(task => (
              <div key={task.id} className="card p-6 flex items-center justify-between group relative">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingScheduled(task); setIsAddingScheduled(true); }} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-600">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDeleteScheduled(task.id)} className="p-2 bg-rose-50 rounded-lg hover:bg-rose-100 text-rose-600">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <CalendarDays size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold">{task.title}</h3>
                    <p className="text-sm text-slate-500">{task.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>{format(new Date(task.scheduled_date), 'MMM d, yyyy')}</span>
                      <span>•</span>
                      <span>{task.frequency}</span>
                      <span>•</span>
                      <span>{task.property_name}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right mr-12">
                  <p className="text-sm font-medium">{task.vendor_name || 'Unassigned'}</p>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{task.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'vendors' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => { setEditingVendor(null); setIsAddingVendor(true); }} className="btn-primary flex items-center gap-2">
              <Plus size={18} /> Add Vendor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map(vendor => (
              <div key={vendor.id} className="card p-6 space-y-4 group relative">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingVendor(vendor); setIsAddingVendor(true); }} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-600">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDeleteVendor(vendor.id)} className="p-2 bg-rose-50 rounded-lg hover:bg-rose-100 text-rose-600">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{vendor.name}</h3>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{vendor.category}</span>
                  </div>
                  <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                    <Wrench size={16} />
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone size={14} /> {vendor.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} /> {vendor.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} /> {vendor.address}
                  </div>
                </div>
                {vendor.notes && (
                  <p className="text-xs text-slate-400 border-t border-slate-100 pt-3 mt-3">
                    {vendor.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {isAddingRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold">{editingRequest ? 'Edit Request' : 'New Maintenance Request'}</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const data = Object.fromEntries(formData);
              const payload = {
                ...data,
                property_id: parseInt(data.property_id as string),
                unit_id: data.unit_id ? parseInt(data.unit_id as string) : null
              };
              
              if (editingRequest) {
                await fetch(`/api/maintenance/requests/${editingRequest.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
              } else {
                await fetch('/api/maintenance/requests', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
              }
              setIsAddingRequest(false);
              setEditingRequest(null);
              fetchData();
            }} className="space-y-4">
              <div>
                <label className="label">Property</label>
                <select name="property_id" className="input-field" required defaultValue={editingRequest?.property_id || selectedProperty?.id || ''}>
                  <option value="">Select Property</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Unit ID (Optional)</label>
                <input name="unit_id" type="number" placeholder="Unit ID" className="input-field" defaultValue={editingRequest?.unit_id || ''} />
              </div>
              <div>
                <label className="label">Title</label>
                <input name="title" placeholder="Issue Title" className="input-field" required defaultValue={editingRequest?.title} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea name="description" placeholder="Describe the issue..." className="input-field min-h-[100px]" required defaultValue={editingRequest?.description} />
              </div>
              <div>
                <label className="label">Priority</label>
                <select name="priority" className="input-field" defaultValue={editingRequest?.priority}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Emergency</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setIsAddingRequest(false); setEditingRequest(null); }} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editingRequest ? 'Save Changes' : 'Submit Request'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddingScheduled && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold">{editingScheduled ? 'Edit Scheduled Task' : 'Schedule Maintenance'}</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const data = Object.fromEntries(formData);
              const payload = {
                ...data,
                property_id: parseInt(data.property_id as string),
                vendor_id: data.vendor_id ? parseInt(data.vendor_id as string) : null
              };

              if (editingScheduled) {
                await fetch(`/api/maintenance/scheduled/${editingScheduled.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
              } else {
                await fetch('/api/maintenance/scheduled', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
              }
              setIsAddingScheduled(false);
              setEditingScheduled(null);
              fetchData();
            }} className="space-y-4">
              <div>
                <label className="label">Property</label>
                <select name="property_id" className="input-field" required defaultValue={editingScheduled?.property_id || selectedProperty?.id || ''}>
                  <option value="">Select Property</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Title</label>
                <input name="title" placeholder="Task Title" className="input-field" required defaultValue={editingScheduled?.title} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea name="description" placeholder="Task Description" className="input-field min-h-[100px]" required defaultValue={editingScheduled?.description} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date</label>
                  <input name="scheduled_date" type="date" className="input-field" required defaultValue={editingScheduled?.scheduled_date} />
                </div>
                <div>
                  <label className="label">Frequency</label>
                  <select name="frequency" className="input-field" defaultValue={editingScheduled?.frequency}>
                    <option>One-time</option>
                    <option>Monthly</option>
                    <option>Quarterly</option>
                    <option>Annually</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Vendor</label>
                <select name="vendor_id" className="input-field" defaultValue={editingScheduled?.vendor_id || ''}>
                  <option value="">Unassigned</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.category})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setIsAddingScheduled(false); setEditingScheduled(null); }} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editingScheduled ? 'Save Changes' : 'Schedule'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddingVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold">{editingVendor ? 'Edit Vendor' : 'Add Vendor'}</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const data = Object.fromEntries(formData);
              
              if (editingVendor) {
                await fetch(`/api/vendors/${editingVendor.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                });
              } else {
                await fetch('/api/vendors', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                });
              }
              setIsAddingVendor(false);
              setEditingVendor(null);
              fetchData();
            }} className="space-y-4">
              <input name="name" placeholder="Vendor Name" className="input-field" required defaultValue={editingVendor?.name} />
              <input name="category" placeholder="Category (e.g. Plumber)" className="input-field" required defaultValue={editingVendor?.category} />
              <input name="phone" placeholder="Phone" className="input-field" defaultValue={editingVendor?.phone} />
              <input name="email" placeholder="Email" className="input-field" defaultValue={editingVendor?.email} />
              <input name="address" placeholder="Address" className="input-field" defaultValue={editingVendor?.address} />
              <textarea name="notes" placeholder="Notes" className="input-field min-h-[100px]" defaultValue={editingVendor?.notes} />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setIsAddingVendor(false); setEditingVendor(null); }} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editingVendor ? 'Save Changes' : 'Add Vendor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard = ({ properties, setActiveTab }: { properties: Property[], setActiveTab: (t: string) => void }) => {
  const [upcomingRents, setUpcomingRents] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/upcoming-rents')
      .then(res => res.json())
      .then(data => setUpcomingRents(data));
  }, []);

  const stats = [
    { label: 'Total Properties', value: properties.length, icon: Building2, color: 'bg-blue-500' },
    { label: 'Active Tenants', value: upcomingRents.length, icon: Users, color: 'bg-emerald-500' },
    { label: 'Monthly Revenue', value: `$${properties.reduce((acc, p) => acc + p.rent_price, 0)}`, icon: DollarSign, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-6 flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-${stat.color.split('-')[1]}-200`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold dark:text-white">Recent Properties</h2>
            <button 
              onClick={() => setActiveTab('properties')}
              className="text-sm font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 dark:text-slate-400 dark:hover:text-white"
            >
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {properties.slice(0, 2).map(p => (
              <PropertyCard key={p.id} property={p} onClick={() => setActiveTab('properties')} />
            ))}
            {properties.length === 0 && (
              <div className="col-span-2 py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl dark:border-slate-800">
                <p className="text-slate-400">No properties added yet.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-xl font-bold dark:text-white">Upcoming Rent</h2>
          <div className="card divide-y divide-slate-100 dark:divide-slate-800">
            {upcomingRents.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No upcoming rents due.</div>
            ) : (
              upcomingRents.slice(0, 5).map(rent => (
                <div key={rent.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer dark:hover:bg-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 dark:bg-slate-800">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold dark:text-white">{rent.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Unit {rent.unit_number} • Due Day {rent.rent_due_day}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">${rent.rent_price}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TenantDetails = ({ tenant, unit, onBack }: { tenant: Tenant, unit: Unit, onBack: () => void }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(unit.rent_price);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState(tenant);

  const fetchData = async () => {
    const [payRes, msgRes, docsRes] = await Promise.all([
      fetch(`/api/tenants/${tenant.id}/payments`),
      fetch(`/api/messages/${tenant.id}`),
      fetch(`/api/documents/tenant/${tenant.id}`)
    ]);
    setPayments(await payRes.json());
    setMessages(await msgRes.json());
    setDocuments(await docsRes.json());
  };

  useEffect(() => {
    fetchData();
  }, [tenant.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender_type: 'landlord',
        sender_id: 1, // Mock landlord ID
        receiver_id: tenant.id,
        content: newMessage
      })
    });
    setNewMessage('');
    fetchData();
  };

  const handleDraftReminder = async () => {
    setLoadingDraft(true);
    try {
      const res = await fetch('/api/ai/draft-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_name: tenant.name,
          amount_due: unit.rent_price,
          due_date: format(new Date(), 'MMMM do')
        })
      });
      const data = await res.json();
      setNewMessage(data.draft);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDraft(false);
    }
  };

  const handleMarkAsPaid = async () => {
    await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant_id: tenant.id,
        amount: paymentAmount,
        payment_date: new Date().toISOString(),
        period_month: new Date().getMonth() + 1,
        period_year: new Date().getFullYear()
      })
    });
    setShowPaymentModal(false);
    fetchData();
  };

  const handleEditTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/tenants/${tenant.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editFormData)
    });
    setIsEditing(false);
    // Refresh parent data would be ideal, but for now we can just update local state if we were passing a setter, 
    // but since we are just viewing, we might need to trigger a refresh up the chain or just reload.
    // For this implementation, let's assume onBack triggers a refresh when re-entering, 
    // but to see changes immediately we should probably update the local tenant object if it was state, 
    // but it's a prop. 
    // A simple way is to call onBack() to force a re-fetch when the user clicks back, 
    // but to update the UI *now* we need to reload the page or have a way to update the parent state.
    // Given the structure, onBack() goes back to the list. 
    // Let's just close the modal. The user will see updated data if they navigate back and forth 
    // (assuming the parent fetches fresh data).
    // Actually, the parent `App` fetches data in `useEffect`. 
    // We can force a reload of the page or just accept that the prop won't change until we go back.
    // However, to make it nice, we can reload the window or use a context. 
    // Let's just reload for simplicity in this specific constraint environment, or better, 
    // just close the modal and let the user navigate.
    window.location.reload(); 
  };

  const handleDeleteTenant = async () => {
    if (confirm('Are you sure you want to remove this tenant? This action cannot be undone.')) {
      await fetch(`/api/tenants/${tenant.id}`, {
        method: 'DELETE'
      });
      onBack();
    }
  };

  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
  const isLeaseActive = new Date(tenant.lease_end) > new Date();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors">
          <ArrowLeft size={18} /> Back to Property
        </button>
        <div className="flex gap-2">
          <button onClick={() => setIsEditing(true)} className="btn-secondary flex items-center gap-2 text-sm">
            <Pencil size={16} /> Edit Tenant
          </button>
          <button onClick={handleDeleteTenant} className="btn-secondary text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center gap-2 text-sm">
            <Trash2 size={16} /> Remove
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold">Edit Tenant</h2>
            <form onSubmit={handleEditTenant} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input-field" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} required />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input-field" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} required />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input-field" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} required />
              </div>
              <div>
                <label className="label">Rent Due Day</label>
                <input type="number" className="input-field" value={editFormData.rent_due_day} onChange={e => setEditFormData({...editFormData, rent_due_day: parseInt(e.target.value)})} required />
              </div>
              <div>
                <label className="label">Lease Start</label>
                <input type="date" className="input-field" value={editFormData.lease_start} onChange={e => setEditFormData({...editFormData, lease_start: e.target.value})} required />
              </div>
              <div>
                <label className="label">Lease End</label>
                <input type="date" className="input-field" value={editFormData.lease_end} onChange={e => setEditFormData({...editFormData, lease_end: e.target.value})} required />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="card p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-2xl font-bold border-4 border-white shadow-sm">
                {tenant.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold">{tenant.name}</h1>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isLeaseActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {isLeaseActive ? 'Active Lease' : 'Lease Expired'}
                  </span>
                </div>
                <p className="text-slate-500">Unit {unit.unit_number} • {tenant.email}</p>
                <div className="flex flex-wrap gap-4 mt-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                    <Calendar size={12} /> {format(new Date(tenant.lease_start), 'MMM yyyy')} - {format(new Date(tenant.lease_end), 'MMM yyyy')}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                    <DollarSign size={12} /> Due Day {tenant.rent_due_day}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                    <Users size={12} /> {tenant.phone}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Paid to Date</p>
                <p className="text-2xl font-bold text-emerald-600">${totalPaid.toLocaleString()}</p>
              </div>
              <button onClick={() => setShowPaymentModal(true)} className="btn-primary flex items-center gap-2 w-full md:w-auto">
                <CreditCard size={18} /> Mark as Paid
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Payment History</h2>
            <div className="card overflow-hidden overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-bottom border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm">{format(new Date(p.payment_date), 'MMM d, yyyy')}</td>
                      <td className="px-6 py-4 text-sm">{format(new Date(p.period_year, p.period_month - 1), 'MMMM yyyy')}</td>
                      <td className="px-6 py-4 text-sm font-bold">${p.amount}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">No payments recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="card p-6 space-y-6">
            <h2 className="text-xl font-bold">Documents</h2>
            <DocumentUpload entityType="tenant" entityId={tenant.id} onUploadSuccess={fetchData} />
            <div className="space-y-3">
              {documents.map(doc => (
                <div key={doc.id} className="p-3 bg-slate-50 rounded-xl flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{doc.file_name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      {format(new Date(doc.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-2">
                <MessageSquare size={18} /> Messages
              </h2>
              <button 
                onClick={handleDraftReminder}
                disabled={loadingDraft}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-wider flex items-center gap-1"
              >
                {loadingDraft ? <Loader2 size={12} className="animate-spin" /> : <><Bell size={12} /> AI Draft Reminder</>}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.sender_type === 'landlord' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    m.sender_type === 'landlord' 
                      ? 'bg-slate-900 text-white rounded-tr-none' 
                      : 'bg-slate-100 text-slate-900 rounded-tl-none'
                  }`}>
                    {m.content}
                    <p className={`text-[10px] mt-1 ${m.sender_type === 'landlord' ? 'text-slate-400' : 'text-slate-500'}`}>
                      {format(new Date(m.created_at), 'h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100">
              <div className="flex gap-2">
                <input 
                  className="input-field text-sm" 
                  placeholder="Type a message..." 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage} className="btn-primary p-2">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card w-full max-w-md p-8 space-y-6"
          >
            <h2 className="text-2xl font-bold">Record Payment</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Amount Paid</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="number" 
                    className="input-field !pl-10" 
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(parseFloat(e.target.value))}
                  />
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">This will mark the rent for {format(new Date(), 'MMMM yyyy')} as paid for {tenant.name}.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleMarkAsPaid} className="btn-primary flex-1">Confirm Payment</button>
              <button onClick={() => setShowPaymentModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const Expenses = ({ propertyId }: { propertyId: number }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: 'Utilities (electricity, water, etc.)',
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    description: ''
  });

  const categories = [
    'Utilities (electricity, water, etc.)',
    'Property maintenance (cleaning, repairs, lawn care)',
    'Taxes and insurance',
    'Mortgage payments',
    'Property management fees (if applicable)',
    'Other'
  ];

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/expenses`);
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [propertyId]);

  const handleAddExpense = async () => {
    try {
      await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newExpense, property_id: propertyId }),
      });
      setShowAddModal(false);
      setNewExpense({
        category: 'Utilities (electricity, water, etc.)',
        amount: 0,
        date: format(new Date(), 'yyyy-MM-dd'),
        description: ''
      });
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h2 className="text-xl font-bold">Expense Log</h2>
          <span className="text-sm text-slate-400 font-medium">Total: <span className="text-slate-900 font-bold">${totalExpenses.toLocaleString()}</span></span>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Record Expense
        </button>
      </div>

      <div className="card overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map(expense => (
              <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm whitespace-nowrap">{format(new Date(expense.date), 'MMM d, yyyy')}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    {expense.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{expense.description}</td>
                <td className="px-6 py-4 text-sm font-bold text-right">${expense.amount.toLocaleString()}</td>
              </tr>
            ))}
            {expenses.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm italic">No expenses recorded for this property.</td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <Loader2 className="animate-spin mx-auto text-slate-300" size={24} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card w-full max-w-md p-8 space-y-6"
          >
            <h2 className="text-2xl font-bold">Record Expense</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Category</label>
                <select 
                  className="input-field"
                  value={newExpense.category}
                  onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="number" 
                    className="input-field !pl-10" 
                    value={newExpense.amount}
                    onChange={e => setNewExpense({...newExpense, amount: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="label">Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={newExpense.date}
                  onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea 
                  className="input-field min-h-[80px]" 
                  placeholder="What was this for?"
                  value={newExpense.description}
                  onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleAddExpense} className="btn-primary flex-1">Save Expense</button>
              <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const PropertyDetail = ({ property, onBack }: { property: Property, onBack: () => void }) => {
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'expenses'>('overview');
  const [units, setUnits] = useState<Unit[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tenants, setTenants] = useState<Record<number, Tenant>>({});
  const [selectedTenant, setSelectedTenant] = useState<{tenant: Tenant, unit: Unit} | null>(null);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [newUnit, setNewUnit] = useState({ unit_number: '', rent_price: property.rent_price });
  const [lateFeeRules, setLateFeeRules] = useState<LateFeeRule | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);

  const fetchData = async () => {
    const [unitsRes, docsRes, rulesRes] = await Promise.all([
      fetch(`/api/properties/${property.id}/units`),
      fetch(`/api/documents/property/${property.id}`),
      fetch(`/api/properties/${property.id}/late-fee-rules`)
    ]);
    const unitsData = await unitsRes.json();
    setUnits(unitsData);
    setDocuments(await docsRes.json());
    setLateFeeRules(await rulesRes.json());

    // Fetch tenants for each unit
    const tenantMap: Record<number, Tenant> = {};
    for (const unit of unitsData) {
      if (unit.status === 'occupied') {
        const tRes = await fetch(`/api/units/${unit.id}/tenant`);
        const tData = await tRes.json();
        if (tData) tenantMap[unit.id] = tData;
      }
    }
    setTenants(tenantMap);
  };

  useEffect(() => {
    fetchData();
  }, [property.id]);

  const handleAddUnit = async () => {
    await fetch('/api/units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newUnit, property_id: property.id }),
    });
    setShowAddUnit(false);
    fetchData();
  };

  const [showAddTenant, setShowAddTenant] = useState<number | null>(null);
  const [newTenant, setNewTenant] = useState({ name: '', email: '', phone: '', lease_start: '', lease_end: '', rent_due_day: 1 });

  const handleAddTenant = async (unitId: number) => {
    await fetch('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newTenant, unit_id: unitId }),
    });
    setShowAddTenant(null);
    fetchData();
  };

  const handleSaveRules = async () => {
    await fetch(`/api/properties/${property.id}/late-fee-rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lateFeeRules),
    });
    setShowRulesModal(false);
  };

  if (selectedTenant) {
    return <TenantDetails tenant={selectedTenant.tenant} unit={selectedTenant.unit} onBack={() => setSelectedTenant(null)} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors">
          <ArrowLeft size={18} /> Back to Properties
        </button>
        <button onClick={() => setShowRulesModal(true)} className="btn-secondary flex items-center gap-2 text-sm">
          <Settings size={16} /> Late Fee Rules
        </button>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveDetailTab('overview')}
          className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeDetailTab === 'overview' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveDetailTab('expenses')}
          className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeDetailTab === 'expenses' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Expenses
        </button>
      </div>

      {activeDetailTab === 'overview' ? (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-8">
          <div className="card p-8 flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-64 h-48 rounded-2xl overflow-hidden bg-slate-100">
              <img src={`https://picsum.photos/seed/${property.id}/800/600`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold mb-1">{property.name}</h1>
                <p className="text-slate-500 flex items-center gap-1"><MapPin size={16} /> {property.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</p>
                  <p className="font-bold">{property.type}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rooms</p>
                  <p className="font-bold">{property.rooms} Rooms</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Square Feet</p>
                  <p className="font-bold">{property.sqft} sqft</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Base Rent</p>
                  <p className="font-bold">${property.rent_price}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Units & Tenants</h2>
              <button onClick={() => setShowAddUnit(true)} className="btn-primary flex items-center gap-2 text-sm">
                <Plus size={16} /> Add Unit
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {units.map(unit => (
                <div key={unit.id} className="card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold">Unit {unit.unit_number}</p>
                      <p className="text-sm text-slate-500">${unit.rent_price} / month</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {unit.status === 'occupied' && tenants[unit.id] && (
                        <button 
                          onClick={() => setSelectedTenant({ tenant: tenants[unit.id], unit })}
                          className="text-sm font-bold text-slate-900 hover:underline flex items-center gap-1"
                        >
                          {tenants[unit.id].name} <ChevronRight size={14} />
                        </button>
                      )}
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        unit.status === 'occupied' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {unit.status}
                      </span>
                    </div>
                  </div>

                  {unit.status === 'vacant' && showAddTenant !== unit.id && (
                    <button 
                      onClick={() => setShowAddTenant(unit.id)}
                      className="w-full py-3 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={16} /> Assign Tenant
                    </button>
                  )}

                  {showAddTenant === unit.id && (
                    <div className="p-4 bg-slate-50 rounded-xl space-y-4">
                      <h3 className="font-bold text-sm">Assign New Tenant</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="label">Full Name</label>
                          <input className="input-field" value={newTenant.name} onChange={e => setNewTenant({...newTenant, name: e.target.value})} />
                        </div>
                        <div>
                          <label className="label">Email</label>
                          <input className="input-field" value={newTenant.email} onChange={e => setNewTenant({...newTenant, email: e.target.value})} />
                        </div>
                        <div>
                          <label className="label">Phone</label>
                          <input className="input-field" value={newTenant.phone} onChange={e => setNewTenant({...newTenant, phone: e.target.value})} />
                        </div>
                        <div>
                          <label className="label">Rent Due Day</label>
                          <input type="number" className="input-field" value={newTenant.rent_due_day} onChange={e => setNewTenant({...newTenant, rent_due_day: parseInt(e.target.value)})} />
                        </div>
                        <div>
                          <label className="label">Lease Start</label>
                          <input type="date" className="input-field" value={newTenant.lease_start} onChange={e => setNewTenant({...newTenant, lease_start: e.target.value})} />
                        </div>
                        <div>
                          <label className="label">Lease End</label>
                          <input type="date" className="input-field" value={newTenant.lease_end} onChange={e => setNewTenant({...newTenant, lease_end: e.target.value})} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleAddTenant(unit.id)} className="btn-primary flex-1 text-sm">Save Tenant</button>
                        <button onClick={() => setShowAddTenant(null)} className="btn-secondary flex-1 text-sm">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {units.length === 0 && !showAddUnit && (
                <div className="py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400">No units added yet.</p>
                </div>
              )}
              {showAddUnit && (
                <div className="card p-6 border-slate-900 ring-2 ring-slate-900/5">
                  <h3 className="font-bold mb-4">Add New Unit</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="label">Unit Number</label>
                      <input 
                        className="input-field" 
                        value={newUnit.unit_number} 
                        onChange={e => setNewUnit({...newUnit, unit_number: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="label">Rent Price</label>
                      <input 
                        type="number"
                        className="input-field" 
                        value={newUnit.rent_price} 
                        onChange={e => setNewUnit({...newUnit, rent_price: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddUnit} className="btn-primary flex-1">Save Unit</button>
                    <button onClick={() => setShowAddUnit(false)} className="btn-secondary flex-1">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:w-1/3 space-y-8">
          <div className="card p-6 space-y-6">
            <h2 className="text-xl font-bold">Documents</h2>
            <DocumentUpload entityType="property" entityId={property.id} onUploadSuccess={fetchData} />
            <div className="space-y-3">
              {documents.map(doc => (
                <div key={doc.id} className="p-3 bg-slate-50 rounded-xl flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{doc.file_name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      {format(new Date(doc.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ) : (
      <Expenses propertyId={property.id} />
    )}

      {showRulesModal && lateFeeRules && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card w-full max-w-md p-8 space-y-6"
          >
            <h2 className="text-2xl font-bold">Late Fee Rules</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Grace Period (Days)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={lateFeeRules.grace_period_days}
                  onChange={e => setLateFeeRules({...lateFeeRules, grace_period_days: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="label">Flat Late Fee ($)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={lateFeeRules.flat_fee}
                  onChange={e => setLateFeeRules({...lateFeeRules, flat_fee: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <label className="label">Daily Late Fee ($)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={lateFeeRules.daily_fee}
                  onChange={e => setLateFeeRules({...lateFeeRules, daily_fee: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSaveRules} className="btn-primary flex-1">Save Rules</button>
              <button onClick={() => setShowRulesModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const News = () => {
  const [news, setNews] = useState<string>('');
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/market-news');
      const data = await res.json();
      console.log("Market news data received:", data);
      if (data.error) {
        throw new Error(data.error);
      }
      setNews(data.text || "No news content returned from the market analysis.");
      setSources(data.sources || []);
    } catch (err: any) {
      console.error("Client news error:", err);
      setError(err.message || "Failed to load market insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Market Insights</h1>
          <p className="text-slate-500">Stay updated with the latest real estate trends and news</p>
        </div>
        <button onClick={fetchNews} disabled={loading} className="btn-secondary text-sm flex items-center gap-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <><Search size={16} /> Refresh News</>}
        </button>
      </div>

      {loading ? (
        <div className="card p-12 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-slate-400" size={32} />
          <p className="text-slate-500 animate-pulse">Scanning the market for latest updates...</p>
        </div>
      ) : error ? (
        <div className="card p-12 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
            <Bell size={32} />
          </div>
          <h3 className="text-lg font-bold">Something went wrong</h3>
          <p className="text-slate-500 max-w-md">{error}</p>
          <button onClick={fetchNews} className="btn-primary">Try Again</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-8 prose prose-slate max-w-none">
              <div className="markdown-body">
                <Markdown>{news}</Markdown>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="font-bold text-lg">Key Sources</h3>
            <div className="space-y-3">
              {sources.map((source, i) => (
                <a 
                  key={i} 
                  href={source.web?.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="card p-4 flex items-center justify-between hover:border-slate-300 transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate group-hover:text-slate-900">{source.web?.title || 'Market Source'}</p>
                    <p className="text-[10px] text-slate-400 truncate">{source.web?.uri}</p>
                  </div>
                  <ExternalLink size={14} className="text-slate-300 group-hover:text-slate-900" />
                </a>
              ))}
              {sources.length === 0 && (
                <p className="text-sm text-slate-400 italic">No direct source links available for this summary.</p>
              )}
            </div>
            <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4">
              <h4 className="font-bold">Market Tip</h4>
              <p className="text-sm text-slate-400">Keep an eye on interest rate fluctuations as they directly impact property valuations and buyer demand.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PropertyList = ({ properties, onAdd, onSelect }: { properties: Property[], onAdd: () => void, onSelect: (p: Property) => void }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Properties</h1>
          <p className="text-slate-500">Manage your real estate portfolio</p>
        </div>
        <button onClick={onAdd} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Property
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map(p => (
          <PropertyCard key={p.id} property={p} onClick={() => onSelect(p)} />
        ))}
        <button 
          onClick={onAdd}
          className="h-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-slate-300 hover:text-slate-500 transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus size={24} />
          </div>
          <span className="font-medium">Add New Property</span>
        </button>
      </div>
    </div>
  );
};

const AddPropertyForm = ({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: 'Apartment',
    sqft: 0,
    rooms: 1,
    rent_price: 0,
    deposit_amount: 0,
    lease_terms: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create property');
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-2">
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-900 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold">New Property</h1>
      </div>

      <form onSubmit={handleSubmit} className="card p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="label">Property Name</label>
            <input 
              required
              className="input-field" 
              placeholder="e.g. Sunset Heights"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Address</label>
            <input 
              required
              className="input-field" 
              placeholder="123 Main St, City, State"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
          </div>
          <div>
            <label className="label">Property Type</label>
            <select 
              className="input-field"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
            >
              <option>Apartment</option>
              <option>House</option>
              <option>Condo</option>
              <option>Commercial</option>
            </select>
          </div>
          <div>
            <label className="label">Square Footage</label>
            <input 
              type="number"
              className="input-field" 
              value={formData.sqft}
              onChange={e => setFormData({...formData, sqft: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <label className="label">Rooms</label>
            <input 
              type="number"
              className="input-field" 
              value={formData.rooms}
              onChange={e => setFormData({...formData, rooms: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <label className="label">Base Monthly Rent</label>
            <input 
              type="number"
              className="input-field" 
              value={formData.rent_price}
              onChange={e => setFormData({...formData, rent_price: parseFloat(e.target.value)})}
            />
          </div>
          <div>
            <label className="label">Security Deposit</label>
            <input 
              type="number"
              className="input-field" 
              value={formData.deposit_amount}
              onChange={e => setFormData({...formData, deposit_amount: parseFloat(e.target.value)})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Lease Terms</label>
            <textarea 
              className="input-field min-h-[100px]" 
              placeholder="e.g. 12 month minimum, no pets..."
              value={formData.lease_terms}
              onChange={e => setFormData({...formData, lease_terms: e.target.value})}
            />
          </div>
        </div>
        <div className="pt-4 flex gap-4">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Create Property'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        </div>
      </form>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/properties');
      const data = await res.json();
      setProperties(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-slate-400" size={40} />
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard properties={properties} setActiveTab={setActiveTab} />;
      case 'financials':
        return <FinancialsView />;
      case 'maintenance':
        return <MaintenanceView properties={properties} selectedProperty={selectedProperty} />;
      case 'assistant':
        return <AssistantView />;
      case 'properties':
        if (selectedProperty) {
          return <PropertyDetail property={selectedProperty} onBack={() => setSelectedProperty(null)} />;
        }
        if (isAddingProperty) {
          return <AddPropertyForm onCancel={() => setIsAddingProperty(false)} onSuccess={() => {
            setIsAddingProperty(false);
            fetchProperties();
          }} />;
        }
        return <PropertyList properties={properties} onAdd={() => setIsAddingProperty(true)} onSelect={setSelectedProperty} />;
      case 'news':
        return <News />;
      default:
        return <Dashboard properties={properties} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 flex-col md:flex-row dark:bg-slate-950 transition-colors duration-300">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-30 h-16 dark:bg-slate-900 dark:border-slate-800">
        <div className="font-bold flex items-center gap-2 text-lg dark:text-white">
           <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white dark:bg-white dark:text-slate-900">
             <DollarSign size={18} />
           </div>
           Pocket Estate
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-800 dark:text-white">
          <Menu size={24} />
        </button>
      </div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(t) => {
          setActiveTab(t);
          setSelectedProperty(null);
          setIsAddingProperty(false);
          setIsMobileMenuOpen(false);
        }}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto mt-16 md:mt-0 w-full">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (selectedProperty?.id || '') + isAddingProperty}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

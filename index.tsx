
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Users, ShieldCheck, Gamepad2, Database, Activity, Search, Settings, 
  MessageSquare, TrendingUp, Cpu, LogOut, ChevronRight, Package, Zap, 
  Filter, BarChart3, Edit3, Trash2, Key, Star, Crown, DollarSign, 
  Megaphone, Clock, Plus, Save, X, RefreshCw, UserPlus, BookOpen, Trophy, Users2, Briefcase,
  Flame, Sword, Scroll, Shield, Heart, Map, Sparkles
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

// --- 武侠风格辅助组件 ---

const CornerDecor = ({ className = "" }) => (
  <svg className={`absolute w-8 h-8 ${className}`} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0H32M0 0V32M4 4H28M4 4V28" stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.6"/>
    <rect x="0" y="0" width="2" height="2" fill="#d4af37" />
  </svg>
);

const CloudPattern = () => (
  <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <pattern id="clouds" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <path d="M25 50 Q 35 30 50 50 Q 65 70 75 50" fill="none" stroke="#d4af37" strokeWidth="1" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#clouds)" />
    </svg>
  </div>
);

// --- 类型与映射 ---
type JobType = '剑圣' | '邪皇' | '医仙' | '神算' | '魔尊' | '天师';
const JOBS: JobType[] = ['剑圣', '邪皇', '医仙', '神算', '魔尊', '天师'];

interface Character {
  id: number;
  name: string;
  level: number;
  job: JobType;
  pvp: number;
  status: '在线' | '离线';
  skills: string[];
  titles: string[];
  friends: string[];
  inventory: string[];
  warehouse: string[];
}

interface UserAccount {
  id: number;
  username: string;
  points: number;
  vip: number;
  isGM: boolean;
  status: '正常' | '封禁';
  lastLogin: string;
}

interface Announcement {
  id: number;
  content: string;
  type: '即时' | '定时';
  time?: string;
  active: boolean;
}

// --- 模拟数据 ---
const MOCK_ACCOUNTS: UserAccount[] = [
  { id: 1024, username: '星云掌门', points: 999999, vip: 12, isGM: true, status: '正常', lastLogin: '2024-05-24' },
  { id: 1025, username: '独孤求败', points: 1500, vip: 5, isGM: false, status: '正常', lastLogin: '2024-05-23' },
  { id: 1026, username: '邪教魔头', points: 0, vip: 0, isGM: false, status: '封禁', lastLogin: '2024-01-10' },
];

const MOCK_CHARACTERS: Character[] = [
  { 
    id: 1, name: '苍穹之主', level: 110, job: '剑圣', pvp: 1540, status: '在线',
    skills: ['万剑归宗', '天外飞仙', '剑意凛然'],
    titles: ['武林盟主', '剑道巅峰'],
    friends: ['月下独酌', '风清扬'],
    inventory: ['轩辕剑', '九转金丹', '回城卷轴', '红宝石 x10'],
    warehouse: ['玄铁石', '龙之逆鳞', '远古卷轴']
  },
  { 
    id: 2, name: '月下独酌', level: 95, job: '医仙', pvp: 89, status: '离线',
    skills: ['妙手回春', '普度众生', '太极神功'],
    titles: ['悬壶世世'],
    friends: ['苍穹之主'],
    inventory: ['神农鼎', '灵芝仙草'],
    warehouse: ['寒冰箭', '黄金甲']
  },
];

const GROWTH_DATA = [
  { time: '子时', users: 120 }, { time: '寅时', users: 80 },
  { time: '辰时', users: 450 }, { time: '午时', users: 890 },
  { time: '申时', users: 1200 }, { time: '戌时', users: 2100 },
  { time: '亥时', users: 1500 },
];

// --- 武侠风格子组件 ---

const TraditionalBadge = ({ children, color = "gold" }: any) => {
  const styles: any = {
    gold: "bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/30 shadow-[0_0_10px_rgba(212,175,55,0.1)]",
    jade: "bg-[#00a86b]/10 text-[#00a86b] border-[#00a86b]/30",
    ink: "bg-slate-800 text-slate-400 border-slate-700",
    vermillion: "bg-[#e34234]/10 text-[#e34234] border-[#e34234]/30",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  };
  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold tracking-widest rounded-sm border ${styles[color]} backdrop-blur-sm`}>
      {children}
    </span>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded transition-all duration-300 group relative ${
        active 
          ? 'bg-[#d4af37]/10 text-[#d4af37] border-l-2 border-[#d4af37]' 
          : 'text-[#d4af37]/40 hover:bg-[#d4af37]/5 hover:text-[#d4af37]/70'
      }`}
    >
      <Icon size={18} className={active ? 'text-[#d4af37]' : 'text-inherit'} />
      <span className="text-xs font-black tracking-[0.2em]">{label}</span>
      {active && (
        <div className="absolute right-4 w-1 h-3 bg-[#d4af37] rounded-full shadow-[0_0_8px_#d4af37]" />
      )}
    </button>
  );
};

const Modal = ({ title, isOpen, onClose, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-[#121214] border border-[#d4af37]/30 w-full max-w-md rounded-lg shadow-[0_0_50px_rgba(212,175,55,0.05)] overflow-hidden animate-in fade-in zoom-in duration-300 relative">
        <CornerDecor className="top-0 left-0" />
        <CornerDecor className="top-0 right-0 rotate-90" />
        <CornerDecor className="bottom-0 left-0 -rotate-90" />
        <CornerDecor className="bottom-0 right-0 rotate-180" />
        
        <div className="flex justify-between items-center p-6 border-b border-[#d4af37]/10 relative">
          <h3 className="text-xl font-black text-[#d4af37] flex items-center gap-3 tracking-widest">
            <Scroll size={24} className="opacity-70" /> {title}
          </h3>
          <button onClick={onClose} className="text-[#d4af37]/50 hover:text-[#d4af37] transition-all"><X size={24}/></button>
        </div>
        <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar relative z-10">{children}</div>
      </div>
    </div>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dbConfig, setDbConfig] = useState({ host: '127.0.0.1', port: '3306', name: 'wulin_db', user: 'root' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [accounts, setAccounts] = useState<UserAccount[]>(MOCK_ACCOUNTS);
  const [characters, setCharacters] = useState<Character[]>(MOCK_CHARACTERS);
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { id: 1, content: "百晓生传讯：服务器灵气充沛，诸位大侠可安心历练。", type: '即时', active: true },
  ]);
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chat, setChat] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  
  const [editModal, setEditModal] = useState<{
    type: 'password' | 'recharge' | 'vip' | 'char_edit' | 'add_account' | 'add_announcement', 
    target?: any
  } | null>(null);

  const [charTabs, setCharTabs] = useState<Record<number, 'overview' | 'skills' | 'inventory' | 'warehouse'>>({});

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  const handleAddAccount = (formData: any) => {
    // 模拟添加弟子逻辑，实际开发中此处会执行数据库插入
    console.log("正在将新弟子录入宗门:", formData.username, " 密语:", formData.password);
    
    const newAcc: UserAccount = {
      id: Math.floor(Math.random() * 9000) + 1000,
      username: formData.username,
      points: Number(formData.points) || 0,
      vip: Number(formData.vip) || 0,
      isGM: !!formData.isGM,
      status: '正常',
      lastLogin: new Date().toISOString().split('T')[0]
    };
    setAccounts([newAcc, ...accounts]);
    setEditModal(null);
  };

  const handleAddAnnouncement = (content: string) => {
    const newAnn: Announcement = {
      id: announcements.length + 1,
      content,
      type: '即时',
      active: true
    };
    setAnnouncements([newAnn, ...announcements]);
    setEditModal(null);
  };

  const askAi = async () => {
    if (!input) return;
    const userMsg = input;
    setInput('');
    setChat(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsAiLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `你是一个深居简出的武林百晓生，负责解答GM的运维问题。系统状态：豪侠${characters.length}位，弟子${accounts.length}人。问题：${userMsg}`,
        config: { systemInstruction: "使用文绉绉的武侠风格进行回复，如'回禀掌门'、'据我所知'等，回复要精准、充满侠气。使用中文。" }
      });
      setChat(prev => [...prev, { role: 'assistant', content: response.text || '老朽分析完毕。' }]);
    } catch (err) {
      setChat(prev => [...prev, { role: 'assistant', content: '传音入密链路受阻，请检查网关。' }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0c0c0e] flex items-center justify-center p-6 relative overflow-hidden">
        <CloudPattern />
        <div className="w-full max-w-md bg-[#161618] border border-[#d4af37]/20 p-10 rounded-lg shadow-[0_0_100px_rgba(212,175,55,0.05)] space-y-8 relative z-10">
          <CornerDecor className="top-0 left-0" />
          <CornerDecor className="bottom-0 right-0 rotate-180" />
          
          <div className="text-center space-y-4">
            <div className="inline-flex bg-gradient-to-b from-[#d4af37] to-[#8a6d1e] p-4 rounded-full mb-2 shadow-lg shadow-black/50">
              <Sword className="text-[#0c0c0e]" size={36} />
            </div>
            <h1 className="text-4xl font-black tracking-[0.2em] text-[#d4af37] drop-shadow-sm">星云阁<span className="text-white/80">·秘录</span></h1>
            <p className="text-[#d4af37]/40 text-xs tracking-widest uppercase">Ancient Wisdom & Modern Logic</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#d4af37]/60 uppercase tracking-widest">宗门节点 (Host)</label>
                <input required type="text" value={dbConfig.host} onChange={e => setDbConfig({...dbConfig, host: e.target.value})} className="w-full bg-black/40 border-[#d4af37]/20 border rounded p-3 text-sm text-[#d4af37] focus:border-[#d4af37] outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#d4af37]/60 uppercase tracking-widest">传送门 (Port)</label>
                <input required type="text" value={dbConfig.port} onChange={e => setDbConfig({...dbConfig, port: e.target.value})} className="w-full bg-black/40 border-[#d4af37]/20 border rounded p-3 text-sm text-[#d4af37] focus:border-[#d4af37] outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#d4af37]/60 uppercase tracking-widest">密室库名 (Database)</label>
              <input required type="text" value={dbConfig.name} onChange={e => setDbConfig({...dbConfig, name: e.target.value})} className="w-full bg-black/40 border-[#d4af37]/20 border rounded p-3 text-sm text-[#d4af37] focus:border-[#d4af37] outline-none transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#d4af37]/60 uppercase tracking-widest">执事之名 (Username)</label>
              <input required type="text" value={dbConfig.user} onChange={e => setDbConfig({...dbConfig, user: e.target.value})} className="w-full bg-black/40 border-[#d4af37]/20 border rounded p-3 text-sm text-[#d4af37] focus:border-[#d4af37] outline-none transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#d4af37]/60 uppercase tracking-widest">通关密语 (Password)</label>
              <input required type="password" placeholder="••••••••" className="w-full bg-black/40 border-[#d4af37]/20 border rounded p-3 text-sm text-[#d4af37] focus:border-[#d4af37] outline-none transition-all placeholder:text-[#d4af37]/20" />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-[#8a6d1e] via-[#d4af37] to-[#8a6d1e] text-[#0c0c0e] font-black py-4 rounded-sm transition-all shadow-[0_10px_30px_rgba(212,175,55,0.2)] active:scale-[0.98] uppercase tracking-[0.3em] flex items-center justify-center gap-2">
              <Zap size={18} /> 开启秘录
            </button>
          </form>
          <div className="flex items-center justify-center gap-4 text-[9px] text-[#d4af37]/30 tracking-[0.5em] font-bold uppercase">
            <span className="w-8 h-[1px] bg-[#d4af37]/20"></span>
            武林至尊 宝刀屠龙
            <span className="w-8 h-[1px] bg-[#d4af37]/20"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-[#d4af37]/80 flex overflow-hidden font-serif selection:bg-[#d4af37]/30 selection:text-white">
      <CloudPattern />
      
      <aside className="w-72 border-r border-[#d4af37]/10 flex flex-col p-8 bg-[#0c0c0e]/80 backdrop-blur-xl shrink-0 relative z-20">
        <div className="flex items-center space-x-4 mb-14 px-2">
          <div className="bg-gradient-to-br from-[#d4af37] to-[#8a6d1e] p-2.5 rounded shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <Flame className="text-[#0c0c0e]" size={28} />
          </div>
          <span className="text-2xl font-black tracking-[0.2em] text-[#d4af37] uppercase italic">星云阁<span className="text-white/60 ml-1">GM</span></span>
        </div>
        
        <nav className="flex-1 space-y-4">
          <SidebarItem icon={Activity} label="乾坤概览" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Users} label="弟子名册" active={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} />
          <SidebarItem icon={Gamepad2} label="豪侠传志" active={activeTab === 'characters'} onClick={() => setActiveTab('characters')} />
          <SidebarItem icon={Megaphone} label="江湖通告" active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} />
          <SidebarItem icon={ShieldCheck} label="戒律审计" active={activeTab === 'auth'} onClick={() => setActiveTab('auth')} />
        </nav>

        <div className="mt-auto pt-8 border-t border-[#d4af37]/10">
          <button onClick={() => setIsLoggedIn(false)} className="group flex items-center space-x-3 text-[#d4af37]/40 hover:text-rose-500 transition-all px-4 py-2 w-full text-left">
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold tracking-widest">隐退江湖</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#0c0c0e] relative z-10 custom-scrollbar">
        <header className="sticky top-0 z-30 flex items-center justify-between px-12 py-8 bg-[#0c0c0e]/90 backdrop-blur-md border-b border-[#d4af37]/10">
          <div className="flex items-center gap-6">
            <h2 className="text-3xl font-black text-white tracking-[0.2em]">
              {activeTab === 'dashboard' ? '乾坤大势' : 
               activeTab === 'accounts' ? '诸徒名册' : 
               activeTab === 'characters' ? '群侠录' : 
               activeTab === 'announcements' ? '江湖榜' : '戒律司'}
            </h2>
            <div className="flex items-center gap-2 text-[#d4af37] bg-[#d4af37]/10 px-3 py-1.5 rounded-sm text-[10px] font-black border border-[#d4af37]/20 tracking-widest">
              <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
              密令通畅
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d4af37]/40" size={16} />
              <input type="text" placeholder="搜寻侠名..." className="bg-black/40 border-[#d4af37]/20 border rounded-full pl-10 pr-6 py-2.5 text-sm text-[#d4af37] focus:outline-none focus:border-[#d4af37] w-72 placeholder:text-[#d4af37]/20 transition-all" />
            </div>
            <button className="p-2.5 bg-[#161618] border border-[#d4af37]/20 rounded-lg text-[#d4af37]/60 hover:text-[#d4af37] hover:border-[#d4af37] transition-all">
              <Settings size={22} />
            </button>
          </div>
        </header>

        <div className="p-12 max-w-7xl mx-auto space-y-12">
          
          {activeTab === 'dashboard' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { label: "实时灵压", value: "2,842", icon: Zap, color: "text-amber-500" },
                  { label: "金银盈余", value: "42,800", icon: DollarSign, color: "text-[#d4af37]" },
                  { label: "江湖波澜", value: "0.02%", icon: Activity, color: "text-indigo-400" },
                  { label: "百晓算力", value: "98.4%", icon: Cpu, color: "text-purple-400" },
                ].map((stat, i) => {
                  const IconComp = stat.icon;
                  return (
                    <div key={i} className="bg-[#161618] border border-[#d4af37]/10 p-8 rounded shadow-lg group hover:border-[#d4af37]/40 transition-all relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                        <IconComp size={48} />
                      </div>
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-[#d4af37]/40 text-xs font-black uppercase tracking-[0.2em]">{stat.label}</span>
                        <IconComp size={20} className={stat.color} />
                      </div>
                      <div className="text-4xl font-black text-white tracking-tighter">{stat.value}</div>
                      <div className="mt-4 text-[10px] text-[#d4af37]/40 flex items-center gap-1 font-bold">
                        <TrendingUp size={14} className="text-[#00a86b]" /> 
                        <span className="text-[#00a86b]">+12.5%</span> 较昨日
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 bg-[#161618] border border-[#d4af37]/10 p-10 rounded shadow-xl min-h-[450px] relative overflow-hidden">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xl font-black text-white flex items-center gap-3 tracking-[0.2em]">
                      <BarChart3 size={24} className="text-[#d4af37]" /> 江湖人烟图
                    </h3>
                  </div>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={GROWTH_DATA}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d4af37" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#d4af3711" vertical={false} />
                        <XAxis dataKey="time" stroke="#d4af3744" fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#d4af3788'}} />
                        <YAxis stroke="#d4af3744" fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#d4af3788'}} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0c0c0e', border: '1px solid #d4af3744', borderRadius: '4px' }}
                          labelStyle={{ color: '#d4af37' }}
                        />
                        <Area type="monotone" dataKey="users" name="活跃豪侠" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-[#161618] border border-[#d4af37]/10 p-10 rounded shadow-xl flex flex-col min-h-[450px] relative">
                  <CornerDecor className="top-0 right-0 rotate-90" />
                  <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3 tracking-[0.2em]">
                    <MessageSquare size={24} className="text-[#d4af37]" /> 百晓生传音
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-4 custom-scrollbar">
                    {chat.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-20 italic">
                        <Scroll size={64} className="mb-6" />
                        <p className="text-sm">尚未修书百晓生。请询问武林动态...</p>
                      </div>
                    ) : chat.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] px-5 py-3.5 rounded-sm text-sm tracking-wide ${
                          msg.role === 'user' ? 'bg-[#d4af37]/20 text-white border-r-4 border-[#d4af37]' : 'bg-black/40 text-[#d4af37]/90 border-l-4 border-[#d4af37]/40'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="relative">
                    <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && askAi()} disabled={isAiLoading} placeholder="修书百晓生..." className="w-full bg-black/40 border-[#d4af37]/20 border rounded-sm pl-5 pr-14 py-4 text-sm text-[#d4af37] focus:outline-none focus:border-[#d4af37] placeholder:text-[#d4af37]/20" />
                    <button onClick={askAi} disabled={isAiLoading || !input} className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#d4af37] text-black p-2.5 rounded hover:bg-[#b8952e] transition-colors"><Zap size={18} /></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'accounts' && (
            <div className="bg-[#161618] border border-[#d4af37]/10 rounded shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700 relative">
              <CornerDecor className="top-0 left-0" />
              <div className="p-10 border-b border-[#d4af37]/10 flex justify-between items-center bg-black/20">
                <h3 className="text-2xl font-black text-white tracking-[0.2em]">诸徒名册 (Account Roster)</h3>
                <button 
                  onClick={() => setEditModal({ type: 'add_account' })}
                  className="bg-[#d4af37] text-black px-6 py-2.5 rounded-sm font-black text-sm flex items-center gap-2 hover:bg-[#b8952e] shadow-lg transition-all"
                >
                  <UserPlus size={20} /> 收录新徒
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/40 text-left">
                    <tr>
                      <th className="px-10 py-5 text-xs font-black text-[#d4af37]/50 uppercase tracking-[0.3em]">门徒名号 / 密号</th>
                      <th className="px-10 py-5 text-xs font-black text-[#d4af37]/50 uppercase tracking-[0.3em]">江湖头衔</th>
                      <th className="px-10 py-5 text-xs font-black text-[#d4af37]/50 uppercase tracking-[0.3em]">元宝余额</th>
                      <th className="px-10 py-5 text-xs font-black text-[#d4af37]/50 uppercase tracking-[0.3em]">心境状态</th>
                      <th className="px-10 py-5 text-xs font-black text-[#d4af37]/50 uppercase tracking-[0.3em] text-right">掌门批示</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d4af37]/5">
                    {accounts.map(acc => (
                      <tr key={acc.id} className="hover:bg-[#d4af37]/5 transition-colors group">
                        <td className="px-10 py-7">
                          <div className="text-white font-bold text-lg tracking-wider group-hover:text-[#d4af37] transition-colors">{acc.username}</div>
                          <div className="text-[#d4af37]/30 text-xs mt-1">密印: {acc.id}</div>
                        </td>
                        <td className="px-10 py-7">
                          <div className="flex gap-3">
                            {acc.isGM && <TraditionalBadge color="purple"><Shield size={10} className="mr-1 inline mb-0.5" /> 江湖戒律使</TraditionalBadge>}
                            {acc.vip > 0 && <TraditionalBadge color="gold"><Crown size={10} className="mr-1 inline mb-0.5" /> 级位 {acc.vip}</TraditionalBadge>}
                          </div>
                        </td>
                        <td className="px-10 py-7">
                          <div className="flex items-center gap-2 text-[#d4af37] font-black text-xl">
                            <DollarSign size={16} className="opacity-50" />
                            {acc.points.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-10 py-7">
                          <span className={`px-3 py-1 rounded-sm text-[10px] font-black border tracking-widest ${acc.status === '正常' ? 'bg-[#00a86b]/10 text-[#00a86b] border-[#00a86b]/20' : 'bg-[#e34234]/10 text-[#e34234] border-[#e34234]/20'}`}>
                            {acc.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-10 py-7 text-right">
                          <div className="flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditModal({type: 'password', target: acc})} className="p-3 bg-black/40 text-[#d4af37] rounded hover:bg-[#d4af37] hover:text-black transition-all" title="重设密语"><Key size={18} /></button>
                            <button onClick={() => setEditModal({type: 'recharge', target: acc})} className="p-3 bg-black/40 text-[#00a86b] rounded hover:bg-[#00a86b] hover:text-white transition-all" title="注入修为"><DollarSign size={18} /></button>
                            <button onClick={() => setEditModal({type: 'vip', target: acc})} className="p-3 bg-black/40 text-purple-400 rounded hover:bg-purple-500 hover:text-white transition-all" title="赏赐头衔"><Crown size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'characters' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {characters.map(char => {
                const charTab = charTabs[char.id] || 'overview';
                return (
                  <div key={char.id} className="bg-[#161618] border border-[#d4af37]/10 rounded overflow-hidden shadow-2xl hover:border-[#d4af37]/60 transition-all flex flex-col h-full relative group">
                    <CornerDecor className="top-0 right-0 rotate-90" />
                    <div className="p-7 border-b border-[#d4af37]/10 bg-black/40 flex flex-col items-center text-center">
                      <div className="relative mb-6">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-b from-[#d4af37]/40 to-transparent p-[1px]">
                          <div className="w-full h-full rounded-full bg-[#0c0c0e] flex items-center justify-center border border-[#d4af37]/10 overflow-hidden relative">
                             <Sword className="text-[#d4af37]/20 absolute scale-[3] rotate-45" />
                             <span className="text-3xl font-black text-[#d4af37] relative z-10">{char.name[0]}</span>
                          </div>
                        </div>
                        <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-[#161618] shadow-lg ${char.status === '在线' ? 'bg-[#00a86b]' : 'bg-slate-700'}`} />
                      </div>
                      <h4 className="font-black text-2xl text-white tracking-[0.2em] mb-2">{char.name}</h4>
                      <div className="flex gap-2">
                        <TraditionalBadge color="jade">{char.job}</TraditionalBadge>
                        <TraditionalBadge color="gold">修为等级 {char.level}</TraditionalBadge>
                      </div>
                    </div>
                    
                    <div className="p-8 flex-1 flex flex-col min-h-[350px] relative">
                      <div className="flex gap-4 text-[11px] font-black text-[#d4af37]/30 uppercase border-b border-[#d4af37]/10 pb-3 mb-6 overflow-x-auto custom-scrollbar whitespace-nowrap tracking-[0.2em]">
                        {['overview', 'skills', 'inventory', 'warehouse'].map(t => (
                          <button key={t} onClick={() => setCharTabs({...charTabs, [char.id]: t as any})} className={`pb-3 transition-all ${charTab === t ? 'text-[#d4af37] border-b-2 border-[#d4af37] -mb-[13px]' : 'hover:text-[#d4af37]/60'}`}>
                            {t === 'overview' ? '豪侠属性' : t === 'skills' ? '绝学' : t === 'inventory' ? '随身囊' : '私人金库'}
                          </button>
                        ))}
                      </div>

                      <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar max-h-56">
                        {charTab === 'overview' && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-black/40 p-4 rounded-sm border border-[#d4af37]/10 shadow-inner">
                                <div className="text-[10px] text-[#d4af37]/40 font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Flame size={12} /> 武林威望</div>
                                <div className="text-xl font-black text-white">{char.pvp}</div>
                              </div>
                              <div className="bg-black/40 p-4 rounded-sm border border-[#d4af37]/10 shadow-inner">
                                <div className="text-[10px] text-[#d4af37]/40 font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Users2 size={12} /> 生死之交</div>
                                <div className="text-xl font-black text-white">{char.friends.length}</div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-[10px] text-[#d4af37]/40 font-black uppercase tracking-widest mb-2">江湖称号</div>
                              <div className="flex flex-wrap gap-2">{char.titles.map((t, idx) => <TraditionalBadge key={idx} color="vermillion">{t}</TraditionalBadge>)}</div>
                            </div>
                          </div>
                        )}
                        {charTab === 'skills' && (
                          <div className="space-y-3">
                            {char.skills.map((s, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 bg-black/20 border border-[#d4af37]/5 rounded-sm hover:border-[#d4af37]/20 transition-all">
                                <Sparkles size={16} className="text-[#d4af37]" />
                                <span className="text-sm font-bold text-white/80">{s}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {charTab === 'inventory' && (
                          <div className="grid grid-cols-4 gap-3">
                            {char.inventory.map((item, i) => (
                              <div key={i} className="aspect-square bg-black/40 border border-[#d4af37]/10 rounded flex items-center justify-center p-2 group/item hover:border-[#d4af37] transition-all cursor-help relative" title={item}>
                                <Package size={20} className="text-[#d4af37]/30 group-hover/item:text-[#d4af37]" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 bg-black/40 flex gap-4 border-t border-[#d4af37]/10 relative">
                      <button onClick={() => setEditModal({type: 'char_edit', target: char})} className="flex-1 bg-transparent border border-[#d4af37]/40 hover:bg-[#d4af37] hover:text-black text-[#d4af37] text-xs font-black py-3 rounded-sm transition-all flex items-center justify-center gap-2 tracking-[0.1em] uppercase">
                        <Edit3 size={14} /> 易经洗髓
                      </button>
                      <button className="bg-[#e34234]/10 hover:bg-[#e34234] text-[#e34234] hover:text-white border border-[#e34234]/20 p-3 rounded-sm transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="bg-[#161618] border border-[#d4af37]/10 p-12 rounded shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-12 relative z-10">
                  <h3 className="text-3xl font-black text-white tracking-[0.2em] flex items-center gap-4">
                    <Megaphone className="text-[#d4af37]" size={32} /> 百晓通告榜
                  </h3>
                  <button 
                    onClick={() => setEditModal({ type: 'add_announcement' })}
                    className="bg-[#d4af37] text-black px-8 py-3 rounded-sm font-black flex items-center gap-3 hover:bg-[#b8952e] shadow-xl transition-all"
                  >
                    <Plus size={22} /> 发布江湖令
                  </button>
                </div>
                <div className="space-y-6 relative z-10">
                  {announcements.map(ann => (
                    <div key={ann.id} className="bg-black/30 border-l-4 border-[#d4af37] p-8 rounded-sm flex items-center gap-8 hover:bg-black/50 transition-all group">
                      <div className={`p-5 rounded-full ${ann.type === '即时' ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'bg-[#e34234]/10 text-[#e34234]'}`}>
                        {ann.type === '即时' ? <Zap size={28} /> : <Clock size={28} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                           <span className="text-white font-black text-lg tracking-widest">{ann.type}·传讯</span>
                        </div>
                        <p className="text-[#d4af37]/70 text-base leading-relaxed font-serif italic">“ {ann.content} ”</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Modal 
        isOpen={!!editModal} 
        onClose={() => setEditModal(null)} 
        title={
          editModal?.type === 'password' ? '重设弟子密语' : 
          editModal?.type === 'recharge' ? '注入元宝修为' : 
          editModal?.type === 'vip' ? '授予江湖地位' : 
          editModal?.type === 'add_account' ? '弟子招募令' :
          editModal?.type === 'add_announcement' ? '发布江湖令' : '易经洗髓'
        }
      >
        {editModal && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            if (editModal.type === 'add_account') {
              handleAddAccount(Object.fromEntries(fd.entries()));
            } else if (editModal.type === 'add_announcement') {
              handleAddAnnouncement(fd.get('content') as string);
            }
          }} className="space-y-8">
            
            {/* 添加弟子表单 */}
            {editModal.type === 'add_account' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#d4af37]/60 uppercase tracking-[0.2em]">弟子名号 (Username)</label>
                  <input required name="username" type="text" placeholder="输入侠名..." className="w-full bg-black/40 border-[#d4af37]/20 border rounded p-4 text-[#d4af37] text-sm focus:border-[#d4af37] outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#d4af37]/60 uppercase tracking-[0.2em]">通关密语 (Password)</label>
                  <input required name="password" type="password" placeholder="设立密语..." className="w-full bg-black/40 border-[#d4af37]/20 border rounded p-4 text-[#d4af37] text-sm focus:border-[#d4af37] outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#d4af37]/60 uppercase tracking-[0.2em]">初始元宝</label>
                    <input name="points" type="number" defaultValue="1000" className="w-full bg-black/40 border-[#d4af37]/20 border rounded p-4 text-[#d4af37] text-sm focus:border-[#d4af37] outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#d4af37]/60 uppercase tracking-[0.2em]">VIP 级位</label>
                    <input name="vip" type="number" defaultValue="0" max="15" className="w-full bg-black/40 border-[#d4af37]/20 border rounded p-4 text-[#d4af37] text-sm focus:border-[#d4af37] outline-none transition-all" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/40 rounded border border-[#d4af37]/10">
                  <span className="text-white font-black text-sm">授戒律使 (GM) 权限</span>
                  <input name="isGM" type="checkbox" value="true" className="w-5 h-5 accent-[#d4af37] cursor-pointer" />
                </div>
              </div>
            )}

            {/* 发布公告表单 */}
            {editModal.type === 'add_announcement' && (
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[#d4af37]/60 uppercase tracking-[0.2em]">传音内容</label>
                <textarea required name="content" rows={4} placeholder="写下欲告知江湖之事..." className="w-full bg-black/40 border-[#d4af37]/20 border rounded p-4 text-[#d4af37] text-sm focus:border-[#d4af37] outline-none resize-none italic font-serif transition-all" />
              </div>
            )}

            {/* 其他编辑逻辑 */}
            {editModal.type === 'password' && (
              <div className="space-y-5">
                <input required type="password" placeholder="输入新密语..." className="w-full bg-black/40 border-[#d4af37]/20 border rounded p-4 text-[#d4af37] text-sm" />
                <input required type="password" placeholder="确认新密语..." className="w-full bg-black/40 border-[#d4af37]/20 border rounded p-4 text-[#d4af37] text-sm" />
              </div>
            )}

            <div className="flex gap-4 pt-6 border-t border-[#d4af37]/10">
              <button type="button" onClick={() => setEditModal(null)} className="flex-1 bg-black/40 border border-[#d4af37]/20 text-[#d4af37]/60 py-4 rounded-sm font-black text-sm hover:text-[#d4af37] transition-all">暂缓执行</button>
              <button type="submit" className="flex-1 bg-gradient-to-r from-[#8a6d1e] to-[#d4af37] text-black py-4 rounded-sm font-black text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">确认颁布</button>
            </div>
          </form>
        )}
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700;900&display=swap');
        body { font-family: 'Noto Serif SC', serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.2); border-radius: 10px; }
      `}} />
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  FileText, 
  Image as ImageIcon, 
  Type, 
  Calculator, 
  Zap, 
  Clock, 
  ArrowLeft, 
  ExternalLink,
  Menu,
  X,
  Moon,
  Sun,
  ChevronRight,
  ShieldCheck,
  Info,
  Mail,
  Scale,
  Lock,
  Github,
  Twitter,
  Linkedin,
  Globe,
  Share2,
  Copy,
  Check,
  ArrowUp,
  Send,
  Heart,
  Star,
  CreditCard,
  Coffee,
  Sparkles,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Define the tool structure based on tools-registry.js
interface Tool {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  keywords: string[];
  popularity: number;
  module: string;
  functionName: string;
  seoTitle?: string;
  seoDescription?: string;
  isPro?: boolean;
}

// Global declarations for the vanilla JS tool modules
declare global {
  interface Window {
    PDFTools: any;
    ImageTools: any;
    TextTools: any;
    CalcTools: any;
    GenTools: any;
    toolsRegistry: Tool[];
  }
}

const CATEGORIES = [
  { id: 'all', name: 'All Tools', icon: <Zap className="w-4 h-4" /> },
  { id: 'favorites', name: 'Favorites', icon: <Check className="w-4 h-4 text-pink-500" /> },
  { id: 'pdf', name: 'PDF', icon: <FileText className="w-4 h-4" /> },
  { id: 'image', name: 'Image', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'text', name: 'Text', icon: <Type className="w-4 h-4" /> },
  { id: 'calculator', name: 'Calculators', icon: <Calculator className="w-4 h-4" /> },
  { id: 'generator', name: 'Generators', icon: <Zap className="w-4 h-4" /> },
];

type View = 'home' | 'tool' | 'about' | 'privacy' | 'terms' | 'contact';

export default function App() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [recentTools, setRecentTools] = useState<Tool[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [currentView, setCurrentView] = useState<View>('home');
  const [isCopied, setIsCopied] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(() => {
    return localStorage.getItem('cookieConsent') !== 'true';
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('favoriteTools') || '[]');
    } catch (e) {
      return [];
    }
  });
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Dynamic SEO updates
    if (currentView === 'tool' && selectedTool) {
      const title = selectedTool.seoTitle || `${selectedTool.name} - Free Online Tool | ToolKit`;
      const description = selectedTool.seoDescription || selectedTool.description;
      
      document.title = title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', description);
      
      // OG Tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', title);
      
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', description);
    } else {
      document.title = 'ToolKit — 58 Free Online Tools | 100% Private & Free';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', 'Compress PDFs, resize images, generate text and more — all free, all private, no uploads to any server.');
    }
  }, [currentView, selectedTool]);

  // Load tools from the global registry
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    console.log('App mounted, checking toolsRegistry:', window.toolsRegistry);
    if (window.toolsRegistry) {
      setTools(window.toolsRegistry);
    } else {
      console.warn('toolsRegistry not found on window object');
    }
    
    // Load recent tools from localStorage
    let savedRecent: string[] = [];
    try {
      savedRecent = JSON.parse(localStorage.getItem('recentTools') || '[]');
    } catch (e) {
      console.error('Error parsing recentTools:', e);
    }

    if (window.toolsRegistry) {
      const recent = savedRecent
        .map((id: string) => (window as any).toolsRegistry.find((t: any) => t.id === id))
        .filter(Boolean)
        .slice(0, 4);
      setRecentTools(recent);
    }

    // Handle initial URL tool param
    const params = new URLSearchParams(window.location.search);
    const toolId = params.get('tool');
    const view = params.get('view') as View;

    if (toolId && window.toolsRegistry) {
      const tool = window.toolsRegistry.find(t => t.id === toolId);
      if (tool) {
        setSelectedTool(tool);
        setCurrentView('tool');
      }
    } else if (view) {
      setCurrentView(view);
    }
  }, []);

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
      
      let matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
      if (activeCategory === 'favorites') {
        matchesCategory = favorites.includes(tool.id);
      }
      
      return matchesSearch && matchesCategory;
    });
  }, [tools, searchQuery, activeCategory, favorites]);

  const toggleFavorite = (e: React.MouseEvent, toolId: string) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(toolId)
      ? favorites.filter(id => id !== toolId)
      : [...favorites, toolId];
    setFavorites(newFavorites);
    localStorage.setItem('favoriteTools', JSON.stringify(newFavorites));
  };

  const handleToolSelect = (tool: Tool) => {
    setSelectedTool(tool);
    setCurrentView('tool');
    setSearchQuery('');
    
    // Save to recent tools
    let savedRecent: string[] = [];
    try {
      savedRecent = JSON.parse(localStorage.getItem('recentTools') || '[]');
    } catch (e) {
      console.error('Error parsing recentTools:', e);
    }
    const newRecent = [tool.id, ...savedRecent.filter((id: string) => id !== tool.id)].slice(0, 5);
    localStorage.setItem('recentTools', JSON.stringify(newRecent));
    
    const recent = newRecent
      .map((id: string) => tools.find(t => t.id === id))
      .filter(Boolean) as Tool[];
    setRecentTools(recent);

    // Update URL
    window.history.pushState({ toolId: tool.id }, '', `?tool=${tool.id}`);
    window.scrollTo(0, 0);
  };

  const navigateTo = (view: View) => {
    setCurrentView(view);
    setSelectedTool(null);
    setIsSidebarOpen(false);
    window.history.pushState({}, '', `?view=${view}`);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setSelectedTool(null);
    setCurrentView('home');
    window.history.pushState({}, '', window.location.pathname);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = async () => {
    if (!selectedTool) return;
    const url = `${window.location.origin}/?tool=${selectedTool.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `ToolKit - ${selectedTool.name}`,
          text: selectedTool.description,
          url: url,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:bg-slate-900/80 dark:border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => { setSelectedTool(null); setActiveCategory('all'); setCurrentView('home'); }}
            >
              <div className="w-10 h-10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-blue-600" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <span className="text-2xl font-black tracking-tighter hidden sm:block bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">TOOLKIT</span>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Try: 'Compress PDF' or 'Resize Image'..."
                className="w-full pl-10 pr-12 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-full focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (currentView !== 'home') setCurrentView('home'); }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[10px] font-bold text-slate-400 pointer-events-none">
                <span className="text-[8px]">⌘</span>K
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => navigateTo('contact')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors hidden sm:block"
            >
              <Mail className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8 lg:hidden">
              <span className="font-bold text-lg">Categories</span>
              <button onClick={() => setIsSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setSelectedTool(null); setCurrentView('home'); setIsSidebarOpen(false); }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${activeCategory === cat.id && currentView === 'home'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}
                  `}
                >
                  {cat.icon}
                  {cat.name}
                </button>
              ))}
              
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Information</p>
                <button onClick={() => navigateTo('about')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all ${currentView === 'about' ? 'bg-slate-100 dark:bg-slate-800' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  <Info className="w-4 h-4" /> About Us
                </button>
                <button onClick={() => navigateTo('privacy')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all ${currentView === 'privacy' ? 'bg-slate-100 dark:bg-slate-800' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  <Lock className="w-4 h-4" /> Privacy Policy
                </button>
                <button onClick={() => navigateTo('terms')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all ${currentView === 'terms' ? 'bg-slate-100 dark:bg-slate-800' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  <Scale className="w-4 h-4" /> Terms of Service
                </button>
              </div>
            </nav>

            <div className="mt-auto pt-8">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Privacy First</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  All tools run locally in your browser. Your files never leave your device.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <AnimatePresence mode="wait">
            {currentView === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-6xl mx-auto"
              >
                {/* Hero Section */}
                <div className="mb-12 text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Everything you need, <br className="hidden md:block" /> all in one place.
                  </h1>
                  <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
                    58+ free, fast, and secure online tools for PDF, Images, Text, and more. 
                    No registration required.
                  </p>

                  <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-2">
                    <span className="text-sm text-slate-400 mr-2 flex items-center">
                      <Zap className="w-3.5 h-3.5 text-yellow-500 mr-1.5" />
                      Trending:
                    </span>
                    {[
                      { name: 'Compress PDF', id: 'compress-pdf' },
                      { name: 'Resize Image', id: 'resize-image' },
                      { name: 'Invoice Generator', id: 'invoice-gen' },
                      { name: 'CGPA Calculator', id: 'cgpa-calc' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          const tool = tools.find(t => t.id === item.id);
                          if (tool) handleToolSelect(tool);
                        }}
                        className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-full text-xs font-medium transition-all border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 shadow-sm"
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                <AdUnit slot="home-top" />

                {/* Featured Tools Bento Grid */}
                {!searchQuery && activeCategory === 'all' && (
                  <div className="mb-16">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-semibold uppercase tracking-wider">Featured Tools</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-auto md:h-[450px]">
                      {/* Large Featured Card */}
                      {tools.find(t => t.id === 'merge-pdf') && (
                        <div className="md:col-span-2 md:row-span-2">
                          <ToolCard 
                            tool={tools.find(t => t.id === 'merge-pdf')!} 
                            onClick={() => handleToolSelect(tools.find(t => t.id === 'merge-pdf')!)}
                            isFavorite={favorites.includes('merge-pdf')}
                            onToggleFavorite={toggleFavorite}
                            className="h-full !bg-blue-600 !text-white !border-none shadow-2xl shadow-blue-500/20"
                          />
                        </div>
                      )}
                      {/* Medium Featured Cards */}
                      {tools.find(t => t.id === 'compress-pdf') && (
                        <div className="md:col-span-2 md:row-span-1">
                          <ToolCard 
                            tool={tools.find(t => t.id === 'compress-pdf')!} 
                            onClick={() => handleToolSelect(tools.find(t => t.id === 'compress-pdf')!)}
                            isFavorite={favorites.includes('compress-pdf')}
                            onToggleFavorite={toggleFavorite}
                            className="h-full !bg-indigo-600 !text-white !border-none shadow-2xl shadow-indigo-500/20"
                          />
                        </div>
                      )}
                      {/* Small Featured Cards */}
                      {tools.find(t => t.id === 'resize-image') && (
                        <div className="md:col-span-1 md:row-span-1">
                          <ToolCard 
                            tool={tools.find(t => t.id === 'resize-image')!} 
                            onClick={() => handleToolSelect(tools.find(t => t.id === 'resize-image')!)}
                            isFavorite={favorites.includes('resize-image')}
                            onToggleFavorite={toggleFavorite}
                            className="h-full !bg-slate-900 !text-white !border-none shadow-2xl shadow-slate-900/20"
                          />
                        </div>
                      )}
                      {tools.find(t => t.id === 'invoice-gen') && (
                        <div className="md:col-span-1 md:row-span-1">
                          <ToolCard 
                            tool={tools.find(t => t.id === 'invoice-gen')!} 
                            onClick={() => handleToolSelect(tools.find(t => t.id === 'invoice-gen')!)}
                            isFavorite={favorites.includes('invoice-gen')}
                            onToggleFavorite={toggleFavorite}
                            className="h-full !bg-emerald-600 !text-white !border-none shadow-2xl shadow-emerald-500/20"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recent Tools */}
                {recentTools.length > 0 && !searchQuery && activeCategory === 'all' && (
                  <div className="mb-12">
                    <div className="flex items-center gap-2 mb-4 text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-semibold uppercase tracking-wider">Recently Used</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {recentTools.map((tool) => (
                        <ToolCard 
                          key={tool.id} 
                          tool={tool} 
                          onClick={() => handleToolSelect(tool)} 
                          isRecent 
                          isFavorite={favorites.includes(tool.id)}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Tools Grid */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">
                      {activeCategory === 'all' ? 'All Tools' : CATEGORIES.find(c => c.id === activeCategory)?.name}
                      <span className="ml-2 text-sm font-normal text-slate-400">({filteredTools.length})</span>
                    </h2>
                  </div>

                  {filteredTools.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredTools.map((tool) => (
                        <ToolCard 
                          key={tool.id} 
                          tool={tool} 
                          onClick={() => handleToolSelect(tool)} 
                          isFavorite={favorites.includes(tool.id)}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-semibold mb-1">No tools found</h3>
                      <p className="text-slate-500">Try adjusting your search or category filter.</p>
                    </div>
                  )}
                </div>
                
                {/* SEO Content for Home */}
                <div className="mt-24 pt-12 border-t border-slate-200 dark:border-slate-800">
                  <div className="grid md:grid-cols-3 gap-12">
                    <div>
                      <h3 className="text-lg font-bold mb-4">Why use ToolKit?</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        ToolKit provides a comprehensive suite of online tools that are completely free to use. Unlike other platforms, we don't require registration or subscriptions. Everything is designed to be fast, simple, and accessible from any device.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-4">Is it secure?</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Yes! Security is our top priority. All our tools process your files locally in your browser. This means your data never leaves your computer or phone. We don't upload your files to any server, ensuring 100% privacy.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-4">How much does it cost?</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        ToolKit is 100% free. We believe that basic utility tools should be available to everyone without barriers. We sustain our platform through minimal advertising, allowing us to keep the tools free forever.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Latest Updates Section */}
                <div className="mt-24 p-8 bg-blue-600 rounded-3xl text-white">
                  <div className="max-w-3xl">
                    <h2 className="text-2xl font-bold mb-4">Latest Updates & News</h2>
                    <div className="space-y-6">
                      <div className="border-l-2 border-blue-400 pl-4">
                        <span className="text-xs font-bold uppercase tracking-widest opacity-70">March 20, 2026</span>
                        <h4 className="font-bold text-lg mt-1">New PDF Tools Added!</h4>
                        <p className="text-sm opacity-90 mt-2">We've just added 5 new PDF tools including PDF to Word, PDF to Excel, and PDF Watermarking. All running 100% client-side for your privacy.</p>
                      </div>
                      <div className="border-l-2 border-blue-400 pl-4">
                        <span className="text-xs font-bold uppercase tracking-widest opacity-70">March 15, 2026</span>
                        <h4 className="font-bold text-lg mt-1">Dark Mode is Here</h4>
                        <p className="text-sm opacity-90 mt-2">By popular request, we've implemented a full dark mode across the entire platform. Switch it on in the header for a more comfortable experience at night.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Featured Articles Section */}
                <div className="mt-24">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">Guides & Articles</h2>
                    <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      View all guides <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="group cursor-pointer bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all">
                      <div className="aspect-video relative overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=800" alt="PDF Security" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">Security</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors">How to Secure Your PDF Documents</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">Learn the best practices for protecting your sensitive PDF files with passwords and encryption using our local tools.</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span>5 min read</span>
                          <span>•</span>
                          <span>March 20, 2026</span>
                        </div>
                      </div>
                    </div>
                    <div className="group cursor-pointer bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all">
                      <div className="aspect-video relative overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800" alt="Image Optimization" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-green-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">Performance</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors">Optimizing Images for the Web</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">A comprehensive guide on choosing the right image format and compression level to speed up your website performance.</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span>8 min read</span>
                          <span>•</span>
                          <span>March 15, 2026</span>
                        </div>
                      </div>
                    </div>
                    <div className="group cursor-pointer bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all">
                      <div className="aspect-video relative overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800" alt="Web Development" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">Development</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors">The Future of Browser-Based Tools</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">Discover how WebAssembly and modern APIs are enabling powerful desktop-class applications to run entirely in the browser.</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span>6 min read</span>
                          <span>•</span>
                          <span>March 10, 2026</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentView === 'tool' && selectedTool && (
              <motion.div 
                key="tool"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto"
              >
                <button 
                  onClick={handleBack}
                  className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6 group"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  <span className="text-sm font-medium">Back to all tools</span>
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{selectedTool.icon}</span>
                      <h1 className="text-3xl font-bold tracking-tight">{selectedTool.name}</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">{selectedTool.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleShare}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition-all"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                      {isCopied ? 'Copied!' : 'Share Tool'}
                    </button>
                    <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider">
                      {selectedTool.category}
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-1 overflow-hidden">
                  <ToolUI tool={selectedTool} />
                </div>

                <AdUnit slot="tool-bottom" />
                
                {/* SEO Content for Tool */}
                <div className="mt-12 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                  <h2 className="text-xl font-bold mb-4">How to use {selectedTool.name}</h2>
                  <div className="prose prose-slate dark:prose-invert max-w-none text-sm text-slate-500 dark:text-slate-400">
                    <p className="mb-4">Using our {selectedTool.name} tool is incredibly easy. Just follow these simple steps:</p>
                    <ol className="list-decimal pl-5 space-y-2 mb-6">
                      <li>Select your file or enter the required input in the area above.</li>
                      <li>Configure any options or settings specific to the {selectedTool.name} tool.</li>
                      <li>Click the action button to process your request.</li>
                      <li>Download your result instantly to your device.</li>
                    </ol>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">Frequently Asked Questions</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">Is my data safe?</p>
                        <p>Absolutely. All processing happens locally in your browser. Your files are never uploaded to our servers.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">Are there any file size limits?</p>
                        <p>Since the processing happens on your device, the only limit is your device's memory and processing power. Most standard files work perfectly.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related Tools */}
                <div className="mt-16">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    Related Tools
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {tools
                      .filter(t => t.category === selectedTool.category && t.id !== selectedTool.id)
                      .slice(0, 3)
                      .map(tool => (
                        <ToolCard 
                          key={tool.id} 
                          tool={tool} 
                          onClick={() => handleToolSelect(tool)} 
                          compact 
                          isFavorite={favorites.includes(tool.id)}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
                  </div>
                </div>
              </motion.div>
            )}
            
            {currentView === 'about' && <AboutPage />}
            {currentView === 'privacy' && <PrivacyPage />}
            {currentView === 'terms' && <TermsPage />}
            {currentView === 'contact' && <ContactPage />}
          </AnimatePresence>
          
          {/* Footer */}
          <footer className="mt-24 pt-12 border-t border-slate-200 dark:border-slate-800 pb-12">
            {/* Newsletter Section */}
            <div className="max-w-6xl mx-auto mb-20 p-8 md:p-12 bg-slate-900 dark:bg-blue-900/10 rounded-[2.5rem] text-white overflow-hidden relative">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-md text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">Stay Updated</h3>
                  <p className="text-slate-400 text-sm md:text-base">Get notified when we add new tools and features. No spam, ever.</p>
                </div>
                <form className="flex w-full md:w-auto gap-2" onSubmit={(e) => e.preventDefault()}>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 md:w-64 px-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  />
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    <span>Join</span>
                  </button>
                </form>
              </div>
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
                  <span className="text-xl font-bold tracking-tight">ToolKit</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                  The ultimate collection of free, secure, and fast online tools. 
                  Designed for developers, designers, and everyday users who value privacy and speed.
                </p>
                
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                    <Coffee className="w-3.5 h-3.5 text-amber-500" />
                    Support Our Mission
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                    ToolKit is 100% free. Support us via <strong>PhonePe / GPay</strong> at <strong>9494996929</strong> to help us keep the servers running.
                  </p>
                  <button 
                    onClick={() => setShowDonationModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20"
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    Donate via UPI
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <a href="https://twitter.com/PavanB4588" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:text-blue-600 transition-colors"><Twitter className="w-4 h-4" /></a>
                  <a href="https://github.com/pavan09-end-byte" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:text-blue-600 transition-colors"><Github className="w-4 h-4" /></a>
                  <a href="https://www.linkedin.com/in/pavan-kumar-bathula-0b4753320?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:text-blue-600 transition-colors"><Linkedin className="w-4 h-4" /></a>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold mb-4">Tools</h4>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <li><button onClick={() => { setActiveCategory('pdf'); setCurrentView('home'); }} className="hover:text-blue-600 transition-colors">PDF Tools</button></li>
                  <li><button onClick={() => { setActiveCategory('image'); setCurrentView('home'); }} className="hover:text-blue-600 transition-colors">Image Tools</button></li>
                  <li><button onClick={() => { setActiveCategory('text'); setCurrentView('home'); }} className="hover:text-blue-600 transition-colors">Text Tools</button></li>
                  <li><button onClick={() => { setActiveCategory('calculator'); setCurrentView('home'); }} className="hover:text-blue-600 transition-colors">Calculators</button></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <li><a href="#" className="hover:text-blue-600 transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition-colors">API Reference</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition-colors">Changelog</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition-colors">Status Page</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <li><button onClick={() => navigateTo('about')} className="hover:text-blue-600 transition-colors">About Us</button></li>
                  <li><button onClick={() => navigateTo('privacy')} className="hover:text-blue-600 transition-colors">Privacy Policy</button></li>
                  <li><button onClick={() => navigateTo('terms')} className="hover:text-blue-600 transition-colors">Terms of Service</button></li>
                  <li><button onClick={() => navigateTo('contact')} className="hover:text-blue-600 transition-colors">Contact Us</button></li>
                </ul>
              </div>
            </div>
            
            <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-slate-400">© 2026 ToolKit. All rights reserved. Made with ❤️ for the web.</p>
              <div className="flex items-center gap-6 text-xs text-slate-400">
                <span>v1.0.0</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  All Systems Operational
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>

      <AnimatePresence>
        {showCommandPalette && (
          <CommandPalette 
            tools={tools} 
            onClose={() => setShowCommandPalette(false)} 
            onSelect={(tool) => { handleToolSelect(tool); setShowCommandPalette(false); }} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCookieConsent && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-[120] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">We value your privacy</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  We use cookies to enhance your experience, analyze traffic, and serve personalized ads. By clicking "Accept", you consent to our use of cookies.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  localStorage.setItem('cookieConsent', 'true');
                  setShowCookieConsent(false);
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all"
              >
                Accept All
              </button>
              <button 
                onClick={() => setShowCookieConsent(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                Decline
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to Top */}
      <AnimatePresence>
        {showDonationModal && (
          <DonationModal onClose={() => setShowDonationModal(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-4 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/30 z-50 hover:bg-blue-700 transition-all"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdUnit({ slot }: { slot: string }) {
  return (
    <div className="my-12 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[120px] group transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50">
      <div className="flex items-center gap-2 mb-2">
        <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-400 rounded text-[8px] font-bold uppercase tracking-widest">Sponsored</span>
        <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors" />
      </div>
      <div className="text-center">
        <p className="text-xs font-bold text-slate-400 group-hover:text-slate-500 transition-colors">Your Ad Here</p>
        <p className="text-[10px] text-slate-300 dark:text-slate-500">Reach 50k+ monthly users. <button className="text-blue-500 hover:underline">Learn more</button></p>
      </div>
    </div>
  );
}

function CommandPalette({ tools, onClose, onSelect }: { tools: Tool[], onClose: () => void, onSelect: (tool: Tool) => void }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    if (!query) return tools.slice(0, 5);
    return tools.filter(t => 
      t.name.toLowerCase().includes(query.toLowerCase()) || 
      t.keywords.some(k => k.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 8);
  }, [tools, query]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-start justify-center p-4 md:p-20 bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: -20 }}
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            autoFocus
            type="text" 
            placeholder="Search for tools..." 
            className="flex-1 bg-transparent border-none outline-none text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-xs text-slate-400 font-bold">ESC</button>
        </div>
        <div className="p-2 max-h-[60vh] overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onSelect(tool)}
                className="w-full flex items-center justify-between p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{tool.icon}</span>
                  <div className="text-left">
                    <p className="font-bold text-sm group-hover:text-blue-600">{tool.name}</p>
                    <p className="text-xs text-slate-400 line-clamp-1">{tool.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {tool.isPro && <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded text-[8px] font-black">PRO</span>}
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                </div>
              </button>
            ))
          ) : (
            <div className="py-12 text-center text-slate-400">
              <p>No tools found for "{query}"</p>
            </div>
          )}
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><ArrowUp className="w-3 h-3 rotate-180" /><ArrowUp className="w-3 h-3" /> Navigate</span>
            <span className="flex items-center gap-1"><ArrowUp className="w-3 h-3 rotate-90" /> Select</span>
          </div>
          <span>ToolKit Search</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DonationModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-8 text-center">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Coffee className="w-10 h-10 text-amber-600" />
          </div>

          <h2 className="text-3xl font-black tracking-tight mb-2">Support ToolKit</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
            ToolKit is 100% free and private. Your donations help us keep the servers running and add more tools.
          </p>

          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 mb-8">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Donate via PhonePe / GPay</p>
            <div className="flex flex-col items-center gap-4">
              <div className="text-2xl font-black tracking-wider text-blue-600 dark:text-blue-400">
                9494996929
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
                    <img src="https://picsum.photos/seed/phonepe/100/100" alt="PhonePe" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">PhonePe</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
                    <img src="https://picsum.photos/seed/gpay/100/100" alt="GPay" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">GPay</span>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Done
          </button>
          <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Thank you for your support!</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ToolCard({ 
  tool, 
  onClick, 
  isRecent = false, 
  compact = false,
  isFavorite = false,
  onToggleFavorite = () => {},
  className = ""
}: { 
  tool: Tool, 
  onClick: () => void, 
  isRecent?: boolean, 
  compact?: boolean, 
  isFavorite?: boolean,
  onToggleFavorite?: (e: React.MouseEvent, id: string) => void,
  className?: string,
  key?: React.Key
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        group relative cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-500/30
        ${compact ? 'p-4' : 'p-6'}
        ${isRecent ? 'bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-blue-900/5' : ''}
        ${className}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`
          flex items-center justify-center rounded-xl transition-colors
          ${compact ? 'w-10 h-10 text-xl' : 'w-12 h-12 text-2xl'}
          ${className.includes('!bg-') ? 'bg-white/20 text-white' : isRecent ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20'}
        `}>
          {tool.icon}
        </div>
        {!compact && (
          <button
            onClick={(e) => onToggleFavorite(e, tool.id)}
            className={`p-2 rounded-lg transition-all ${isFavorite ? 'text-pink-500 bg-pink-50 dark:bg-pink-900/20' : className.includes('!bg-') ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-slate-300 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 opacity-0 group-hover:opacity-100'}`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>
      <h3 className={`font-bold mb-1 transition-colors ${compact ? 'text-sm' : 'text-base'} ${className.includes('!bg-') ? 'text-white' : 'group-hover:text-blue-600'}`}>{tool.name}</h3>
      {!compact && <p className={`text-sm line-clamp-2 leading-relaxed ${className.includes('!bg-') ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>{tool.description}</p>}
    </motion.div>
  );
}

function ToolUI({ tool }: { tool: Tool }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear container
    containerRef.current.innerHTML = '';

    // Map module to global object
    const moduleMap: any = {
      'pdf-tools.js': (window as any).PDFTools,
      'image-tools.js': (window as any).ImageTools,
      'text-tools.js': (window as any).TextTools,
      'calc-tools.js': (window as any).CalcTools,
      'gen-tools.js': (window as any).GenTools
    };

    const moduleObj = moduleMap[tool.module];
    
    if (moduleObj && moduleObj[tool.functionName]) {
      try {
        // The tool functions expect a DOM element to render into
        moduleObj[tool.functionName](containerRef.current);
      } catch (error) {
        console.error(`Error rendering tool ${tool.name}:`, error);
        containerRef.current.innerHTML = `
          <div class="flex flex-col items-center justify-center py-20 text-red-500 text-center px-6">
            <div class="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <h3 class="text-xl font-bold mb-2">Tool Initialization Failed</h3>
            <p class="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              There was an error starting <strong>${tool.name}</strong>. This might be due to a script loading issue or a browser compatibility problem.
            </p>
            <div class="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-xs font-mono text-left overflow-auto max-w-full mb-6">
              ${error instanceof Error ? error.stack || error.message : String(error)}
            </div>
            <button class="btn btn-primary px-8" onclick="location.reload()">Reload Page</button>
          </div>
        `;
      }
    } else {
      containerRef.current.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 text-slate-400 text-center px-6">
          <div class="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Loading Tool Logic...</h3>
          <p class="max-w-md mx-auto">
            The logic for <strong>${tool.name}</strong> is still loading or could not be found. 
            Please wait a moment or try refreshing the page.
          </p>
          <button class="btn btn-outline mt-8 px-8" onclick="location.reload()">Refresh Now</button>
        </div>
      `;
    }
  }, [tool]);

  return (
    <div className="p-6 min-h-[400px]" ref={containerRef}>
      {/* Tool UI will be injected here */}
    </div>
  );
}

// Legal & Info Pages
function AboutPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">About ToolKit</h1>
      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
        <p className="text-lg mb-6">ToolKit was founded with a simple mission: to provide the world with high-quality, secure, and free utility tools that respect user privacy.</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-4">Our Philosophy</h2>
        <p className="mb-4">We believe that the web has become too cluttered with tools that require accounts, track your data, and charge for basic features. ToolKit is our answer to that. We build tools that run entirely in your browser, meaning your files are never uploaded to our servers.</p>
        
        <div className="my-12 p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-800/30">
          <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            Security First Architecture
          </h3>
          <p className="text-sm text-blue-800/80 dark:text-blue-200/80 leading-relaxed">
            Unlike traditional online tools that process your data on remote servers, ToolKit uses modern WebAssembly and JavaScript technologies to perform all computations directly on your device. This "Zero-Server" approach means that your private data never leaves your computer, providing a level of security that server-based alternatives simply cannot match.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-4">Why Client-Side?</h2>
        <p className="mb-4">By processing data on your device, we ensure:</p>
        <ul className="list-disc pl-5 space-y-2 mb-8">
          <li><strong>Speed:</strong> No waiting for uploads or downloads from a server.</li>
          <li><strong>Privacy:</strong> Your sensitive documents and images stay with you.</li>
          <li><strong>Reliability:</strong> Many of our tools work even when you're offline.</li>
        </ul>
        <p>Thank you for using ToolKit. We're constantly adding new tools and improving existing ones based on your feedback.</p>

        <div className="mt-16 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-500/20">
              BP
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold mb-2">Meet the Developer</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                ToolKit is built and maintained by <strong>Bathula Pavan Kumar</strong>, a passionate developer dedicated to creating high-performance, privacy-focused web utilities.
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <a href="https://github.com/pavan09-end-byte" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline">
                  <Github className="w-3.5 h-3.5" />
                  GitHub Profile
                </a>
                <a href="https://www.linkedin.com/in/pavan-kumar-bathula-0b4753320?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline">
                  <Linkedin className="w-3.5 h-3.5" />
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PrivacyPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
        <p className="mb-6">Last updated: March 26, 2026</p>
        <p className="mb-4">At ToolKit, your privacy is not just a policy—it's how we build our software. This policy explains how we handle your information.</p>
        
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-4">1. No Data Collection</h2>
        <p className="mb-4">We do not collect, store, or share any of the files you process using our tools. All processing (PDF merging, image resizing, text analysis, etc.) happens locally in your web browser using JavaScript. Your files are never transmitted to our servers.</p>
        
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-4">2. Cookies and Tracking</h2>
        <p className="mb-4">We use minimal cookies to remember your preferences (like Dark Mode) and to analyze site traffic using basic analytics. We do not use cookies for cross-site tracking or targeted advertising.</p>
        
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-4">3. Third-Party Services</h2>
        <p className="mb-4">We may display advertisements through Google AdSense. These third-party vendors may use cookies to serve ads based on your prior visits to our website or other websites.</p>
        
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-4">4. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at privacy@toolkit.com.</p>
      </div>
    </motion.div>
  );
}

function TermsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
        <p className="mb-6">By using ToolKit, you agree to the following terms:</p>
        
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-4">1. Use of Service</h2>
        <p className="mb-4">ToolKit provides free online utility tools. You are free to use these tools for personal or commercial purposes.</p>
        
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-4">2. No Warranty</h2>
        <p className="mb-4">The tools are provided "as is" without any warranty of any kind. While we strive for accuracy and reliability, we are not responsible for any data loss or errors resulting from the use of our tools.</p>
        
        <div className="my-8 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/30">
          <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600" />
            Important Disclaimer
          </h4>
          <p className="text-xs text-amber-800/80 dark:text-amber-200/80 leading-relaxed">
            ToolKit does not store or transmit your data. However, users are responsible for ensuring they have the legal right to process the files they upload. We are not liable for any misuse of our tools or any legal consequences arising from the processing of copyrighted or restricted materials.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-4">3. Prohibited Use</h2>
        <p className="mb-4">You may not use our service for any illegal activities or to distribute malicious content. You may not attempt to scrape or automate the use of our tools in a way that harms our infrastructure.</p>
        
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-4">4. Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. Your continued use of the site constitutes acceptance of the updated terms.</p>
      </div>
    </motion.div>
  );
}

function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: (formData.get('name') as string),
      email: (formData.get('email') as string),
      message: (formData.get('message') as string),
    };

    try {
      const response = await fetch('https://formspree.io/f/mjvnrqkq', { // Placeholder ID
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
      <div className="mb-12 p-6 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-600" />
          Direct Email
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">For business inquiries or support, email us at:</p>
        <a href="mailto:bathulapavankumar976@gmail.com" className="text-blue-600 font-bold hover:underline">bathulapavankumar976@gmail.com</a>
      </div>
      {status === 'success' ? (
        <div className="p-8 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-3xl text-center">
          <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">Message Sent!</h2>
          <p className="text-green-700 dark:text-green-300">Thank you for reaching out. We'll get back to you as soon as possible.</p>
          <button onClick={() => setStatus('idle')} className="mt-6 text-sm font-bold text-green-600 underline">Send another message</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold">Name</label>
            <input required name="name" type="text" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Email</label>
            <input required name="email" type="email" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="your@email.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Message</label>
            <textarea required name="message" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[150px]" placeholder="How can we help?"></textarea>
          </div>
          {status === 'error' && <p className="text-red-500 text-sm">Something went wrong. Please try again later.</p>}
          <button 
            disabled={status === 'loading'}
            type="submit" 
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {status === 'loading' ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      )}
    </motion.div>
  );
}

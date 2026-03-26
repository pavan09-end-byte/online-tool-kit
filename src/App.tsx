import { useState, useEffect, useMemo, useRef } from 'react';
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
  ShieldCheck
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
  { id: 'pdf', name: 'PDF', icon: <FileText className="w-4 h-4" /> },
  { id: 'image', name: 'Image', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'text', name: 'Text', icon: <Type className="w-4 h-4" /> },
  { id: 'calculator', name: 'Calculators', icon: <Calculator className="w-4 h-4" /> },
  { id: 'generator', name: 'Generators', icon: <Zap className="w-4 h-4" /> },
];

export default function App() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [recentTools, setRecentTools] = useState<Tool[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load tools from the global registry
  useEffect(() => {
    console.log('App mounted, checking toolsRegistry:', window.toolsRegistry);
    if (window.toolsRegistry) {
      setTools(window.toolsRegistry);
    } else {
      console.warn('toolsRegistry not found on window object');
    }
    
    // Load recent tools from localStorage
    const savedRecent = JSON.parse(localStorage.getItem('recentTools') || '[]');
    if (window.toolsRegistry) {
      const recent = savedRecent
        .map((id: string) => window.toolsRegistry.find(t => t.id === id))
        .filter(Boolean)
        .slice(0, 4);
      setRecentTools(recent);
    }

    // Handle initial URL tool param
    const params = new URLSearchParams(window.location.search);
    const toolId = params.get('tool');
    if (toolId && window.toolsRegistry) {
      const tool = window.toolsRegistry.find(t => t.id === toolId);
      if (tool) setSelectedTool(tool);
    }
  }, []);

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [tools, searchQuery, activeCategory]);

  const handleToolSelect = (tool: Tool) => {
    setSelectedTool(tool);
    setSearchQuery('');
    
    // Save to recent tools
    const savedRecent = JSON.parse(localStorage.getItem('recentTools') || '[]');
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

  const handleBack = () => {
    setSelectedTool(null);
    window.history.pushState({}, '', window.location.pathname);
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
              onClick={() => { setSelectedTool(null); setActiveCategory('all'); }}
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                T
              </div>
              <span className="text-xl font-bold tracking-tight hidden sm:block">ToolKit</span>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search 58+ tools..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-full focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <a 
              href="https://github.com" 
              target="_blank" 
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors hidden sm:block"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
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
                  onClick={() => { setActiveCategory(cat.id); setSelectedTool(null); setIsSidebarOpen(false); }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${activeCategory === cat.id 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}
                  `}
                >
                  {cat.icon}
                  {cat.name}
                </button>
              ))}
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
            {!selectedTool ? (
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
                </div>

                {/* Recent Tools */}
                {recentTools.length > 0 && !searchQuery && activeCategory === 'all' && (
                  <div className="mb-12">
                    <div className="flex items-center gap-2 mb-4 text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-semibold uppercase tracking-wider">Recently Used</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {recentTools.map((tool) => (
                        <ToolCard key={tool.id} tool={tool} onClick={() => handleToolSelect(tool)} isRecent />
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
                        <ToolCard key={tool.id} tool={tool} onClick={() => handleToolSelect(tool)} />
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
              </motion.div>
            ) : (
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
                    <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider">
                      {selectedTool.category}
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-1 overflow-hidden">
                  <ToolUI tool={selectedTool} />
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
                        <ToolCard key={tool.id} tool={tool} onClick={() => handleToolSelect(tool)} compact />
                      ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function ToolCard({ tool, onClick, isRecent = false, compact = false }: { tool: Tool, onClick: () => void, isRecent?: boolean, compact?: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-500/30
        ${compact ? 'p-4' : 'p-6'}
        ${isRecent ? 'bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-blue-900/5' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`
          flex items-center justify-center rounded-xl transition-colors
          ${compact ? 'w-10 h-10 text-xl' : 'w-12 h-12 text-2xl'}
          ${isRecent ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20'}
        `}>
          {tool.icon}
        </div>
        {!compact && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-5 h-5 text-blue-500" />
          </div>
        )}
      </div>
      <h3 className={`font-bold mb-1 group-hover:text-blue-600 transition-colors ${compact ? 'text-sm' : 'text-base'}`}>{tool.name}</h3>
      {!compact && <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{tool.description}</p>}
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
          <div class="flex flex-col items-center justify-center py-20 text-red-500">
            <X class="w-12 h-12 mb-4 opacity-20" />
            <p>Error rendering tool <strong>${tool.name}</strong>.</p>
            <p class="text-xs mt-2 opacity-70">${error instanceof Error ? error.message : String(error)}</p>
          </div>
        `;
      }
    } else {
      containerRef.current.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 text-slate-400">
          <Zap class="w-12 h-12 mb-4 opacity-20" />
          <p>Tool logic for <strong>${tool.name}</strong> is loading or not found.</p>
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

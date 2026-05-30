import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Home, Compass, Users2, Map as MapIcon, Wallet, UserCircle, 
    Sparkles, MessageSquare, Sun, Moon 
} from 'lucide-react';
import { cn } from './lib/utils';
import { BottomNav } from './components/layout/BottomNav';
import { HomeView } from './features/home/HomeView';
import { ExploreView } from './features/explore/ExploreView';
import { CommunityView } from './features/community/CommunityView';
import { PlannerView } from './features/planner/PlannerView';
import { WalletView } from './features/wallet/WalletView';
import { SafetyView } from './features/safety/SafetyView';
import { ProfileView } from './features/profile/ProfileView';
import { GuidesView } from './features/guides/GuidesView';
import CabBookingView from './features/cabs/CabBookingView';
import { HotelsView } from './features/hotels/HotelsView';
import { FlightsView } from './features/flights/FlightsView';
import TrainsView from './features/trains/TrainsView';
import BusView from './features/buses/BusView';
import { VisaView } from './features/visa/VisaView';
import { PackingView } from './features/packing/PackingView';
import { DocumentsView } from './features/documents/DocumentsView';
import { LoginView } from './features/login/LoginView';
import { EnvironmentProvider, useEnvironment } from './context/EnvironmentContext';
import { AIAgentProvider } from './context/AIAgentContext';
import { OfflineProvider } from './context/OfflineContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import { OnboardingOverlay } from './components/Onboarding';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { PlanOnTheGoDrawer } from './components/PlanOnTheGoDrawer';
import { AIChat } from './components/AIChat';
import { OfflineIndicator } from './components/ui/OfflineManager';

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const },
};

const views: Record<string, React.FC<any>> = {
  home: HomeView,
  explore: ExploreView,
  community: CommunityView,
  planner: PlannerView,
  wallet: WalletView,
  safety: SafetyView,
  profile: ProfileView,
  guides: GuidesView,
  cabs: CabBookingView,
  hotels: HotelsView,
  flights: FlightsView,
  trains: TrainsView,
  buses: BusView,
  visa: VisaView,
  packing: PackingView,
  documents: DocumentsView,
};

type TabType = 'home' | 'explore' | 'community' | 'planner' | 'wallet' | 'safety' | 'profile' | 'guides' | 'cabs' | 'hotels' | 'flights' | 'trains' | 'buses' | 'visa' | 'packing' | 'documents';

function AppContent() {
  const { user, isLoading, isGuest } = useAuth();
  const { isRaining, isHighTraffic } = useEnvironment();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold faio-logo mb-4">FAIO</h1>
          <div className="w-8 h-8 border-2 border-action border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-secondary text-sm mt-3">Loading your adventure...</p>
        </motion.div>
      </div>
    );
  }

  // Not authenticated — show login
  if (!user && !isGuest) {
    return <LoginView />;
  }

  // Get the current view component
  const CurrentView = views[activeTab] || HomeView;
  const viewProps = activeTab === 'home'
    ? { onNavigate: setActiveTab, onOpenChat: () => setIsChatOpen(true) }
    : {};

  const sidebarTabs: { id: TabType; icon: React.ElementType; label: string }[] = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'explore', icon: Compass, label: 'Explore' },
    { id: 'community', icon: Users2, label: 'Social' },
    { id: 'planner', icon: MapIcon, label: 'Plan' },
    { id: 'wallet', icon: Wallet, label: 'Wallet' },
    { id: 'profile', icon: UserCircle, label: 'Me' },
  ];

  // Authenticated — show the app
  return (
    <div className="min-h-screen bg-background text-primary pb-24 md:pb-0">
      <OfflineIndicator />
      
      {/* Responsive Split Dashboard Wrapper */}
      <div className="flex min-h-screen w-full">
        
        {/* SIDEBAR - Shown on md (768px) and up */}
        <aside className="hidden md:flex flex-col w-72 bg-white/70 backdrop-blur-xl border-r border-stone-200/50 p-6 shrink-0 z-30 sticky top-0 h-screen">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-black faio-logo tracking-tight leading-none">FAIO</h1>
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Ecosystem</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full glass-card-premium flex items-center justify-center text-primary border border-stone-200/50 dark:border-stone-800/50 hover:bg-stone-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
              title={isDarkMode ? "Toggle Light Mode" : "Toggle Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500 animate-pulse" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </motion.button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 space-y-2">
            {sidebarTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 relative group",
                    isActive ? "text-primary bg-primary/8 border-l-[3px] border-primary" : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
                  )}
                >
                  <tab.icon className={cn(
                    "w-5 h-5 transition-transform duration-300 group-hover:scale-105",
                    isActive ? "text-primary stroke-[2.2px]" : "text-stone-400 stroke-[1.8px]"
                  )} />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Profile Widget at Sidebar Bottom */}
          <div className="pt-6 border-t border-stone-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shadow-sm p-0.5">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'Felix'}`}
                alt="User avatar"
                className="w-full h-full rounded-lg object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-black text-stone-900 truncate">
                {isGuest ? 'Guest Explorer' : user?.email?.split('@')[0]}
              </p>
              <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest truncate">
                {isGuest ? 'Demo Mode' : 'Premium account'}
              </p>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col lg:flex-row">
          
          {/* Primary Content Column */}
          <main className="flex-1 min-h-screen relative overflow-hidden md:px-8 md:py-8">
            <div className="max-w-md mx-auto md:max-w-3xl md:mx-0 w-full relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  {...pageTransition}
                >
                  <CurrentView {...viewProps} />
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          {/* CONTEXTUAL DESKTOP SIDE PANEL (SPLIT DASHBOARD) - Shown on lg (1024px) and up */}
          <aside className="hidden lg:flex flex-col w-[340px] bg-stone-50 border-l border-stone-200/50 p-6 shrink-0 sticky top-0 h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">Co-Pilot Intel</h3>
              <div className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black tracking-wider uppercase rounded-full">Active</div>
            </div>

            {/* Desktop persistent Chat/Environment view */}
            <div className="flex-1 flex flex-col gap-5">
              {/* Environment Overview widget */}
              <div className="bg-white p-5 rounded-3xl border border-stone-200/60 shadow-card space-y-4">
                <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">Environmental Sensors</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-center">
                    <p className="text-[9px] font-bold text-stone-400 uppercase">Weather</p>
                    <p className="text-sm font-black text-stone-900 mt-1">
                      {isRaining ? '🌧️ Rain' : '☀️ Clear'}
                    </p>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-center">
                    <p className="text-[9px] font-bold text-stone-400 uppercase">Congestion</p>
                    <p className="text-sm font-black text-stone-900 mt-1">
                      {isHighTraffic ? '🔴 Heavy' : '🟢 Light'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Integrated AI Chat Preview Widget */}
              <div className="flex-1 bg-white p-5 rounded-3xl border border-stone-200/60 shadow-card flex flex-col min-h-[300px]">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider text-left">FAIO Co-Pilot</h4>
                  </div>
                  <button 
                    onClick={() => setIsChatOpen(true)}
                    className="text-[9px] font-black text-primary hover:underline uppercase tracking-widest"
                  >
                    Expand
                  </button>
                </div>
                <div className="flex-1 flex items-center justify-center text-center p-4">
                  <div>
                    <MessageSquare className="w-8 h-8 text-stone-200 mx-auto mb-3" />
                    <p className="text-xs font-bold text-stone-500 leading-relaxed">
                      Need local secrets or automated transit bookings? Chat with your AI Co-Pilot anytime.
                    </p>
                    <button 
                      onClick={() => setIsChatOpen(true)}
                      className="mt-4 px-4.5 py-2.5 bg-stone-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-all active:scale-95 shadow-sm"
                    >
                      Launch Co-Pilot
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION - Hidden on md and up */}
      <div className="md:hidden">
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* MOBILE FLOATING THEME TOGGLE BUTTON */}
      {!isChatOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="md:hidden fixed bottom-24 right-6 w-12 h-12 rounded-full glass-card-premium flex items-center justify-center text-primary z-40 transition-colors shadow-lg"
          title={isDarkMode ? "Toggle Light Mode" : "Toggle Dark Mode"}
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-500 animate-pulse" /> : <Moon className="w-5 h-5 text-indigo-400" />}
        </motion.button>
      )}

      <PlanOnTheGoDrawer />

      {/* AI Chat drawer overlay for mobile */}
      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Onboarding & PWA prompts */}
      {showOnboarding && <OnboardingOverlay onComplete={() => setShowOnboarding(false)} />}
      <PWAInstallPrompt />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <OfflineProvider>
          <AIAgentProvider>
            <EnvironmentProvider>
              <ThemeProvider>
                <AppContent />
              </ThemeProvider>
            </EnvironmentProvider>
          </AIAgentProvider>
        </OfflineProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

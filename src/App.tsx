import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
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
import { EnvironmentProvider } from './context/EnvironmentContext';
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



  // Authenticated — show the app
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950/40 text-primary flex justify-center items-start md:py-8">
      {/* Centered Mobile simulator on desktop, native full screen on phone */}
      <div className="w-full max-w-md min-h-screen md:min-h-[850px] md:max-h-[890px] md:rounded-[44px] md:shadow-2xl md:border-[10px] md:border-stone-900 md:dark:border-slate-800 bg-background text-primary relative overflow-hidden flex flex-col">
        <OfflineIndicator />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-28 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              {...pageTransition}
            >
              <CurrentView {...viewProps} />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* BOTTOM NAVIGATION - Stays relative to simulated screen bottom */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* FLOATING THEME TOGGLE BUTTON - Stays relative inside phone mockup */}
        {!isChatOpen && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="absolute bottom-24 right-6 w-12 h-12 rounded-full glass-card-premium flex items-center justify-center text-primary z-40 transition-colors shadow-lg"
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

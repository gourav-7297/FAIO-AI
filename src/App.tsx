import { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { BottomNav } from './components/layout/BottomNav';
import { HomeView } from './features/home/HomeView';
import { LoginView } from './features/login/LoginView';
import { EnvironmentProvider } from './context/EnvironmentContext';
import { AIAgentProvider } from './context/AIAgentContext';
import { OfflineProvider } from './context/OfflineContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import { OnboardingOverlay } from './components/Onboarding';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { PlanOnTheGoDrawer } from './components/PlanOnTheGoDrawer';
import { AIChat, AIFloatingButton } from './components/AIChat';
import { OfflineIndicator } from './components/ui/OfflineManager';

// ── Lazy-loaded views for code splitting (reduces initial bundle from 2.3MB) ──
const ExploreView = lazy(() => import('./features/explore/ExploreView').then(m => ({ default: m.ExploreView })));
const CommunityView = lazy(() => import('./features/community/CommunityView').then(m => ({ default: m.CommunityView })));
const PlannerView = lazy(() => import('./features/planner/PlannerView').then(m => ({ default: m.PlannerView })));
const WalletView = lazy(() => import('./features/wallet/WalletView').then(m => ({ default: m.WalletView })));
const SafetyView = lazy(() => import('./features/safety/SafetyView').then(m => ({ default: m.SafetyView })));
const ProfileView = lazy(() => import('./features/profile/ProfileView').then(m => ({ default: m.ProfileView })));
const GuidesView = lazy(() => import('./features/guides/GuidesView').then(m => ({ default: m.GuidesView })));
const CabBookingView = lazy(() => import('./features/cabs/CabBookingView'));
const HotelsView = lazy(() => import('./features/hotels/HotelsView').then(m => ({ default: m.HotelsView })));
const FlightsView = lazy(() => import('./features/flights/FlightsView').then(m => ({ default: m.FlightsView })));
const TrainsView = lazy(() => import('./features/trains/TrainsView'));
const BusView = lazy(() => import('./features/buses/BusView'));
const VisaView = lazy(() => import('./features/visa/VisaView').then(m => ({ default: m.VisaView })));
const PackingView = lazy(() => import('./features/packing/PackingView').then(m => ({ default: m.PackingView })));
const DocumentsView = lazy(() => import('./features/documents/DocumentsView').then(m => ({ default: m.DocumentsView })));

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
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Only show onboarding if user hasn't completed it before
    try { return !localStorage.getItem('faio_onboarding_done'); } catch { return true; }
  });

  const completeOnboarding = () => {
    setShowOnboarding(false);
    try { localStorage.setItem('faio_onboarding_done', '1'); } catch { /* ignore */ }
  };

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
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          }>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                {...pageTransition}
              >
                <CurrentView {...viewProps} />
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </main>

        {/* BOTTOM NAVIGATION - Stays relative to simulated screen bottom */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        <PlanOnTheGoDrawer />

        {/* AI Chat drawer overlay for mobile */}
        {!isChatOpen && (
          <AIFloatingButton onClick={() => setIsChatOpen(true)} />
        )}
        <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

        {/* Onboarding & PWA prompts */}
        {showOnboarding && <OnboardingOverlay onComplete={completeOnboarding} />}
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

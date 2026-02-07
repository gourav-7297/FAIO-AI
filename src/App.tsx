import { useState } from 'react';
import { BottomNav } from './components/layout/BottomNav';
import { HomeView } from './features/home/HomeView';
import { ExploreView } from './features/explore/ExploreView';
import { CommunityView } from './features/community/CommunityView';
import { PlannerView } from './features/planner/PlannerView';
import { WalletView } from './features/wallet/WalletView';
import { SafetyView } from './features/safety/SafetyView';
import { ProfileView } from './features/profile/ProfileView';
import { GuidesView } from './features/guides/GuidesView';
import { CabBookingView } from './features/cabs/CabBookingView';
import { EnvironmentProvider } from './context/EnvironmentContext';
import { AIAgentProvider } from './context/AIAgentContext';
import { OfflineProvider } from './context/OfflineContext';
import { AuthProvider } from './context/AuthContext';
import { PlanOnTheGoDrawer } from './components/PlanOnTheGoDrawer';
import { AIChat, AIFloatingButton } from './components/AIChat';
import { OfflineIndicator } from './components/ui/OfflineManager';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'community' | 'planner' | 'wallet' | 'safety' | 'profile' | 'guides' | 'cabs'>('home');
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <AuthProvider>
      <OfflineProvider>
        <AIAgentProvider>
          <EnvironmentProvider>
            <div className="min-h-screen bg-background text-primary pb-24">
              <OfflineIndicator />
              <main className="max-w-md mx-auto min-h-screen relative overflow-hidden">
                {activeTab === 'home' && <HomeView onNavigate={setActiveTab} onOpenChat={() => setIsChatOpen(true)} />}
                {activeTab === 'explore' && <ExploreView />}
                {activeTab === 'community' && <CommunityView />}
                {activeTab === 'planner' && <PlannerView />}
                {activeTab === 'wallet' && <WalletView />}
                {activeTab === 'safety' && <SafetyView />}
                {activeTab === 'safety' && <SafetyView />}
                {activeTab === 'profile' && <ProfileView />}
                {activeTab === 'guides' && <GuidesView />}
                {activeTab === 'cabs' && <CabBookingView />}
              </main>
              <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
              <PlanOnTheGoDrawer />

              {/* AI Chat */}
              {!isChatOpen && activeTab !== 'planner' && (
                <AIFloatingButton onClick={() => setIsChatOpen(true)} />
              )}
              <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
            </div>
          </EnvironmentProvider>
        </AIAgentProvider>
      </OfflineProvider>
    </AuthProvider>
  );
}

export default App;


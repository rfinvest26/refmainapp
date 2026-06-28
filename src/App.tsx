import { Suspense, lazy, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BottomNav } from '@/components/BottomNav';
import { AuthGate } from '@/components/AuthGate';
import { LoadingView } from '@/components/StateView';
import { OverviewPage } from '@/pages/OverviewPage';
import { LinksPage } from '@/pages/LinksPage';
import { PlansPage } from '@/pages/PlansPage';
import { MorePage } from '@/pages/MorePage';
import { initTelegramWebApp } from '@/lib/telegram';

// Charts (recharts) are the heaviest dependency and only used on this one tab —
// lazy-load it so Overview/Links/Plans stay fast to first paint on mobile.
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <Routes location={location}>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/links" element={<LinksPage />} />
          <Route
            path="/analytics"
            element={
              <Suspense fallback={<LoadingView />}>
                <AnalyticsPage />
              </Suspense>
            }
          />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/more" element={<MorePage />} />
          <Route path="*" element={<OverviewPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

// HashRouter is deliberate: Telegram `web_app` buttons in the bot can deep-link
// straight to a tab via a URL hash (e.g. `<miniapp-url>#/links`) with zero
// server-side routing/rewrites needed.
export default function App() {
  useEffect(() => {
    initTelegramWebApp();
  }, []);

  return (
    <AuthGate>
      <HashRouter>
        <div className="pb-20">
          <AnimatedRoutes />
        </div>
        <BottomNav />
      </HashRouter>
    </AuthGate>
  );
}

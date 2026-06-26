import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import WhatsAppButton from './components/WhatsAppButton';
import PrincipalGreetingModal from './components/PrincipalGreetingModal';

import Home from './pages/Home';
import UserLogin from './pages/UserLogin';
import UserReg from './pages/UserReg';
import EmailConfirmation from './pages/EmailConfirmation';
import NoticeBoard from './pages/NoticeBoard';
import Downloads from './pages/Downloads';
import Teachers from './pages/Teachers';
import AboutUs from './pages/AboutUs';
import ApplicationForm from './pages/ApplicationForm';
import PhotoGallery from './pages/PhotoGallery';
import Forum from './pages/Forum';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserProfile from './pages/AdminUserProfile';
import Transaction from './pages/Transaction';
import Profile from './pages/Profile';
import Prologue from './pages/Prologue';
import Doctrine from './pages/Doctrine';
import AcademicInfo from './pages/AcademicInfo';
import ContactUs from './pages/ContactUs';
import BoardOfManagement from './pages/BoardOfManagement';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CancellationAndRefunds from './pages/CancellationAndRefunds';
import ShippingAndDelivery from './pages/ShippingAndDelivery';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string[] }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && profile && !requiredRole.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const { loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthRoute><UserLogin /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><UserReg /></AuthRoute>} />
          <Route path="/confirm-email" element={<EmailConfirmation />} />
          <Route path="/notices" element={<NoticeBoard />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/apply" element={<ApplicationForm />} />
          <Route path="/gallery" element={<PhotoGallery />} />
          <Route path="/prologue" element={<Prologue />} />
          <Route path="/doctrine" element={<Doctrine />} />
          <Route path="/academics" element={<AcademicInfo />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/board" element={<BoardOfManagement />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/refunds" element={<CancellationAndRefunds />} />
          <Route path="/shipping" element={<ShippingAndDelivery />} />
          <Route
            path="/forum"
            element={<ProtectedRoute><Forum /></ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute><Profile /></ProtectedRoute>}
          />
          <Route
            path="/admin"
            element={<ProtectedRoute requiredRole={['admin']}><AdminDashboard /></ProtectedRoute>}
          />
          <Route
            path="/admin/users/:id"
            element={<ProtectedRoute requiredRole={['admin']}><AdminUserProfile /></ProtectedRoute>}
          />
          <Route
            path="/transactions"
            element={<ProtectedRoute requiredRole={['admin', 'faculty', 'student', 'finance']}><Transaction /></ProtectedRoute>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButton />
      <PrincipalGreetingModal />
    </div>
  );
}

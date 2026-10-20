import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import AboutPage from './pages/AboutPage';
import OrdersPage from './pages/OrdersPage';
import { useAuth } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';

const ProtectedRoute = ({ children, admin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loading">
        <span className="page-spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <WishlistProvider>
      <div className="app-shell">
        <Navbar />
        <main className="min-h-[75vh]">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute admin>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <Toast />
      </div>
    </WishlistProvider>
  );
}

export default App;

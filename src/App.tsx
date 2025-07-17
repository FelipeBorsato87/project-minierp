import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProductManager from './components/ProductManager';
import CouponManager from './components/CouponManager';
import OrderManager from './components/OrderManager';
import Cart from './components/Cart';
import { useCart } from './hooks/useCart';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { getCartCount } = useCart();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductManager />;
      case 'coupons':
        return <CouponManager />;
      case 'orders':
        return <OrderManager />;
      case 'cart':
        return <Cart />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout 
      currentPage={currentPage} 
      onNavigate={setCurrentPage}
      cartCount={getCartCount()}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
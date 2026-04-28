import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { AuthLayout } from '../components/layout/AuthLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { LandingPage } from '../pages/landing/LandingPage';
import { DashboardPage } from '../pages/DashboardPage';
import { EquipmentListPage } from '../pages/equipment/EquipmentListPage';
import { EquipmentDetailPage } from '../pages/equipment/EquipmentDetailPage';
import { EquipmentFormPage } from '../pages/equipment/EquipmentFormPage';
import { RentalPage } from '../pages/rentals/RentalPage';
import { OrdersListPage } from '../pages/orders/OrdersListPage';
import { OrderDetailPage } from '../pages/orders/OrderDetailPage';
import { CreateOrderPage } from '../pages/orders/CreateOrderPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { UsersListPage } from '../pages/admin/UsersListPage';
import { WishlistPage } from '../pages/wishlist/WishlistPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'equipment', element: <EquipmentListPage /> },
      { path: 'equipment/new', element: <ProtectedRoute roles={['admin', 'manager']}><EquipmentFormPage /></ProtectedRoute> },
      { path: 'equipment/:id', element: <EquipmentDetailPage /> },
      { path: 'equipment/:id/edit', element: <ProtectedRoute roles={['admin', 'manager']}><EquipmentFormPage /></ProtectedRoute> },
      { path: 'rentals', element: <ProtectedRoute roles={['customer']}><RentalPage /></ProtectedRoute> },
      { path: 'orders', element: <OrdersListPage /> },
      { path: 'orders/new', element: <ProtectedRoute roles={['customer']}><CreateOrderPage /></ProtectedRoute> },
      { path: 'orders/:id', element: <OrderDetailPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'wishlist', element: <WishlistPage /> },
      { path: 'admin/users', element: <ProtectedRoute roles={['admin']}><UsersListPage /></ProtectedRoute> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

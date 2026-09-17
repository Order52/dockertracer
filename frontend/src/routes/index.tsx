import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import SignInPage from '../pages/SignInPage';
import AppsPage from '../pages/AppsPage';
import DockerTracerPage from '../pages/DockerTracerPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <AppsPage />,
      },
      {
        path: '/docker-tracer',
        element: <DockerTracerPage />,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: '/auth/login',
        element: <SignInPage />,
      },
      {
        path: '/auth',
        element: <Navigate to="/auth/login" replace />,
      }
    ],
  },
  {
    path: '/login',
    element: <Navigate to="/auth/login" replace />,
  }
]);

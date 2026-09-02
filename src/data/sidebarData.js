import { LayoutDashboard, Users, Home, Shield } from 'lucide-react';

export const sidebarData = [
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { title: 'Employees', path: '/employees', icon: Users, reqAdmin: true },
  { title: 'Onboarding', path: '/onboarding', icon: Home },
  { title: 'Roles', path: '/roles', icon: Shield, reqAdmin: true },
];
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore, type User, type Shop, type Order, type DeliveryOffer, type PointsTransaction, type PaymentRequest, type PaymentMethodConfig } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Store, Truck, Users, Package, Coins, LogOut, Menu, X, Plus, CheckCircle,
  XCircle, Clock, MapPin, Phone, Star, TrendingUp, ShoppingCart, ArrowLeft,
  Home as HomeIcon, ClipboardList, DollarSign, Gift, ChevronLeft, Settings, UserPlus,
  Building2, CircleDot, Wallet, CreditCard, Copy, Check, Send, Shield,
  Sparkles, BadgeCheck, Lightbulb, ArrowRight, ExternalLink, HelpCircle, Trash2,
  Sun, Moon
} from 'lucide-react';

// ============== API HELPERS ==============
const api = {
  get: async (url: string) => {
    const res = await fetch(url);
    return res.json();
  },
  post: async (url: string, body: unknown) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  },
  del: async (url: string) => {
    const res = await fetch(url, { method: 'DELETE' });
    return res.json();
  },
  patch: async (url: string, body: unknown) => {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  },
  put: async (url: string, body: unknown) => {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  },
};

// ============== STATUS HELPERS ==============
const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  OFFERED: 'bg-blue-100 text-blue-800 border-blue-300',
  ACCEPTED: 'bg-green-100 text-green-800 border-green-300',
  PICKED_UP: 'bg-purple-100 text-purple-800 border-purple-300',
  DELIVERED: 'bg-indigo-100 text-indigo-800 border-emerald-300',
  CANCELLED: 'bg-red-100 text-red-800 border-red-300',
};

const statusLabels: Record<string, string> = {
  PENDING: 'في الانتظار',
  OFFERED: 'فيه عروض',
  ACCEPTED: 'مقبول',
  PICKED_UP: 'تم الاستلام',
  DELIVERED: 'تم التوصيل',
  CANCELLED: 'ملغي',
};

const shopTypeLabels: Record<string, string> = {
  PHARMACY: 'صيدلية',
  SUPERMARKET: 'سوبر ماركت',
  RESTAURANT: 'مطعم',
  OTHER: 'أخرى',
};

const shopTypeIcons: Record<string, string> = {
  PHARMACY: '💊',
  SUPERMARKET: '🛒',
  RESTAURANT: '🍽️',
  OTHER: '🏪',
};

// ============== LOGIN VIEW ==============
function LoginView() {
  const { setUser, setCurrentView } = useAppStore();
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post('/api/auth', { phone, password });
      if (data.error) {
        if (data.notApproved) {
          toast({ title: 'حسابك لسه في الانتظار', description: data.error, variant: 'destructive' });
        } else {
          toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
        }
      } else {
        setUser(data.user);
        const role = data.user.role;
        if (role === 'ADMIN') setCurrentView('admin-dashboard');
        else if (role === 'SHOP') setCurrentView('shop-dashboard');
        else setCurrentView('driver-dashboard');
        toast({ title: 'أهلاً!', description: `مرحباً ${data.user.name}` });
      }
    } catch {
      toast({ title: 'خطأ', description: 'حصل خطأ في الاتصال', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 bg-grid-pattern p-4 relative overflow-hidden">
      {/* Animated floating orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-indigo-300/20 to-purple-300/20 rounded-full blur-3xl animate-morph" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-violet-300/20 to-fuchsia-300/15 rounded-full blur-3xl animate-drift" />
      <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-gradient-to-br from-indigo-400/10 to-violet-400/10 rounded-full blur-2xl animate-drift" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-gradient-to-br from-purple-300/10 to-pink-300/10 rounded-full blur-2xl animate-morph" style={{ animationDelay: '4s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-400/5 to-transparent rounded-full blur-3xl animate-breathe" />

      <div className="w-full max-w-md relative">
        {/* Brand section */}
        <div className="text-center mb-10 animate-fade-in-down">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-3xl blur-2xl animate-pulse-glow" />
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-200/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 animate-breathe" />
              <Truck className="w-10 h-10 text-white relative z-10" />
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-1">دليفري برو</h1>
          <p className="text-gray-400 text-sm tracking-wide">نظام التوصيل الذكي</p>
        </div>

        {/* Login card with gradient border */}
        <div className="relative animate-slide-up">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-2xl blur-sm opacity-75 animate-gradient-border" />
          <Card className="relative bg-white/95 shadow-2xl border-0 rounded-2xl overflow-hidden">
            {/* Decorative top bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-indigo-600 via-purple-500 to-indigo-400" />
            <CardHeader className="text-center pt-8 pb-3">
              <CardTitle className="text-2xl font-bold text-gray-900">مرحباً بك</CardTitle>
              <CardDescription className="text-sm">سجل دخولك للبدء</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-8">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">رقم التليفون</Label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                    <div className="relative flex items-center">
                      <Phone className="absolute right-3 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="01xxxxxxxxx"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pr-10 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-300 transition-all h-11"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">الباسورد</Label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                    <div className="relative">
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-300 transition-all h-11"
                        required
                      />
                    </div>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-l from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 h-11 text-base shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      جاري الدخول...
                    </span>
                  ) : 'دخول'}
                </Button>
              </form>

              <div className="mt-6 text-center relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative">
                  <Button
                    variant="link"
                    onClick={() => setCurrentView('register')}
                    className="text-indigo-600 hover:text-indigo-800 bg-white/80 px-4 text-sm"
                  >
                    حساب جديد؟ سجل من هنا
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8 animate-fade-in">
          دليفري برو © {new Date().getFullYear()} — جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}

// ============== REGISTER VIEW ==============
function RegisterView() {
  const { setCurrentView } = useAppStore();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('DRIVER');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post('/api/auth/register', { name, phone, password, role });
      if (data.error) {
        toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
      } else {
        toast({ title: 'تم التسجيل!', description: data.message || 'حسابك في انتظار موافقة الأدمن. هتقدر تدخل لما يتم اعتمادك.' });
        setCurrentView('login');
      }
    } catch {
      toast({ title: 'خطأ', description: 'حصل خطأ', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 bg-grid-pattern p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-300/10 to-purple-300/10 rounded-full blur-3xl animate-morph" style={{ width: '500px', height: '500px', top: '-10%', right: '-10%' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-violet-300/8 to-pink-300/8 rounded-full blur-3xl animate-drift" style={{ width: '400px', height: '400px', bottom: '-10%', left: '-10%' }} />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl shadow-indigo-200/50">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">حساب جديد</h1>
          <p className="text-gray-400 text-sm mt-1">أنشئ حسابك وابدأ</p>
        </div>

        <div className="relative animate-slide-up">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-2xl blur-sm opacity-75 animate-gradient-border" />
          <Card className="relative bg-white/95 shadow-2xl border-0 rounded-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-indigo-600 via-purple-500 to-indigo-400" />
            <CardContent className="pt-8 px-6 pb-8">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">الاسم</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك" className="border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-300 transition-all h-11" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">رقم التليفون</Label>
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" className="border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-300 transition-all h-11" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">الباسورد</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-300 transition-all h-11" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">نوع الحساب</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="h-11 border-gray-200 bg-gray-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SHOP">
                        <span className="flex items-center gap-2">
                          <Store className="w-4 h-4" /> صاحب محل (شوب)
                        </span>
                      </SelectItem>
                      <SelectItem value="DRIVER">
                        <span className="flex items-center gap-2">
                          <Truck className="w-4 h-4" /> دليفري
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-l from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all h-11"
                  disabled={loading}
                >
                  {loading ? 'جاري التسجيل...' : 'تسجيل'}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <Button variant="link" onClick={() => setCurrentView('login')} className="text-indigo-600 hover:text-indigo-800 text-sm">
                  عندي حساب بالفعل
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============== ADMIN SIDEBAR ==============
function AdminSidebar() {
  const { currentView, setCurrentView, sidebarOpen, setSidebarOpen, darkMode, toggleDarkMode, logout } = useAppStore();

  const menuItems = [
    { id: 'admin-dashboard', label: 'الرئيسية', icon: HomeIcon },
    { id: 'admin-shops', label: 'المحلات', icon: Building2 },
    { id: 'admin-users', label: 'المستخدمين', icon: Users },
    { id: 'admin-orders', label: 'الطلبات', icon: ClipboardList },
    { id: 'admin-payments', label: 'طلبات الدفع', icon: Wallet },
    { id: 'admin-approvals', label: 'طلبات التسجيل', icon: UserPlus },
    { id: 'admin-earnings', label: 'الأرباح', icon: DollarSign },
    { id: 'admin-payment-settings', label: 'إعدادات التحويل', icon: CreditCard },
  ];

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200/50">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base text-gray-900">دليفري برو</span>
              <p className="text-[10px] text-gray-400 -mt-0.5">لوحة التحكم</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden hover:bg-gray-100" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-0.5 overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as typeof currentView)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group ${
                  isActive
                    ? 'bg-gradient-to-l from-indigo-50 to-purple-50/50 text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isActive && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
                )}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100 bg-white dark:bg-gray-900 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start gap-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl py-2 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
              onClick={toggleDarkMode}
            >
              <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </div>
              {darkMode ? 'فاتح' : 'داكن'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl py-2 dark:hover:bg-red-950/30"
              onClick={logout}
            >
              <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                <LogOut className="w-3.5 h-3.5" />
              </div>
              خروج
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ============== ADMIN DASHBOARD ==============
function AdminDashboard() {
  const { setCurrentView } = useAppStore();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/stats').then((data) => {
      if (data.stats) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
      }
      setLoading(false);
    });
  }, []);

  const statCards = [
    { label: 'المحلات', value: stats.totalShops || 0, icon: Building2, color: 'from-emerald-500 to-green-600' },
    { label: 'الدليفري', value: stats.totalDrivers || 0, icon: Truck, color: 'from-blue-500 to-cyan-600' },
    { label: 'الطلبات', value: stats.totalOrders || 0, icon: Package, color: 'from-orange-500 to-amber-600' },
    { label: 'في الانتظار', value: stats.pendingOrders || 0, icon: Clock, color: 'from-yellow-500 to-orange-500' },
    { label: 'تم التوصيل', value: stats.deliveredOrders || 0, icon: CheckCircle, color: 'from-indigo-600 to-purple-700' },
    { label: 'إجمالي المستخدمين', value: stats.totalUsers || 0, icon: Users, color: 'from-violet-500 to-indigo-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">لوحة تحكم الأدمن</h2>
        <p className="text-gray-500 mt-1">نظرة عامة على النظام</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 entrance-group">
        {statCards.map((stat, i) => (
          <Card key={stat.label} className={`border-0 shadow-md hover-lift cursor-pointer overflow-hidden ${['from-emerald-500 to-green-600','from-blue-500 to-cyan-600','from-orange-500 to-amber-600','from-yellow-500 to-orange-500','from-indigo-600 to-purple-700','from-violet-500 to-indigo-600'].includes(stat.color) ? 'gradient-border-card' : ''}`} style={{ animationDelay: `${i * 0.08}s` }}>
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-md shadow-${stat.color.split('-')[1]}-200/50`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 count-animate">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-md hover-lift overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-indigo-600 via-purple-500 to-indigo-400" />
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            آخر الطلبات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg skeleton-shimmer-rich" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400">مفيش طلبات لسه</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order, idx) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gradient-to-l from-gray-50 to-white rounded-xl border border-gray-100 hover:border-indigo-100 hover:shadow-sm transition-all" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${order.status === 'DELIVERED' ? 'bg-indigo-400' : order.status === 'CANCELLED' ? 'bg-red-400' : 'bg-amber-400'}`} />
                    <div>
                      <p className="font-medium text-sm">{order.description?.slice(0, 50)}{order.description?.length > 50 ? '...' : ''}</p>
                      <p className="text-xs text-gray-400">{order.shop?.name}</p>
                    </div>
                  </div>
                  <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============== ADMIN SHOPS ==============
function AdminShops() {
  const { toast } = useToast();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [shopUsers, setShopUsers] = useState<User[]>([]);

  // Form state
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('PHARMACY');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formOwnerId, setFormOwnerId] = useState('');

  const loadShops = useCallback(async () => {
    const data = await api.get('/api/shops');
    if (data.shops) setShops(data.shops);
    setLoading(false);
  }, []);

  const loadShopUsers = useCallback(async () => {
    const data = await api.get('/api/users?role=SHOP');
    if (data.users) setShopUsers(data.users);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadShops();
    loadShopUsers();
  }, [loadShops, loadShopUsers]);

  const handleAddShop = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await api.post('/api/shops', {
      name: formName, type: formType, address: formAddress, phone: formPhone, ownerId: formOwnerId,
    });
    if (data.error) {
      toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
    } else {
      toast({ title: 'تم!', description: 'تم إضافة المحل بنجاح' });
      setShowAdd(false);
      setFormName(''); setFormAddress(''); setFormPhone(''); setFormOwnerId('');
      loadShops();
    }
  };

  const handleAddShopUser = async () => {
    const name = prompt('اسم صاحب المحل:');
    const phone = prompt('رقم التليفون:');
    const password = prompt('الباسورد:');
    if (!name || !phone || !password) return;
    const data = await api.post('/api/users', { name, phone, password, role: 'SHOP', adminRole: 'ADMIN' });
    if (data.error) {
      toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
    } else {
      toast({ title: 'تم!', description: 'تم إضافة مستخدم شوب' });
      loadShopUsers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">المحلات</h2>
          <p className="text-gray-500 mt-1">إدارة المحلات المسجلة</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <Plus className="w-4 h-4" /> إضافة محل
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة محل جديد</DialogTitle>
              <DialogDescription>أضف محل جديد للنظام</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddShop} className="space-y-4">
              <div className="space-y-2">
                <Label>اسم المحل</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>نوع المحل</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PHARMACY">💊 صيدلية</SelectItem>
                    <SelectItem value="SUPERMARKET">🛒 سوبر ماركت</SelectItem>
                    <SelectItem value="RESTAURANT">🍽️ مطعم</SelectItem>
                    <SelectItem value="OTHER">🏪 أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>العنوان</Label>
                <Input value={formAddress} onChange={(e) => setFormAddress(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>رقم التليفون</Label>
                <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>صاحب المحل</Label>
                  <Button type="button" variant="link" size="sm" className="text-indigo-600" onClick={handleAddShopUser}>
                    إضافة مستخدم جديد
                  </Button>
                </div>
                <Select value={formOwnerId} onValueChange={setFormOwnerId}>
                  <SelectTrigger><SelectValue placeholder="اختر صاحب المحل" /></SelectTrigger>
                  <SelectContent>
                    {shopUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name} - {u.phone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">إضافة المحل</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl skeleton-shimmer-rich" />
          ))}
        </div>
      ) : shops.length === 0 ? (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50/50 to-white">
          <CardContent className="py-10 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Store className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">مفيش محلات مسجلة لسه</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 entrance-group">
          {shops.map((shop, idx) => (
            <Card key={shop.id} className="border-0 shadow-md hover-lift overflow-hidden relative" style={{ animationDelay: `${idx * 0.06}s` }}>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-l from-indigo-400 via-purple-400 to-indigo-400" />
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center text-2xl shadow-sm">
                      {shopTypeIcons[shop.type] || '🏪'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{shop.name}</h3>
                      <Badge variant="outline" className="mt-1 text-xs">{shopTypeLabels[shop.type] || shop.type}</Badge>
                    </div>
                  </div>
                  <Badge className={`${shop.active ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'} text-xs`}>
                    {shop.active ? 'نشط' : 'معلق'}
                  </Badge>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> {shop.address}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> {shop.phone}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Users className="w-3.5 h-3.5 text-gray-400" /> {shop.owner?.name}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============== ADMIN USERS ==============
function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadUsers = useCallback(async () => {
    const url = filter !== 'all' ? `/api/users?role=${filter}` : '/api/users';
    const data = await api.get(url);
    if (data.users) setUsers(data.users);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, [loadUsers]);

  const handleToggleActive = async (userId: string, active: boolean) => {
    const data = await api.patch('/api/users', { userId, active: !active, adminRole: 'ADMIN' });
    if (data.error) {
      toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
    } else {
      toast({ title: 'تم!', description: active ? 'تم تعطيل المستخدم' : 'تم تفعيل المستخدم' });
      loadUsers();
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${userName}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) return;
    const data = await api.del(`/api/users?userId=${userId}&adminRole=ADMIN`);
    if (data.error) {
      toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
    } else {
      toast({ title: 'تم الحذف!', description: `تم حذف ${userName} نهائياً` });
      loadUsers();
    }
  };

  const roleLabels: Record<string, string> = { ADMIN: 'أدمن', SHOP: 'شوب', DRIVER: 'دليفري' };
  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    SHOP: 'bg-blue-100 text-blue-700',
    DRIVER: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">المستخدمين</h2>
          <p className="text-gray-500 mt-1">إدارة المستخدمين</p>
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="SHOP">شوب</TabsTrigger>
            <TabsTrigger value="DRIVER">دليفري</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg skeleton-shimmer-rich" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {user.role === 'ADMIN' ? <Settings className="w-5 h-5 text-red-500" /> :
                     user.role === 'SHOP' ? <Store className="w-5 h-5 text-blue-500" /> :
                     <Truck className="w-5 h-5 text-emerald-500" />}
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">{user.phone}</span>
                      <Badge className={`rounded-full text-xs ${roleColors[user.role]}`}>
                        {roleLabels[user.role]}
                      </Badge>
                      {user.role === 'DRIVER' && (
                        <span className="text-xs text-indigo-600 flex items-center gap-1">
                          <Coins className="w-3 h-3" /> {user.points}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {user.role !== 'ADMIN' && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant={user.active ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => handleToggleActive(user.id, user.active)}
                      className={user.active ? 'text-red-600 border-red-200 hover:bg-red-50' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all'}
                    >
                      {user.active ? 'تعطيل' : 'تفعيل'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============== ADMIN ORDERS ==============
function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/orders').then((data) => {
      if (data.orders) setOrders(data.orders);
      setLoading(false);
    });
  }, []);

  const updateOrderStatus = async (orderId: string, status: string) => {
    await api.patch(`/api/orders/${orderId}`, { status });
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">كل الطلبات</h2>
        <p className="text-gray-500 mt-1">متابعة وإدارة الطلبات</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg skeleton-shimmer-rich" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50/50 to-white">
          <CardContent className="py-10 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Package className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">مفيش طلبات لسه</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{shopTypeIcons[order.shop?.type] || '🏪'}</span>
                      <span className="font-medium">{order.shop?.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{order.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> من: {order.pickupAddress}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> إلى: {order.deliveryAddress}</span>
                    </div>
                    {order.acceptedDriver && (
                      <p className="text-xs text-indigo-600 flex items-center gap-1">
                        <Truck className="w-3 h-3" /> الدليفري: {order.acceptedDriver.name} - {order.acceptedDriver.phone}
                      </p>
                    )}
                    {order.offers && order.offers.length > 0 && (
                      <p className="text-xs text-blue-600">{order.offers.length} عرض</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                    <span className="text-sm font-bold text-indigo-600">{order.deliveryFee} ج.م</span>
                    {(order.status === 'ACCEPTED' || order.status === 'PICKED_UP') && (
                      <div className="flex gap-1">
                        {order.status === 'ACCEPTED' && (
                          <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => updateOrderStatus(order.id, 'PICKED_UP')}>
                            تم الاستلام
                          </Button>
                        )}
                        {order.status === 'PICKED_UP' && (
                          <Button size="sm" className="text-xs h-7 bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all" onClick={() => updateOrderStatus(order.id, 'DELIVERED')}>
                            تم التوصيل
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============== SHOP SIDEBAR ==============
function ShopSidebar() {
  const { user, currentView, setCurrentView, sidebarOpen, setSidebarOpen, darkMode, toggleDarkMode, logout } = useAppStore();

  const menuItems = [
    { id: 'shop-dashboard', label: 'الرئيسية', icon: HomeIcon },
    { id: 'shop-create-order', label: 'طلب جديد', icon: Plus },
    { id: 'shop-orders', label: 'طلباتي', icon: ClipboardList },
  ];

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base text-gray-900">شوبي</span>
              <p className="text-[10px] text-gray-400 -mt-0.5">لوحة التحكم</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden hover:bg-gray-100" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="mx-3 mt-3 p-3 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl border border-blue-100/50">
          <p className="font-medium text-sm text-blue-900">{user?.name}</p>
          <p className="text-xs text-blue-600 mt-0.5">{user?.phone}</p>
        </div>
        <nav className="p-3 space-y-0.5 overflow-y-auto" style={{ height: 'calc(100% - 200px)' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as typeof currentView)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group ${
                  isActive
                    ? 'bg-gradient-to-l from-blue-50 to-indigo-50/50 text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isActive && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full" />
                )}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100 bg-white dark:bg-gray-900 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start gap-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl py-2 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
              onClick={toggleDarkMode}
            >
              <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </div>
              {darkMode ? 'فاتح' : 'داكن'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl py-2 dark:hover:bg-red-950/30"
              onClick={logout}
            >
              <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                <LogOut className="w-3.5 h-3.5" />
              </div>
              خروج
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ============== SHOP DASHBOARD ==============
function ShopDashboard() {
  const { user, setCurrentView } = useAppStore();
  const [myShops, setMyShops] = useState<Shop[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get('/api/shops'),
      api.get('/api/orders'),
    ]).then(([shopsData, ordersData]) => {
      if (shopsData.shops) {
        const filtered = shopsData.shops.filter((s: Shop) => s.owner?.id === user.id);
        setMyShops(filtered);
      }
      if (ordersData.orders) {
        const shopIds = myShops.map((s) => s.id);
        setMyOrders(ordersData.orders.filter((o: Order) => shopIds.includes(o.shopId)));
      }
      setLoading(false);
    });
  }, [user, myShops]);

  const pendingCount = myOrders.filter((o) => ['PENDING', 'OFFERED'].includes(o.status)).length;
  const activeCount = myOrders.filter((o) => ['ACCEPTED', 'PICKED_UP'].includes(o.status)).length;
  const deliveredCount = myOrders.filter((o) => o.status === 'DELIVERED').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">أهلاً يا {user?.name} 👋</h2>
        <p className="text-gray-500 mt-1">لوحة تحكم المحل</p>
      </div>

      <div className="grid grid-cols-3 gap-3 entrance-group">
        <Card className="border-0 shadow-md hover-lift overflow-hidden" style={{ animationDelay: '0.05s' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-l from-amber-400 to-yellow-500" />
          <CardContent className="p-4 text-center">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold count-animate">{pendingCount}</p>
            <p className="text-xs text-gray-500">في الانتظار</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover-lift overflow-hidden" style={{ animationDelay: '0.1s' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-l from-blue-400 to-cyan-500" />
          <CardContent className="p-4 text-center">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Truck className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold count-animate">{activeCount}</p>
            <p className="text-xs text-gray-500">نشطة</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover-lift overflow-hidden" style={{ animationDelay: '0.15s' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-l from-emerald-400 to-green-500" />
          <CardContent className="p-4 text-center">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold count-animate">{deliveredCount}</p>
            <p className="text-xs text-gray-500">تم التوصيل</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md hover-lift overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-blue-500 via-indigo-400 to-blue-400" />
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600" />
            محلاتي
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myShops.length === 0 ? (
            <div className="text-center py-6">
              <Store className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">مفيش محلات مسجلة باسمك</p>
              <p className="text-gray-300 text-xs mt-1">الأدمن لازم يضيفك الأول</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myShops.map((shop) => (
                <div key={shop.id} className="flex items-center gap-3 p-3 bg-gradient-to-l from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-100 transition-all">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-lg">
                    {shopTypeIcons[shop.type] || '🏪'}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{shop.name}</p>
                    <p className="text-xs text-gray-400">{shopTypeLabels[shop.type]} - {shop.address}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        className="w-full bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2 py-6 text-lg shadow-lg shadow-blue-200/50 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        onClick={() => setCurrentView('shop-create-order')}
      >
        <Plus className="w-5 h-5" /> طلب توصيلة جديدة
      </Button>
    </div>
  );
}

// ============== SHOP CREATE ORDER ==============
function ShopCreateOrder() {
  const { user, setCurrentView } = useAppStore();
  const { toast } = useToast();
  const [myShops, setMyShops] = useState<Shop[]>([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [description, setDescription] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get('/api/shops').then((data) => {
      if (data.shops) {
        const filtered = data.shops.filter((s: Shop) => s.owner?.id === user.id || (s as any).ownerId === user.id);
        setMyShops(filtered);
        if (filtered.length > 0) {
          setPickupAddress(filtered[0].address);
        }
      }
      setLoadingShops(false);
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || myShops.length === 0) return;
    setLoading(true);
    try {
      const data = await api.post('/api/orders', {
        shopId: myShops[0].id,
        description,
        pickupAddress,
        deliveryAddress,
        deliveryFee: parseFloat(deliveryFee) || 0,
        pointsCost: 1,
        createdById: user.id,
      });
      if (data.error) {
        toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
      } else {
        toast({ title: 'تم!', description: 'تم إنشاء الطلب بنجاح' });
        setCurrentView('shop-orders');
      }
    } catch {
      toast({ title: 'خطأ', description: 'حصل خطأ', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">طلب توصيلة جديدة</h2>
        <p className="text-gray-500 mt-1">أنشئ طلب توصيل جديد</p>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>المحل</Label>
              {loadingShops ? (
                <div className="h-14 bg-gray-100 rounded-xl skeleton-shimmer-rich" />
              ) : myShops.length > 0 ? (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-l from-indigo-50/50 to-purple-50/30 rounded-xl border border-indigo-100">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-lg shadow-sm">
                    {shopTypeIcons[myShops[0].type] || '🏪'}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{myShops[0].name}</p>
                    <p className="text-xs text-gray-400">{myShops[0].address}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-red-500 py-2">مفيش محل مسجل باسمك. كلم الأدمن يضيفلك محل.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>وصف الطلب</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف الطلب أو اللي محتاج توصيله..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label>عنوان الاستلام</Label>
              <div className="relative">
                <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} className="pr-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>عنوان التوصيل</Label>
              <div className="relative">
                <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="عنوان التوصيل..."
                  className="pr-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>رسوم التوصيل (ج.م)</Label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  placeholder="0"
                  className="pr-10"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={loading}
            >
              {loading ? 'جاري إنشاء الطلب...' : 'إنشاء الطلب'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ============== SHOP ORDERS ==============
function ShopOrders() {
  const { user } = useAppStore();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    const shopsData = await api.get('/api/shops');
    if (shopsData.shops) {
      const shopIds = shopsData.shops.filter((s: Shop) => s.owner?.id === user.id).map((s: Shop) => s.id);
      const ordersData = await api.get('/api/orders');
      if (ordersData.orders) {
        setOrders(ordersData.orders.filter((o: Order) => shopIds.includes(o.shopId)));
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
  }, [loadOrders]);

  const handleOfferAction = async (offerId: string, action: 'ACCEPTED' | 'REJECTED') => {
    const data = await api.patch(`/api/offers/${offerId}`, { status: action });
    if (data.error) {
      toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
    } else {
      toast({ title: 'تم!', description: action === 'ACCEPTED' ? 'تم قبول العرض' : 'تم رفض العرض' });
      loadOrders();
      setSelectedOrder(null);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    await api.patch(`/api/orders/${orderId}`, { status });
    loadOrders();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">طلباتي</h2>
        <p className="text-gray-500 mt-1">متابعة الطلبات والعروض</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg skeleton-shimmer-rich" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50/50 to-white">
          <CardContent className="py-10 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Package className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">مفيش طلبات لسه</p>
            <p className="text-sm text-gray-300 mt-1">اعمل طلب جديد من القايمة</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium">{order.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> إلى: {order.deliveryAddress}</span>
                      <span className="font-bold text-indigo-600">{order.deliveryFee} ج.م</span>
                    </div>
                  </div>
                  <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                </div>

                {/* Show offers for PENDING/OFFERED orders */}
                {['PENDING', 'OFFERED'].includes(order.status) && order.offers && order.offers.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm font-medium mb-2 flex items-center gap-1">
                      <CircleDot className="w-3.5 h-3.5 text-blue-500" />
                      {order.offers.length} عرض من الدليفري
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {order.offers.map((offer) => (
                        <div key={offer.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">{offer.driver?.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-indigo-600">{offer.price} ج.م</span>
                            {offer.status === 'PENDING' && (
                              <div className="flex gap-1">
                                <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all" onClick={() => handleOfferAction(offer.id, 'ACCEPTED')}>
                                  <CheckCircle className="w-3 h-3 ml-1" /> قبول
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200" onClick={() => handleOfferAction(offer.id, 'REJECTED')}>
                                  <XCircle className="w-3 h-3 ml-1" /> رفض
                                </Button>
                              </div>
                            )}
                            {offer.status === 'ACCEPTED' && <Badge className="bg-indigo-100 text-indigo-700 text-xs">مقبول ✓</Badge>}
                            {offer.status === 'REJECTED' && <Badge className="bg-red-100 text-red-700 text-xs">مرفوض</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status update buttons */}
                {order.status === 'ACCEPTED' && (
                  <div className="mt-3 pt-3 border-t flex justify-end">
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => updateOrderStatus(order.id, 'PICKED_UP')}>
                      تأكيد الاستلام من المحل
                    </Button>
                  </div>
                )}
                {order.status === 'PICKED_UP' && (
                  <div className="mt-3 pt-3 border-t flex justify-end">
                    <Button size="sm" className="text-xs bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all" onClick={() => updateOrderStatus(order.id, 'DELIVERED')}>
                      تأكيد التوصيل
                    </Button>
                  </div>
                )}

                {order.acceptedDriver && ['ACCEPTED', 'PICKED_UP'].includes(order.status) && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-indigo-600">
                    <Truck className="w-3 h-3" /> الدليفري: {order.acceptedDriver.name} - {order.acceptedDriver.phone}
                  </div>
                )}
                {order.status === 'DELIVERED' && order.commission > 0 && (
                  <div className="mt-2 p-2 bg-indigo-50 rounded-lg text-xs space-y-1">
                    <p className="font-medium text-indigo-800">تم التوصيل - توزيع الرسوم:</p>
                    <div className="flex justify-between text-amber-700">
                      <span>عمولة المنصة (10%)</span>
                      <span className="font-bold">{order.commission?.toFixed(2)} ج.م</span>
                    </div>
                    <div className="flex justify-between text-blue-700">
                      <span>أرباح الدليفري</span>
                      <span className="font-bold">{((order.deliveryFee || 0) - (order.commission || 0)).toFixed(2)} ج.م</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============== DRIVER SIDEBAR ==============
function DriverSidebar() {
  const { user, currentView, setCurrentView, sidebarOpen, setSidebarOpen, darkMode, toggleDarkMode, logout } = useAppStore();

  const menuItems = [
    { id: 'driver-dashboard', label: 'الرئيسية', icon: HomeIcon },
    { id: 'driver-available', label: 'الطلبات المتاحة', icon: Package },
    { id: 'driver-my-offers', label: 'عروضي', icon: ClipboardList },
    { id: 'driver-my-deliveries', label: 'توصيلاتي', icon: Truck },
    { id: 'driver-points', label: 'النقاط', icon: Coins },
  ];

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200/50">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base text-gray-900">دليفري</span>
              <p className="text-[10px] text-gray-400 -mt-0.5">لوحة التحكم</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden hover:bg-gray-100" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="mx-3 mt-3 p-3 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-xl border border-emerald-100/50">
          <p className="font-medium text-sm text-gray-900">{user?.name}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Coins className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-sm text-emerald-700 font-bold">{user?.points} نقطة</span>
          </div>
        </div>
        <nav className="p-3 space-y-0.5 overflow-y-auto" style={{ height: 'calc(100% - 200px)' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as typeof currentView)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group ${
                  isActive
                    ? 'bg-gradient-to-l from-emerald-50 to-teal-50/50 text-emerald-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isActive && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
                )}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100 bg-white dark:bg-gray-900 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start gap-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl py-2 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
              onClick={toggleDarkMode}
            >
              <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </div>
              {darkMode ? 'فاتح' : 'داكن'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl py-2 dark:hover:bg-red-950/30"
              onClick={logout}
            >
              <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                <LogOut className="w-3.5 h-3.5" />
              </div>
              خروج
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ============== DRIVER DASHBOARD ==============
function DriverDashboard() {
  const { user, setCurrentView } = useAppStore();
  const [availableCount, setAvailableCount] = useState(0);
  const [myActiveDeliveries, setMyActiveDeliveries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get(`/api/orders?driverId=${user.id}&status=AVAILABLE`),
      api.get(`/api/orders?driverId=${user.id}&status=ACCEPTED`),
    ]).then(([availableData, activeData]) => {
      setAvailableCount(availableData.orders?.length || 0);
      setMyActiveDeliveries(activeData.orders?.filter((o: Order) => o.acceptedDriverId === user.id) || []);
      setLoading(false);
    });
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">أهلاً يا {user?.name} 👋</h2>
        <p className="text-gray-500 mt-1">لوحة تحكم الدليفري</p>
      </div>

      <div className="grid grid-cols-2 gap-3 entrance-group">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white hover-lift" style={{ animationDelay: '0.05s' }}>
          <CardContent className="p-5 text-center relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/5 rounded-full" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full" />
            <Coins className="w-8 h-8 mx-auto mb-2 opacity-90" />
            <p className="text-3xl font-bold count-animate">{user?.points}</p>
            <p className="text-sm opacity-80">نقطة</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white hover-lift cursor-pointer" style={{ animationDelay: '0.1s' }} onClick={() => setCurrentView('driver-available')}>
          <CardContent className="p-5 text-center relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/5 rounded-full" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full" />
            <Package className="w-8 h-8 mx-auto mb-2 opacity-90" />
            <p className="text-3xl font-bold count-animate">{availableCount}</p>
            <p className="text-sm opacity-80">طلب متاح</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md hover-lift overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-indigo-600 via-purple-500 to-indigo-400" />
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" />
            التوصيلات النشطة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-16 bg-gray-100 rounded-lg skeleton-shimmer-rich" />
          ) : myActiveDeliveries.length === 0 ? (
            <div className="text-center py-6">
              <Truck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">مفيش توصيلات نشطة</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myActiveDeliveries.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gradient-to-l from-gray-50 to-white rounded-xl border border-gray-100 hover:border-indigo-100 transition-all">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    <div>
                      <p className="font-medium text-sm">{order.shop?.name}</p>
                      <p className="text-xs text-gray-400">{order.deliveryAddress}</p>
                    </div>
                  </div>
                  <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="py-6 flex-col gap-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50/30 rounded-xl transition-all" onClick={() => setCurrentView('driver-points')}>
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Coins className="w-5 h-5 text-indigo-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">شراء نقاط</span>
        </Button>
        <Button variant="outline" className="py-6 flex-col gap-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50/30 rounded-xl transition-all" onClick={() => setCurrentView('driver-available')}>
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">الطلبات المتاحة</span>
        </Button>
      </div>
    </div>
  );
}

// ============== DRIVER AVAILABLE ORDERS ==============
function DriverAvailableOrders() {
  const { user } = useAppStore();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [offerPrice, setOfferPrice] = useState<Record<string, string>>({});
  const [showCounterOffer, setShowCounterOffer] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});

  const loadOrders = useCallback(async () => {
    if (!user) return;
    const data = await api.get(`/api/orders?driverId=${user.id}&status=AVAILABLE`);
    if (data.orders) setOrders(data.orders);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
  }, [loadOrders]);

  // Driver accepts the shop's price directly (NO offer created, order assigned immediately)
  const handleDirectAccept = async (orderId: string, shopPrice: number) => {
    if (!user) return;
    const commissionPoints = Math.max(1, Math.ceil(shopPrice * 0.10));
    if (user.points < commissionPoints) {
      toast({
        title: 'نقاط مش كافية',
        description: `عمولة القبول = ${commissionPoints} نقطة. عندك ${user.points} نقطة بس. اشتري نقاط الأول`,
        variant: 'destructive',
      });
      return;
    }

    setSubmitting((prev) => ({ ...prev, [orderId]: true }));
    try {
      const data = await api.patch(`/api/orders/${orderId}`, {
        action: 'directAccept',
        acceptedDriverId: user.id,
      });
      if (data.error) {
        toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
      } else {
        toast({
          title: 'تم القبول! 🎉',
          description: `اتقبل الطلب على سعر المحل (${shopPrice} ج.م). اتخصم منك ${data.deductedPoints} نقطة عمولة.`,
        });
        loadOrders();
        // Update user points in store
        const updatedUser = { ...user, points: data.remainingPoints };
        useAppStore.getState().setUser(updatedUser);
      }
    } catch {
      toast({ title: 'خطأ', description: 'حصل خطأ في الاتصال', variant: 'destructive' });
    }
    setSubmitting((prev) => ({ ...prev, [orderId]: false }));
  };

  // Driver makes a counter-offer with a different price (shop needs to approve)
  const handleCounterOffer = async (orderId: string) => {
    if (!user) return;
    const price = parseFloat(offerPrice[orderId] || '0');
    if (!price || price <= 0) {
      toast({ title: 'خطأ', description: 'لازم تحط سعر للعرض', variant: 'destructive' });
      return;
    }
    const commissionPoints = Math.max(1, Math.ceil(price * 0.10));
    if (user.points < commissionPoints) {
      toast({
        title: 'نقاط مش كافية',
        description: `عمولة العرض = ${commissionPoints} نقطة. عندك ${user.points} نقطة بس. اشتري نقاط الأول`,
        variant: 'destructive',
      });
      return;
    }

    setSubmitting((prev) => ({ ...prev, [orderId]: true }));
    const data = await api.post('/api/offers', { orderId, driverId: user.id, price });
    if (data.error) {
      toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
    } else {
      toast({ title: 'تم!', description: `تم تقديم عرضك (${price} ج.م). استنى رد المحل.` });
      setOfferPrice((prev) => ({ ...prev, [orderId]: '' }));
      setShowCounterOffer((prev) => ({ ...prev, [orderId]: false }));
      loadOrders();
    }
    setSubmitting((prev) => ({ ...prev, [orderId]: false }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الطلبات المتاحة</h2>
          <p className="text-gray-500 mt-1">وافق على سعر المحل أو اعرض سعر تاني</p>
        </div>
        <div className="flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-full">
          <Coins className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-bold text-indigo-700">{user?.points}</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl skeleton-shimmer-rich" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50/50 to-white">
          <CardContent className="py-10 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Package className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">مفيش طلبات متاحة دلوقتي</p>
            <p className="text-sm text-gray-300 mt-1">فضل متابع! الطلبات بتتضاف كل وقت</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const shopPrice = order.deliveryFee || 0;
            const commissionPoints = Math.max(1, Math.ceil(shopPrice * 0.10));
            const canAfford = (user?.points || 0) >= commissionPoints;

            return (
              <Card key={order.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{shopTypeIcons[order.shop?.type] || '🏪'}</span>
                      <div>
                        <p className="font-medium">{order.shop?.name}</p>
                        <p className="text-xs text-gray-500">{shopTypeLabels[order.shop?.type] || 'محل'}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-400">سعر المحل</p>
                      <p className="text-lg font-bold text-indigo-600">{shopPrice} ج.م</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{order.description}</p>
                  <div className="space-y-1 text-xs text-gray-400">
                    <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> من: {order.pickupAddress}</p>
                    <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> إلى: {order.deliveryAddress}</p>
                  </div>
                  {order.offers && order.offers.length > 0 && (
                    <p className="text-xs text-blue-600">{order.offers.length} عرض تايه</p>
                  )}

                  {/* Action buttons */}
                  <div className="pt-2 border-t space-y-2">
                    {/* Direct accept button */}
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700 gap-1 h-10 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                      disabled={submitting[order.id] || !canAfford}
                      onClick={() => handleDirectAccept(order.id, shopPrice)}
                    >
                      {submitting[order.id] ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <><CheckCircle className="w-4 h-4" /> أوافق على سعر المحل ({shopPrice} ج.م)</>
                      )}
                    </Button>

                    {/* Counter-offer toggle */}
                    {!showCounterOffer[order.id] ? (
                      <Button
                        variant="outline"
                        className="w-full gap-1 h-9 border-blue-200 text-blue-700 hover:bg-blue-50"
                        disabled={submitting[order.id] || !canAfford}
                        onClick={() => setShowCounterOffer((prev) => ({ ...prev, [order.id]: true }))}
                      >
                        <Send className="w-3.5 h-3.5" /> عارض سعر تاني
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                        <div className="relative flex-1">
                          <span className="absolute right-3 top-2.5 text-xs text-gray-400">ج.م</span>
                          <Input
                            type="number"
                            placeholder="سعرك"
                            value={offerPrice[order.id] || ''}
                            onChange={(e) => setOfferPrice((prev) => ({ ...prev, [order.id]: e.target.value }))}
                            className="pr-10 h-9"
                            autoFocus
                          />
                        </div>
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 gap-1 h-9"
                          disabled={submitting[order.id]}
                          onClick={() => handleCounterOffer(order.id)}
                        >
                          {submitting[order.id] ? <span className="animate-spin">⏳</span> : <><Send className="w-3.5 h-3.5" /> أرسل</>}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 px-2"
                          disabled={submitting[order.id]}
                          onClick={() => {
                            setShowCounterOffer((prev) => ({ ...prev, [order.id]: false }));
                            setOfferPrice((prev) => ({ ...prev, [order.id]: '' }));
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {!canAfford && (
                      <p className="text-xs text-red-500 text-center">
                        معندكش نقاط كافية ({commissionPoints} مطلوبة). اشتري نقاط الأول!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============== DRIVER MY OFFERS ==============
function DriverMyOffers() {
  const { user } = useAppStore();
  const [offers, setOffers] = useState<DeliveryOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get(`/api/offers?driverId=${user.id}`).then((data) => {
      if (data.offers) setOffers(data.offers);
      setLoading(false);
    });
  }, [user]);

  const offerStatusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-indigo-100 text-indigo-800',
    REJECTED: 'bg-red-100 text-red-800',
  };
  const offerStatusLabels: Record<string, string> = {
    PENDING: 'في الانتظار',
    ACCEPTED: 'مقبول 🎉',
    REJECTED: 'مرفوض',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">عروضي</h2>
        <p className="text-gray-500 mt-1">كل العروض اللي عملتها</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg skeleton-shimmer-rich" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50/50 to-white">
          <CardContent className="py-10 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ClipboardList className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">معملتش عروض لسه</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <Card key={offer.id} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{offer.order?.description || 'طلب'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {offer.order?.shop?.name} - {offer.order?.shop?.address}
                  </p>
                  <p className="text-sm font-bold text-indigo-600 mt-1">عرضك: {offer.price} ج.م</p>
                </div>
                <Badge className={offerStatusColors[offer.status]}>
                  {offerStatusLabels[offer.status]}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============== DRIVER MY DELIVERIES ==============
function DriverMyDeliveries() {
  const { user } = useAppStore();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    const data = await api.get('/api/orders');
    if (data.orders) {
      const myOrders = data.orders.filter((o: Order) => o.acceptedDriverId === user.id);
      setOrders(myOrders);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
  }, [loadOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    await api.patch(`/api/orders/${orderId}`, { status });
    toast({ title: 'تم!', description: 'تم تحديث حالة الطلب' });
    loadOrders();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">توصيلاتي</h2>
        <p className="text-gray-500 mt-1">التوصيلات اللي اتعينت عليك</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg skeleton-shimmer-rich" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50/50 to-white">
          <CardContent className="py-10 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Truck className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">مفيش توصيلات لسه</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{shopTypeIcons[order.shop?.type] || '🏪'}</span>
                      <span className="font-medium">{order.shop?.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{order.description}</p>
                    <div className="mt-2 space-y-1 text-xs text-gray-400">
                      <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> من: {order.pickupAddress}</p>
                      <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> إلى: {order.deliveryAddress}</p>
                    </div>
                  </div>
                  <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-bold text-indigo-600">{order.deliveryFee} ج.م</span>
                  <div className="flex gap-2">
                    {order.status === 'ACCEPTED' && (
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => updateStatus(order.id, 'PICKED_UP')}>
                        وصلت المحل
                      </Button>
                    )}
                    {order.status === 'PICKED_UP' && (
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all" onClick={() => updateStatus(order.id, 'DELIVERED')}>
                        تم التوصيل ✅
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============== DRIVER POINTS ==============
function DriverPoints() {
  const { user, setUser } = useAppStore();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [currentPoints, setCurrentPoints] = useState(user?.points || 0);
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [pointPrice, setPointPrice] = useState(1);

  // Payment form state
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderName, setSenderName] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [myPayments, setMyPayments] = useState<PaymentRequest[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get(`/api/points?userId=${user.id}`),
      api.get('/api/settings/payment-methods'),
      api.get(`/api/payments?userId=${user.id}`),
    ]).then(([pointsData, methodsData, paymentsData]) => {
      if (pointsData.transactions) setTransactions(pointsData.transactions);
      if (pointsData.currentPoints !== undefined) setCurrentPoints(pointsData.currentPoints);
      if (methodsData.paymentMethods) setPaymentMethods(methodsData.paymentMethods);
      if (methodsData.pointPrice) setPointPrice(methodsData.pointPrice);
      if (paymentsData.payments) setMyPayments(paymentsData.payments);
      setLoading(false);
    });
  }, [user]);

  const handleCopyPhone = (phone: string, methodId: string) => {
    navigator.clipboard.writeText(phone);
    setCopied(methodId);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: 'تم النسخ!', description: `تم نسخ الرقم ${phone}` });
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amount = parseInt(purchaseAmount);
    if (!amount || amount <= 0) {
      toast({ title: 'خطأ', description: 'اختر عدد النقاط', variant: 'destructive' });
      return;
    }
    if (!selectedMethod) {
      toast({ title: 'خطأ', description: 'اختر طريقة الدفع', variant: 'destructive' });
      return;
    }
    if (!senderPhone || !senderName) {
      toast({ title: 'خطأ', description: 'اكتب بيانات المرسل', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    const data = await api.post('/api/payments', {
      userId: user.id,
      amount,
      paymentMethod: selectedMethod,
      senderPhone,
      senderName,
      receiptNumber: receiptNumber || null,
    });
    if (data.error) {
      toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
    } else {
      toast({ title: 'تم إرسال الطلب!', description: 'استنى للأدمن يapprove طلبك والنقاط هتتنزل تلقائي' });
      setShowPaymentForm(false);
      setPurchaseAmount('');
      setSenderPhone('');
      setSenderName('');
      setReceiptNumber('');
      setSelectedMethod('');
      // Reload payments
      const paymentsData = await api.get(`/api/payments?userId=${user.id}`);
      if (paymentsData.payments) setMyPayments(paymentsData.payments);
    }
    setSubmitting(false);
  };

  const paymentMethodLabels: Record<string, string> = {
    VODAFONE_CASH: 'فودافون كاش',
    INSTAPAY: 'إنستاباي',
    ORANGE_CASH: 'أورنج كاش',
  };

  const paymentStatusLabels: Record<string, string> = {
    PENDING: 'في الانتظار',
    APPROVED: 'تم القبول',
    REJECTED: 'مرفوض',
  };
  const paymentStatusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-indigo-100 text-indigo-800',
    REJECTED: 'bg-red-100 text-red-800',
  };

  const typeLabels: Record<string, string> = {
    PURCHASE: 'شراء',
    USAGE: 'استخدام',
    EARNING: 'كسب',
  };
  const typeColors: Record<string, string> = {
    PURCHASE: 'text-blue-600',
    USAGE: 'text-red-600',
    EARNING: 'text-indigo-600',
  };

  const selectedMethodConfig = paymentMethods.find((m) => m.id === selectedMethod);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">النقاط</h2>
        <p className="text-gray-500 mt-1">شراء نقاط عن طريق التحويل البنكي</p>
      </div>

      {/* Points balance card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white overflow-hidden relative hover-lift">
        <CardContent className="p-6 text-center relative">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full animate-breathe" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full" />
          <Coins className="w-12 h-12 mx-auto mb-3 opacity-90" />
          <p className="text-4xl font-bold count-animate">{currentPoints}</p>
          <p className="text-lg opacity-80">نقطة</p>
          <p className="text-sm opacity-60 mt-2">خصم عمولة لما المحل يقبل عرضك</p>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="border-0 shadow-md overflow-hidden relative hover-lift">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-amber-400 via-orange-500 to-amber-400" />
        <CardContent className="p-4 bg-amber-50">
          <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-amber-700" />
            </div>
            إزاي تشتري نقاط؟
          </h3>
          <div className="space-y-2">
            {[
              { num: 1, text: 'اختار طريقة الدفع (فودافون كاش / إنستاباي / أورنج كاش)' },
              { num: 2, text: 'حوّل المبلغ على رقم الأدمن اللي مكتوب' },
              { num: 3, text: 'اكتب بيانات التحويل (اسمك ورقم التليفون ورقم الإيصال)' },
              { num: 4, text: 'استنى الأدمن يعتمد الطلب والنقاط هتتنزل تلقائي' },
            ].map((step) => (
              <div key={step.num} className="flex items-start gap-2.5 text-sm">
                <div className="w-5 h-5 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                  {step.num}
                </div>
                <span className="text-amber-800">{step.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2.5 bg-amber-100/70 rounded-lg text-xs text-amber-700 text-center font-medium">
            سعر النقطة: {pointPrice} ج.م | مثال: 10 نقاط = {10 * pointPrice} ج.م
          </div>
        </CardContent>
      </Card>

      {/* Payment methods */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          طرق الدفع المتاحة
        </h3>
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <Card key={method.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center text-2xl shadow-sm`}>
                      {method.icon}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{method.name}</p>
                      <p className="text-sm text-gray-500">تحويل إلى: {method.accountName}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-gradient-to-l from-gray-50 to-white rounded-xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">رقم الحساب</p>
                    <p className="font-bold text-gray-900 text-lg tracking-wider" dir="ltr">{method.accountPhone}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleCopyPhone(method.accountPhone, method.id)}
                  >
                    {copied === method.id ? <Check className="w-3.5 h-3.5 text-indigo-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === method.id ? 'تم!' : 'نسخ'}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">{method.instructions}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Buy points button / form */}
      {!showPaymentForm ? (
        <Button
          className="w-full bg-gradient-to-l from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all gap-2 py-6 text-lg shadow-indigo-200/50"
          onClick={() => setShowPaymentForm(true)}
        >
          <ShoppingCart className="w-5 h-5" /> اشتري نقاط دلوقتي
        </Button>
      ) : (
        <Card className="border-0 shadow-md hover-lift overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-indigo-600 via-purple-500 to-indigo-400" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                طلب شراء نقاط
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowPaymentForm(false)} className="hover:bg-gray-100 rounded-xl">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              {/* Points amount */}
              <div className="space-y-2">
                <Label>عدد النقاط</Label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[5, 10, 25, 50].map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant={purchaseAmount === String(amount) ? 'default' : 'outline'}
                      className={purchaseAmount === String(amount) ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all' : ''}
                      onClick={() => setPurchaseAmount(String(amount))}
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
                <Input
                  type="number"
                  placeholder="أو اكتب عدد مخصص"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                />
                {purchaseAmount && (
                  <p className="text-sm text-indigo-600 font-medium">
                    المطلوب تحويله: {parseInt(purchaseAmount) * pointPrice} ج.م
                  </p>
                )}
              </div>

              {/* Payment method */}
              <div className="space-y-2">
                <Label>طريقة الدفع</Label>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        selectedMethod === method.id
                          ? 'border-indigo-500 bg-indigo-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{method.icon}</span>
                      <span className="text-xs font-medium">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Show selected method info */}
              {selectedMethodConfig && (
                <div className="p-3 bg-indigo-50 rounded-lg text-sm">
                  <p className="font-medium text-indigo-800">حوّل على الرقم ده:</p>
                  <p className="text-lg font-bold text-indigo-900 mt-1 tracking-wider" dir="ltr">{selectedMethodConfig.accountPhone}</p>
                  <p className="text-xs text-indigo-600 mt-1">باسم: {selectedMethodConfig.accountName}</p>
                </div>
              )}

              {/* Sender info */}
              <div className="space-y-2">
                <Label>اسم المرسل (الاسم اللي على الحساب)</Label>
                <Input
                  placeholder="الاسم اللي حوّلت منه"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>رقم تليفون المرسل</Label>
                <Input
                  type="tel"
                  placeholder="رقم التليفون اللي حوّلت منه"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>رقم الإيصال / المرجع (اختياري)</Label>
                <Input
                  placeholder="رقم الإيصال من التطبيق"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-l from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                disabled={submitting || !purchaseAmount || !selectedMethod}
              >
                {submitting ? '⏳ جاري الإرسال...' : 'إرسال طلب الدفع'}
              </Button>
              <p className="text-xs text-gray-400 text-center">بعد الإرسال هيتم مراجعة طلبك والنقاط هتتنزل بعد ما الأدمن يعتمد</p>
            </form>
          </CardContent>
        </Card>
      )}

      {/* My payment requests */}
      {myPayments.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              طلبات الدفع بتاعتي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-64">
              <div className="space-y-2">
                {myPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gradient-to-l from-gray-50 to-white rounded-xl border border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{payment.amount} نقطة</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{paymentMethodLabels[payment.paymentMethod] || payment.paymentMethod}</span>
                      </div>
                      <p className="text-xs text-gray-400">{new Date(payment.createdAt).toLocaleDateString('ar-EG')}</p>
                      {payment.adminNote && (
                        <p className="text-xs text-amber-600 mt-1">ملاحظة: {payment.adminNote}</p>
                      )}
                    </div>
                    <Badge className={paymentStatusColors[payment.status]}>
                      {paymentStatusLabels[payment.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Points transaction history */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">سجل النقاط</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded skeleton-shimmer-rich" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-gray-400 py-6">مفيش عمليات على النقاط لسه</p>
          ) : (
            <ScrollArea className="max-h-96">
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm">{tx.description}</p>
                      <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString('ar-EG')}</p>
                    </div>
                    <span className={`font-bold ${typeColors[tx.type]}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============== ADMIN PAYMENTS ==============
function AdminPayments() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [adminNote, setAdminNote] = useState<Record<string, string>>({});

  const loadPayments = useCallback(async () => {
    const url = filter !== 'ALL' ? `/api/payments?status=${filter}&role=ADMIN` : '/api/payments?role=ADMIN';
    const data = await api.get(url);
    if (data.payments) setPayments(data.payments);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPayments();
  }, [loadPayments]);

  const handleAction = async (paymentId: string, action: 'APPROVED' | 'REJECTED') => {
    const note = adminNote[paymentId] || '';
    const data = await api.patch(`/api/payments/${paymentId}`, {
      status: action,
      adminNote: note,
      adminRole: 'ADMIN',
    });
    if (data.error) {
      toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
    } else {
      toast({
        title: 'تم!',
        description: action === 'APPROVED' ? 'تم قبول الدفع وإضافة النقاط' : 'تم رفض طلب الدفع',
      });
      loadPayments();
    }
  };

  const paymentMethodLabels: Record<string, string> = {
    VODAFONE_CASH: '📱 فودافون كاش',
    INSTAPAY: '💳 إنستاباي',
    ORANGE_CASH: '🍊 أورنج كاش',
  };

  const paymentStatusLabels: Record<string, string> = {
    PENDING: 'في الانتظار',
    APPROVED: 'تم القبول',
    REJECTED: 'مرفوض',
  };
  const paymentStatusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    APPROVED: 'bg-indigo-100 text-indigo-800 border-emerald-300',
    REJECTED: 'bg-red-100 text-red-800 border-red-300',
  };

  const pendingCount = payments.filter((p) => p.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">طلبات الدفع</h2>
          <p className="text-gray-500 mt-1">إدارة طلبات شراء النقاط</p>
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="PENDING" className="relative">
              في الانتظار
              {pendingCount > 0 && (
                <span className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="APPROVED">مقبولة</TabsTrigger>
            <TabsTrigger value="REJECTED">مرفوضة</TabsTrigger>
            <TabsTrigger value="ALL">الكل</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg skeleton-shimmer-rich" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50/50 to-white">
          <CardContent className="py-10 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">مفيش طلبات دفع {filter === 'PENDING' ? 'في الانتظار' : ''}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <Card key={payment.id} className={`border-0 shadow-sm hover:shadow-md transition-shadow ${
              payment.status === 'PENDING' ? 'ring-2 ring-yellow-200' : ''
            }`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Coins className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{payment.user?.name}</p>
                      <p className="text-xs text-gray-500">{payment.user?.phone}</p>
                    </div>
                  </div>
                  <Badge className={paymentStatusColors[payment.status]}>
                    {paymentStatusLabels[payment.status]}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-gradient-to-l from-gray-50 to-white rounded-xl border border-gray-100 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">عدد النقاط</p>
                    <p className="font-bold text-indigo-600 text-lg">{payment.amount} نقطة</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">طريقة الدفع</p>
                    <p className="font-medium">{paymentMethodLabels[payment.paymentMethod]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">اسم المرسل</p>
                    <p className="font-medium">{payment.senderName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">رقم المرسل</p>
                    <p className="font-medium" dir="ltr">{payment.senderPhone}</p>
                  </div>
                  {payment.receiptNumber && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400">رقم الإيصال / المرجع</p>
                      <p className="font-bold text-blue-600 tracking-wider" dir="ltr">{payment.receiptNumber}</p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-400">
                  تاريخ الطلب: {new Date(payment.createdAt).toLocaleDateString('ar-EG')} - {new Date(payment.createdAt).toLocaleTimeString('ar-EG')}
                </p>

                {payment.status === 'PENDING' && (
                  <div className="pt-3 border-t space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">ملاحظة (اختياري)</Label>
                      <Input
                        placeholder="مثال: تم التحويل بنجاح / الإيصال مش واضح"
                        value={adminNote[payment.id] || ''}
                        onChange={(e) => setAdminNote((prev) => ({ ...prev, [payment.id]: e.target.value }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-1 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                        onClick={() => handleAction(payment.id, 'APPROVED')}
                      >
                        <CheckCircle className="w-4 h-4" /> قبول وإضافة النقاط
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50 gap-1"
                        onClick={() => handleAction(payment.id, 'REJECTED')}
                      >
                        <XCircle className="w-4 h-4" /> رفض
                      </Button>
                    </div>
                  </div>
                )}

                {payment.adminNote && payment.status !== 'PENDING' && (
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400">ملاحظة الأدمن:</p>
                    <p className="text-sm text-gray-600">{payment.adminNote}</p>
                  </div>
                )}

                {payment.reviewedAt && (
                  <p className="text-xs text-gray-400">
                    تاريخ المراجعة: {new Date(payment.reviewedAt).toLocaleDateString('ar-EG')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============== ADMIN APPROVALS ==============
function AdminApprovals() {
  const { toast } = useToast();
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPending = useCallback(async () => {
    const data = await api.get('/api/users?approved=false');
    if (data.users) setPendingUsers(data.users);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPending();
  }, [loadPending]);

  const handleApprove = async (userId: string) => {
    const data = await api.patch('/api/users', { userId, approved: true, adminRole: 'ADMIN' });
    if (data.error) {
      toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
    } else {
      toast({ title: 'تم!', description: 'تم قبول الحساب. المستخدم يقدر يدخل دلوقتي' });
      loadPending();
    }
  };

  const handleReject = async (userId: string) => {
    // Deactivate (soft reject) instead of deleting
    const data = await api.patch('/api/users', { userId, active: false, approved: false, adminRole: 'ADMIN' });
    if (data.error) {
      toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
    } else {
      toast({ title: 'تم الرفض', description: 'تم رفض طلب التسجيل' });
      loadPending();
    }
  };

  const roleLabels: Record<string, string> = { SHOP: 'شوب (صاحب محل)', DRIVER: 'دليفري' };
  const roleIcons: Record<string, string> = { SHOP: '🏪', DRIVER: '🚚' };
  const roleColors: Record<string, string> = {
    SHOP: 'bg-blue-100 text-blue-700',
    DRIVER: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">طلبات التسجيل</h2>
        <p className="text-gray-500 mt-1">المستخدمين اللي عايزين ينضموا للنظام</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg skeleton-shimmer-rich" />
          ))}
        </div>
      ) : pendingUsers.length === 0 ? (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50/50 to-white">
          <CardContent className="py-10 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">مفيش طلبات تسجيل جديدة</p>
            <p className="text-sm text-gray-300 mt-1">لما حد يسجل جديد، هتظهر طلبو هنا</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingUsers.filter((u) => u.active).map((user) => (
            <Card key={user.id} className="border-0 shadow-sm ring-2 ring-yellow-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-2xl">
                      {roleIcons[user.role] || '👤'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{user.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className={roleColors[user.role]}>
                          {roleLabels[user.role] || user.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">في الانتظار</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-gradient-to-l from-gray-50 to-white rounded-xl border border-gray-100 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">رقم التليفون</p>
                    <p className="font-medium" dir="ltr">{user.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">النقاط</p>
                    <p className="font-medium">{user.points}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">تاريخ التسجيل</p>
                    <p className="font-medium">{new Date(user.createdAt).toLocaleDateString('ar-EG')} - {new Date(user.createdAt).toLocaleTimeString('ar-EG')}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-1 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    onClick={() => handleApprove(user.id)}
                  >
                    <CheckCircle className="w-4 h-4" /> قبول التسجيل
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 gap-1"
                    onClick={() => handleReject(user.id)}
                  >
                    <XCircle className="w-4 h-4" /> رفض
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============== ADMIN EARNINGS ==============
function AdminEarnings() {
  const [data, setData] = useState<{
    totalCommission: number;
    totalDeliveryFees: number;
    totalDriverEarnings: number;
    totalDeliveries: number;
    todayCommission: number;
    todayDeliveries: number;
    monthCommission: number;
    monthDeliveries: number;
    commissionRate: number;
    recentEarnings: Array<{
      id: string;
      deliveryFee: number;
      commission: number;
      driverEarning: number;
      createdAt: string;
      order: { description: string };
      shop: { name: string; type: string };
    }>;
    earningsByShop: Array<{
      shopId: string;
      _sum: { commission: number; deliveryFee: number };
      _count: number;
      shop: { name: string; type: string };
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/earnings').then((result) => {
      setData(result);
      setLoading(false);
    });
  }, []);

  const shopTypeIcons: Record<string, string> = {
    PHARMACY: '💊', SUPERMARKET: '🛒', RESTAURANT: '🍽️', OTHER: '🏪',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">الأرباح والعمولات</h2>
        <p className="text-gray-500 mt-1">عمولة {data?.commissionRate || 10}% على كل توصيلة</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl skeleton-shimmer-rich" />
          ))}
        </div>
      ) : (
        <>
          {/* Main stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 entrance-group">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white hover-lift overflow-hidden" style={{ animationDelay: '0.05s' }}>
              <CardContent className="p-4 text-center relative">
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/5 rounded-full" />
                <DollarSign className="w-7 h-7 mx-auto mb-1 opacity-90" />
                <p className="text-2xl font-bold count-animate">{data?.totalCommission?.toFixed(2) || '0'}</p>
                <p className="text-xs opacity-80">إجمالي العمولة (ج.م)</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md hover-lift overflow-hidden relative" style={{ animationDelay: '0.1s' }}>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-l from-blue-400 to-cyan-500" />
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900 count-animate">{data?.monthCommission?.toFixed(2) || '0'}</p>
                <p className="text-xs text-gray-500">عمولة الشهر (ج.م)</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md hover-lift overflow-hidden relative" style={{ animationDelay: '0.15s' }}>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-l from-orange-400 to-amber-500" />
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-1">
                  <Package className="w-4 h-4 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900 count-animate">{data?.totalDeliveries || 0}</p>
                <p className="text-xs text-gray-500">توصيلات مكتملة</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md hover-lift overflow-hidden relative" style={{ animationDelay: '0.2s' }}>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-l from-amber-400 to-yellow-500" />
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-1">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900 count-animate">{data?.todayCommission?.toFixed(2) || '0'}</p>
                <p className="text-xs text-gray-500">عمولة النهارده (ج.م)</p>
              </CardContent>
            </Card>
          </div>

          {/* How commission works */}
          <Card className="border-0 shadow-md bg-rose-50">
            <CardContent className="p-4">
              <h3 className="font-bold text-indigo-900 mb-2">إزاي العمولة بتشتغل؟</h3>
              <div className="space-y-2 text-sm text-indigo-800">
                <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <span>رسوم التوصيلة</span>
                  <span className="font-bold">100%</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-indigo-100 rounded-lg">
                  <span>عمولتك (الأدمن)</span>
                  <span className="font-bold text-indigo-700">10%</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-100 rounded-lg">
                  <span>أرباح الدليفري</span>
                  <span className="font-bold text-blue-700">90%</span>
                </div>
              </div>
              <p className="text-xs text-indigo-600 mt-2">مثال: توصيلة بـ 30 ج.م → عمولتك 3 ج.م والدليفري ياخد 27 ج.م</p>
            </CardContent>
          </Card>

          {/* Earnings by shop */}
          {data?.earningsByShop && data.earningsByShop.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-gray-500" />
                  أرباح المحلات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.earningsByShop.map((item) => (
                    <div key={item.shopId} className="flex items-center justify-between p-3 bg-gradient-to-l from-gray-50 to-white rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{shopTypeIcons[item.shop?.type] || '🏪'}</span>
                        <div>
                          <p className="font-medium text-sm">{item.shop?.name}</p>
                          <p className="text-xs text-gray-400">{item._count} توصيلة</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-indigo-600">{item._sum.commission?.toFixed(2)} ج.م</p>
                        <p className="text-xs text-gray-400">إجمالي: {item._sum.deliveryFee?.toFixed(2)} ج.م</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent earnings */}
          {data?.recentEarnings && data.recentEarnings.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  آخر الأرباح
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-96">
                  <div className="space-y-2">
                    {data.recentEarnings.map((earning) => (
                      <div key={earning.id} className="flex items-center justify-between p-3 bg-gradient-to-l from-gray-50 to-white rounded-xl border border-gray-100">
                        <div>
                          <p className="text-sm font-medium">{earning.order?.description || 'طلب'}</p>
                          <p className="text-xs text-gray-400">
                            {earning.shop?.name} - {new Date(earning.createdAt).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-indigo-600">+{earning.commission?.toFixed(2)} ج.م</p>
                          <p className="text-xs text-gray-400">من {earning.deliveryFee?.toFixed(2)} ج.م</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {(!data?.recentEarnings || data.recentEarnings.length === 0) && (
            <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50/50 to-white">
              <CardContent className="py-10 text-center">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-gray-400 text-sm">مفيش أرباح لسه</p>
                <p className="text-sm text-gray-300 mt-1">لما يتم توصيل طلبات، هتظهر الأرباح هنا</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// ============== ADMIN PAYMENT SETTINGS ==============
function AdminPaymentSettings() {
  const { toast } = useToast();
  const [methods, setMethods] = useState<Array<{
    id: string; name: string; icon: string; color: string;
    accountName: string; accountPhone: string; instructions: string; active: boolean;
  }>>([]);
  const [pointPrice, setPointPrice] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const data = await api.get('/api/settings/payment-methods');
    if (data.paymentMethods) setMethods(data.paymentMethods);
    if (typeof data.pointPrice === 'number') setPointPrice(data.pointPrice);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await api.put('/api/settings/payment-methods', {
        paymentMethods: methods,
        pointPrice,
      });
      if (data.error) {
        toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
      } else {
        toast({ title: 'تم الحفظ! ✅', description: 'تم تحديث بيانات التحويل بنجاح' });
      }
    } catch {
      toast({ title: 'خطأ', description: 'حصل خطأ في الاتصال', variant: 'destructive' });
    }
    setSaving(false);
  };

  const updateMethod = (id: string, field: string, value: string | boolean) => {
    setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">إعدادات التحويل</h2>
        <p className="text-gray-500 mt-1">عدّل أرقام التحويل اللي بيشتغل عليها المستخدمين</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl skeleton-shimmer-rich" />
          ))}
        </div>
      ) : (
        <>
          {/* Point price card */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold">سعر النقطة</h3>
              </div>
              <p className="text-xs text-gray-500">السعر اللي بيدفعه المستخدم مقابل كل نقطة (بالجنيه المصري)</p>
              <div className="relative max-w-xs">
                <DollarSign className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={pointPrice}
                  onChange={(e) => setPointPrice(parseFloat(e.target.value) || 1)}
                  className="pr-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment methods cards */}
          {methods.map((method) => (
            <Card key={method.id} className="border-0 shadow-md">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center text-xl`}>
                      {method.icon}
                    </div>
                    <div>
                      <p className="font-bold">{method.name}</p>
                      <p className="text-xs text-gray-400">{method.id}</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={method.active}
                      onChange={(e) => updateMethod(method.id, 'active', e.target.checked)}
                      className="w-4 h-4 accent-indigo-600"
                    />
                    <span className="text-sm text-gray-600">مفعّل</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">الاسم على الحساب</Label>
                    <Input
                      value={method.accountName}
                      onChange={(e) => updateMethod(method.id, 'accountName', e.target.value)}
                      placeholder="الاسم الموجود على الحساب"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">رقم التحويل</Label>
                    <Input
                      value={method.accountPhone}
                      onChange={(e) => updateMethod(method.id, 'accountPhone', e.target.value)}
                      placeholder="01xxxxxxxxx"
                      dir="ltr"
                      className="text-left"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">تعليمات للمستخدم</Label>
                  <Input
                    value={method.instructions}
                    onChange={(e) => updateMethod(method.id, 'instructions', e.target.value)}
                    placeholder="تعليمات التحويل"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            className="w-full bg-gradient-to-l from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all h-11"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </>
      )}
    </div>
  );
}

// ============== NOTIFICATION SOUND ==============
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1108, now + 0.1);
    osc.frequency.setValueAtTime(1318, now + 0.2);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
  } catch {}
}

function playOfferSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      const t = ctx.currentTime + i * 0.15;
      osc.frequency.setValueAtTime(660, t);
      osc.frequency.setValueAtTime(880, t + 0.08);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      osc.start(t);
      osc.stop(t + 0.15);
    }
  } catch {}
}

// ============== MAIN APP ==============
function AppContent() {
  const { user, currentView, sidebarOpen, setSidebarOpen, darkMode, setDarkMode, toggleDarkMode } = useAppStore();
  const [lastNotifId, setLastNotifId] = useState<string>('');

  const checkNotifications = useCallback(async () => {
    if (!user || user.role === 'ADMIN') return;
    try {
      const data = await api.get(`/api/notifications?userId=${user.id}&unreadOnly=true`);
      if (data.notifications && data.notifications.length > 0) {
        const newest = data.notifications[0];
        if (newest.id !== lastNotifId) {
          setLastNotifId(newest.id);
          // Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newest.title, { body: newest.body, icon: '/favicon.ico' });
          }
          if (newest.type === 'new_order') {
            playNotificationSound();
          } else if (newest.type === 'offer_accepted') {
            playOfferSound();
          } else {
            playNotificationSound();
          }
        }
      }
    } catch {}
  }, [user, lastNotifId]);

  const requestNotifPermission = useCallback(async () => {
    if (user && user.role !== 'ADMIN' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [user]);

  // Initialize dark mode
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      setDarkMode(saved === 'true');
    }
  }, [setDarkMode]);

  useEffect(() => {
    requestNotifPermission();
    if (user && user.role !== 'ADMIN') {
      checkNotifications();
      const interval = setInterval(checkNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user, checkNotifications, requestNotifPermission]);

  if (!user) {
    if (currentView === 'register') return <RegisterView />;
    return <LoginView />;
  }

  const isAdmin = user.role === 'ADMIN';
  const isShop = user.role === 'SHOP';
  const isDriver = user.role === 'DRIVER';

  const Sidebar = isAdmin ? AdminSidebar : isShop ? ShopSidebar : DriverSidebar;

  const renderView = () => {
    switch (currentView) {
      // Admin views
      case 'admin-dashboard': return <AdminDashboard />;
      case 'admin-shops': return <AdminShops />;
      case 'admin-users': return <AdminUsers />;
      case 'admin-orders': return <AdminOrders />;
      case 'admin-payments': return <AdminPayments />;
      case 'admin-approvals': return <AdminApprovals />;
      case 'admin-earnings': return <AdminEarnings />;
      case 'admin-payment-settings': return <AdminPaymentSettings />;
      // Shop views
      case 'shop-dashboard': return <ShopDashboard />;
      case 'shop-create-order': return <ShopCreateOrder />;
      case 'shop-orders': return <ShopOrders />;
      // Driver views
      case 'driver-dashboard': return <DriverDashboard />;
      case 'driver-available': return <DriverAvailableOrders />;
      case 'driver-my-offers': return <DriverMyOffers />;
      case 'driver-my-deliveries': return <DriverMyDeliveries />;
      case 'driver-points': return <DriverPoints />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/40 bg-grid-pattern">
      <Sidebar />
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl shadow-sm z-30 px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:bg-gray-900/90 dark:border-gray-700">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${
            isAdmin ? 'bg-gradient-to-br from-indigo-100 to-purple-100' : isShop ? 'bg-gradient-to-br from-blue-100 to-indigo-100' : 'bg-gradient-to-br from-emerald-100 to-teal-100'
          }`}>
            {isAdmin ? <Settings className="w-4 h-4 text-indigo-600" /> :
             isShop ? <Store className="w-4 h-4 text-blue-600" /> :
             <Truck className="w-4 h-4 text-emerald-600" />}
          </div>
          <div>
            <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{user.name}</span>
            <p className="text-[10px] text-gray-400 -mt-0.5">{isAdmin ? 'أدمن' : isShop ? 'شوب' : 'دليفري'}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => toggleDarkMode} className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>
      {/* Main content */}
      <main className="lg:mr-64 pt-16 lg:pt-0 p-4 lg:p-8 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="animate-fade-in" key={currentView}>
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return <AppContent />;
}

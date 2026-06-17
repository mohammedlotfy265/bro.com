'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore, type User, type Shop, type Order, type DeliveryOffer, type PointsTransaction } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Store, Truck, Users, Package, Coins, LogOut, Menu, X, Plus, CheckCircle,
  XCircle, Clock, MapPin, Phone, Star, TrendingUp, ShoppingCart, ArrowLeft,
  Home as HomeIcon, ClipboardList, DollarSign, Gift, ChevronLeft, Settings, UserPlus,
  Building2, CircleDot
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
  patch: async (url: string, body: unknown) => {
    const res = await fetch(url, {
      method: 'PATCH',
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
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
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
  const [seeding, setSeeding] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post('/api/auth', { phone, password });
      if (data.error) {
        toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
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

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const data = await api.post('/api/seed', {});
      toast({ title: 'تم!', description: 'تم إنشاء البيانات الأولية. جرّب تسجيل الدخول' });
    } catch {
      toast({ title: 'خطأ', description: 'حصل خطأ', variant: 'destructive' });
    }
    setSeeding(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">دليفري برو</h1>
          <p className="text-gray-500 mt-2">نظام التوصيل الذكي</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">تسجيل الدخول</CardTitle>
            <CardDescription>ادخل رقم التليفون والباسورد</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">رقم التليفون</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="01xxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pr-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">الباسورد</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                disabled={loading}
              >
                {loading ? 'جاري الدخول...' : 'دخول'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => setCurrentView('register')}
                className="text-emerald-600"
              >
                حساب جديد
              </Button>
            </div>

            <Separator className="my-4" />

            <div className="text-center">
              <p className="text-xs text-gray-400 mb-2">أول مرة تستخدم التطبيق؟</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSeed}
                disabled={seeding}
                className="text-xs"
              >
                {seeding ? 'جاري التجهيز...' : 'إنشاء بيانات تجريبية'}
              </Button>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
                <p className="font-semibold text-gray-700">حسابات تجريبية:</p>
                <p>أدمن: 01000000000 / admin123</p>
                <p>شوب: 01100000000 / shop123</p>
                <p>دليفري: 01200000000 / driver123</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
        toast({ title: 'تم التسجيل!', description: 'قدرك تسجل دخول دلوقتي' });
        setCurrentView('login');
      }
    } catch {
      toast({ title: 'خطأ', description: 'حصل خطأ', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">حساب جديد</h1>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="pt-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label>الاسم</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك" required />
              </div>
              <div className="space-y-2">
                <Label>رقم التليفون</Label>
                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" required />
              </div>
              <div className="space-y-2">
                <Label>الباسورد</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <div className="space-y-2">
                <Label>نوع الحساب</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
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
                className="w-full bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                disabled={loading}
              >
                {loading ? 'جاري التسجيل...' : 'تسجيل'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button variant="link" onClick={() => setCurrentView('login')} className="text-emerald-600">
                عندي حساب بالفعل
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============== ADMIN SIDEBAR ==============
function AdminSidebar() {
  const { currentView, setCurrentView, sidebarOpen, setSidebarOpen, logout } = useAppStore();

  const menuItems = [
    { id: 'admin-dashboard', label: 'الرئيسية', icon: HomeIcon },
    { id: 'admin-shops', label: 'المحلات', icon: Building2 },
    { id: 'admin-users', label: 'المستخدمين', icon: Users },
    { id: 'admin-orders', label: 'الطلبات', icon: ClipboardList },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">دليفري برو</span>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as typeof currentView)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === item.id
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t">
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={logout}>
            <LogOut className="w-4 h-4" />
            تسجيل خروج
          </Button>
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
    { label: 'تم التوصيل', value: stats.deliveredOrders || 0, icon: CheckCircle, color: 'from-teal-500 to-emerald-600' },
    { label: 'إجمالي المستخدمين', value: stats.totalUsers || 0, icon: Users, color: 'from-purple-500 to-violet-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">لوحة تحكم الأدمن</h2>
        <p className="text-gray-500 mt-1">نظرة عامة على النظام</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            آخر الطلبات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-center text-gray-400 py-8">مفيش طلبات لسه</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{order.description}</p>
                    <p className="text-xs text-gray-500">{order.shop?.name}</p>
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
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
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
                  <Button type="button" variant="link" size="sm" className="text-emerald-600" onClick={handleAddShopUser}>
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
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">إضافة المحل</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : shops.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">مفيش محلات مسجلة لسه</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shops.map((shop) => (
            <Card key={shop.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl">
                      {shopTypeIcons[shop.type] || '🏪'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{shop.name}</h3>
                      <Badge variant="outline" className="mt-1">{shopTypeLabels[shop.type] || shop.type}</Badge>
                    </div>
                  </div>
                  <Badge className={shop.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}>
                    {shop.active ? 'نشط' : 'معلق'}
                  </Badge>
                </div>
                <div className="mt-4 space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" /> {shop.address}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> {shop.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> {shop.owner?.name}
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

  const roleLabels: Record<string, string> = { ADMIN: 'أدمن', SHOP: 'شوب', DRIVER: 'دليفري' };
  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    SHOP: 'bg-blue-100 text-blue-700',
    DRIVER: 'bg-emerald-100 text-emerald-700',
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
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
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
                      <Badge className={`text-xs ${roleColors[user.role]}`}>
                        {roleLabels[user.role]}
                      </Badge>
                      {user.role === 'DRIVER' && (
                        <span className="text-xs text-emerald-600 flex items-center gap-1">
                          <Coins className="w-3 h-3" /> {user.points}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {user.role !== 'ADMIN' && (
                  <Button
                    variant={user.active ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => handleToggleActive(user.id, user.active)}
                    className={user.active ? 'text-red-600 border-red-200 hover:bg-red-50' : 'bg-emerald-600 hover:bg-emerald-700'}
                  >
                    {user.active ? 'تعطيل' : 'تفعيل'}
                  </Button>
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
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">مفيش طلبات لسه</p>
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
                      <p className="text-xs text-emerald-600 flex items-center gap-1">
                        <Truck className="w-3 h-3" /> الدليفري: {order.acceptedDriver.name}
                      </p>
                    )}
                    {order.offers && order.offers.length > 0 && (
                      <p className="text-xs text-blue-600">{order.offers.length} عرض</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                    <span className="text-sm font-bold text-emerald-600">{order.deliveryFee} ج.م</span>
                    {(order.status === 'ACCEPTED' || order.status === 'PICKED_UP') && (
                      <div className="flex gap-1">
                        {order.status === 'ACCEPTED' && (
                          <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => updateOrderStatus(order.id, 'PICKED_UP')}>
                            تم الاستلام
                          </Button>
                        )}
                        {order.status === 'PICKED_UP' && (
                          <Button size="sm" className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700" onClick={() => updateOrderStatus(order.id, 'DELIVERED')}>
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
  const { user, currentView, setCurrentView, sidebarOpen, setSidebarOpen, logout } = useAppStore();

  const menuItems = [
    { id: 'shop-dashboard', label: 'الرئيسية', icon: HomeIcon },
    { id: 'shop-create-order', label: 'طلب جديد', icon: Plus },
    { id: 'shop-orders', label: 'طلباتي', icon: ClipboardList },
  ];

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">شوبي</span>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-4 bg-blue-50 m-3 rounded-lg">
          <p className="font-medium text-sm text-blue-900">{user?.name}</p>
          <p className="text-xs text-blue-600">{user?.phone}</p>
        </div>
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as typeof currentView)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === item.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t">
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={logout}>
            <LogOut className="w-4 h-4" />
            تسجيل خروج
          </Button>
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

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{pendingCount}</p>
            <p className="text-xs text-gray-500">في الانتظار</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <Truck className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{activeCount}</p>
            <p className="text-xs text-gray-500">نشطة</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{deliveredCount}</p>
            <p className="text-xs text-gray-500">تم التوصيل</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600" />
            محلاتي
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myShops.length === 0 ? (
            <p className="text-center text-gray-400 py-6">مفيش محلات مسجلة باسمك. الأدمن لازم يضيفك الأول.</p>
          ) : (
            <div className="space-y-3">
              {myShops.map((shop) => (
                <div key={shop.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">{shopTypeIcons[shop.type]}</span>
                  <div>
                    <p className="font-medium">{shop.name}</p>
                    <p className="text-xs text-gray-500">{shopTypeLabels[shop.type]} - {shop.address}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        className="w-full bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2 py-6 text-lg"
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
  const [selectedShop, setSelectedShop] = useState('');
  const [description, setDescription] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get('/api/shops').then((data) => {
      if (data.shops) {
        const filtered = data.shops.filter((s: Shop) => s.owner?.id === user.id);
        setMyShops(filtered);
        if (filtered.length > 0) {
          setSelectedShop(filtered[0].id);
          setPickupAddress(filtered[0].address);
        }
      }
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.post('/api/orders', {
        shopId: selectedShop,
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
              <Select value={selectedShop} onValueChange={(v) => {
                setSelectedShop(v);
                const shop = myShops.find((s) => s.id === v);
                if (shop) setPickupAddress(shop.address);
              }}>
                <SelectTrigger><SelectValue placeholder="اختر المحل" /></SelectTrigger>
                <SelectContent>
                  {myShops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shopTypeIcons[shop.type]} {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">مفيش طلبات لسه</p>
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
                      <span className="font-bold text-emerald-600">{order.deliveryFee} ج.م</span>
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
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {order.offers.map((offer) => (
                        <div key={offer.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{offer.driver?.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-emerald-600">{offer.price} ج.م</span>
                            {offer.status === 'PENDING' && (
                              <div className="flex gap-1">
                                <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => handleOfferAction(offer.id, 'ACCEPTED')}>
                                  <CheckCircle className="w-3 h-3 ml-1" /> قبول
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200" onClick={() => handleOfferAction(offer.id, 'REJECTED')}>
                                  <XCircle className="w-3 h-3 ml-1" /> رفض
                                </Button>
                              </div>
                            )}
                            {offer.status === 'ACCEPTED' && <Badge className="bg-emerald-100 text-emerald-700 text-xs">مقبول</Badge>}
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
                    <Button size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => updateOrderStatus(order.id, 'DELIVERED')}>
                      تأكيد التوصيل
                    </Button>
                  </div>
                )}

                {order.acceptedDriver && ['ACCEPTED', 'PICKED_UP'].includes(order.status) && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
                    <Truck className="w-3 h-3" /> الدليفري: {order.acceptedDriver.name} - {order.acceptedDriver.phone}
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
  const { user, currentView, setCurrentView, sidebarOpen, setSidebarOpen, logout } = useAppStore();

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
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">دليفري</span>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-4 bg-emerald-50 m-3 rounded-lg">
          <p className="font-medium text-sm text-emerald-900">{user?.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <Coins className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-sm text-emerald-700 font-bold">{user?.points} نقطة</span>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as typeof currentView)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === item.id ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t">
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={logout}>
            <LogOut className="w-4 h-4" />
            تسجيل خروج
          </Button>
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

      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <CardContent className="p-4 text-center">
            <Coins className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <p className="text-3xl font-bold">{user?.points}</p>
            <p className="text-sm opacity-80">نقطة</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white cursor-pointer" onClick={() => setCurrentView('driver-available')}>
          <CardContent className="p-4 text-center">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <p className="text-3xl font-bold">{availableCount}</p>
            <p className="text-sm opacity-80">طلب متاح</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            التوصيلات النشطة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ) : myActiveDeliveries.length === 0 ? (
            <p className="text-center text-gray-400 py-4">مفيش توصيلات نشطة</p>
          ) : (
            <div className="space-y-2">
              {myActiveDeliveries.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{order.shop?.name}</p>
                    <p className="text-xs text-gray-500">{order.deliveryAddress}</p>
                  </div>
                  <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="py-6 flex-col gap-2" onClick={() => setCurrentView('driver-points')}>
          <Coins className="w-5 h-5 text-emerald-600" />
          <span className="text-sm">شراء نقاط</span>
        </Button>
        <Button variant="outline" className="py-6 flex-col gap-2" onClick={() => setCurrentView('driver-available')}>
          <Package className="w-5 h-5 text-blue-600" />
          <span className="text-sm">الطلبات المتاحة</span>
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

  const handleOffer = async (orderId: string) => {
    if (!user) return;
    const price = parseFloat(offerPrice[orderId] || '0');
    if (!price || price <= 0) {
      toast({ title: 'خطأ', description: 'لازم تحط سعر للعرض', variant: 'destructive' });
      return;
    }
    if (user.points < 1) {
      toast({ title: 'نقاط مش كافية', description: 'اشتري نقاط الأول عشان تقدر تعمل عرض', variant: 'destructive' });
      return;
    }

    setSubmitting((prev) => ({ ...prev, [orderId]: true }));
    const data = await api.post('/api/offers', { orderId, driverId: user.id, price });
    if (data.error) {
      toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
    } else {
      toast({ title: 'تم!', description: 'تم تقديم العرض بنجاح. استنيت رد المحل.' });
      setOfferPrice((prev) => ({ ...prev, [orderId]: '' }));
      loadOrders();
      // Update user points in store
      const updatedUser = { ...user, points: user.points - 1 };
      useAppStore.getState().setUser(updatedUser);
    }
    setSubmitting((prev) => ({ ...prev, [orderId]: false }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الطلبات المتاحة</h2>
          <p className="text-gray-500 mt-1">اطلب على التوصيلات اللي تعجبك</p>
        </div>
        <div className="flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-full">
          <Coins className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-bold text-emerald-700">{user?.points}</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">مفيش طلبات متاحة دلوقتي</p>
            <p className="text-sm text-gray-300 mt-1">فضل متابع! الطلبات بتتضاف كل وقت</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
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
                  <span className="text-sm font-bold text-emerald-600">{order.deliveryFee} ج.م</span>
                </div>
                <p className="text-sm text-gray-700">{order.description}</p>
                <div className="space-y-1 text-xs text-gray-400">
                  <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> من: {order.pickupAddress}</p>
                  <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> إلى: {order.deliveryAddress}</p>
                </div>
                {order.offers && order.offers.length > 0 && (
                  <p className="text-xs text-blue-600">{order.offers.length} عرض تايه</p>
                )}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <div className="relative flex-1">
                    <span className="absolute right-3 top-2.5 text-xs text-gray-400">ج.م</span>
                    <Input
                      type="number"
                      placeholder="سعرك"
                      value={offerPrice[order.id] || ''}
                      onChange={(e) => setOfferPrice((prev) => ({ ...prev, [order.id]: e.target.value }))}
                      className="pr-10 h-9"
                    />
                  </div>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 gap-1 h-9"
                    disabled={submitting[order.id] || user?.points < 1}
                    onClick={() => handleOffer(order.id)}
                  >
                    {submitting[order.id] ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <><Send className="w-3.5 h-3.5" /> عرض</>
                    )}
                  </Button>
                </div>
                {user?.points < 1 && (
                  <p className="text-xs text-red-500 text-center">معندكش نقاط كافية. اشتري نقاط الأول!</p>
                )}
              </CardContent>
            </Card>
          ))}
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
    ACCEPTED: 'bg-emerald-100 text-emerald-800',
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
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">معملتش عروض لسه</p>
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
                  <p className="text-sm font-bold text-emerald-600 mt-1">عرضك: {offer.price} ج.م</p>
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
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">مفيش توصيلات لسه</p>
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
                  <span className="font-bold text-emerald-600">{order.deliveryFee} ج.م</span>
                  <div className="flex gap-2">
                    {order.status === 'ACCEPTED' && (
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => updateStatus(order.id, 'PICKED_UP')}>
                        وصلت المحل
                      </Button>
                    )}
                    {order.status === 'PICKED_UP' && (
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => updateStatus(order.id, 'DELIVERED')}>
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
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get(`/api/points?userId=${user.id}`).then((data) => {
      if (data.transactions) setTransactions(data.transactions);
      if (data.currentPoints !== undefined) setCurrentPoints(data.currentPoints);
      setLoading(false);
    });
  }, [user]);

  const handlePurchase = async () => {
    if (!user) return;
    const amount = parseInt(purchaseAmount);
    if (!amount || amount <= 0) {
      toast({ title: 'خطأ', description: 'اختر عدد النقاط', variant: 'destructive' });
      return;
    }
    setPurchasing(true);
    const data = await api.post('/api/points', { userId: user.id, amount });
    if (data.error) {
      toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
    } else {
      toast({ title: 'تم!', description: `تم شراء ${amount} نقطة بنجاح` });
      setCurrentPoints(data.user?.points || currentPoints + amount);
      setUser({ ...user, points: data.user?.points || currentPoints + amount });
      setPurchaseAmount('');
      // Reload transactions
      api.get(`/api/points?userId=${user.id}`).then((d) => {
        if (d.transactions) setTransactions(d.transactions);
      });
    }
    setPurchasing(false);
  };

  const typeLabels: Record<string, string> = {
    PURCHASE: 'شراء',
    USAGE: 'استخدام',
    EARNING: 'كسب',
  };
  const typeColors: Record<string, string> = {
    PURCHASE: 'text-blue-600',
    USAGE: 'text-red-600',
    EARNING: 'text-emerald-600',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">النقاط</h2>
        <p className="text-gray-500 mt-1">إدارة النقاط والشراء</p>
      </div>

      <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
        <CardContent className="p-6 text-center">
          <Coins className="w-12 h-12 mx-auto mb-3 opacity-80" />
          <p className="text-4xl font-bold">{currentPoints}</p>
          <p className="text-lg opacity-80">نقطة</p>
          <p className="text-sm opacity-60 mt-2">كل عرض على طلب بيخصم نقطة واحدة</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            شراء نقاط
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[5, 10, 25, 50].map((amount) => (
              <Button
                key={amount}
                variant={purchaseAmount === String(amount) ? 'default' : 'outline'}
                className={purchaseAmount === String(amount) ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                onClick={() => setPurchaseAmount(String(amount))}
              >
                {amount} نقطة
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="عدد نقاط مخصص"
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(e.target.value)}
            />
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
              onClick={handlePurchase}
              disabled={purchasing || !purchaseAmount}
            >
              {purchasing ? '⏳' : 'شراء'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">سجل النقاط</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
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

// ============== MAIN APP ==============
function AppContent() {
  const { user, currentView, sidebarOpen, setSidebarOpen } = useAppStore();

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
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-30 px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            isAdmin ? 'bg-red-100' : isShop ? 'bg-blue-100' : 'bg-emerald-100'
          }`}>
            {isAdmin ? <Settings className="w-4 h-4 text-red-600" /> :
             isShop ? <Store className="w-4 h-4 text-blue-600" /> :
             <Truck className="w-4 h-4 text-emerald-600" />}
          </div>
          <span className="font-bold text-sm">{user.name}</span>
        </div>
        <div className="w-10" />
      </div>
      {/* Main content */}
      <main className="lg:mr-64 pt-16 lg:pt-0 p-4 lg:p-6 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

// Missing Send icon import replacement
function Send({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m22 2-7 20-4-9-9-4Z"/>
      <path d="M22 2 11 13"/>
    </svg>
  );
}

export default function Home() {
  return <AppContent />;
}

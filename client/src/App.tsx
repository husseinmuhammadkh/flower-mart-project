import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CreateUser from "@/pages/CreateUser";
import Login from "@/pages/Login";
import ProductPage from "@/pages/ProductPage"; 
import Checkout from "@/pages/Checkout"; 
import OrderSuccess from "@/pages/OrderSuccess";
import Profile from "./pages/Profile";
import AdminPage from "@/pages/Admin"; 
import AddProduct from "@/pages/AddProduct"; 
import About from "@/pages/About";
import TrackOrder from "@/pages/TrackOrder";

// --- مكون "الحارس" لحماية مسارات الأدمن ---
function AdminRoute({ path, component: Component }: { path: string, component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="flex justify-center pt-20">جاري التحقق...</div>;
  
  if (!user || user.role !== 'admin') {
    return <Redirect to="/" />;
  }

  return <Route path={path} component={Component} />;
}

function Router() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16"> 
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/add-user" component={CreateUser} />
          <Route path="/login" component={Login} />
          <Route path="/product/:id" component={ProductPage} /> 
          <Route path="/profile" component={Profile} />
          <Route path="/cart" component={Checkout} /> 
          <Route path="/checkout" component={Checkout} /> 
          <Route path="/about" component={About} />
          <Route path="/track-order" component={TrackOrder} />
          <Route path="/order/:id" component={OrderSuccess} />
          
          {/* مسارات الإدارة المحمية */}
          <AdminRoute path="/admin" component={AdminPage} />
          <AdminRoute path="/add-product" component={AddProduct} />

          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
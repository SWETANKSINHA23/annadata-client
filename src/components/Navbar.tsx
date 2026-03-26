import { Menu, X, ChevronDown, Download, UserPlus, Home, Users, Phone, Info, LogIn, LogOut, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState("");
  const { isAuthenticated, user, logout } = useAuth();

  // Handle scroll events for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleDropdown = (name: string) => {
    if (activeDropdown === name) {
      setActiveDropdown("");
    } else {
      setActiveDropdown(name);
    }
  };

  const handleMenuItemClick = () => {
    setIsOpen(false);
    setActiveDropdown("");
  };

  // Get role-specific dashboard URL
  const getDashboardUrl = () => {
    if (!user) return "/";
    
    switch (user.role) {
      case "farmer": return "/dashboard/farmer";
      case "vendor": return "/dashboard/vendor";
      case "consumer": return "/dashboard/consumer";
      case "admin": return "/admin/dashboard";
      default: return "/";
    }
  };

  // Render navigation links based on authentication and role
  const renderNavLinks = () => {
    if (!isAuthenticated()) {
      // Not logged in - show general links
      return (
        <>
          <Link 
            to="/about" 
            className="px-3 py-2 text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-100"
          >
            About
          </Link>
          <Link 
            to="/team" 
            className="px-3 py-2 text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-100"
          >
            Team
          </Link>
          <Link 
            to="/contact" 
            className="px-3 py-2 text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-100"
          >
            Contact
          </Link>
        </>
      );
    }

    // Logged in - show role-specific navigation
    if (user?.role === "farmer") {
      return (
        <>
          <Link 
            to="/dashboard/farmer" 
            className="px-3 py-2 text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-100"
          >
            Dashboard
          </Link>
          <Link 
            to="/dashboard/farmer/products" 
            className="px-3 py-2 text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-100"
          >
            My Products
          </Link>
          <Link 
            to="/dashboard/farmer/orders" 
            className="px-3 py-2 text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-100"
          >
            Orders
          </Link>
        </>
      );
    }

    if (user?.role === "vendor") {
      return (
        <>
          <Link 
            to="/dashboard/vendor" 
            className="px-3 py-2 text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-100"
          >
            Dashboard
          </Link>
          <Link 
            to="/dashboard/vendor/products" 
            className="px-3 py-2 text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-100"
          >
            My Products
          </Link>
          <Link 
            to="/marketplace" 
            className="px-3 py-2 text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-100"
          >
            Marketplace
          </Link>
          <Link 
            to="/dashboard/vendor/orders" 
            className="px-3 py-2 text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-100"
          >
            Orders
          </Link>
        </>
      );
    }

    if (user?.role === "consumer") {
      return (
        <>
          <Link 
            to="/dashboard/consumer" 
            className="px-3 py-2 text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-100"
          >
            Dashboard
          </Link>
          <Link 
            to="/marketplace" 
            className="px-3 py-2 text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-100"
          >
            Shop
          </Link>
          <Link 
            to="/vendors" 
            className="px-3 py-2 text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-100"
          >
            Nearby Vendors
          </Link>
          <Link 
            to="/checkout" 
            className="px-3 py-2 text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-100"
          >
            <ShoppingCart className="h-4 w-4 inline mr-1" />
            Cart
          </Link>
        </>
      );
    }

    // Default case
    return (
      <Link 
        to={getDashboardUrl()} 
        className="px-3 py-2 text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-100"
      >
        Dashboard
      </Link>
    );
  };

  // Render mobile navigation links
  const renderMobileNavLinks = () => {
    if (!isAuthenticated()) {
      // Not logged in - show general links
      return (
        <>
          <Link 
            to="/about" 
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={handleMenuItemClick}
          >
            <Info className="h-4 w-4 inline mr-2" />
            About
          </Link>
          
          <Link 
            to="/team" 
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={handleMenuItemClick}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Team
          </Link>
          
          <Link 
            to="/contact" 
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={handleMenuItemClick}
          >
            <Phone className="h-4 w-4 inline mr-2" />
            Contact
          </Link>
        </>
      );
    }

    // Farmer links
    if (user?.role === "farmer") {
      return (
        <>
          <Link 
            to="/dashboard/farmer" 
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={handleMenuItemClick}
          >
            Dashboard
          </Link>
          <Link 
            to="/dashboard/farmer/products" 
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={handleMenuItemClick}
          >
            My Products
          </Link>
          <Link 
            to="/dashboard/farmer/orders" 
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={handleMenuItemClick}
          >
            Orders
          </Link>
        </>
      );
    }

    // Vendor links
    if (user?.role === "vendor") {
      return (
        <>
          <Link 
            to="/dashboard/vendor" 
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={handleMenuItemClick}
          >
            Dashboard
          </Link>
          <Link 
            to="/dashboard/vendor/products" 
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={handleMenuItemClick}
          >
            My Products
          </Link>
          <Link 
            to="/marketplace" 
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={handleMenuItemClick}
          >
            Marketplace
          </Link>
          <Link 
            to="/dashboard/vendor/orders" 
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={handleMenuItemClick}
          >
            Orders
          </Link>
        </>
      );
    }

    // Consumer links
    if (user?.role === "consumer") {
      return (
        <>
          <Link 
            to="/dashboard/consumer" 
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={handleMenuItemClick}
          >
            Dashboard
          </Link>
          <Link 
            to="/marketplace" 
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={handleMenuItemClick}
          >
            Shop
          </Link>
          <Link 
            to="/vendors" 
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={handleMenuItemClick}
          >
            Nearby Vendors
          </Link>
          <Link 
            to="/checkout" 
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={handleMenuItemClick}
          >
            <ShoppingCart className="h-4 w-4 inline mr-1" />
            Cart
          </Link>
        </>
      );
    }

    // Default case - just dashboard link
    return (
      <Link 
        to={getDashboardUrl()} 
        className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
        onClick={handleMenuItemClick}
      >
        Dashboard
      </Link>
    );
  };

  // Render authentication buttons
  const renderAuthButtons = () => {
    if (!isAuthenticated()) {
      return (
        <>
          <Link to="/login" className="btn-secondary flex items-center">
            <LogIn className="w-4 h-4 mr-2" />
            Log In
          </Link>
          <Link to="/register" className="btn-primary flex items-center">
            <UserPlus className="w-4 h-4 mr-2" />
            Sign Up
          </Link>
        </>
      );
    }

    return (
      <button onClick={logout} className="btn-secondary flex items-center">
        <LogOut className="w-4 h-4 mr-2" />
        Log Out
      </button>
    );
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? "navbar-scrolled py-2" : "bg-white/50 backdrop-blur-md border-b border-gray-200 py-4"
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0 font-bold text-2xl text-primary">
            <Link to="/">Annadata</Link>
          </div>
          
          <div className="hidden md:flex space-x-1 lg:space-x-2">
            {renderNavLinks()}
          </div>
          
          <div className="hidden md:flex space-x-4">
            {renderAuthButtons()}
          </div>
          
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-gray-600 p-2 focus:outline-none"
              aria-expanded={isOpen}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X size={24} className="text-gray-800" />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-3 space-y-3 bg-white shadow-lg rounded-b-xl">
          {renderMobileNavLinks()}
          
          <div className="pt-2 space-y-3">
            {renderAuthButtons()}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

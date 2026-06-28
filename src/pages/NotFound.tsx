import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
      <div className="text-center">
        <h1 className="text-9xl font-black text-primary animate-pulse">404</h1>
        <p className="text-2xl font-bold mt-4 mb-8">Page Not Found</p>
        <Link 
          to="/" 
          className="px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/80 transition-all"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

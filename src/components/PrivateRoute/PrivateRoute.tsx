import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "../Skeleton";

const PrivateRoute = (WrappedComponent: any) => {
  return (props: any) => {
    const { isAuthenticated, isLoading, user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "auth" && !e.newValue) {
          logout();
          router.replace("/login");
        }
      };

      window.addEventListener("storage", handleStorageChange);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }, [logout, router]);

    if (isLoading) {
      return <Skeleton />;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return null;
    }

    const pathname = router?.pathname;

    if (pathname && pathname.includes("admin") && user?.role !== "admin") {
      router.replace(pathname.replace("admin", "editor"));
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default PrivateRoute;

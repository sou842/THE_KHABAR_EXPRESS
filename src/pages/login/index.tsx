import { useState, useEffect } from "react";
import ContributorForm from "@/components/ContributorForm";
import AuthForm from "@/components/AuthForm";
import { PenLine } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import Logo from "@/components/Logo";

const Index = () => {
  const [isContributor, setIsContributor] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleForm = () => {
    setMounted(false);
    setTimeout(() => {
      setIsContributor(!isContributor);
      setMounted(true);
    }, 300);
  };

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left Side - Branding */}
        <div className="md:w-1/2 bg-gradient-to-br from-accent/5 to-accent/10 p-8 md:p-8 lg:p-10 flex flex-col justify-between">
          <div>
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2"
            >
              <PenLine className="h-8 w-8 text-accent" />
              <Logo />
            </button>
          </div>

          <div className={`mt-12 md:mt-5`}>
            <blockquote className="font-serif text-2xl md:text-3xl lg:text-4xl text-balance leading-relaxed text-foreground max-w-lg">
              "The world is shaped by those who share their stories and
              insights."
            </blockquote>
            <p className="mt-6 text-muted-foreground font-medium">
              Join our community of thinkers, writers, and creators
            </p>

            <div className="mt-8 grid grid-cols-3 gap-x-4 gap-y-6 max-w-md">
              {[...Array(6)]?.map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-md bg-gradient-to-br ${
                    i % 2 === 0
                      ? "from-accent/20 to-accent/5"
                      : "from-primary/10 to-primary/5"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className={`mt-12 md:mt-10`}>
            <p className="text-sm text-muted-foreground">
              © {new Date()?.getFullYear()}The Khabar Express Publishing. All
              rights reserved.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 md:p-8 lg:p-10 flex items-center justify-center bg-white">
          <div className="w-full max-w-md">
            {mounted &&
              (isContributor ? (
                <ContributorForm onSwitch={toggleForm} />
              ) : (
                <AuthForm onSwitch={toggleForm} />
              ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Index;

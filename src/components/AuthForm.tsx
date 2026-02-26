import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowRight, Loader, Lock, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AuthFormProps {
  onSwitch: () => void;
}

const AuthForm = ({ onSwitch }: AuthFormProps) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      toast.error("Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto`}>
      <div className={`mb-6`}>
        <div className="inline-block bg-secondary text-muted-foreground px-3 py-1 rounded-full text-sm font-medium mb-2">
          Contributor Access
        </div>
        <h1 className="text-3xl font-serif font-semibold mb-2 text-balance">
          Welcome Back
        </h1>
        <p className="text-muted-foreground mb-6 text-balance">
          Sign in to continue your contribution journey with The Khabar Express.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className={`space-y-2`}>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 h-12 border-border/50 focus:border-accent"
            />
          </div>
        </div>

        <div className={`space-y-2`}>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 h-12 border-border/50 focus:border-accent"
            />
          </div>
        </div>

        <div className={`pt-2`}>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 h-12"
            disabled={isLoading}
          >
            {isLoading ? <Loader className="animate-spin" /> : "Sign In"}
          </Button>
        </div>

        <div className={`text-center pt-4`}>
          <button
            type="button"
            onClick={onSwitch}
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
          >
            Want to become a contributor?
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;

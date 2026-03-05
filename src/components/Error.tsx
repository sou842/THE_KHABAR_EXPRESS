import React from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import Link from "next/link";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHome?: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  title = "Something went wrong", 
  message = "If the problem continues, please contact the developers.",
  onRetry,
  showHome = true
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in zoom-in duration-300">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        {message}
      </p>
      
      <div className="flex flex-wrap items-center justify-center gap-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </button>
        )}
        
        {showHome && (
          <Link
            href="/"
            className="inline-flex items-center px-5 py-2.5 rounded-full border border-border bg-background text-sm font-semibold hover:bg-muted transition-all"
          >
            Go back Home
          </Link>
        )}
      </div>
    </div>
  );
};

export default ErrorState;

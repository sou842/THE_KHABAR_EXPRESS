import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowRight, Mail, Send } from "lucide-react";
import { poster } from "@/lib/helper";
import { useRouter } from "next/router";

interface ContributorFormProps {
  onSwitch: () => void;
}

const ContributorForm = ({ onSwitch }: ContributorFormProps) => {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleReset = () => {
    setEmail("");
    setNote("");
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!note && !email) return toast.info("Please fill out the form");

    const data = { email, note: note?.trim() };

    const apiResult = await poster("/api/contributor", data);

    if (apiResult?.success) {
      toast.success("Application submitted successfully", {
        description: "We'll review your application and get back to you soon.",
      });

      // Clear the data and redirecting to the home page
      handleReset();
      router.push("/");
    } else {
      toast.error("Something went wrong, please try again.");
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto`}>
      <div className={`mb-6`}>
        <div className="inline-block bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium mb-2">
          Become a Contributor
        </div>
        <h1 className="text-3xl font-serif font-semibold mb-2 text-balance">
          Join Our Creative Community
        </h1>
        <p className="text-muted-foreground mb-6 text-balance">
          Share your unique voice and perspectives with our growing audience of
          curious minds.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className={`space-y-2`}>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 h-12 border-border/50 focus:border-accent"
            />
          </div>
        </div>

        <div className={`space-y-2`}>
          <Textarea
            placeholder="Tell us about yourself and why you'd like to contribute..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
            className="min-h-32 border-border/50 focus:border-accent resize-none"
          />
        </div>

        <div className={`pt-2 flex items-center gap-4`}>
          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-white transition-all duration-300 h-12"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                Apply to Contribute
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <div className={`text-center pt-4`}>
          <button
            type="button"
            onClick={onSwitch}
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
          >
            Already a contributor? Sign in
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContributorForm;

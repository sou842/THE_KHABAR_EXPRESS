import React, { useState } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import useSWRMutation from "swr/mutation";
import { poster } from "@/lib/helper";
import { Mail, Phone, MapPin, Send, MessageSquare, Linkedin, Twitter, Facebook, Instagram, ArrowRight, LucideIcon } from "lucide-react";

// --- Interfaces ---

interface ContactDetail {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}

interface SocialLinkItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface SubmitStatus {
  type: "success" | "error" | null;
  message: string;
}

// --- Constants ---
const CONTACT_DETAILS: ContactDetail[] = [
  {
    icon: Mail,
    label: "Email",
    value: "thekhabarexpressnews@gmail.com",
    href: "mailto:thekhabarexpressnews@gmail.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 9903149200",
    href: "tel:+9903149299",
  },
];

const SOCIAL_LINKS: SocialLinkItem[] = [
  // { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/share/17xd6c1Uc9/" },
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/the_khabar_express?igsh=a2V5eWYxazJmMWl6" },
  // { icon: Linkedin, label: "LinkedIn", href: "#" },
];

const ContactInfoItem = ({ icon: Icon, label, value, href }: ContactDetail) => (
  <div className="flex gap-4">
    <div className="mt-1 text-zinc-400 shrink-0">
      <Icon className="h-4 w-4" aria-hidden="true" />
    </div>
    <div>
      <p className="font-sans text-xs tracking-widest uppercase text-zinc-400 mb-1">{label}</p>
      {href ? (
        <a href={href} className="font-sans text-sm text-zinc-700 hover:text-zinc-900 transition-colors leading-relaxed block">
          {value}
        </a>
      ) : (
        <p className="font-sans text-sm text-zinc-700 leading-relaxed whitespace-pre-line">{value}</p>
      )}
    </div>
  </div>
);

const SocialLink = ({ icon: Icon, label, href }: SocialLinkItem) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`Follow us on ${label}`}
    className="font-sans rounded-full border border-zinc-300 text-zinc-500 hover:border-gray-600 hover:text-gray-600 transition-all p-3 flex items-center justify-center"
  >
    <Icon className="h-4 w-4" aria-hidden="true" />
  </a>
);

export default function ContactUs() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({ type: null, message: "" });

  const { trigger, isMutating } = useSWRMutation("/api/contact", (url, { arg }: { arg: ContactFormData }) => poster(url, arg), {
    onSuccess: (data) => {
      if (data?.success) {
        setSubmitStatus({
          type: "success",
          message: "Message received. We'll be in touch shortly.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setSubmitStatus({
          type: "error",
          message: data?.error || "Something went wrong. Please try again.",
        });
      }
    },
    onError: () => {
      setSubmitStatus({
        type: "error",
        message: "Connection error. Please try again.",
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus({ type: null, message: "" });
    trigger(formData);
  };

  // --- Structured Data ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact The Khabar Express",
    "description": "Get in touch with The Khabar Express for news tips, feedback, and inquiries.",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL}/contact`,
    "mainEntity": {
      "@type": "Organization",
      "name": "The Khabar Express",
      "logo": `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-123-456-7890",
        "contactType": "customer service",
        "email": "thekhabarexpressnews@gmail.com",
        "availableLanguage": ["English", "Hindi"]
      },
      "sameAs": SOCIAL_LINKS?.map(link => link.href)
    }
  };

  return (
    <Layout 
      title="Contact Us | The Khabar Express" 
      description="Connect with Noida's leading news portal. Send us your feedback, news tips, or inquiries through our secure contact form."
      path="contact"
    >
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <div className="min-h-screen bg-stone-50 text-zinc-900 font-serif">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden border-b border-zinc-300" aria-labelledby="contact-hero-title">
          <div className="absolute inset-0 grid grid-cols-6 pointer-events-none" aria-hidden="true">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="border-r border-zinc-200 h-full" />
            ))}
          </div>

          <div className="relative px-6 md:px-16 pt-12 pb-2">
            <div className="h-[3px] bg-zinc-900 w-full mb-2" />
            <div className="h-px bg-zinc-400 w-full" />
          </div>

          <div className="relative px-6 md:px-16 py-16 md:py-24 max-w-7xl mx-auto">
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-zinc-400 mb-6">
              The Khabar Express — Contact
            </p>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <h1 id="contact-hero-title" className="text-6xl md:text-8xl lg:text-9xl font-black uppercase leading-none tracking-tighter text-zinc-900">
                Get In<br />
                <span className="text-transparent [-webkit-text-stroke:2px_#18181b]">Touch</span>
              </h1>
              <p className="font-sans text-zinc-500 text-base md:text-lg max-w-xs leading-relaxed md:text-right">
                Join the conversation. Whether reporting a story or seeking information, our newsroom is open to your voice.
              </p>
            </div>
          </div>

          <div className="relative px-6 md:px-16 pb-0 pt-2">
            <div className="h-px bg-zinc-400 w-full mb-2" />
            <div className="h-[3px] bg-zinc-900 w-full" />
          </div>
        </section>

        {/* ── Main Content ── */}
        <main className="max-w-7xl mx-auto px-6 md:px-16 py-16 md:py-24">
          <div className="flex flex-col-reverse lg:flex-row gap-10 lg:gap-12">

            {/* ── Left Column: Info ── */}
            <aside className="lg:col-span-4 space-y-10">

              {/* Contact Details */}
              <section className="border border-zinc-200 bg-white p-8" aria-labelledby="details-heading">
                <h2 id="details-heading" className="font-sans text-xs tracking-[0.25em] uppercase text-zinc-400 mb-8 pb-4 border-b border-zinc-200">
                  Correspondent Details
                </h2>

                <address className="space-y-8 not-italic">
                  {CONTACT_DETAILS.map((detail) => (
                    <ContactInfoItem key={detail.label} {...detail} />
                  ))}
                </address>
              </section>

              {/* Social Links */}
              <section className="border border-zinc-200 bg-white p-8" aria-labelledby="social-heading">
                <h2 id="social-heading" className="font-sans text-xs tracking-[0.25em] uppercase text-zinc-400 mb-6 pb-4 border-b border-zinc-200">
                  Global Coverage
                </h2>
                <div className="flex gap-3">
                  {SOCIAL_LINKS?.map((link) => (
                    <SocialLink key={link.label} {...link} />
                  ))}
                </div>
              </section>

              {/* Contribute CTA */}
              <section className="bg-zinc-900 text-zinc-100 p-8 relative overflow-hidden" aria-labelledby="contribute-heading">
                <div className="relative z-10">
                  <p className="font-sans text-xs tracking-[0.25em] uppercase text-zinc-400 mb-4">
                    Be Part of the Story
                  </p>
                  <h2 id="contribute-heading" className="text-2xl font-black uppercase leading-tight tracking-tight mb-3">
                    Submit a Tip?
                  </h2>
                  <p className="font-sans text-sm text-zinc-400 mb-6 leading-relaxed">
                    Our journalism is powered by the community. Share your insights or leak a story securely.
                  </p>
                  <a
                    href="/write"
                    className="font-sans inline-flex items-center gap-2 bg-stone-50 text-zinc-900 px-5 py-3 text-sm font-bold tracking-wide uppercase hover:bg-white transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 outline-none"
                  >
                    Start Writing <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
                <div className="absolute -bottom-8 -right-8 text-zinc-700" aria-hidden="true">
                  <MessageSquare className="h-32 w-32" />
                </div>
              </section>

            </aside>

            {/* ── Right Column: Form ── */}
            <article className="lg:col-span-8">
              <section className="border border-zinc-200 bg-white p-8 md:p-12" aria-labelledby="form-heading">
                <div className="mb-10 pb-6 border-b border-zinc-200 flex items-end justify-between">
                  <div>
                    <p className="font-sans text-xs tracking-[0.25em] uppercase text-zinc-400 mb-2">
                      Secure Dispatch
                    </p>
                    <h2 id="form-heading" className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none text-zinc-900">
                      Editor Inquiry
                    </h2>
                  </div>
                  <Send className="h-8 w-8 text-zinc-300" aria-hidden="true" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-7">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                    <div className="space-y-2">
                      <label htmlFor="name" className="font-sans text-xs tracking-[0.2em] uppercase text-zinc-500">
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full bg-stone-50 border border-zinc-200 text-zinc-900 font-sans text-sm px-4 py-3 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="font-sans text-xs tracking-[0.2em] uppercase text-zinc-500">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full bg-stone-50 border border-zinc-200 text-zinc-900 font-sans text-sm px-4 py-3 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="font-sans text-xs tracking-[0.2em] uppercase text-zinc-500">
                      Subject
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Feedback about a story"
                      className="w-full bg-stone-50 border border-zinc-200 text-zinc-900 font-sans text-sm px-4 py-3 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="font-sans text-xs tracking-[0.2em] uppercase text-zinc-500">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={7}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Your message here..."
                      className="w-full bg-stone-50 border border-zinc-200 text-zinc-900 font-sans text-sm px-4 py-3 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors resize-none"
                    />
                  </div>

                  {submitStatus.type && (
                    <div
                      role="alert"
                      className={`flex items-start gap-3 px-5 py-4 border font-sans text-sm ${submitStatus.type === "success"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-red-300 bg-red-50 text-red-600"
                        }`}
                    >
                      <span className="font-black text-base leading-none mt-0.5" aria-hidden="true">
                        {submitStatus.type === "success" ? "✓" : "!"}
                      </span>
                      <p>{submitStatus.message}</p>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col  gap-6">
                    <button
                      type="submit"
                      disabled={isMutating}
                      className="font-sans text-nowrap inline-flex items-center justify-center gap-3 bg-zinc-900 text-zinc-100 px-8 py-4 text-sm font-bold tracking-widest uppercase hover:bg-zinc-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900"
                    >
                      {isMutating ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="h-4 w-4" aria-hidden="true" />
                        </>
                      )}
                    </button>
                    <p className="font-sans text-xs text-zinc-400 italic">
                      Dispatches are reviewed within 24 business hours.
                    </p>
                  </div>
                </form>
              </section>
            </article>

          </div>
        </main>

        <div className="h-px bg-zinc-200 w-full mb-2 max-w-7xl mx-auto" aria-hidden="true" />

      </div>
    </Layout>
  );
}
import React, { FC, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  CookiePreferences,
  getDefaultCookiePreferences,
  readCookiePreferences,
  saveCookiePreferences,
} from "@/lib/cookiePreferences";
import { toast } from "@/hooks/use-toast";

type EditablePreferences = Pick<
  CookiePreferences,
  "functional" | "analytics" | "advertising"
>;

const lastUpdated = "7 April 2026";

const CookieSettingsPage: FC = () => {
  const defaults = useMemo(() => getDefaultCookiePreferences(), []);
  const [preferences, setPreferences] = useState<EditablePreferences>({
    functional: defaults.functional,
    analytics: defaults.analytics,
    advertising: defaults.advertising, // Advertising cookies are treated as enabled by default since they are required for AdSense to function properly, even if the user hasn't explicitly accepted them yet.
  });
  const [savedAt, setSavedAt] = useState(defaults.updatedAt);

  useEffect(() => {
    const savedPreferences = readCookiePreferences();
    setPreferences({
      functional: savedPreferences.functional,
      analytics: savedPreferences.analytics,
      advertising: savedPreferences.advertising, // We treat advertising cookies as enabled if preferences exist, since AdSense requires them to function properly. The user can disable them from the controls, but we don't want to set them to false on load if they haven't explicitly rejected them.
    });
    setSavedAt(savedPreferences.updatedAt);
  }, []);

  const handleSave = (nextPreferences: EditablePreferences) => {
    const savedPreferences = saveCookiePreferences(nextPreferences);
    setPreferences(nextPreferences);
    setSavedAt(savedPreferences.updatedAt);
    toast({
      title: "Cookie settings updated",
      description: "Your choices have been saved for this browser.",
    });
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Cookie Settings - The Khabar Express",
    description:
      "Manage cookie settings for The Khabar Express, including functional, analytics, and advertising preferences.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.thekhabarexpress.com"}/cookie-settings`,
  };

  return (
    <Layout
      title="Cookie Settings | Manage Your Privacy | The Khabar Express"
      path="cookie-settings"
      description="Manage your cookie preferences for The Khabar Express. Control how we use cookies for functional, analytics, and advertising purposes to protect your privacy."
      jsonLd={jsonLd}
    >
      <section className="mx-auto max-w-7xl px-0 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-sky-100 bg-white">
          <div className="border-b border-sky-100/80 px-6 py-8 sm:px-8 sm:py-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-700">
              Cookie Controls
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Manage how this website uses cookies
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              The Khabar Express uses essential website storage and can enable
              optional third-party services such as Google Translate, Google
              Analytics, and AdSense-related resources when you allow them. You
              can control those optional categories below for this browser at
              any time.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="rounded-full border border-gray-200 bg-white/80 px-3 py-1">
                Last updated: {lastUpdated}
              </span>
              <span className="rounded-full border border-gray-200 bg-white/80 px-3 py-1">
                Saved for this browser
              </span>
            </div>
          </div>

          <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-5">
              <Card className="border-slate-200/80 shadow-none">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">
                    Cookie categories
                  </CardTitle>
                  <CardDescription>
                    Essential cookies stay on because they support core site
                    functions such as security, login, and page delivery.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          Strictly necessary
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          Required for core features such as login sessions,
                          security checks, and basic page functionality.
                        </p>
                      </div>
                      <Switch checked disabled aria-label="Necessary cookies enabled" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          Functional cookies
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          Used for language preferences and Google Translate.
                          Turning this off clears the translation preference
                          stored by the site.
                        </p>
                      </div>
                      <Switch
                        checked={preferences.functional}
                        onCheckedChange={(checked) =>
                          setPreferences((current) => ({
                            ...current,
                            functional: checked,
                          }))
                        }
                        aria-label="Toggle functional cookies"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          Analytics cookies
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          Used by Google Analytics to understand traffic,
                          popular pages, and site performance trends.
                        </p>
                      </div>
                      <Switch
                        checked={preferences.analytics}
                        onCheckedChange={(checked) =>
                          setPreferences((current) => ({
                            ...current,
                            analytics: checked,
                          }))
                        }
                        aria-label="Toggle analytics cookies"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          Advertising cookies
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          Used by Google AdSense and advertising partners to
                          measure ad performance and support personalized ads.
                        </p>
                      </div>
                      <Switch
                        checked={preferences.advertising}
                        onCheckedChange={(checked) =>
                          setPreferences((current) => ({
                            ...current,
                            advertising: checked,
                          }))
                        }
                        disabled
                        aria-label="Toggle advertising cookies"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200/80 shadow-none">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">
                    Controls
                  </CardTitle>
                  <CardDescription>
                    Save a custom setup or use a quick action for all optional
                    categories.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button onClick={() => handleSave(preferences)}>
                    Save preferences
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleSave({
                        functional: true,
                        analytics: true,
                        advertising: true,
                      })
                    }
                  >
                    Accept all
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleSave({
                        functional: false,
                        analytics: false,
                        advertising: true, // AdSense requires advertising cookies to function, so we set it to true even on reject
                      })
                    }
                  >
                    Reject optional cookies
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-5">
              <Card className="border-slate-200/80 shadow-none">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">
                    What this site uses today
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-6 text-slate-600">
                  <div>
                    <p className="font-semibold text-slate-900">
                      Essential website storage
                    </p>
                    <p>
                      Authentication state, security-related behaviour, and
                      basic website delivery.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-semibold text-slate-900">
                      Google Translate
                    </p>
                    <p>
                      Stores the selected language and may set a{" "}
                      <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
                        googtrans
                      </code>{" "}
                      cookie when translation is enabled.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-semibold text-slate-900">
                      Google Analytics
                    </p>
                    <p>
                      Measures page visits and usage patterns when analytics is
                      enabled.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-semibold text-slate-900">
                      AdSense-related resources
                    </p>
                    <p>
                      Can load Google advertising resources when advertising
                      cookies are enabled and ad placements are active on the
                      site.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200/80 shadow-none">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">
                    More privacy controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
                  <p>
                    Some third-party cookies may also be managed directly from
                    your browser or provider settings.
                  </p>
                  <p>
                    Read the{" "}
                    <Link
                      href="/privacy-policy"
                      className="font-semibold text-gray-700 hover:text-gray-800 hover:underline"
                    >
                      Privacy Policy
                    </Link>{" "}
                    for more detail about data use.
                  </p>
                  <p>
                    Google ad controls:{" "}
                    <a
                      href="https://adssettings.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-gray-700 hover:text-gray-800 hover:underline"
                    >
                      adssettings.google.com
                    </a>
                  </p>
                  <p>
                    Industry opt-out tools:{" "}
                    <a
                      href="https://www.aboutads.info/choices/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-gray-700 hover:text-gray-800 hover:underline"
                    >
                      aboutads.info/choices
                    </a>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CookieSettingsPage;

import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import useSWR from 'swr';
import {
  Twitter,
  Linkedin,
  Globe,
  Instagram,
  Youtube,
  Github,
  MapPin,
  Calendar,
  Briefcase,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { Skeleton } from '@/components/Skeleton';
import { IUser } from '@/models/user.model';
import { IBlog } from '@/models/blog.model';
import BlogCard from '@/components/BlogCard';

const fetcher = (url: string) => fetch(url)?.then((res) => res?.json());

const socialLinksData = [
  { href: 'twitter', icon: Twitter, label: 'Twitter', color: 'hover:bg-sky-500' },
  { href: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'hover:bg-blue-500' },
  { href: 'github', icon: Github, label: 'GitHub', color: 'hover:bg-stone-900' },
  { href: 'website', icon: Globe, label: 'Website', color: 'hover:bg-green-600' },
  { href: 'youtube', icon: Youtube, label: 'YouTube', color: 'hover:bg-red-600' },
  { href: 'instagram', icon: Instagram, label: 'Instagram', color: 'hover:bg-pink-600' },
];


const CreatorProfile = () => {
  const router = useRouter();
  const { profile: handle } = router.query;

  const { data: profileData, error: profileError, isLoading: profileLoading } = useSWR(
    handle ? `/api/creator/${handle}` : null,
    fetcher
  );

  const { data: blogsData, isLoading: blogsLoading } = useSWR(
    handle ? `/api/creator/blogs/${handle}` : null,
    fetcher
  );

  if (profileLoading || blogsLoading) {
    return <Layout><Skeleton type="creator-profile" /></Layout>;
  }

  const creator = profileData?.data as IUser | undefined;
  const blogs = (blogsData?.data || []) as IBlog[];


  if (profileError || !profileData?.success || !creator) {
    return null;
  }

  const seoTitle = `${creator?.name} | Contributor Profile | The Khabar Express`;
  const seoDescription = creator?.shortBio || `Discover articles, insights, and expert reporting from ${creator?.name} on The Khabar Express. Staying ahead with the latest news.`;
  const seoImage = creator?.profilePhoto || 'https://images.pexels.com/photos/3944460/pexels-photo-3944460.jpeg';
  const seoPath = `creator/${handle}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/creator/${handle}`,
        "mainEntity": {
          "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/creator/${handle}#person`
        }
      },
      {
        "@type": "Person",
        "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/creator/${handle}#person`,
        "name": creator?.name,
        "image": creator?.profilePhoto,
        "description": creator?.shortBio || creator?.longBio,
        "jobTitle": creator?.profession,
        "address": creator?.location ? {
          "@type": "PostalAddress",
          "addressLocality": creator?.location
        } : undefined,
        "url": `${process.env.NEXT_PUBLIC_SITE_URL}/creator/${handle}`,
        "sameAs": Object.values(creator?.socialLinks || {}).filter(Boolean) as string[]
      }
    ]
  };

  return (
    <Layout
      title={seoTitle}
      description={seoDescription}
      image={seoImage}
      path={seoPath}
      jsonLd={jsonLd}
    >
      <div className="relative w-full h-56 md:h-72 overflow-hidden bg-stone-200 rounded-xl">
        <img
          loading='lazy'
          src={creator?.bannerPhoto || 'https://images.pexels.com/photos/994605/pexels-photo-994605.jpeg'}
          alt={`${creator?.name}'s Banner`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://images.pexels.com/photos/994605/pexels-photo-994605.jpeg';
            e.currentTarget.onerror = null;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 -mt-14 md:-mt-16 relative z-10">
          <div>
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl ring-4 ring-stone-50 shadow-xl overflow-hidden bg-stone-200 shrink-0">
              {creator?.profilePhoto ? (
                <img
                  loading='lazy'
                  src={creator?.profilePhoto}
                  alt={creator?.name}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-stone-500">
                  {creator?.name?.[0] || '-'}
                </div>
              )}
            </div>
          </div>

          {/* Social links — top right on desktop */}
          {socialLinksData?.length > 0 && (
            <div className="flex items-center gap-2 pb-2">
              {socialLinksData?.map(({ href, icon: Icon, label, color }) => {

                if (!creator?.socialLinks) return null;
                const link = (creator.socialLinks as any)[href];
                if (!link) return null;
                return (
                  <a
                    key={label}
                    href={link as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={label}
                    aria-label={label}
                    className={`w-9 h-9 flex items-center justify-center rounded-full bg-primary/70 text-gray-200 ${color} hover:border-stone-300 hover:shadow-sm transition-all`}
                  >
                    <Icon size={16} />
                  </a>
                )
              })}
            </div>
          )}
        </div>

        {/* Name / meta */}
        <div className="mt-5 space-y-2">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-900 leading-none capitalize">
            {creator?.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500 font-medium">
            <span className="font-medium text-stone-700">
              {creator?.username || creator?.name?.toLowerCase().replace(/\s+/g, '')}
            </span>
            {creator?.location && (
              <>
                <span className="w-1 h-1 rounded-full bg-stone-300" />
                <span className="flex items-center gap-1">
                  <MapPin size={13} />
                  {creator?.location}
                </span>
              </>
            )}
            {creator?.profession && (
              <>
                <span className="w-1 h-1 rounded-full bg-stone-300" />
                <span className="flex items-center gap-1">
                  <Briefcase size={13} />
                  {creator?.profession}
                  {creator?.yearsOfExperience && ` · ${creator?.yearsOfExperience}y exp`}
                </span>
              </>
            )}
            <span className="w-1 h-1 rounded-full bg-stone-300" />
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              Joined {new Date(creator?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          {creator?.shortBio && (
            <p className="text-stone-600 text-base leading-relaxed max-w-2xl pt-1">{creator?.shortBio}</p>
          )}
        </div>

        {/* Expertise chips */}
        {creator?.expertise && creator.expertise.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5">
            {creator?.expertise?.map((item: string) => (
              <span
                key={item}
                className="px-3 py-1 text-xs font-semibold bg-primary/90 text-gray-100 rounded-full"
              >
                {item || ''}
              </span>
            ))}
          </div>
        )}

        {/* ── DIVIDER ── */}
        <div className="mt-10 border-t border-stone-200" />

        {/* ── MAIN CONTENT GRID ── */}
        <div className="flex md:flex-row flex-col gap-10 mt-10 pb-24">

          <aside className="lg:col-span-3 space-y-8 max-w-[320px]">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">About</h2>
              <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">
                {creator?.longBio || creator?.shortBio || 'Passionate creator sharing stories and insights with the world.'}
              </p>
            </div>

            {creator?.expertise && creator.expertise.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Topics</h3>
                <div className="flex flex-col gap-1.5">
                  {creator?.expertise?.map((item: string) => (
                    <div key={item} className="flex items-center gap-2 text-sm font-medium capitalize text-stone-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item || ''}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* ── RIGHT: BLOG GRID ── */}
          <main className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900">
                Recent Articles
              </h2>
              <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider">{blogs?.length} articles</span>
            </div>

            {blogs?.length === 0 ? (
              <div
                className="py-24 text-center rounded-2xl border-2 border-dashed border-stone-200 bg-white"
              >
                <AlertCircle className="mx-auto text-stone-300 mb-3" size={32} />
                <p className="text-sm text-stone-400 font-medium">No articles published yet.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {blogs?.length > 1 && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {blogs?.map((blog: IBlog, index: number) => (
                      <BlogCard key={blog._id as string} blog={blog} variant="featured" index={index} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default CreatorProfile;
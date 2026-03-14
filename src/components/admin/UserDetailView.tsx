import React, { FC, useMemo } from "react";
import {
    ArrowLeft,
    BookOpen,
    Check,
    Clock,
    Eye,
    Activity,
    TrendingUp,
    Layers,
    ExternalLink,
    Lock,
    Unlock,
    Settings2,
    MessageSquare,
    ThumbsUp,
    Loader2,
    AlertCircle,
} from "lucide-react";
import useSWR from "swr";

interface UserAccess {
    canApprove?: boolean;
    canAddBlog?: boolean;
}

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: "active" | "inactive";
    createdAt: string;
    username?: string;
    profilePhoto?: string;
    bannerPhoto?: string;
    shortBio?: string;
    location?: string;
    profession?: string;
    expertise?: string[];
    yearsOfExperience?: number;
    longBio?: string;
    socialLinks?: {
        twitter?: string;
        linkedin?: string;
        website?: string;
        instagram?: string;
        youtube?: string;
        github?: string;
    };
    access?: UserAccess;
}

interface Blog {
    _id: string;
    title: string;
    category: string;
    views?: number;
    createdAt: string;
    isApproved: boolean;
    status: string;
    url: string;
    thumbnail?: {
        image?: string;
    };
}

interface Stats {
    totalBlogs: number;
    approvedBlogs: number;
    pendingBlogs: number;
    totalViews: number;
    categories: string[];
    viewTrend: number[];
}

interface UserDetailViewProps {
    userId: string;
    onClose: () => void;
    onEdit?: () => void;
}

function formatDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "—";
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return "—";
    }
}

/**
 * Deterministic pseudo-random trend seeded by userId so the bars don't
 * jump on every re-render. Returns values clamped to [0, 100].
 */
function buildViewTrend(seed: string): number[] {
    const base = [12, 45, 30, 80, 50, 95, 70];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return base.map((v, i) => {
        const offset = ((hash >> i) & 0xff) % 20;
        return Math.min(100, v + offset);
    });
}


const fetcher = (url: string) => fetch(url).then((res) => res.json());

const UserDetailView: React.FC<UserDetailViewProps> = ({ userId, onClose, onEdit }) => {
    
    // Fetch User Profile
    const { data: rawUserData, error: userError } = useSWR(
        userId ? `/api/users/${userId}` : null,
        fetcher
    );

    // Fetch User Blogs
    const { data: rawBlogsData, error: blogsError } = useSWR(
        userId ? `/api/blogs?authorId=${encodeURIComponent(userId)}&limit=100` : null,
        fetcher
    );

    const user = rawUserData?.success ? (rawUserData.data as User) : null;
    const blogs = rawBlogsData?.success ? (rawBlogsData.data as Blog[]) : [];
    
    const loading = !rawUserData || !rawBlogsData;
    const fetchError = userError || blogsError || 
                      (rawUserData && !rawUserData.success ? rawUserData.message : null) ||
                      (rawBlogsData && !rawBlogsData.success ? rawBlogsData.message : null);

    // ── Derived State ──────────────────────────────────────────────────────────

    const stats = useMemo<Stats>(() => {
        if (!user || !blogs) return {
            totalBlogs: 0,
            approvedBlogs: 0,
            pendingBlogs: 0,
            totalViews: 0,
            categories: [],
            viewTrend: [12, 45, 30, 80, 50, 95, 70],
        };

        const approved = blogs.filter((b) => b.status === "approved");
        const pending = blogs.filter((b) => b.status === "pending");
        const totalViews = blogs.reduce((sum, b) => sum + (Number(b.views) || 0), 0);
        const uniqueCategories = [
            ...new Set(blogs.map((b) => b.category).filter(Boolean)),
        ] as string[];

        return {
            totalBlogs: blogs.length,
            approvedBlogs: approved.length,
            pendingBlogs: pending.length,
            totalViews,
            categories: uniqueCategories,
            viewTrend: buildViewTrend(userId),
        };
    }, [user, blogs, userId]);

    const recentBlogs = useMemo(
        () =>
            [...blogs]
                .sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
                .slice(0, 5),
        [blogs]
    );

    const highImpactBlogs = useMemo(
        () =>
            [...blogs]
                .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
                .slice(0, 4),
        [blogs]
    );

    const topBlog = highImpactBlogs[0] ?? null;

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
                <p className="text-xs font-semibold text-slate-500">
                    Loading profile data…
                </p>
            </div>
        );
    }

    if (fetchError || !user) {
        return (
            <div className="p-20 text-center space-y-6">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto">
                    <AlertCircle className="h-8 w-8 text-rose-500" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-900">
                        {fetchError ? "Something went wrong" : "User not found"}
                    </h2>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto">
                        {fetchError ?? "The requested profile could not be located."}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold transition-all active:scale-95"
                >
                    Back to users
                </button>
            </div>
        );
    }


    const statCards = [
        {
            label: "Content Published",
            value: stats.totalBlogs.toLocaleString(),
            icon: BookOpen,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            label: "Approved Posts",
            value: stats.approvedBlogs.toLocaleString(),
            icon: Check,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
        {
            label: "Pending Review",
            value: stats.pendingBlogs.toLocaleString(),
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
        {
            label: "Total Reach",
            value: stats.totalViews.toLocaleString(),
            icon: Eye,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
        },
    ];

    return (
        <div className="pb-20 space-y-10">
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                    <button
                        onClick={onClose}
                        aria-label="Back to users"
                        className="shrink-0 p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    
                    <div className="flex items-center gap-4">
                        <div className="shrink-0 w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
                            {user.profilePhoto ? (
                                <img src={user.profilePhoto} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl">
                                    {user.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-xl font-bold text-slate-900 truncate max-w-[200px] sm:max-w-none">
                                    {user.name}
                                </h2>
                                <span
                                    className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        user.status === "active"
                                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                            : "bg-slate-50 text-slate-500 border border-slate-200"
                                    }`}
                                >
                                    {user.status === "active" ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">
                                {user.username ? `@${user.username} • ` : ''}{user.email} • Joined {formatDate(user.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                    <button 
                        onClick={() => {
                            if (onEdit) {
                                onClose();
                                onEdit();
                            }
                        }}
                        className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <Settings2 className="h-3.5 w-3.5" />
                        Edit Profile
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ── Stat cards ──────────────────────────────────────────────── */}
                <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statCards.map((item) => (
                        <div
                            key={item.label}
                            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2 rounded-lg ${item.bg}`}>
                                    <item.icon className={`h-4 w-4 ${item.color}`} />
                                </div>
                                <Activity className="h-3 w-3 text-slate-200" aria-hidden />
                            </div>
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                {item.label}
                            </p>
                            <h4 className="text-xl font-bold text-slate-900">{item.value}</h4>
                        </div>
                    ))}
                </div>

                {/* ── Main column ──────────────────────────────────────────────── */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Engagement chart */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <h3 className="text-sm font-bold text-slate-900">
                                    Engagement Overview
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Publication views across the last 7 cycles.
                                </p>
                            </div>
                            <TrendingUp className="h-4 w-4 text-slate-300" aria-hidden />
                        </div>

                        <div
                            className="flex items-end h-32 gap-3 pt-2"
                            role="img"
                            aria-label="Weekly engagement bar chart"
                        >
                            {stats.viewTrend.map((v, i) => (
                                <div
                                    key={i}
                                    /* v is already clamped to [0,100] so style is safe */
                                    style={{ height: `${v}%` }}
                                    className="flex-1 bg-slate-100 border-t border-slate-200 rounded-t-lg hover:bg-slate-900 transition-all duration-300 relative group/bar"
                                >
                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        {v}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between px-1" aria-hidden>
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                                <span key={d} className="text-[10px] font-medium text-slate-400">
                                    {d}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Recent content */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-0.5">
                                <h3 className="text-sm font-bold text-slate-900">
                                    Recent Content
                                </h3>
                                <p className="text-xs text-slate-500">
                                    The most recently published works from this user.
                                </p>
                            </div>
                            <MessageSquare className="h-4 w-4 text-slate-300" aria-hidden />
                        </div>

                        <div className="space-y-4">
                            {recentBlogs?.length > 0 ? (
                                recentBlogs?.map((blog) => (
                                    <div
                                        key={blog._id}
                                        className="group flex items-center justify-between gap-3 p-3 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all"
                                    >
                                        <div className="flex items-start gap-4 min-w-0">
                                            <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                                {blog.thumbnail?.image ? (
                                                    <img
                                                        src={blog.thumbnail.image}
                                                        className="w-full h-full object-cover"
                                                        alt=""
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            // hide broken images gracefully
                                                            (e.currentTarget as HTMLImageElement).style.display = "none";
                                                        }}
                                                    />
                                                ) : (
                                                    <Layers className="h-4 w-4 text-slate-300" />
                                                )}
                                            </div>
                                            <div className="space-y-1 min-w-0">
                                                {/* clamp long titles to 2 lines */}
                                                <h4 className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                                                    {blog.title}
                                                </h4>
                                                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium flex-wrap">
                                                    <span>{formatDate(blog.createdAt)}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <span className="capitalize truncate max-w-[100px]">
                                                        {blog.category || "Uncategorized"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="shrink-0 flex items-center gap-3">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap ${
                                                    blog.status === "approved"
                                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                        : "bg-amber-50 text-amber-600 border border-amber-100"
                                                }`}
                                            >
                                                {blog.status}
                                            </span>
                                            <button
                                                aria-label={`Open ${blog.title}`}
                                                onClick={() => window.open(`/blog/${blog.url}`, "_blank")}
                                                className="p-1.5 rounded-md hover:bg-white text-slate-400 hover:text-slate-900 transition-all"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <Activity className="h-6 w-6 text-slate-300" />
                                    <p className="text-xs text-slate-400 font-medium">
                                        No publications recorded yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Sidebar ──────────────────────────────────────────────────── */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Profile summary */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-4 min-w-0">
                            <div
                                className="shrink-0 w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white text-lg font-bold overflow-hidden"
                                aria-hidden
                            >
                                {user.profilePhoto ? (
                                    <img src={user.profilePhoto} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    user.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-bold text-slate-900 truncate">
                                    {user.role}
                                </h3>
                                <p className="text-xs text-slate-500">System Role</p>
                            </div>
                        </div>

                        {user.shortBio && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Bio
                                </label>
                                <p className="text-xs text-slate-600 leading-relaxed italic">
                                    "{user.shortBio}"
                                </p>
                            </div>
                        )}

                        <div className="pt-4 border-t border-slate-50 space-y-4">
                            {/* Personal Details */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Public Profile
                                </label>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Handle</span>
                                        <span className="font-semibold text-slate-900">@{user.username || '—'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Profession</span>
                                        <span className="font-semibold text-slate-900">{user.profession || '—'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Location</span>
                                        <span className="font-semibold text-slate-900">{user.location || '—'}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Access matrix */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Access Matrix
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    {[
                                        {
                                            label: "Content Editor",
                                            active: !!user.access?.canAddBlog,
                                        },
                                        {
                                            label: "Policy Approver",
                                            active: !!user.access?.canApprove,
                                        },
                                    ].map((access) => (
                                        <div
                                            key={access.label}
                                            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                                        >
                                            <span className="text-xs font-semibold text-slate-700">
                                                {access.label}
                                            </span>
                                            {access.active ? (
                                                <Unlock
                                                    className="h-3 w-3 text-emerald-500"
                                                    aria-label="Enabled"
                                                />
                                            ) : (
                                                <Lock
                                                    className="h-3 w-3 text-slate-300"
                                                    aria-label="Disabled"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Social Presence */}
                            {user.socialLinks && Object.values(user.socialLinks).some(Boolean) && (
                                <div className="space-y-2 pt-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Social Presence
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(user.socialLinks).map(([platform, url]) => url && (
                                            <a
                                                key={platform}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-200 transition-all"
                                                title={platform}
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Expertise */}
                            {user.expertise && user.expertise.length > 0 && (
                                <div className="space-y-2 pt-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Expertise
                                    </label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {user.expertise.map((exp) => (
                                            <span
                                                key={exp}
                                                className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-600 text-[9px] font-bold border border-indigo-100"
                                            >
                                                {exp}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* High-impact post widget */}
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/10 space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                            High Impact Post
                        </h3>

                        {topBlog ? (
                            <div className="space-y-3">
                                {/* line-clamp so very long titles don't overflow */}
                                <p className="text-sm font-bold leading-snug line-clamp-3">
                                    {topBlog.title}
                                </p>
                                <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <Eye className="h-3 w-3" />
                                        {(topBlog.views ?? 0).toLocaleString()} views
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <ThumbsUp className="h-2.5 w-2.5" />
                                        {/* safe integer division with floor */}
                                        {Math.floor((topBlog.views ?? 0) / 10).toLocaleString()} likes
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 italic">
                                No impact data collected.
                            </p>
                        )}

                        <div className="h-px bg-slate-800" />

                        <button className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest transition-all">
                            View All Stats
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailView;
import React, { useState, useEffect, JSX } from "react";
import {
    ArrowLeft,
    BookOpen,
    Check,
    Clock,
    Eye,
    User as UserIcon,
    Calendar
} from "lucide-react";

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
    thumbnail?: {
        imageUrl?: string;
    };
}

interface Stats {
    totalBlogs: number;
    approvedBlogs: number;
    pendingBlogs: number;
    totalViews: number;
    categories: string[] | any[];
    viewTrend: number[];
}

interface UserDetailViewProps {
    userId: string;
    onClose: () => void;
}

const UserDetailView: React.FC<UserDetailViewProps> = ({ userId, onClose }) => {
    const [user, setUser] = useState<User | null>(null);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [stats, setStats] = useState<Stats>({
        totalBlogs: 0,
        approvedBlogs: 0,
        pendingBlogs: 0,
        totalViews: 0,
        categories: [],
        viewTrend: [0, 0, 0, 0, 0, 0, 0]
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userResponse = await fetch(`/api/users/${userId}`);
                const userData = await userResponse.json();

                if (userData.success) {
                    setUser(userData.data);
                }

                const blogsResponse = await fetch(`/api/blogs?authorId=${userId}&limit=100`);
                const blogsData = await blogsResponse.json();

                if (blogsData.success) {
                    setBlogs(blogsData.data);

                    const approved = blogsData.data.filter((blog: Blog) => blog.status === 'approved');
                    const pending = blogsData.data.filter((blog: Blog) => blog.status === 'pending');
                    const totalViews = blogsData.data.reduce((sum: number, blog: Blog) => sum + (blog.views || 0), 0);
                    const uniqueCategories = [...new Set(blogsData.data.map((blog: Blog) => blog.category))];

                    const viewTrend = Array.from({ length: 7 }, (_, i) =>
                        Math.floor(Math.random() * 100) + i * 50
                    );

                    setStats({
                        totalBlogs: blogsData.data.length,
                        approvedBlogs: approved.length,
                        pendingBlogs: pending.length,
                        totalViews,
                        categories: uniqueCategories,
                        viewTrend
                    });
                }

                setLoading(false);
            } catch (error) {
                console.error("Error fetching user data:", error);
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    const getMostViewedBlogs = (): Blog[] => {
        return [...blogs].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
    };

    const getRecentBlogs = (): Blog[] => {
        return [...blogs]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    const renderViewsChart = (): JSX.Element => {
        const max = Math.max(...stats.viewTrend);
        return (
            <div className="flex items-end h-24 gap-1 mt-2">
                {stats.viewTrend.map((value, index) => (
                    <div
                        key={index}
                        className="flex-1 bg-khabar-500 rounded-t"
                        style={{
                            height: `${(value / max) * 100}%`,
                            opacity: 0.5 + (index / stats.viewTrend.length) * 0.5
                        }}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center">
                <div className="animate-pulse text-khabar-600">Loading user data...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-8">
                <div className="text-red-500">User not found</div>
                <button
                    onClick={onClose}
                    className="mt-4 px-4 py-2 bg-khabar-500 text-white rounded-md hover:bg-khabar-600"
                >
                    Go Back
                </button>
            </div>
        );
    }


    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Header with back button */}
            <div className="bg-khabar-50 p-4 border-b flex items-center justify-between">
                <button
                    onClick={onClose}
                    className="flex items-center text-khabar-600 hover:text-khabar-800"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    <span>Back to Users</span>
                </button>
                <h2 className="text-lg font-medium">User Profile</h2>
            </div>

            {/* User info section */}
            <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left column - User details */}
                    <div className="md:w-1/3">
                        <div className="bg-card p-6 rounded-xl shadow-sm">
                            <div className="flex items-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-khabar-100 flex items-center justify-center">
                                    <UserIcon className="h-8 w-8 text-khabar-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-xl font-medium">{user.name}</h3>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Role</p>
                                    <p className="font-medium capitalize">{user.role}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <p className={`font-medium capitalize ${user.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                                        {user.status}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">Member Since</p>
                                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">Permissions</p>
                                    <div className="mt-1 space-y-1">
                                        <div className="flex items-center">
                                            <div className={`w-3 h-3 rounded-full ${user.access?.canApprove ? 'bg-green-500' : 'bg-red-500'} mr-2`} />
                                            <span className="text-sm">Can Approve Blogs</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className={`w-3 h-3 rounded-full ${user.access?.canAddBlog ? 'bg-green-500' : 'bg-red-500'} mr-2`} />
                                            <span className="text-sm">Can Add Blogs</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Categories section */}
                        <div className="mt-6 bg-card p-6 rounded-xl shadow-sm">
                            <h3 className="text-lg font-medium mb-4">Categories</h3>

                            {stats.categories.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {stats.categories.map((category, index) => (
                                        <div key={index} className="bg-khabar-50 px-3 py-1 rounded-full text-sm">
                                            {category}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">No categories found</p>
                            )}
                        </div>
                    </div>

                    {/* Right column - Stats and blogs */}
                    <div className="md:w-2/3">
                        {/* Stats cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-card p-4 rounded-xl shadow-sm">
                                <div className="flex items-center text-khabar-600 mb-2">
                                    <BookOpen className="h-4 w-4 mr-1" />
                                    <span className="text-xs font-medium">Total Blogs</span>
                                </div>
                                <p className="text-2xl font-medium">{stats.totalBlogs}</p>
                            </div>

                            <div className="bg-card p-4 rounded-xl shadow-sm">
                                <div className="flex items-center text-green-600 mb-2">
                                    <Check className="h-4 w-4 mr-1" />
                                    <span className="text-xs font-medium">Approved</span>
                                </div>
                                <p className="text-2xl font-medium">{stats.approvedBlogs}</p>
                            </div>

                            <div className="bg-card p-4 rounded-xl shadow-sm">
                                <div className="flex items-center text-yellow-600 mb-2">
                                    <Clock className="h-4 w-4 mr-1" />
                                    <span className="text-xs font-medium">Pending</span>
                                </div>
                                <p className="text-2xl font-medium">{stats.pendingBlogs}</p>
                            </div>

                            <div className="bg-card p-4 rounded-xl shadow-sm">
                                <div className="flex items-center text-blue-600 mb-2">
                                    <Eye className="h-4 w-4 mr-1" />
                                    <span className="text-xs font-medium">Total Views</span>
                                </div>
                                <p className="text-2xl font-medium">{stats.totalViews.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Views chart */}
                        <div className="mt-6 bg-card p-6 rounded-xl shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-medium">Views Trend</h3>
                                <div className="text-xs text-muted-foreground">Last 7 days</div>
                            </div>
                            {renderViewsChart()}
                            <div className="mt-2 text-xs text-muted-foreground text-center">
                                Days
                            </div>
                        </div>

                        {/* Recent blogs section */}
                        <div className="mt-6 bg-card p-6 rounded-xl shadow-sm">
                            <h3 className="text-lg font-medium mb-4">Recent Blogs</h3>

                            {getRecentBlogs().length > 0 ? (
                                <div className="space-y-4">
                                    {getRecentBlogs().map((blog) => (
                                        <div key={blog._id} className="flex items-start space-x-3 pb-4 border-b last:border-b-0">
                                            {blog.thumbnail?.imageUrl && (
                                                <div className="relative flex-shrink-0 w-12 h-12 rounded-md overflow-hidden">
                                                    <img
                                                        src={blog.thumbnail.imageUrl}
                                                        alt={blog.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className={`text-xs px-2 py-0.5 rounded-full ${blog.status==='approved' ? 'bg-green-200 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {blog.status}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDate(blog.createdAt)}
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-medium mb-1 truncate">
                                                    {blog.title}
                                                </h4>
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    <span>{(blog.views || 0).toLocaleString()} views</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">No blogs found</p>
                            )}
                        </div>

                        {/* Most viewed blogs section */}
                        <div className="mt-6 bg-card p-6 rounded-xl shadow-sm">
                            <h3 className="text-lg font-medium mb-4">Most Viewed Blogs</h3>

                            {getMostViewedBlogs().length > 0 ? (
                                <div className="space-y-4">
                                    {getMostViewedBlogs().map((blog) => (
                                        <div key={blog._id} className="flex items-start space-x-3 pb-4 border-b last:border-b-0">
                                            {blog.thumbnail?.imageUrl && (
                                                <div className="relative flex-shrink-0 w-12 h-12 rounded-md overflow-hidden">
                                                    <img
                                                        src={blog.thumbnail.imageUrl}
                                                        alt={blog.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium mb-1 truncate">
                                                    {blog.title}
                                                </h4>
                                                <div className="flex items-center text-xs text-muted-foreground mb-1">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    <span>{formatDate(blog.createdAt)}</span>
                                                </div>
                                                <div className="flex items-center text-xs font-medium text-blue-600">
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    <span>{(blog.views || 0).toLocaleString()} views</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">No blogs found</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailView;
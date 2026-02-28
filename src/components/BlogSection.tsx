import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { getter, putter } from '@/lib/helper';
import Loading from '@/components/ui/loading';
import Error from '@/components/Error';
import BlogCard from './BlogCard';
import SearchInput from './SearchInput';
import SortDropdown from './SortDropdown';

const STATUS_BADGE: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
};

const BlogActionRow = ({ post, onDone }: { post: any; onDone: () => void }) => {
    const [loading, setLoading] = useState<'approved' | 'rejected' | null>(null);

    const handleAction = async (newStatus: 'approved' | 'rejected') => {
        setLoading(newStatus);
        try {
            const result = await putter(`/api/blogs/approve/${post._id}`, { status: newStatus });
            if (result?.success) {
                toast.success(
                    newStatus === 'approved'
                        ? `"${post.title}" approved successfully.`
                        : `"${post.title}" rejected.`
                );
                onDone();
            } else {
                toast.error('Action failed. Please try again.');
            }
        } catch {
            toast.error('Something went wrong.');
        } finally {
            setLoading(null);
        }
    };

    const canApprove = post.status !== 'approved';
    const canReject = post.status !== 'rejected';

    return (
        <div className="flex items-center gap-2 px-4 pb-3 pt-1">
            <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_BADGE[post.status] ?? 'bg-muted text-muted-foreground border-border'}`}>
                {post.status}
            </span>
            <div className="flex-1" />
            {canApprove && (
                <button
                    disabled={!!loading}
                    onClick={() => handleAction('approved')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 disabled:opacity-50 transition-colors"
                >
                    {loading === 'approved' ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <CheckCircle className="h-3.5 w-3.5" />
                    )}
                    Approve
                </button>
            )}
            {canReject && (
                <button
                    disabled={!!loading}
                    onClick={() => handleAction('rejected')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50 transition-colors"
                >
                    {loading === 'rejected' ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <XCircle className="h-3.5 w-3.5" />
                    )}
                    Reject
                </button>
            )}
        </div>
    );
};

const BlogSection = ({ status }: { status: string }) => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<'asc' | 'desc'>('desc');
    const limit = 5;

    const query = useMemo(() =>
        `/api/blogs/admin?status=${status}&page=${page}&limit=${limit}&search=${search}&sort=${sort}`,
        [status, page, search, sort]
    );

    const { data, error, isLoading, mutate } = useSWR(query, getter);

    if (isLoading) return <Loading />;
    if (error) return <Error />;

    return (
        <div className="bg-card rounded-xl shadow-sm overflow-hidden py-2">
            <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-medium capitalize">{status}</h3>
                <div className="flex gap-4">
                    <SearchInput value={search} onChange={setSearch} />
                    <SortDropdown value={sort} onChange={setSort} />
                </div>
            </div>
            <div className="divide-y">
                {data?.data?.length ? (
                    data?.data?.map((post: any) => (
                        <div key={post?._id}>
                            <BlogCard blog={post} variant='compact' />
                            <BlogActionRow post={post} onDone={() => mutate()} />
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        No blogs in this section
                    </div>
                )}
            </div>
            {data?.data?.length > 0 &&
                <div className='mb-6'>
                    <Pagination
                        currentPage={page}
                        totalPages={data?.totalPages || 1}
                        onPageChange={setPage}
                    />
                </div>
            }
        </div>
    );
};

export default BlogSection;

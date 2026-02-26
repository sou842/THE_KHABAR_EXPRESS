import { useState, useMemo } from 'react';
import useSWR from 'swr';
import Pagination from '@/components/Pagination';
import { getter } from '@/lib/helper';
import Loading from '@/components/ui/loading';
import Error from '@/components/Error';
import BlogCard from './BlogCard';
import SearchInput from './SearchInput';
import SortDropdown from './SortDropdown';

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
                        <BlogCard key={post._id} blog={post}
                            variant='compact'
                        />
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

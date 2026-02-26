import Layout from "../components/Layout";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {

    return (
        <Layout>
        <main className="flex-grow flex items-center justify-center pt-24 pb-24">
            <div className="container mx-auto px-4 animate-fade-in">
                <div className="max-w-md mx-auto text-center">
                    <h1 className="text-6xl font-serif font-medium mb-6">404</h1>
                    <h2 className="text-2xl font-medium mb-6">Page Not Found</h2>
                    <p className="text-foreground/70 mb-8">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </main>
        </Layout>
    );
};

export default NotFound;

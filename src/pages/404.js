import ErrorState from "../components/Error";
import Layout from "../components/Layout";

const NotFound = () => {
    return (
        <Layout 
            title="404 - Page Not Found | The Khabar Express"
            description="Oops! The page you are looking for doesn't exist. Head back to The Khabar Express homepage for the latest news and insights."
        >
            <div className="py-20">
                <ErrorState 
                    title="Page Not Found"
                    message="The page you're looking for doesn't exist or has been moved."
                    showHome={true}
                />
            </div>
        </Layout>
    );
};

export default NotFound;

import { NextPageContext } from "next";
import Layout from "@/components/Layout";
import ErrorState from "@/components/Error";

interface ErrorProps {
  statusCode: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <Layout>
      <main className="flex-grow flex items-center justify-center pt-24 pb-24">
        <div className="container mx-auto px-4">
          <ErrorState 
            title={statusCode ? `Error ${statusCode}` : "An error occurred"}
            message={
              statusCode === 404 
                ? "The page you are looking for does not exist." 
                : "An unexpected error occurred on the server. Please try again later."
            }
            onRetry={() => window.location.reload()}
          />
        </div>
      </main>
    </Layout>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;

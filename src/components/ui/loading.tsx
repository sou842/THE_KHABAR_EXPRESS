import { Loader2 } from "lucide-react";

const Loading: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="mt-4 text-lg text-gray-600">Loading, please wait...</p>
        </div>
    );
};

export default Loading;

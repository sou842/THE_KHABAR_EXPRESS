import React from "react";

const Error: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-semibold text-red-600">Something went wrong</h1>
      <p className="text-gray-700 mt-2">
        If the problem continues, please contact the developers.
      </p>
    </div>
  );
};

export default Error;

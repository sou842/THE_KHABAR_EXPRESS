import React from "react";
import { motion } from "framer-motion";

export type ContentProps = {
  type: "header" | "text";
  value: string;
};

export const ContentComponent: React.FC<any> = ({ contents }) => {
  return (
    <motion.div
      className="w-full flex justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50 min-h-screen"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="w-full max-w-4xl overflow-hidden p-8 sm:p-12 md:p-16">
        <div className="prose prose-lg prose-slate max-w-none">
          {contents &&
            contents?.map((content: ContentProps, index: number) => {
              if (content?.type === "header") {
                // First header should look like a main page title, others like section headers
                return index === 0 ? (
                  <h1
                    key={index}
                    className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-8 pb-6 border-b border-gray-100"
                  >
                    {content?.value}
                  </h1>
                ) : (
                  <h2
                    key={index}
                    className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800 mt-12 mb-6"
                  >
                    {content?.value}
                  </h2>
                );
              }
              if (content?.type === "text") {
                return (
                  <p
                    key={index}
                    className="text-gray-600 leading-relaxed mb-6 text-base sm:text-lg"
                  >
                    {content?.value}
                  </p>
                );
              }
              return null;
            })}
        </div>
      </div>
    </motion.div>
  );
};

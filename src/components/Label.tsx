interface LableProps {
  children: string;
  category: string;
}

const Label: React.FC<LableProps> = ({ children, category }) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technology: "bg-blue-100 text-blue-800",
      health: "bg-green-100 text-green-800",
      finance: "bg-purple-100 text-purple-800",
      politics: "bg-red-100 text-red-800",
      entertainment: "bg-pink-100 text-pink-800",
      sports: "bg-orange-100 text-orange-800",
    };

    return colors?.[category?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className={`w-fit category-tag ${getCategoryColor(category)}`}>
      {children}
    </div>
  );
};

export default Label;

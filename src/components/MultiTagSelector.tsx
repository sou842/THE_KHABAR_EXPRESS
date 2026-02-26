import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";

type SingleTagSelectProps = {
  category: string;
  setCategory: (type: string) => void;
  profileBar?: boolean;
  wrapCaterogy?: boolean;
  defaultCategory?: string[];
  setDefaultCategory?: (type: string[]) => void;
};

export const MultiTagEdit = (props: SingleTagSelectProps) => {
  const {
    category = "",
    setCategory,
    profileBar = false,
    wrapCaterogy = false,
    defaultCategory,
    setDefaultCategory,
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [addType, setAddType] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const selectcategory = (type: string) => {
    if (profileBar) {
      setCategory(type === category ? "" : type.toLowerCase());
    } else {
      const newType = type.toLowerCase();

      if (category !== newType) setCategory(newType);
      if (defaultCategory && !defaultCategory.includes(newType)) {
        setDefaultCategory?.([...defaultCategory, newType]);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && addType.trim()) {
      selectcategory(addType.trim());
      setAddType("");
      setIsOpen(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddType(e.target.value);
  };

  const getButtonStyle = (item: string): string => {
    const isActive = category === item.toLowerCase();
    if (isActive) {
      switch (item) {
        case "bugs":
          return "bg-orange-400 text-white";
        case "error":
          return "bg-red-500 text-white";
        default:
          return "bg-khabar-500 hover:bg-khabar-600 text-white";
      }
    }
    return "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300";
  };

  const availableTags = profileBar
    ? category
      ? [category]
      : []
    : defaultCategory;

  return (
    <div
      id="hide_scrollbar"
      className={`flex ${
        profileBar || wrapCaterogy ? "flex-wrap" : "flex-row rounded-3xl"
      } items-center gap-2 overflow-x-auto py-1`}
    >
      {availableTags?.map((item: string, index: number) => (
        <button
          key={index}
          onClick={() => selectcategory(item)}
          className={`px-4 py-2 rounded-full text-sm capitalize transition-all duration-200 cursor-pointer ${getButtonStyle(
            item
          )}`}
        >
          {item}
        </button>
      ))}

      {isOpen ? (
        <input
          ref={inputRef}
          type="text"
          value={addType}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type..."
          className="min-w-28 max-w-32 px-4 py-2 text-sm rounded-full bg-gray-100 text-gray-700 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 rounded-full text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-300"
        >
          +
        </button>
      )}
    </div>
  );
};

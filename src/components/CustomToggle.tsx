import React, { useState, useEffect } from "react";

type ToggleProps = {
  options: string[];
  className?: string;
  defaultValue?: string;
  onChange?: (selected: string) => void;
};

const CustomToggle: React.FC<ToggleProps> = (props) => {
  const { options, defaultValue, className, onChange } = props;
  const [selected, setSelected] = useState<string>(defaultValue || options[0]);

  useEffect(() => {
    onChange?.(selected);
  }, [selected, onChange]);

  return (
    <div className={`flex bg-transparent rounded-full overflow-hidden w-fit border border-foreground/30 p-0.5 ${className}`}>
      {options &&
        options?.map((option) => (
          <button
            key={option}
            onClick={() => setSelected(option)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full cursor-pointer capitalize ${
              selected === option
                ? "bg-foreground/80  text-white"
                : "bg-transparent text-gray-700"
            }`}
          >
            {option}
          </button>
        ))}
    </div>
  );
};

export default CustomToggle;

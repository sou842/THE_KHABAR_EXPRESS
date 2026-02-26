type SearchInputProps = {
    value: string;
    onChange: any;
};

const SearchInput = ({ value, onChange }: SearchInputProps) => (
    <input
        type="text"
        placeholder="Search..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
    />
);

export default SearchInput;
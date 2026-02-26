type SearchInputProps = {
    value: string;
    onChange: any;
};

const SortDropdown = ({ value, onChange }: SearchInputProps) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
    >
        <option value="desc">Newest</option>
        <option value="asc">Oldest</option>
    </select>
);
export default SortDropdown;
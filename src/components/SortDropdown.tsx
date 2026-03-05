type SortInputProps = {
    value: string;
    onChange: any;
};

const SortDropdown = ({ value, onChange }: SortInputProps) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-fit h-10 border bg-white rounded-lg px-3 py-1 text-sm"
    >
        <option value="desc">Newest</option>
        <option value="asc">Oldest</option>
    </select>
);
export default SortDropdown;
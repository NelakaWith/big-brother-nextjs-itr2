export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="border-b mb-4">
      <nav className="flex space-x-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={`px-3 py-2 -mb-px ${
              t === active
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>
    </div>
  );
}

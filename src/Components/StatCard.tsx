type StatCardProps = {
  title: string;
  value: number | string;
  subtitle?: string;
};

const StatCard = ({ title, value, subtitle }: StatCardProps) => {
  return (
    <div className="bg-white rounded-3xl shadow-md p-8 hover:shadow-lg transition">
      <p className="text-gray-400 uppercase tracking-wider text-sm mb-3">
        {title}
      </p>

      <h2 className="text-4xl font-bold">
        {typeof value === "number"
          ? value.toLocaleString()
          : value}
      </h2>

      {subtitle && (
        <p className="text-sm text-gray-500 mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;

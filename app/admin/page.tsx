export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Đơn hàng" value="120" />
        <StatCard title="Doanh thu" value="45.000.000đ" />
        <StatCard title="Sản phẩm" value="320" />
        <StatCard title="User" value="89" />
      </div>

      {/* CONTENT */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold mb-4">Hoạt động gần đây</h2>
        <p className="text-sm text-gray-500">(sau này gắn table / chart)</p>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

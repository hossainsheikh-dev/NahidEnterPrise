import React from "react";


const DashboardHome = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">
        Welcome back 👋
      </h1>

      <p className="text-gray-500 mt-2">
        Here's what's happening with your store today.
      </p>

      {/* Example Cards (optional) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm text-gray-500">Total Orders</h3>
          <p className="text-2xl font-semibold mt-2">1,245</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm text-gray-500">Total Products</h3>
          <p className="text-2xl font-semibold mt-2">320</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm text-gray-500">Total Users</h3>
          <p className="text-2xl font-semibold mt-2">890</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
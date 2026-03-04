import { useState } from "react";

const AdminProfile = () => {
  const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));
  const [name, setName] = useState(adminInfo?.name || "");
  const [email, setEmail] = useState(adminInfo?.email || "");

  const handleUpdate = () => {
    const updated = { ...adminInfo, name, email };
    localStorage.setItem("adminInfo", JSON.stringify(updated));
    alert("Profile updated successfully");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Profile</h2>

        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded-md"
            placeholder="Full Name"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded-md"
            placeholder="Email"
          />

          <button
            onClick={handleUpdate}
            className="w-full bg-indigo-600 text-white py-2 rounded-md"
          >
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
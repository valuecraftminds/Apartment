import React from 'react'

export default function CreateHouse({onClose,onCreated,apartment_id,floor_id}) {
  const [formData,setFormData] = useState({
    house_id:"",
    housetype_id:"",
  })

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-red-500">{error}</p>}

      <input
        type="text"
        name="house_id"
        value={formData.house_id}
        onChange={handleChange}
        className="border rounded p-2 text-black dark:text-white border-purple-600"
        required
        disabled
      />

      <input
        type="text"
        name="housetype_id"
        placeholder="Select house type"
        value={formData.housetype_id}
        onChange={handleChange}
        className="border rounded p-2 text-black dark:text-white border-purple-600"
        required
      />

      <input
        type="text"
        name="status"
        placeholder="Select Status"
        value={formData.status}
        onChange={handleChange}
        className="border rounded p-2 text-black dark:text-white border-purple-600"
        required
      />

      <input
        type="text"
        name="houseowner_id"
        placeholder="House owner"
        value={formData.houseowner_id}
        onChange={handleChange}
        className="border rounded p-2 text-black dark:text-white border-purple-600"
        required
      />

      <input
        type="text"
        name="family_id"
        placeholder="Family Details"
        value={formData.family_id}
        onChange={handleChange}
        className="border rounded p-2 text-black dark:text-white border-purple-600"
      />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  )
}

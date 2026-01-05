import React, { useState } from 'react';

const EducationForm = () => {
  const [formData, setFormData] = useState({
    degree: '',
    specialization: '',
    cgpa: '',
    year: '',
    certifications: ''
  });

  const [errors, setErrors] = useState({});

  const degrees = ["B.Tech", "M.Tech", "B.Sc", "MBA", "BCA"];
  const specializations = ["CSE", "ECE", "Mechanical", "Civil", "IT", "Finance"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    let newErrors = {};
    const currentYear = new Date().getFullYear();

    if (!formData.degree) newErrors.degree = "Degree is required.";
    if (!formData.specialization) newErrors.specialization = "Specialization is required.";
    if (!formData.cgpa || formData.cgpa < 0 || formData.cgpa > 10) newErrors.cgpa = "CGPA must be 0-10.";
    if (!formData.year || formData.year < 2000 || formData.year > currentYear + 5) newErrors.year = "Invalid year.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- THE NEW PART: Connecting to Backend ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // 1. Send data to the server
      const response = await fetch('http://localhost:5000/education/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      // 2. Handle Response
      if (response.ok) {
        alert("✅ Success! Data saved & preprocessed.");
        console.log("Server Response:", data);
        // Clear form
        setFormData({ degree: '', specialization: '', cgpa: '', year: '', certifications: '' });
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (err) {
      alert("❌ Failed to connect. Is the Server running?");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Education Details</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Degree */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Degree</label>
            <select name="degree" value={formData.degree} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
              <option value="">Select Degree</option>
              {degrees.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.degree && <p className="text-red-500 text-xs mt-1">{errors.degree}</p>}
          </div>

          {/* Specialization */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Specialization</label>
            <select name="specialization" value={formData.specialization} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
              <option value="">Select Specialization</option>
              {specializations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.specialization && <p className="text-red-500 text-xs mt-1">{errors.specialization}</p>}
          </div>

          {/* CGPA */}
          <div>
            <label className="block text-sm font-medium text-gray-700">CGPA</label>
            <input type="number" step="0.1" name="cgpa" value={formData.cgpa} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            {errors.cgpa && <p className="text-red-500 text-xs mt-1">{errors.cgpa}</p>}
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <input type="number" name="year" value={formData.year} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition">
            Save Details
          </button>
        </form>
      </div>
    </div>
  );
};

export default EducationForm;
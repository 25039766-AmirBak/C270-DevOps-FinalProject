import { useState } from "react";

function PostDonation() {
  const [formData, setFormData] = useState({
    foodName: "",
    quantity: "",
    location: "",
    expiryDate: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          foodName: formData.foodName,
          quantity: Number(formData.quantity),
          location: formData.location,
          expiryDate: formData.expiryDate
        })
      });

      if (!response.ok) {
        throw new Error("Failed to post donation");
      }

      setMessage("Donation posted successfully!");

      setFormData({
        foodName: "",
        quantity: "",
        location: "",
        expiryDate: ""
      });
    } catch (error) {
      console.error(error);
      setMessage("Failed to post donation. Please check your backend.");
    }
  };

  return (
    <div>
      <h1>Post Food Donation</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Food Name</label>
          <input
            type="text"
            name="foodName"
            value={formData.foodName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Quantity</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Expiry Date</label>
          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Post Donation</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default PostDonation;
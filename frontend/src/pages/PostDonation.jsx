import { useEffect, useState } from "react";

function PostDonation() {
  const [formData, setFormData] = useState({
    foodName: "",
    quantity: "",
    location: "",
    expiryDate: ""
  });

  const [donations, setDonations] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchDonations = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/donations");
      const data = await response.json();
      setDonations(data);
    } catch (error) {
      console.error("Failed to fetch donations:", error);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });

    setErrors({
      ...errors,
      [name]: ""
    });

    setMessage("");
  };

  const handleSubmit = async (event) => {
   event.preventDefault();

   const isValid = validateForm();

   if (!isValid) {
    setMessage("Please fix the errors before submitting.");
    return;
  }

   setIsLoading(true);
   setMessage("");

   try {
    const response = await fetch("http://localhost:5000/api/donations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        foodName: formData.foodName.trim(),
        quantity: Number(formData.quantity),
        location: formData.location.trim(),
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

    setErrors({});
    fetchDonations();
  } catch (error) {
    console.error(error);
    setMessage("Failed to post donation. Please check your backend.");
  } finally {
    setIsLoading(false);
  }
}; 
const validateForm = () => {
  const newErrors = {};

  const foodNameRegex = /^[A-Za-z\s]+$/;
  const quantityRegex = /^[1-9][0-9]*$/;
  const locationHasLetterRegex = /[A-Za-z]/;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedExpiryDate = new Date(formData.expiryDate);

  // Food Name validation
  if (!formData.foodName.trim()) {
    newErrors.foodName = "Food name is required.";
  } else if (formData.foodName.trim().length < 2) {
    newErrors.foodName = "Food name must be at least 2 characters.";
  } else if (!foodNameRegex.test(formData.foodName.trim())) {
    newErrors.foodName = "Food name cannot contain numbers or special characters.";
  }

  // Quantity validation
  if (!formData.quantity.trim()) {
    newErrors.quantity = "Quantity is required.";
  } else if (!quantityRegex.test(formData.quantity.trim())) {
    newErrors.quantity = "Quantity must contain numbers only and must be greater than 0.";
  }

  // Location validation
  if (!formData.location.trim()) {
    newErrors.location = "Location is required.";
  } else if (formData.location.trim().length < 3) {
    newErrors.location = "Location must be at least 3 characters.";
  } else if (!locationHasLetterRegex.test(formData.location.trim())) {
    newErrors.location = "Location cannot be numbers only.";
  }

  // Expiry Date validation
  if (!formData.expiryDate) {
    newErrors.expiryDate = "Expiry date is required.";
  } else if (selectedExpiryDate < today) {
    newErrors.expiryDate = "Expiry date cannot be before today.";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};
  return (
    <main className="page">
      <section className="hero-section">
        <div>
          <p className="eyebrow">SharePlate</p>
          <h1>Post Food Donation</h1>
          <p className="hero-text">
            Help reduce food waste by sharing surplus food with people who need it.
          </p>
        </div>
      </section>

      <section className="content-grid">
        <div className="form-card">
          <h2>Donation Details</h2>
          <p className="card-subtitle">
            Fill in the details below. New donations will be marked as Available.
          </p>

          <form onSubmit={handleSubmit} className="post-donation-form" noValidate>
            <label>
              Food Name
               <input
                 type="text"
                 name="foodName"
                 value={formData.foodName}
                 onChange={handleChange}
                 placeholder="Example: Chicken Rice"
                 className={errors.foodName ? "input-error" : ""}
              />
               {errors.foodName && <span className="error-text">{errors.foodName}</span>}
            </label>

            <label>
              Quantity
              <input
                type="text"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Example: 10"
                className={errors.quantity ? "input-error" : ""}
              />
              {errors.quantity && <span className="error-text">{errors.quantity}</span>}
            </label>

            <label>
              Location
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Example: RP Canteen"
                className={errors.location ? "input-error" : ""}
              />
              {errors.location && <span className="error-text">{errors.location}</span>}
            </label>

            <label>
              Expiry Date
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className={errors.expiryDate ? "input-error" : ""}
              />
              {errors.expiryDate && <span className="error-text">{errors.expiryDate}</span>}
            </label>

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Posting..." : "Post Donation"}
            </button>
          </form>

          {message && <p className="message">{message}</p>}
        </div>

        <div className="list-card">
          <h2>Recent Donations</h2>
          <p className="card-subtitle">
            Donations posted through your form will appear here.
          </p>

          <div className="donation-list">
            {donations.length === 0 ? (
              <p className="empty-text">No donations posted yet.</p>
            ) : (
              donations.slice(0, 5).map((donation) => (
                <div className="donation-item" key={donation._id}>
                  <div>
                    <h3>{donation.foodName}</h3>
                    <p>{donation.quantity} item(s)</p>
                    <p>{donation.location}</p>
                  </div>

                  <span className="status-badge">
                    {donation.status || "Available"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default PostDonation;
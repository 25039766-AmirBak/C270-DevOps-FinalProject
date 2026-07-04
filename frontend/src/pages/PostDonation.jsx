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
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

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

      fetchDonations();
    } catch (error) {
      console.error(error);
      setMessage("Failed to post donation. Please check your backend.");
    } finally {
      setIsLoading(false);
    }
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

          <form onSubmit={handleSubmit} className="post-donation-form">
            <label>
              Food Name
              <input
                type="text"
                name="foodName"
                value={formData.foodName}
                onChange={handleChange}
                placeholder="Example: Chicken Rice"
                required
              />
            </label>

            <label>
              Quantity
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Example: 10"
                min="1"
                required
              />
            </label>

            <label>
              Location
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Example: RP Canteen"
                required
              />
            </label>

            <label>
              Expiry Date
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                required
              />
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
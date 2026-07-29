import React from "react";

const DonationTable = ({ filteredDonations, setMessage }) => {

    const handleRequest = async (item) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/requests`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        foodName: item.foodName,
                        donationId: item._id,
                        quantityRemaining: item.quantity,
                        status: "Pending"
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Unable to submit request");
            }

            await response.json();

            setMessage(`${item.foodName} request submitted successfully!`);

        } catch (error) {

            console.error(error);

            alert("Unable to submit request.");

        }
    };

    return (
        <div className="donation-section">

            <h2 className="donation-title">
                Available Food Donations
            </h2>

            {filteredDonations.length === 0 ? (

                <p className="empty-donation">
                    No food donations available.
                </p>

            ) : (

                <div className="donation-grid">

                    {filteredDonations.map((item) => (

                        <div
                            key={item._id}
                            className="donation-card"
                        >

                            <h3>{item.foodName}</h3>

                            <p>
                                <strong>Quantity:</strong> {item.quantity}
                            </p>

                            <p>
                                <strong>Location:</strong> {item.location}
                            </p>

                            <p>
                                <strong>Status:</strong>{" "}

                                <span
                                    className={
                                        item.status === "Available"
                                            ? "status-available"
                                            : "status-unavailable"
                                    }
                                >
                                    {item.status}
                                </span>

                            </p>

                            <button
                                className="request-btn"
                                disabled={item.status !== "Available"}
                                onClick={() => handleRequest(item)}
                            >
                                {item.status === "Available"
                                    ? "Request Food"
                                    : "Unavailable"}
                            </button>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
};

export default DonationTable;
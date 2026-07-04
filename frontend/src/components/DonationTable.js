import React from "react";

const DonationTable = ({ filteredDonations, setMessage }) => {

    const handleRequest = async (item) => {

        try {

            const response = await fetch(
                "http://localhost:5000/api/requests",
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

            const data = await response.json();

            console.log(data);

            setMessage(`${item.foodName} request submitted successfully!`);

        } catch (error) {

            console.error(error);

            alert("Unable to submit request.");

        }

    };

    return (
        <div style={{ marginTop: "40px" }}>

            <h2
                style={{
                    textAlign: "center",
                    marginBottom: "30px",
                    color: "#2e7d32"
                }}
            >
                Available Food Donations
            </h2>

            {filteredDonations.length === 0 ? (
                <p style={{ textAlign: "center" }}>
                    No food donations available.
                </p>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(320px, 1fr))",
                        gap: "20px"
                    }}
                >
                    {filteredDonations.map((item) => (

                        <div
                            key={item._id}
                            style={{
                                background: "#fff",
                                borderRadius: "12px",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                padding: "20px",
                                borderTop: "5px solid #2e7d32"
                            }}
                        >
                            <h3
                                style={{
                                    marginTop: 0,
                                    color: "#2e7d32"
                                }}
                            >
                                {item.foodName}
                            </h3>

                            <p>
                                <strong>Quantity:</strong> {item.quantity}
                            </p>

                            <p>
                                <strong>Location:</strong> {item.location}
                            </p>

                            <p>
                                <strong>Status:</strong>{" "}
                                <span
                                    style={{
                                        color:
                                            item.status === "Available"
                                                ? "green"
                                                : "red",
                                        fontWeight: "bold"
                                    }}
                                >
                                    {item.status}
                                </span>
                            </p>

                            <button
                                disabled={item.status !== "Available"}
                                onClick={() => handleRequest(item)}
                                style={{
                                    backgroundColor:
                                        item.status === "Available"
                                            ? "#2E7D32"
                                            : "#999",

                                    color: "white",

                                    border: "none",

                                    padding: "10px 18px",

                                    borderRadius: "6px",

                                    cursor:
                                        item.status === "Available"
                                            ? "pointer"
                                            : "not-allowed",

                                    fontWeight: "bold",

                                    transition: "0.2s"
                                }}
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
const res = await API.post("/login", {
    email,
    password
});

// Store the token in localStorage, so user stays logged in even after refreshing the page
localStorage.setItem("token", res.data.token);

const token = localStorage.getItem("token");

//When making requests to protected routes, include the token in the Authorization header
API.get("/profile", {
    headers: {
        Authorization: `Bearer ${token}`
    }
});

//Remove token from localStorage on logout
localStorage.removeItem("token");
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

await API.post("/register", {
    name,
    email,
    password
});
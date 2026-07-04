const formData = new FormData();

formData.append("document",file);

await axios.post(
"/verification/upload",
formData,
{
headers:{
Authorization:`Bearer ${token}`
}
}
);
const API_URL = "http://127.0.0.1:5000"; // Colab ngrok URL
// const API_URL = " https://129a-34-125-102-213.ngrok-free.app"; // Colab ngrok URL

export const sendMessageToBackend = async (message) => {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) throw new Error("Server response error");

    const data = await response.json();
    return data.response; // response
  } catch (error) {
    console.error("API fail", error);
    return { error: "fail to request server" };
  }
};

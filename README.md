# 🚀 CSE156 Project

## ✨ Author

- **Seunghyuk Chang** ([GitHub](https://github.com/your-username))
- **Lina Battikha** 
- **Kurumi Kaneko**
- **Jiho Kim**
- **Shreya Velagala**

## 📌 Project Overview

This is a React-based project built with Vite. The project includes various components such as a chatbot, homepage, and styling using CSS. The main objective is to develop an interactive and user-friendly web application.

## 🛠 Technology Stack

- **Frontend:** React, JSX, CSS
- **Build Tool:** Vite
- **Package Manager:** npm

## 📦 Installation & Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/hyukychang/cse156_project.git
   cd cse156_project
   ```

2. **Install Dependencies:**

   ```
   pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib flask flask_cors
   ```

   ```bash
   npm install
   ```

3. **Set up Google Calendar API**

  1. go to https://console.cloud.google.com/
  2. select the project (if you don't have a project create new project)
  3. search the Google Calendar API and Enable
  4. check "External" in OAuth consent screen
  5. Then create credentials
  6. After you create your credentials click your add authorized redirect urls
  
  ```
  http://localhost:8080/
  http://127.0.0.1:8080/
  ```

4. **Start the Development Server (Google Colab Backend)**

  - Run the google colab on T4 GPU
  - copy the public url to backend.py
   
5. **Start the Development Server (VS Code Backend)**

   ```
   flask --app backend run
   ```

6. **Start the Development Server (Frontend):**
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```
📦 cse156_project
 ┣ 📂 node_modules
 ┣ 📂 public
 ┃ ┗ 📜 vite.svg
 ┣ 📂 src
 ┃ ┣ 📂 assets
 ┃ ┃ ┗ 📂 image
 ┃ ┃ ┃ ┣ 📜 homeicon.png
 ┃ ┃ ┃ ┣ 📜 moon.png
 ┃ ┃ ┃ ┗ 📜 sun.png
 ┃ ┣ 📂 screenshots
 ┃ ┃ ┣ 📜 UI1.png
 ┃ ┃ ┣ 📜 UI2.png
 ┃ ┃ ┣ 📜 UI3.png
 ┃ ┃ ┗ 📜 UI4.png
 ┃ ┣ 📜 App.jsx
 ┃ ┣ 📜 App.css
 ┃ ┣ 📜 Chatbot.jsx
 ┃ ┣ 📜 Chatbot.css
 ┃ ┣ 📜 ChatbotResponse.jsx
 ┃ ┣ 📜 ChatbotResponse.css
 ┃ ┣ 📜 Homepage.jsx
 ┃ ┣ 📜 Homepage.css
 ┃ ┣ 📜 main.jsx
 ┃ ┣ 📜 index.css
 ┣ 📜 .gitignore
 ┣ 📜 eslint.config.js
 ┣ 📜 index.html
 ┣ 📜 package.json
 ┣ 📜 package-lock.json
 ┣ 📜 vite.config.js
 ┗ 📜 README.md
```

## 🎨 Features

- 🌙 Dark Mode & Light Mode toggle
- 💬 Interactive Chatbot component
- 🏠 Homepage with navigation
- 🎨 Responsive design using CSS

## 📸 Screenshots

### 1️⃣ Homepage (Homepage.jsx, Homepage.css)

![Homepage](src/screenshots/U1.png)
![Homepage](src/screenshots/U2.png)

### 2️⃣ Chatbot Interface (Chatbot.jsx, Chatbot.css)

![Chatbot](src/screenshots/U3.png)
![Chatbot Response](src/screenshots/U4.png)

### 3️⃣ Chatbot Response Component (ChatbotResponse.jsx, ChatbotResponse.css)

![Chatbot Extra](src/screenshots/U5.png)

## 🤝 Contribution Guidelines

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License.

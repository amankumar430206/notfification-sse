````markdown
# Live Dashboard - Real-time Notifications with SSE

A simple, clean, and practical **Server-Sent Events (SSE)** based real-time notification dashboard built with Node.js and vanilla JavaScript (using Tailwind CSS via CDN).

Perfect for learning SSE with user-specific messaging.

---

## ✨ Features

- ✅ Real-time Server-Sent Events (SSE)
- ✅ User-specific notifications (`/events?userId=123`)
- ✅ Modern responsive Navbar
- ✅ Live notification count badge
- ✅ Beautiful centered Notifications Modal (Popup)
- ✅ Unread count tracking (resets when modal is opened)
- ✅ Send notifications to specific users
- ✅ Auto-connect on page load
- ✅ Clean and modern UI with Tailwind CSS
- ✅ No React / build tools required (pure CDN version)

---

## 🚀 Quick Start

### 1. Clone or Download the Project

### 2. Install Dependencies

```bash
npm install express cors
```
````

### 3. Run the Server

```bash
node server.js
```

Server will start at: **http://localhost:3000**

### 4. Open the Dashboard

Open your browser and go to:

→ **http://localhost:3000/dashboard-react.html**

---

## 📁 Project Structure

```
sse-notifications/
├── server.js                 # Node.js SSE backend
├── dashboard-react.html      # Main frontend (with navbar + modal)
├── public/                   # (optional) if using static serving
└── README.md
```

---

## 🛠️ How to Use

1. **Set your User ID** in the top right input (default: `123`)
2. Click **Connect** to start receiving live updates
3. Open multiple browser tabs with different User IDs to test user-specific notifications
4. Use the **Notifications** button in navbar to open the modal
5. Send notifications using the form inside the modal

**Note**: The red badge shows unread notifications.

---

## API Endpoints

| Method | Endpoint        | Description                         |
| ------ | --------------- | ----------------------------------- |
| GET    | `/events`       | SSE stream (requires `?userId=xxx`) |
| POST   | `/send-to-user` | Send notification to specific user  |

**Example POST body:**

```json
{
  "userId": "123",
  "message": "Your order has been shipped!",
  "type": "order"
}
```

---

## 🎯 Real-world Use Cases

- E-commerce order status updates
- Admin dashboards & alerts
- Live monitoring systems
- User activity feeds
- Notification systems

---

## 🧩 Future Enhancements (Ideas)

- Add JWT authentication
- Integrate Redis for multi-server scaling
- Add sound notification on new message
- Persist notifications in database
- Convert to full React + TypeScript version

---

## 📄 License

MIT License - Feel free to use this project for learning or production.

---

**Made with ❤️ for learning**

```

---

```

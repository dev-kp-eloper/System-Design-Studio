# 🌟 SysDesign Studio — Features & Example Demos Guide

This document is designed as a manual to help you understand every feature inside the SysDesign Studio application, what each component does, and how to showcase the project to others using 3 specific, ready-to-use example architectures.

---

## 🛠️ Part 1: Core Features & How to Use Them

### 1. The Interactive Canvas
* **What it does:** The main grid area where users design their architecture. It supports infinite panning and zooming. 
* **How to use it:** Click and drag components from the left sidebar (Component Palette) onto the grid. Select a component by clicking on it to see its details. Press `Backspace` or `Delete` to remove a selected component.

### 2. The Connection System (Edges)
* **What it does:** Defines how data flows from one component to another.
* **How to use it:** Hover over any component to reveal the "handles" (little dots on the sides). Click and drag from one component's handle to another's to create a solid line. *Important: The direction of the line matters! It dictates the direction the simulated request will travel.*

### 3. The Component Palette
This is your toolbox. Here is what every node does in real life and in our simulator:
* **Client:** The starting point of the simulation (represents a user's browser or mobile app).
* **API Gateway:** The front door of your system. It receives the client request, checks security, and routes it inside.
* **Load Balancer:** A traffic cop. If you have 3 identical servers, the Load Balancer distributes requests evenly between them so no single server crashes.
* **Service:** Your actual application code (e.g., a Login Service or an Order Service).
* **Database (PostgreSQL/MySQL):** Where permanent data is saved. (High latency/slow).
* **Cache (Redis/Memcached):** Fast, short-term memory. (Low latency/fast).
* **Kafka / Queue:** A background messenger. It accepts requests and processes them later, allowing the main request to finish instantly without waiting.
* **Auth Service:** Checks if a user's login token is valid.

### 4. Real-Time Simulation Playback
* **What it does:** Animates the data flow.
* **How to use it:** Once you connect your nodes, type a mock request (like `GET /users/123`) in the right sidebar and click **"Simulate"**. The backend calculates the path, and the boxes on your screen will light up step-by-step as the data travels. 

### 5. AI Architecture Review
* **What it does:** Grades the user's design.
* **How to use it:** Click the **"Review Architecture"** button. The app will calculate a score (0-100) based on deterministic rules (like looking for Single Points of Failure) and query OpenAI to provide intelligent recommendations.

---

## 🎬 Part 2: Example Demos to Showcase

If you are presenting this project to a recruiter, manager, or in an interview, build these 3 exact architectures on the canvas to demonstrate how the app works.

### 🏗️ Demo 1: The Basic Startup App (Simple & Flawed)
**The Setup:**
`Client` ➡️ `API Gateway` ➡️ `Service` ➡️ `Database`

**The Pitch to the Viewer:**
*"Here is a very standard, basic architecture that a startup might build on day one. A user makes a request, it hits our API Gateway, goes to our Node.js Service, and asks the Database for information. Let's hit **Simulate**."*

**What Happens:** 
The simulation highlights each box one by one. You will see that the Database takes a long time (high latency) to respond. 

**The AI Review:** 
If you click **Review Architecture**, the AI will flag a **Critical Warning**: *"Missing Cache layer."* It will explain that querying the database every single time is too slow, and it will also flag a **Single Point of Failure (SPOF)** because if that single Service crashes, the whole app goes down.

---

### 🚀 Demo 2: The High-Traffic E-Commerce App (Optimized)
**The Setup:**
`Client` ➡️ `Load Balancer`
`Load Balancer` ➡️ `Service A` (and also connect Load Balancer to `Service B`)
`Service A` & `Service B` ➡️ `Cache (Redis)`
`Cache` ➡️ `Database`

**The Pitch to the Viewer:**
*"Now let's design a system meant for Black Friday traffic. Instead of one server, we have a Load Balancer splitting traffic between two Services. Instead of going straight to the Database, our Services check a Redis Cache first. Let's hit **Simulate**."*

**What Happens:**
When you click simulate, the engine calculates a **Cache Hit / Miss**. 
* **If it's a Hit:** The simulation animation stops at the Cache, returns the data instantly, and total latency is very low (~20ms).
* **If it's a Miss:** The animation continues past the Cache to the Database, and the latency increases (~150ms). 

**The AI Review:**
The AI Reviewer will give this a very high score (90+), praising the high availability (two services) and the optimized read speeds (Cache layer).

---

### 📨 Demo 3: The Asynchronous Data Pipeline (Advanced)
**The Setup:**
`Client` ➡️ `API Gateway` ➡️ `Service` 
`Service` ➡️ `Database`
`Service` ➡️ `Kafka (Message Broker)` ➡️ `Notification Service (Worker)`

**The Pitch to the Viewer:**
*"Imagine a user uploads a video or places a massive order. We can't make the user wait on a loading screen for 5 minutes while we process the video or send confirmation emails. We use an asynchronous event-driven system. Let's watch how the simulator handles this."*

**What Happens:**
When you hit **Simulate**, the animation flows from the Client to the Service, and then to the Database. However, you will notice that the data sent to **Kafka** is treated as "Async". The main request successfully returns to the user *immediately*, while the Kafka event continues to travel to the Notification Service in the background. 

**The AI Review:**
The reviewer will validate this as a strong microservice pattern, noting that decoupling the Notification Service via Kafka prevents the main API from slowing down under heavy load.

# SysDesign Studio - Startup Instructions

To start the complete SysDesign Studio project locally, follow these steps. You will need 3 separate terminal windows.

## Prerequisites
- **Docker Desktop** must be installed and currently running.
- **Java 25 & Maven** installed.
- **Node.js** installed.

---

## Step 1: Start Infrastructure (PostgreSQL, Redis, Kafka)
Open a terminal in the root directory:
```bash
cd "C:\Users\deves\Desktop\LinkdinApplyAgent\System Design Studio"
docker compose up -d postgres redis zookeeper kafka
```
*(This starts the databases and messaging queues in the background. We only start these 4 services so we can run the API and Frontend natively for faster reloading).*

---

## Step 2: Start the Backend (Spring Boot)
Open a second terminal and navigate to the backend folder:
```bash
cd "C:\Users\deves\Desktop\LinkdinApplyAgent\System Design Studio"
.\start-backend.ps1
```
*(The backend will start on http://localhost:8080)*

---

## Step 3: Start the Frontend (React)
Open a third terminal and navigate to the frontend folder:
```bash
cd "C:\Users\deves\Desktop\LinkdinApplyAgent\System Design Studio\sysdesign-studio"
npm install
npm run dev
```
*(The frontend will start on http://localhost:5173)*

---

## Step 4: Running Tests

We have set up comprehensive automated tests for both the backend (RuleEngine) and frontend (UI components).

### 4.1 Run Backend Tests (JUnit 5)
Open a **PowerShell** terminal in the root project folder and run:
```powershell
cd "C:\Users\deves\Desktop\LinkdinApplyAgent\System Design Studio"
.\test-backend.ps1
```
* **Test Locations:**
  - `src/test/java/com/sysdesign/review/RuleEngineTest.java` (Deterministic architectural rule validations)
  - `src/test/java/com/sysdesign/review/AIReviewServiceTest.java` (LLM prompt creation, API mock/error responses, and score merging)
* **Verifies:** Deterministic rules, security compliance, API key fallback, and LLM parsing resilience.

### 4.2 Run Frontend Tests (Jest & React Testing Library)
Open a terminal in the frontend directory and run:
```bash
cd "C:\Users\deves\Desktop\LinkdinApplyAgent\System Design Studio\sysdesign-studio"
npm test
```
* **Test Location:** `src/components/ReviewPanel.test.tsx`
* **Verifies:** Render logic, empty canvas alerts, mock API callbacks, and issue lists.

---

### Alternative: Run everything entirely in Docker
If you just want to run the final production build without native hot-reloading, you can simply run:
```bash
cd "C:\Users\deves\Desktop\LinkdinApplyAgent\System Design Studio"
docker compose up --build
```
This will expose the app on **http://localhost:3000** and the API on **http://localhost:8080**.

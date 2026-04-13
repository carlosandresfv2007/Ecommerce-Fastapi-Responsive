### Bulevar Tienda Clone - Vanilla SPA E-commerce
## 🚀 Overview

This repository contains a full-stack e-commerce application designed as a near-exact, highly optimized replica of Bulevar Tienda. The project features a high-performance backend built with FastAPI and a lightweight, custom-built Single Page Application (SPA) frontend utilizing strictly Vanilla HTML, CSS, and JavaScript.

This project demonstrates how to build a scalable, component-based frontend architecture without the overhead of modern reactive frameworks like React or Vue.
🛠️ Tech Stack

    Backend: FastAPI (Python)

    Frontend: Vanilla JavaScript (ES6 Modules), HTML5, CSS3

    Architecture: Single Page Application (SPA)

## 🏗️ Frontend Architecture & Workflow

The frontend is engineered from scratch to operate as a fully functional SPA using native browser capabilities:

    Entry Point (index.html): The initial HTML payload is minimal. It acts as the shell and loads main.js as an ES6 module (<script type="module" src="main.js"></script>).

    Core Orchestration (main.js): This is the heart of the application. It bootstraps the UI by initializing reusable components and invoking the custom Router.

    Client-Side Routing (router.js): A custom routing engine intercepts URL changes and renders the appropriate view/page components dynamically without triggering a full page reload.

    Modular Styling: CSS is scoped and modular, without frameworks

## 🔐 API Integration & Authentication

Data binding and backend communication are handled through a centralized api service module:

    Stateless Fetching: Views and components call the api module to retrieve product data, categories, and user information dynamically.

    Authentication Flow: For endpoints requiring authorization (e.g., checkout, user profile), the api module intercepts the request, verifies the presence of an auth token in the browser's localStorage, and automatically attaches it to the HTTP headers.


## 📸 Screenshots

# Home (original site )
<img width="1365" height="603" alt="image" src="https://github.com/user-attachments/assets/9ee5d309-3bfe-4ec2-bfd5-182947b01fd9" />
<img width="1365" height="613" alt="image" src="https://github.com/user-attachments/assets/75b0282d-ffe6-46be-8b7c-e3fb47dd4340" />

# Home (MY SITE)
<img width="1365" height="611" alt="image" src="https://github.com/user-attachments/assets/654173d2-80f4-4a2f-a984-fc61f227c57e" />
<img width="1365" height="609" alt="image" src="https://github.com/user-attachments/assets/e3ad35d6-30f3-4ce4-a66e-f683d54d275c" />



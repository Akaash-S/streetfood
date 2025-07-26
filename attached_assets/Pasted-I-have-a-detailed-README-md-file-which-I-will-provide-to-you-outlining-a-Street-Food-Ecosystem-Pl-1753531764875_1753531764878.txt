I have a detailed README.md file (which I will provide to you) outlining a 'Street Food Ecosystem Platform'. This README.md specifies the project's introduction, features, the complete tech stack (React.js, Tailwind CSS, Framer Motion for frontend; Node.js, Express.js for backend; Supabase for database and storage; Firebase Authentication), project structure, high-level database schema, and API endpoints.

Your task is to build a foundational web application based on this README.md file.

Please provide the necessary code for the following:

Frontend (React.js):

A basic login/registration page that integrates with Firebase Authentication.

Placeholder dashboard pages for each user role (Vendor, Shop Owner, Delivery Agent) that display a simple "Welcome, [User Role]!" message after successful login.

Ensure the basic structure uses Tailwind CSS for styling and includes a simple Framer Motion animation (e.g., a fade-in effect on a page load or button click).

Include the Supabase client setup for future database interactions.

Backend (Node.js/Express.js):

An Express.js server setup.

Basic authentication routes (/api/auth/register, /api/auth/login) that interact with Firebase Admin SDK to verify user tokens (though full Firebase Admin SDK setup might be complex, focus on the Express route structure and a placeholder for token verification).

A simple protected route (e.g., /api/users/me) that returns the authenticated user's role.

Include the Supabase client setup for future database interactions.

Database (Supabase):

The SQL schema for the core tables mentioned in the README.md: users, retail_shops, products, orders, order_items, ratings, and delivery_requests. Provide this as a single SQL script that can be run in Supabase's SQL editor.

Important Considerations:

Follow the README.md: Adhere strictly to the tech stack and high-level descriptions provided in the README.md.

Modularity: Structure the code logically into components, pages, routes, etc., as suggested by the README.md's project structure.

Placeholders: For complex logic (like full order processing or real-time updates), provide clear placeholders or comments indicating where that logic would go. The goal is a runnable foundation.

Environment Variables: Clearly indicate where environment variables are needed.

Comments: Add comments to explain key parts of the code
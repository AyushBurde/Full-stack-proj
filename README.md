WANDERLUST
This project is a full-stack web application  where users can create, edit, and delete property listings. The project implements the Model-View-Controller (MVC) architecture and integrates various technologies for both frontend and backend development.

Technologies Used
Frontend: HTML, CSS, JavaScript
Backend: Node.js, Express.js
Database: MongoDB
Cloud Storage: Cloudinary (for image storage)
Authentication: Passport.js (for user authentication)
Session Management: Express-session (and MongoStore for deployment)

Key Features
1. User Authentication & Authorization
Users must sign up and log in before creating or managing their listings.
Authorization ensures users can only edit or delete their own listings, maintaining data integrity.

3. Create, Edit, & Delete Listings
Users can add property listings with images and descriptions.
Listings can be edited or deleted only by the user who created them.

5. Validations
User inputs are validated at multiple levels:
Server-Side: Validations for listing data (e.g., required fields like name, price, and description).
Image Uploads: Ensures only valid images are uploaded and securely stored.
Ownership Validation: Restricts users from modifying listings they do not own.

6. MVC Architecture
The project follows the Model-View-Controller pattern for a clean separation of concerns.
Model: Handles database operations (e.g., creating, editing, deleting listings).
View: The frontend interface, built with HTML, CSS, and JavaScript.
Controller: Contains the logic for processing user requests and interacting with the models.

7. Error Handling
Custom error handling is implemented using wrapAsync and ExpressError to catch asynchronous errors.
404 errors and other server issues are properly handled, ensuring the app doesn’t crash.
   
9. Session Management
Express-session is used to manage user sessions.
MongoStore is implemented to store sessions in MongoDB, specifically for deployment purposes.
10. Image Storage with Cloudinary
Cloudinary is integrated for image storage. When users upload images for listings, they are stored securely on Cloudinary.

User Flow
A user signs up and logs into the platform.
After authentication, the user can create a listing with details like property name, description, and images.
The system validates ownership before allowing edits or deletions.
Session management ensures a seamless user experience, even after login.
All asynchronous operations are wrapped using wrapAsync to avoid server crashes.
How It Works
Users can only create a listing if they are logged in.
Validation ensures data integrity:
.Backend validation prevents invalid or incomplete data submissions.
.Ownership validation ensures only the creator of a listing can modify or delete it.

Error handling is robust, managing both user and server-side errors effectively.

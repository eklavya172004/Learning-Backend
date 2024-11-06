# Blogging Website

A full-featured blogging platform built with Node.js, Express.js, MongoDB, and EJS, allowing users to create, edit, and manage blog posts in a secure environment.

Features
- User Authentication: Users must sign up and log in to create or interact with posts.
- Create and Manage Posts: Users can create blog posts with a title and description.
  - Users can edit and delete only their own posts.
- Like System: Registered users can like any post, but each user can only like a post once.
- Password Management:
  - **Forgot Password**: Users can reset their password via an email token. After receiving the token, they can enter it on the reset page to set a new password.
  - Update Password: Logged-in users can update their password directly from their profile.
  
Technologies Used
- Node.js and Express.js for server-side logic and API development
- MongoDB for data storage and management
- EJS for rendering dynamic templates on the frontend
- CSS for styling

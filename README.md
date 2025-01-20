# Webstack_Portfolio_Project


A backend-focused project showcasing the implementation of RESTful APIs and CRUD operations. This project also includes an admin dashboard prototype for data visualization, demonstrating extra effort beyond backend development.

## Features
- Backend APIs for user and data management.
- CRUD operations for seamless data interaction.
- Admin dashboard prototype to visualize backend data.

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MYSQL

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/samkiyya/Webstack_Portfolio_Project.git
   cd Webstack_Portfolio_Project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the application:
   ```bash
   npm run start # or
   npm run dev # to run in development mode
   ```

# API Documentation

## Admin

### Auth
- `POST /api/admin/login`: Admin Login
- `POST /api/admin/register`: Register a new admin
- `GET /api/admin/logout`: Admin Logout
- `GET /api/admin/verify`: Verify admin token

### Admin Management
- `GET /api/admin/get-all-admins`: Retrieve all admins
- `DELETE /api/admin/delete-admin/{id}`: Delete an admin account
- `PUT /api/admin/update-account`: Update admin account details
- `PUT /api/admin/update-role/{id}`: Update an admin's role
- `PUT /api/admin/change-password`: Change Admin Password
- `POST /api/admin/forget-password`: Request Password Reset
- `POST /api/admin/reset-password`: Reset Password

### Moderators & Profile
- `GET /api/admin/moderators`: Get all moderators
- `GET /api/admin/my-profile`: Get Admin Profile
- `GET /api/admin/my-referal`: Get the referral information of the logged-in admin

## User

### Auth
- `POST /api/user/register`: Register a new user
- `POST /api/user/login`: User login
- `POST /api/user/logout`: User Logout
- `GET /api/user/verify`: Verifies the current user's authentication status.
- `POST /api/user/verify/2fa`: Verifies two-factor authentication for a user.
- `POST /api/user/verify/account/{token}`: Verifies a user's account using a token.
- `POST /api/user/change-password`: Changes the user's password.
- `POST /api/user/forgot-password`: Initiates the password recovery process.
- `POST /api/user/reset-password/{token}`: Resets the user's password using a token.
- `POST /api/user/sendme-verification-email`: Sends a verification email to the user.
- `POST /api/user/toggle/2fa`: Toggles the user's two-factor authentication (2FA) status.
- `GET /api/user/my-profile`: Retrieves the authenticated user's profile.

## Book

### Management
- `POST /api/book/create`: Creates a new book entry.
- `GET /api/book/get-all`: Retrieves a list of all books.
- `GET /api/book/filter`: Filters and retrieves books based on search criteria.
- `GET /api/book/find/{id}`: Retrieves a book by its ID.
- `DELETE /api/book/delete/{id}`: Deletes a book by its ID.
- `PUT /api/book/update-status/{id}`: Updates the status of a book.
- `PUT /api/book/approve/{id}`: Approves a book.
- `PUT /api/book/reject/{id}`: Rejects a book.
- `PUT /api/book/update-book/{id}`: Update book details

### Special Retrieval
- `GET /api/book/most-sold`: Retrieves the most sold books.
- `GET /api/book/most-reviewed`: Retrieves the most reviewed books.
- `GET /api/book/top-rated`: Retrieves top-rated books.
- `GET /api/book/by-authors-id/{id}`: Retrieves books by author ID.
- `GET /api/book/approved-by-author-id/{id}`: Retrieves approved books by author ID.
- `GET /api/book/recommendations`: Retrieves book recommendations.

## Category

### Management
- `GET /api/category/get-all`: Get all categories
- `GET /api/category/by/{id}`: Get category by ID
- `POST /api/category/create`: Create a new category
- `DELETE /api/category/delete/{id}`: Delete a category
- `PUT /api/category/update/{id}`: Update category details

## Communication Management

- `POST /api/comm/create`: Create a communication record
- `GET /api/comm/get-all`: Get all communications
- `GET /api/comm/by/{id}`: Get communication by ID
- `PUT /api/comm/update/{id}`: Update a communication record
- `DELETE /api/comm/delete-from-user/{id}`: Delete a communication record from user
- `DELETE /api/comm/delete/{id}`: Delete a communication record
- `GET /api/comm/notagreed`: Get communications not agreed by the users
- `GET /api/comm/logged-author`: Get the logged-in author communication for book
- `PUT /api/comm/am-agreed/{id}`: Mark communication as agreed
- `PUT /api/comm/am-not-agreed/{id}`: Mark communication as not agreed

## Following Management

- `POST /api/following/follow`: Follow a user
- `POST /api/following/unfollow`: Unfollow a user
- `GET /api/following/followers/{id}`: Get followers of a user
- `GET /api/following/following/{id}`: Get users that the user is following
- `GET /api/following/myfollowers`: Get the authenticated user's followers
- `GET /api/following/amfollowing`: Get users authenticated user is following

## Levels Management

- `POST /api/levels/create`: Create a new level
- `GET /api/levels/get-all`: Get all levels
- `GET /api/levels/by/{id}`: Get a level by ID
- `PUT /api/levels/update/{id}`: Update an existing level
- `DELETE /api/levels/delete/{id}`: Delete a level

## Notifications Management

- `GET /api/notification/my`: Get my notifications
- `GET /api/notification/my/unread`: Get unread notifications
- `PUT /api/notification/mark-as-read/{id}`: Mark notification as read
- `GET /api/notification/all`: Get all notifications
- `GET /api/notification/by/{id}`: Get notification by ID
- `DELETE /api/notification/delete/{id}`: Delete notification

## Order Management

- `GET /api/order/get-all`: Get all orders
- `GET /api/order/by-id/{id}`: Get order by ID
- `POST /api/order/purchase/{id}`: Purchase an order
- `PUT /api/order/update-status/{id}`: Update order status
- `DELETE /api/order/delete/{id}`: Delete an order
- `GET /api/order/logged-user`: Get orders of the logged-in user
- `GET /api/order/approved-logged-user`: Get approved orders of the logged-in user
- `GET /api/order/for-book/{id}`: Get orders details for book by book id
- `GET /api/order/last7days-approved`: Get approved orders from the last 7 days
- `DELETE /api/order/delete-unapproved/{id}`: Delete an unapproved order
- `GET /api/order/approved-byuser/{id}`: Get approved orders by user ID
- `GET /api/order/byuser/{id}`: Get orders by user ID
- `GET /api/order/bystatus/{status}`: Get orders by status
- `GET /api/order/between`: Get all orders between two dates
- `GET /api/order/approved-between`: Get approved orders between two dates
- `GET /api/order/today`: Get orders placed today
- `GET /api/order/ordernumber/{orderNumber}`: Get orders placed in the last 7 days

## Promotion Management

- `POST /api/promotion/create`: Create a new promotion
- `GET /api/promotion/get-all`: Get all promotions
- `GET /api/promotion/by/{id}`: Get promotion by ID
- `PUT /api/promotion/update/{id}`: Update promotion by ID
- `DELETE /api/promotion/delete/{id}`: Delete promotion by ID

## Review Management

- `POST /api/review/create/{id}`: Create a review for a book
- `PUT /api/review/update/{id}`: Update a review
- `GET /api/review/get-all`: Get all reviews
- `DELETE /api/review/delete/{id}`: Delete a review by ID
- `GET /api/review/by-userid/{id}`: Get reviews by user ID
- `GET /api/review/by-bookid/{id}`: Get reviews for a book by book ID
- `GET /api/review/by/{id}`: Get a specific review by ID

## Sales Reports

- `GET /api/sales/books/reports/bybookid/{id}`: Get sales report by book ID
- `GET /api/sales/books/reports/logged-author`: Get sales report for logged author
- `GET /api/sales/books/reports/total-byauthorid/{id}`: Get total sales by author ID
- `GET /api/sales/books/reports/top-books`: Get top-selling books
- `GET /api/sales/books/reports/top-sellers`: Get top sellers
- `GET /api/sales/books/reports/top-buyer`: Get top buyers by total money they spent on books
- `GET /api/sales/books/reports/total`: Get total sales report
- `GET /api/sales/books/reports/last7days`: Get sales report for the last 7 days
- `GET /api/sales/books/reports/average`: Get average sales data
- `GET /api/sales/books/reports/last-month`: Get sales report for the last month
- `GET /api/sales/books/reports/last-year`: Get sales report for the last year
- `GET /api/sales/books/reports/this-month`: Get sales report for the current month
- `GET /api/sales/books/reports/this-year`: Get sales report for the current year

## Subscription Management

- `POST /api/subscription/create`: Create a new subscription
- `GET /api/subscription/get-all`: Get all subscriptions
- `GET /api/subscription/by/{id}`: Get subscription by ID
- `PUT /api/subscription/update/{id}`: Update a subscription
- `DELETE /api/subscription/delete/{id}`: Delete a subscription
- `GET /api/subscription/for-book/{id}`: Get subscription details for a book by book ID

## Subscription Order Management

- `GET /api/subscriptionorder/get-all`: Get all subscription orders
- `GET /api/subscriptionorder/by-id/{id}`: Get subscription order by ID
- `GET /api/subscriptionorder/status/{status}`: Get subscription orders by status
- `POST /api/subscriptionorder/place`: Place a subscription order
- `DELETE /api/subscriptionorder/delete/{id}`: Delete a subscription order
- `GET /api/subscriptionorder/logged-user`: Get subscription orders of logged user
- `GET /api/subscriptionorder/logged-user-status`: Get subscription orders by logged user status
- `GET /api/subscriptionorder/created-between`: Get subscription orders created between two dates


## Highlights
- Extra effort in building an admin dashboard prototype.
- Structured and maintainable codebase.
- Focus on backend development with added frontend features.
- Secure JWT authentication for role-based access control.
- Role management API for granular control over user access.

---

> **Author:** Samuel Aberra  
> **Repository:** [Webstack Portfolio Project](https://github.com/samkiyya/Webstack_Portfolio_Project)

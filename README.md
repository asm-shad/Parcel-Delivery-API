# 📦 Parcel Delivery API

## Project Overview
The Parcel Delivery API is a secure, modular, and role-based backend system for managing parcel delivery operations. Inspired by services like Pathao Courier and Sundarban, this Express.js application provides a comprehensive solution for users to register as senders or receivers and perform parcel delivery operations.
### Key Features
* 🔐 JWT-based authentication with secure password hashing

* 🎭 Role-based authorization (Admin, Sender, Receiver)

* 📦 Full parcel lifecycle management (creation, tracking, cancellation, delivery confirmation)

* 🔁 Embedded status history tracking for parcels

* 🧱 Modular code architecture with proper separation of concerns

* ✅ Comprehensive validation and business rules enforcement

* 📊 Advanced querying with filtering, sorting, and pagination
Use the package manager [pip](https://pip.pypa.io/en/stable/) to install foobar.

## Technology Stack
* Backend: Node.js, Express.js

* Database: MongoDB (with Mongoose ODM)

* Authentication: JWT (JSON Web Tokens)

* Password Hashing: bcryptjs

* Validation: Zod schema validation

* Testing: Postman (API testing)

## Setup and Environment Instructions

### Prerequisites
* Node.js v16+

* MongoDB Atlas account or local MongoDB instance

* Postman (for API testing)

### Installation Steps

1. Clone the repository:
```bash
https://github.com/asm-shad/Parcel-Delivery-API.git
cd parcel-delivery-api
```
2. Install dependencies:
```bash
npm install
```
3. Create a .env file in the root directory with the following variables:

```
PORT=5000
DB_URL=mongodb+srv://asmshad:asmshad@cluster0.celrb.mongodb.net/tour-db?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=development

# JWT
JWT_ACCESS_SECRET=access_secret
JWT_ACCESS_EXPIRES=1d
JWT_REFRESH_SECRET=refresh_secret
JWT_REFRESH_EXPIRES=30d

# BCRYPT
BCRYPT_SALT_ROUND=10

# SUPER ADMIN
SUPER_ADMIN_EMAIL=super@gmail.com
SUPER_ADMIN_PASSWORD=12345678

# Google
GOOGLE_CLIENT_ID=$$$
GOOGLE_CLIENT_SECRET=$$$
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Express Session
EXPRESS_SESSION_SECRET=express-session

# Frontend URL
FRONTEND_URL=http://localhost:5173
```
4. Run the application:

```
npm run dev
```
5. Seed the database with sample data:

```
npm run seed:parcels
```
## API Endpoints
### Base URL
``
http://localhost:5000/api
``
### Authentication Routes
| Method | Endpoint               | Description               | Access       |
|--------|------------------------|---------------------------|--------------|
| POST   | /auth/login            | User login                | Public       |
| POST   | /auth/refresh-token    | Get new access token      | Public       |
| POST   | /auth/logout           | User logout               | Authenticated|
| POST   | /auth/reset-password   | Reset password            | Authenticated|
| GET    | /auth/google           | Google OAuth authentication | Public    |
| GET    | /auth/google/callback | Google OAuth callback     | Public       |

### User Management Routes
| Method | Endpoint             | Description                | Access              |
|--------|----------------------|----------------------------|---------------------|
| POST   | /user/register       | Register a new user        | Public              |
| GET    | /user/all-users      | Get all users              | Admin, Super Admin  |
| PATCH  | /user/:id            | Update user information    | Authenticated       |
| PATCH  | /user/status/:id     | Update user status         | Admin, Super Admin  |
| GET    | /user/:id            | Get single user details    | Authenticated       |
| DELETE | /user/:id            | Delete a user              | Admin, Super Admin  |

### Parcel Management Routes
| Method | Endpoint                        | Description                 | Access              |
|--------|----------------------------------|-----------------------------|---------------------|
| POST   | /parcel/create                  | Create a new parcel         | Sender              |
| GET    | /parcel/my-parcels             | Get user's parcels          | Sender, Receiver    |
| PATCH  | /parcel/cancel/:id             | Cancel a parcel             | Sender              |
| GET    | /parcel/incoming-parcels       | Get incoming parcels        | Receiver            |
| PATCH  | /parcel/deliver/:id            | Confirm parcel delivery     | Receiver            |
| GET    | /parcel                        | Get all parcels             | Admin, Super Admin  |
| GET    | /parcel/:id                    | Get parcel details          | Authenticated       |
| PATCH  | /parcel/status/:id             | Update parcel status        | Admin, Super Admin  |
| GET    | /parcel/track/:trackingId      | Track parcel status         | Public              |

<img width="1570" height="1745" alt="flow_chart" src="https://github.com/user-attachments/assets/d4ceb5ca-3b76-4072-b830-f4a4c2be7dee" />


## Sample API Requests
### User Registration
```
POST /api/user/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "SENDER"
}
```
### Create Parcel
```
POST /api/parcel/create
Authorization: Bearer <sender_token>
Content-Type: application/json

{
  "title": "Laptop Package",
  "description": "MacBook Pro 16-inch",
  "type": "Electronics",
  "weightKg": 2.5,
  "fee": 35.99,
  "receiver": "receiver_id_here",
  "senderAddress": "123 Tech Street, San Jose, CA",
  "receiverAddress": "456 Innovation Drive, Austin, TX"
}
```
### Track Parcel (Public)
```
GET /api/parcel/track/TRK-20231001-123456
```
## Database Schema
### User Model
```
{
  name: string;
  email: string;
  password: string;
  role: UserRole; // SUPER_ADMIN, ADMIN, SENDER, RECEIVER
  isActive: IsActive; // ACTIVE, INACTIVE, BLOCKED
  isDeleted: boolean;
  auths: IAuthProvider[]; // Credentials or Google
}
```
### Parcel Model
```
{
  trackingId: string;
  title: string;
  description: string;
  type: string;
  weightKg: number;
  fee: number;
  sender: ObjectId;
  receiver: ObjectId;
  senderAddress: string;
  receiverAddress: string;
  currentStatus: ParcelStatus;
  trackingEvents: ITrackingEvent[];
  isBlocked: boolean;
  isCancelled: boolean;
  isDelivered: boolean;
}
```
## Business Rules
1. **Parcel Creation:**
   - Only senders can create parcels
   - Requires all mandatory fields
   - Generates unique tracking ID automatically

2. **Parcel Cancellation:**
   - Only sender can cancel
   - Only allowed if status is "Requested"

3. **Delivery Confirmation:**
   - Only receiver can confirm
   - Only allowed if status is "In Transit"

4. **Status Updates:**
   - Only admins can update status
   - Follows strict status transition rules


## Testing with Postman

1.  **Import the Postman Collection**

2.  **Set Environment Variables:**

- `base_url`: `http://localhost:5000/api`
- `admin_token`: Obtain from admin login
- `sender_token`: Obtain from sender login
- `receiver_token`: Obtain from receiver login

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch:
```
git checkout -b feature/AmazingFeature
```



#

Developed with ❤️ by **ASM Shad**

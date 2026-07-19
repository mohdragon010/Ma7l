# Ma7l (محل)

Ma7l is a modern, web-based Point of Sale (POS) and inventory management system designed to help small to medium businesses track sales, manage stock, and monitor analytics in real-time. 

Built with Next.js and MongoDB, it provides a fast, responsive, and Arabic-first interface tailored for local merchants.

## Features

- **Point of Sale (POS)**: A fast checkout interface with barcode scanner integration (both hardware scanners and device cameras via HTML5). Includes automatic stock deduction, discount calculations, and change tracking.
- **Thermal Receipt Printing**: Auto-generated 80mm receipts ready to be sent to thermal printers immediately after a sale.
- **Smart Inventory Management**: Add, edit, and organize products. Upload product images and categorize items for faster access.
- **Low-Stock Alerts**: A dedicated dashboard to track items that are running out of stock so you never miss a sale.
- **Sales Analytics**: Track daily revenue, net profit, and total invoices. View detailed transaction histories.
- **Secure Authentication**: JWT-based auth with encrypted passwords and email verification powered by Resend.
- **Responsive UI**: Built with Tailwind CSS and shadcn/ui, the dashboard works seamlessly on desktops, tablets, and mobile devices.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Database**: MongoDB (with native mongodb driver)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI, Lucide Icons
- **Authentication**: JWT, bcrypt
- **Email Delivery**: Resend
- **Scanner**: html5-qrcode

## Getting Started

### Prerequisites

You'll need Node.js installed and a MongoDB instance (local or Atlas). You will also need a Resend account for the email verification system to work.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MohAymann/Ma7l.git
   cd Ma7l
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables. Create a `.env.local` file in the root directory and add the following:
   ```env
   # Database connection
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/Ma7l?retryWrites=true&w=majority

   # Authentication secret (make this a long, random string)
   JSONWEBTOKEN_SECRET=your_super_secret_jwt_key_here

   # Resend API key for email verification
   RESEND_API_KEY=re_your_resend_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Notes for Production

- **HTTPS Requirement**: If you plan to use the device camera for barcode scanning, the application *must* be served over HTTPS. Browsers block camera access on unsecure HTTP connections (except for localhost).
- **Environment**: Ensure your production environment uses a strong `JSONWEBTOKEN_SECRET`.

## License

MIT

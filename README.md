# Ma7l (محل)

A modern, web-based Point of Sale (POS) and inventory management system designed to help small to medium businesses track sales, manage stock, and monitor analytics in real-time.

Built with **Next.js** and **MongoDB**, it provides a fast, responsive, and Arabic-first interface tailored for local merchants.

---

## ✨ Features

### Core POS Features
- **Point of Sale (POS)**: Fast checkout interface with integrated barcode scanning support
  - Hardware barcode scanner support
  - Device camera via HTML5 QR/Barcode scanning
  - Automatic stock deduction on checkout
  - Real-time cart management
  
- **Sales Records**: Complete invoice history with detailed breakdown
  - View all past transactions
  - Invoice details modal showing:
    - Product name and quantity
    - Unit price and total price
    - Discounts applied
    - Subtotal, tax calculations, and final balance
    - Payment status
    - Invoice timestamp
  - Filter and search transactions
  - Export invoice data (receipts)

### Inventory Management
- **Smart Inventory System**: Add, edit, and organize products
  - Upload and manage product images
  - Organize items by categories
  - Track stock levels in real-time
  
- **Low-Stock Alerts**: Dedicated dashboard widget to alert you when inventory is running low

### Analytics & Reports
- **Sales Dashboard**: Real-time insights including:
  - Total daily revenue
  - Net profit tracking
  - Total number of invoices
  - Revenue trends

- **Detailed Transaction History**: View complete sales records with filtering capabilities

### Technical Features
- **Thermal Receipt Printing**: Generate 80mm thermal receipts
  - Auto-generated after each sale
  - Ready to send directly to thermal printers
  - Includes all transaction details
  
- **Secure Authentication**: 
  - JWT-based authentication
  - Encrypted passwords with bcrypt
  - Email verification via Nodemailer
  
- **Responsive UI**: Fully responsive design
  - Seamless experience on desktops, tablets, and mobile devices
  - Built with Tailwind CSS and shadcn/ui components

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js (App Router) |
| **Database** | MongoDB |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui, Radix UI, Lucide Icons |
| **Authentication** | JWT + bcrypt |
| **Email Service** | Nodemailer |
| **Barcode Scanning** | html5-qrcode |
| **Printing** | Web Print API (Thermal 80mm) |

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher) and npm installed
- **MongoDB** instance (local or MongoDB Atlas)
- **Email account** for Nodemailer (Gmail, Outlook, or any SMTP provider)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/MohAymann/Ma7l.git
cd Ma7l
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory and add the following:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/Ma7l?retryWrites=true&w=majority

# JWT Secret (use a long, random string for production)
JSONWEBTOKEN_SECRET=your_super_secret_jwt_key_here_at_least_32_characters

# Nodemailer Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
SMTP_FROM_EMAIL=your_email@gmail.com
SMTP_FROM_NAME=Ma7l Store
```

#### Nodemailer Setup Guide

**For Gmail:**
1. Enable 2-Step Verification on your Google Account
2. Generate an App Password:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Navigate to "App passwords"
   - Select "Mail" and "Windows Computer"
   - Copy the generated 16-character password
3. Use this password as `SMTP_PASSWORD` in your `.env.local`

**For Other Providers (Outlook, Yahoo, etc.):**
- Replace `SMTP_HOST` and `SMTP_PORT` with your provider's SMTP details
- Use your email and password (or app-specific password if available)

**Common SMTP Providers:**
- **Gmail**: `smtp.gmail.com` (Port 587)
- **Outlook**: `smtp.office365.com` (Port 587)
- **Yahoo**: `smtp.mail.yahoo.com` (Port 587 or 465)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🖨️ Thermal Printer Setup

### Hardware Requirements
- 80mm thermal printer (USB or Network connected)
- Compatible with Epson, Star, or similar thermal printers

### Windows Setup
1. Install printer drivers from manufacturer
2. Add printer to Windows Settings → Devices → Printers
3. Set as default printer (recommended)
4. In Ma7l, receipts will print to the default printer

### macOS Setup
1. Go to System Preferences → Printers & Scanners
2. Add your thermal printer
3. Make it the default printer
4. Run `npm run dev` and test print

### Linux Setup
```bash
# Install CUPS (Common Unix Printing System)
sudo apt-get install cups

# Add printer
sudo lppadmin -p <printer_name> -v <printer_connection> -E -m drv:///sample.drv/generic.ppd
```

### Testing Print
1. Go to POS Dashboard
2. Complete a test transaction
3. Click "Print Receipt"
4. Verify output on printer

**Troubleshooting Print Issues:**
- Ensure printer is powered on and connected
- Check printer is set as default in system settings
- Verify browser has print permissions
- Try Print Preview first (Ctrl+P) to debug

---

## 🔒 Production Deployment

### Critical Security Requirements

1. **HTTPS Only**: If using device camera for barcode scanning, HTTPS is **mandatory**
   - Browsers block camera access on unsecure HTTP (except localhost)
   - Use SSL certificates (Let's Encrypt, AWS, etc.)

2. **Environment Variables**
   - Use strong, random `JSONWEBTOKEN_SECRET` (min 32 characters)
   - Never commit `.env.local` to version control
   - Store secrets securely (use environment manager like Vercel Secrets, AWS Secrets Manager)

3. **Database Security**
   - Use MongoDB Atlas with IP whitelisting
   - Enable authentication on MongoDB
   - Use connection strings with credentials

4. **Email Security**
   - Use app-specific passwords instead of account passwords
   - Enable 2-Factor Authentication on email account
   - Consider dedicated SMTP service for production (SendGrid, Mailgun)

### Deployment Platforms

**Vercel (Recommended for Next.js)**
```bash
npm install -g vercel
vercel login
vercel
```

**Heroku, Railway, Render**: Follow platform-specific Next.js deployment guides

---

## 🐛 Troubleshooting

### Email Verification Not Working

**Problem**: Emails not being sent during signup
- Check `SMTP_HOST`, `SMTP_PORT`, and `SMTP_USER` in `.env.local`
- Verify app-specific password (not your main password)
- Check email account has SMTP enabled
- Look for "Less secure app access" toggle if using Gmail

**Solution**:
```bash
# Test your SMTP connection
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});
transporter.verify((err, success) => {
  if (err) console.log('SMTP Error:', err);
  else console.log('SMTP Connection OK');
});
"
```

### Barcode Scanner Not Working

**Problem**: Camera not accessible or QR codes not scanning
- Ensure site is served over HTTPS
- Check browser permissions for camera access
- Grant camera permission when prompted
- Try different QR code format or brightness

**Solution**:
1. Open DevTools (F12)
2. Check Console for permission errors
3. Verify HTTPS in address bar
4. Test with a known good QR code

### Printer Not Printing

**Problem**: Receipt doesn't print or prints incorrectly
- Verify printer is online and has paper
- Check printer is set as default
- Test print from system settings first
- Check browser console for errors

**Solution**:
1. Disable popup blockers for localhost:3000
2. Try smaller receipt content (reduce items)
3. Check printer driver is up-to-date
4. Use browser Print Preview (Ctrl+P) to debug

### MongoDB Connection Error

**Problem**: "Cannot connect to MongoDB"
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist includes your IP
- Verify username/password are URL-encoded
- Ensure cluster is running

**Solution**:
```bash
# Test connection locally
mongosh "mongodb+srv://<user>:<password>@cluster.mongodb.net/Ma7l"
```

### Authentication Failing

**Problem**: Cannot log in or session expires
- Clear browser cookies
- Verify `JSONWEBTOKEN_SECRET` is set
- Check token expiration settings
- Ensure server restarted after env changes

---

## 🤝 Contributing

Found a bug or have a feature request? Open an issue on GitHub!

---

## 📝 License

This project is open source and available under the MIT License.

---

## 📞 Support

For issues, questions, or suggestions:
- Open an GitHub Issue
- Check existing documentation
- Review the troubleshooting section above

---

**Last Updated**: August 2026  
**Version**: 1.0.0
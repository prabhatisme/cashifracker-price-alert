
# 💰 CashiFracker - Cashify Product Price Tracker

A powerful web application that helps you track price drops on refurbished products from Cashify. Never miss a great deal again!

## 🎥 Demo Video

[![CashiFracker Demo](https://img.youtube.com/vi/RRXKS3itN0Y/0.jpg)](https://youtu.be/RRXKS3itN0Y)

Watch the full demo: [https://youtu.be/RRXKS3itN0Y](https://youtu.be/RRXKS3itN0Y)

## ✨ Features

### 🔍 Smart Product Tracking
- **Easy URL Input**: Simply paste any Cashify product link to start tracking
- **Real-time Price Monitoring**: Automated hourly price checks
- **Price History**: Track lowest and highest prices over time
- **Custom Price Alerts**: Set your desired price point and get notified

### 📧 Email Notifications
- **Instant Alerts**: Get notified immediately when prices drop below your target
- **Test Notifications**: Send test emails to verify your alert setup
- **Beautiful Email Templates**: Professional-looking price alert emails

### 🛡️ Secure & Personal
- **User Authentication**: Secure login with Supabase Auth
- **Private Tracking**: Your tracked products are completely private
- **Row Level Security**: Database-level security ensures data isolation

### 📱 Modern Interface
- **Responsive Design**: Works perfectly on desktop and mobile
- **Real-time Updates**: See changes instantly without page refreshes
- **Intuitive Dashboard**: Clean, organized view of all your tracked products

## 🖼️ Screenshots

### Dashboard Overview
![Dashboard](public/lovable-uploads/1349570e-defd-4664-8644-ef0ca008cae0.png)

*Main dashboard showing tracked products with price history, alerts, and last checked status*

### Product Tracking Dialog
![Track Product Dialog](public/lovable-uploads/2116fcc7-de1b-4f68-b7e3-ca7ab4657aa6.png)

*Easy product tracking setup with custom price alert configuration*

### Email Notification Example
![Email Notification](public/lovable-uploads/55abe79a-423c-4b1c-815a-c74989b3a740.png)

*Professional email alert when your target price is reached*

## 🚀 Getting Started

### Prerequisites

- Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Supabase account for backend services

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching

### Backend & Services
- **Supabase** - Backend-as-a-Service
  - Authentication
  - PostgreSQL Database
  - Real-time subscriptions
  - Edge Functions
  - Cron Jobs
- **Edge Functions** - Serverless functions for:
  - Web scraping Cashify products
  - Price monitoring
  - Email notifications

### Key Libraries
- **Lucide React** - Beautiful icons
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Cheerio** - Server-side HTML parsing
- **Date-fns** - Date manipulation

## 🔧 How It Works

### 1. Product Tracking Setup
- User pastes a Cashify product URL
- System scrapes product details (name, price, image, etc.)
- User sets a custom price alert threshold
- Product is saved to user's private tracking list

### 2. Automated Price Monitoring
- Cron job runs every hour (`price-monitor-hourly`)
- Scrapes current prices for all tracked products
- Updates price history and statistics
- Triggers email alerts when prices drop below thresholds

### 3. Price History & Analytics
- **Current Price**: Latest scraped price
- **Lowest Price**: Historically lowest price seen
- **Highest Price**: Historically highest price seen
- **Discount**: Percentage off from original price
- **Last Checked**: Timestamp of last price check

### 4. Email Notifications
- Automatic alerts when target price is reached
- Manual test notifications to verify setup
- Professional email templates with product images
- Includes direct links to purchase

## 📊 Database Schema

### `tracked_products`
- User's tracked products with current pricing
- Price alert thresholds
- Product metadata (name, image, URL)

### `price_history`
- Historical price data for trend analysis
- Timestamps for price changes
- Linked to tracked products

### Row Level Security (RLS)
- Users can only access their own data
- System functions can update all records
- Complete data isolation between users

## 🔐 Security Features

- **Authentication**: Secure user login/logout
- **Row Level Security**: Database-level access control
- **Data Isolation**: Each user's data is completely private
- **Secure APIs**: All API calls are authenticated
- **Input Validation**: Zod schemas validate all inputs

## 🚀 Deployment

### Quick Deploy with Lovable
1. Open your [Lovable Project](https://lovable.dev/projects/d816e44f-0de9-4796-bf6f-9046b67da51f)
2. Click **Share** → **Publish**
3. Your app will be live at `yourapp.lovable.app`

### Custom Domain
1. Navigate to **Project** → **Settings** → **Domains**
2. Click **Connect Domain**
3. Follow the setup instructions

*Note: Custom domains require a paid Lovable plan*

## 🔮 Future Improvements

- [ ] **Multi-platform Support**: Track products from Amazon, Flipkart, and other retailers
- [ ] **Advanced Filtering**: Filter products by category, price range, discount percentage
- [ ] **Price Trend Visualization**: Interactive charts showing price history
- [ ] **Browser Extension**: One-click product tracking from any website
- [ ] **Mobile App**: Native iOS and Android applications
- [ ] **Bulk Actions**: Select and manage multiple products simultaneously
- [ ] **Export Data**: Export price history and tracked products to CSV/PDF
- [ ] **Dark Mode**: Toggle between light and dark themes
- [ ] **Push Notifications**: Real-time alerts via browser notifications
- [ ] **API for Developers**: Public API for third-party integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙋‍♂️ Support

- **Lovable Community**: [Discord](https://discord.com/channels/1119885301872070706/1280461670979993613)
- **Documentation**: [Lovable Docs](https://docs.lovable.dev/)
- **Issues**: Please open an issue on this repository

## 📈 Project Stats

- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth, Database, Functions)
- **Build Tool**: Vite
- **Deployment**: Lovable Platform

**Project URL**: https://lovable.dev/projects/d816e44f-0de9-4796-bf6f-9046b67da51f

---

**Made with ❤️ using [Lovable](https://lovable.dev) - The AI-powered web app builder**

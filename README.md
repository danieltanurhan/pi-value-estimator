# Pi Value Estimator

A web application that integrates with Pi Network to display estimated Pi coin values in various fiat currencies.

## Overview

The Pi Value Estimator is a single-page web application that integrates with the Pi Network ecosystem. It allows users to authenticate with their Pi Network account and view the estimated value of their Pi coins in various fiat currencies. The application runs within the Pi Browser and showcases how to implement Pi Network authentication using the official Pi JavaScript SDK.

![Pi Value Estimator Screenshot](assets/images/app-screenshot.png)

## Features

- **Pi Network Authentication**: Securely authenticate users via the Pi Network SDK
- **Balance Display**: View your Pi coin balance (currently using mock data)
- **Multiple Currencies**: Convert Pi value to USD, EUR, GBP, JPY, and CNY
- **Real-time Updates**: Refresh cryptocurrency values on demand
- **Responsive Design**: Works on mobile and desktop devices
- **Error Handling**: Graceful handling of authentication and API errors

## Technologies Used

- HTML5, CSS3, and JavaScript (ES6+)
- Pi Network JavaScript SDK (v2.0)
- CoinGecko API for cryptocurrency price data
- Responsive design with CSS Grid and Flexbox

## Prerequisites

To run or modify this application, you'll need:

- A Pi Network developer account
- Basic knowledge of HTML, CSS, and JavaScript
- A local development server or web hosting solution
- The Pi Browser app installed on your mobile device (for testing)

## Project Structure

```
pi-value-estimator/              # Root project folder
│
├── assets/                      # Static assets
│   ├── images/                  # Image files
│   │   └── favicon.ico          # App favicon
│   └── fonts/                   # Custom fonts (if needed)
│
├── css/                         # CSS files
│   └── style.css                # Main stylesheet
│
├── js/                          # JavaScript files
│   ├── app.js                   # Main application logic
│   ├── pi-integration.js        # Pi Network SDK specific functions
│   └── api-services.js          # API calls to CoinGecko and other services
│
├── index.html                   # Main HTML file
├── README.md                    # Project documentation
├── LICENSE                      # License information
├── .gitignore                   # Git ignore file
└── SETUP.md                     # Detailed setup instructions
```

## Setup and Installation

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/pi-value-estimator.git
   cd pi-value-estimator
   ```

2. **Set up a local server**:
   You can use Python's built-in HTTP server:
   ```bash
   # Python 3
   python -m http.server 5000
   
   # Python 2
   python -m SimpleHTTPServer 5000
   ```
   
   Or Node.js http-server:
   ```bash
   # Install http-server globally
   npm install -g http-server
   
   # Run the server
   http-server -p 5000
   ```

3. **Register your app in the Pi Developer Portal**:
   - Go to the [Pi Developer Portal](https://developers.minepi.com/)
   - Create a new app
   - Set the development URL to `http://localhost:5000` (or your preferred local URL)
   - Configure the app to request the `username` and `payments` scopes

4. **Test in Pi Browser**:
   - Open the Pi Browser on your mobile device
   - Navigate to your app in the Pi Developer Portal
   - Click "Open in Sandbox" to test your app

### Production Deployment

1. **Host your application**:
   - Deploy the app to a web hosting service (GitHub Pages, Netlify, Vercel, etc.)
   - Update the app URL in the Pi Developer Portal to your production URL

2. **Domain verification**:
   - Follow the Pi Network domain verification process in the Developer Portal
   - Add the required DNS records to verify ownership of your domain

3. **Switch to production mode**:
   - In `js/pi-integration.js`, update the Pi SDK initialization to use production mode:
     ```javascript
     Pi.init({ 
         version: "2.0",
         sandbox: false // Changed to false for production
     });
     ```

4. **Submit for review**:
   - Submit your app for review in the Pi Developer Portal
   - Wait for approval before promoting your app to Pi Network users

## Usage

1. **Open the app** in the Pi Browser
2. **Click "Sign in with Pi"** to authenticate with your Pi Network account
3. **View your Pi balance** and its estimated value in USD (default currency)
4. **Select a different currency** from the dropdown menu to see values in other fiat currencies
5. **Click "Refresh Values"** to update the currency conversion rates

## Implementation Notes

- **Mock Data**: Currently, the app uses mock data for Pi coin values since Pi is not yet listed on major cryptocurrency exchanges. This will be updated when official market data becomes available.

- **Pi Balance**: The current implementation uses a hardcoded Pi balance of 100 Pi. In a production app, this would be retrieved from your backend after proper authentication.

- **API Rate Limits**: The CoinGecko API has rate limits. For production use, implement proper caching or consider using a paid API plan.

## Future Enhancements

- Implement backend integration for secure authentication and data storage
- Add transaction history and payment features using Pi Payments API
- Support additional fiat currencies
- Implement charts and graphs for value trends
- Add push notifications for significant price changes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Pi Network](https://minepi.com/) for creating the Pi cryptocurrency ecosystem
- [CoinGecko API](https://www.coingecko.com/en/api) for cryptocurrency market data
- The Pi Pioneer community for feedback and support

## Disclaimer

This application is not affiliated with, endorsed by, or sponsored by the Pi Core Team. The Pi Value Estimator is an independent project created to demonstrate Pi Network SDK integration. All Pi value estimates are speculative and should not be considered financial advice.
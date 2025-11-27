# Dictionary Frontend

A beautiful, modern React application for the Dictionary Service, built with Vite, Tailwind CSS, and Headless UI.

## Features

- 🔍 **Real-time Search** - Fast word lookup with instant results
- ✨ **Autocomplete** - Smart suggestions as you type
- 🎨 **Beautiful UI** - Modern design with Tailwind CSS and Heroicons
- 🌙 **Dark Mode** - Automatic dark mode support
- 📱 **Responsive** - Works perfectly on all devices
- ⚡ **Fast** - Built with Vite for lightning-fast development

## Tech Stack

- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Unstyled, accessible UI components
- **Heroicons** - Beautiful SVG icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Dictionary service running on `http://localhost:8080` (or configure `VITE_API_URL`)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8080
```

Or set it when running:

```bash
VITE_API_URL=http://your-api-url:8080 npm run dev
```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles with Tailwind
├── public/              # Static assets
├── index.html           # HTML template
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
└── vite.config.js       # Vite configuration
```

## Features in Detail

### Autocomplete
- Shows up to 10 suggestions as you type
- Click any suggestion to look up the word
- Suggestions appear in a beautiful dropdown

### Word Lookup
- Enter a word and press Enter or click Search
- View all meanings in a clean, organized list
- Numbered meanings for easy reading

### Statistics
- Displays total word count from the dictionary
- Updates automatically on page load

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Customization

#### Colors
Edit `tailwind.config.js` to customize the color scheme:

```js
colors: {
  primary: {
    // Your custom colors
  }
}
```

#### API URL
Set the `VITE_API_URL` environment variable or update `src/App.jsx`:

```js
const API_BASE_URL = 'http://your-api-url:8080'
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

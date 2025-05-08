# AI-Grocery: Smart Grocery Shopping Platform

AI-Grocery is an innovative web application that combines AI-powered natural language processing with a streamlined shopping experience to make grocery shopping faster, more intuitive, and more personalized.

![AI-Grocery Platform](https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1074&auto=format&fit=crop)

## 🌟 Features

### Natural Language Order Processing
- Enter your grocery list in natural language, just as you would write or speak it
- AI processes your input to identify products and quantities
- Handles various formats: "2 apples", "milk", "dozen eggs", etc.

### Image Upload & OCR
- Upload images of handwritten or printed grocery lists
- Advanced OCR using OpenAI's GPT-4o Vision model
- Automatically extracts text from images and processes it
- Works with multiple languages including English, Tamil, Telugu, Hindi, and more

### Voice Recognition
- Record your grocery list using the microphone button
- Multilingual support for Tamil, Telugu, Hindi, Gujarati, and Bhojpuri
- Powered by OpenAI's Whisper API for accurate transcription
- Seamlessly integrates with the natural language processing pipeline

### Smart Product Recommendations
- Receive personalized product recommendations based on your cart items
- Discover complementary products that pair well with your selections
- AI learns from shopping patterns to improve suggestions over time

### Interactive Shopping Experience
- User-friendly interface with intuitive product browsing
- Real-time updates to your shopping cart
- Voice input support for hands-free grocery list creation

### Comprehensive Product Information
- Detailed nutritional information for all products
- High-quality product images
- Price, description, and availability status

## 🚀 Technical Stack

- **Frontend**: React with TypeScript
- **UI Components**: Custom components using shadcn/ui and Tailwind CSS
- **State Management**: React Hooks and Context
- **Routing**: React Router
- **API Communication**: TanStack Query
- **Styling**: Tailwind CSS with custom animations and glassmorphism effects
- **Bundler**: Vite

## 🔧 Project Structure

The application follows a modular architecture:

```
src/
├── components/         # Reusable UI components
├── lib/                # Utility functions and data models
├── pages/              # Page components (routes)
├── hooks/              # Custom React hooks
├── services/           # API services
└── db/                 # Mock database and data access
```

## 💡 How It Works

1. **Natural Language Processing**: When a user enters a grocery list in natural language, the application parses the input to identify products and quantities. It matches items against the product database using fuzzy matching and semantic understanding.

2. **Product Recommendation**: The system analyzes the user's cart contents and shopping history to suggest relevant products. Recommendations consider factors like complementary items, frequently bought together products, and seasonal offerings.

3. **Interactive UI**: The interface features smooth animations, responsive design, and accessibility considerations to ensure a seamless user experience across all devices.

## 🛠️ Development

### Prerequisites
- Node.js 16+
- npm or yarn
- Python 3.9+
- Conda (recommended for environment management)

### Setup and Installation

#### Backend Setup (Python/FastAPI)

**macOS**
```bash
# Navigate to the backend directory
cd ai-order-backend

# Create and activate a conda environment (recommended)
conda create -n ai-grocery python=3.9
conda activate ai-grocery

# Install dependencies
pip install -r requirements.txt

# Set up your OpenAI API key in a .env file
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

**Windows**
```cmd
# Navigate to the backend directory
cd ai-order-backend

# Create and activate a conda environment (recommended)
conda create -n ai-grocery python=3.9
conda activate ai-grocery

# Install dependencies
pip install -r requirements.txt

# Set up your OpenAI API key in a .env file (create a .env file with your text editor)
# Add this line to the .env file: OPENAI_API_KEY=your_api_key_here
```

#### Frontend Setup (React/TypeScript)

**macOS**
```bash
# Navigate to the frontend directory
cd ai-grocery-frontend

# Install dependencies
npm install
# or
yarn install
```

**Windows**
```cmd
# Navigate to the frontend directory
cd ai-grocery-frontend

# Install dependencies
npm install
# or
yarn install
```

### Starting the Servers

#### Starting the Backend Server

**macOS**
```bash
# Make sure you're in the backend directory
cd ai-order-backend

# Activate the conda environment if not already activated
conda activate ai-grocery

# Start the FastAPI server
python -m uvicorn main:app --reload
```

**Windows**
```cmd
# Make sure you're in the project root directory
# Run this command to navigate to backend directory and start the server
cd ai-order-backend && .venv\Scripts\python -m uvicorn main:app --reload
```

#### Starting the Frontend Server

**macOS**
```bash
# Make sure you're in the frontend directory
cd ai-grocery-frontend

# Start the development server
npm run dev
# or
yarn dev
```

**Windows**
```cmd
# Make sure you're in the project root directory
# Run this command to navigate to frontend directory and start the server
cd ai-grocery-frontend && npm run dev
```

### Accessing the Application
- Frontend: http://localhost:8080
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 🔮 Future Enhancements

- Integration with real grocery store APIs for live inventory and pricing
- Advanced NLP capabilities using large language models
- User accounts with personalized shopping history and preferences

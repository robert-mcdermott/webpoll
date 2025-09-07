# 🗳️ Web Polling App

A modern, real-time web polling application that allows administrators to create polls and participants to add items and vote. Built with FastAPI backend and vanilla JavaScript frontend.

![Web Polling App](https://img.shields.io/badge/FastAPI-Web%20App-009688?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.12+-blue?style=for-the-badge&logo=python)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-CSS3-orange?style=for-the-badge&logo=html5)

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Functionality
- **📊 Poll Creation** - Administrators can create polls with custom titles and descriptions
- **➕ Dynamic Item Addition** - Participants can add new voting options in real-time
- **🗳️ Single Vote System** - Each user can vote for one item (can change their vote)
- **⚡ Real-time Updates** - Live vote counts update every 2 seconds
- **📈 Visual Results** - Interactive bar chart showing voting results
- **🔗 URL Sharing** - Shareable poll URLs for easy participant access

### Technical Features
- **🚀 Fast Performance** - Built with FastAPI for high performance
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **🎨 Modern UI** - Beautiful gradient design with smooth animations
- **🔒 Thread-Safe** - Concurrent request handling with thread safety
- **💾 In-Memory Storage** - Fast data access without database complexity
- **🌐 Vanilla JavaScript** - No heavy frameworks, pure JavaScript for speed

## 🏗️ Architecture

The application follows a simple but effective architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin UI      │    │   Participant   │    │   Real-time     │
│  (Poll Creator) │    │      UI         │    │   Updates       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────────────────────▼─────────────────────────────────┐
│                          FastAPI Server                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │
│  │   Routes    │  │  Templates  │  │      Static Files       │   │
│  │ (Endpoints) │  │ (Jinja2 HTML)│  │  (CSS/JS/Images)      │   │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘   │
└─────────────────────────────────┬─────────────────────────────────┘
                                  │
         ┌────────────────────────▼────────────────────────┐
         │              In-Memory Storage                  │
         │  ┌─────────────┐  ┌─────────────────────────┐   │
         │  │   Polls     │  │    Thread-Safe Lock    │   │
         │  │  Storage    │  │      (RLock)           │   │
         │  └─────────────┘  └─────────────────────────┘   │
         └─────────────────────────────────────────────────┘
```

### Technology Stack
- **Backend**: FastAPI (Python 3.12+)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Templating**: Jinja2
- **Storage**: In-memory with thread safety
- **Styling**: Modern CSS with gradients and animations
- **Charts**: Custom HTML5 Canvas implementation

## 🚀 Installation

### Prerequisites
- Python 3.12 or higher
- `uv` package manager (recommended) or `pip`

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd webvote
   ```

2. **Install dependencies**
   ```bash
   # Using uv (recommended)
   uv add fastapi uvicorn jinja2 python-multipart
   
   # Or using pip
   pip install fastapi uvicorn jinja2 python-multipart
   ```

3. **Run the application**
   ```bash
   # Using uv
   uv run main.py
   
   # Or using python directly
   python main.py
   ```

4. **Access the application**
   - Open your browser and go to `http://localhost:8000`
   - Create a new poll
   - Share the generated poll URL with participants

## 📖 Usage

### Creating a Poll (Admin)

1. Navigate to `http://localhost:8000`
2. Fill in the poll title and description
3. Click "Create Poll"
4. Copy the generated URL and share it with participants

### Participating in a Poll

1. Open the shared poll URL
2. **Add items** (optional): Type a new option and click "Add Item"
3. **Vote**: Click the "Vote" button next to your preferred option
4. **View results**: Watch the live chart update in real-time
5. **Change vote**: Click "Vote" on a different item to change your choice

### Real-time Features

- Vote counts update automatically every 2 seconds
- New items appear instantly when added
- Interactive bar chart shows current standings
- Total vote count displays at the bottom

## 🔌 API Endpoints

### Web Pages
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Admin home page for creating polls |
| `GET` | `/poll/{poll_id}` | Poll voting page for participants |

### API Routes
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/polls` | Create a new poll | `{"title": "string", "description": "string"}` |
| `POST` | `/api/polls/{poll_id}/items` | Add item to poll | `{"text": "string"}` |
| `POST` | `/api/polls/{poll_id}/vote` | Vote for an item | `{"item_id": "string", "user_id": "string"}` |
| `GET` | `/api/polls/{poll_id}/results` | Get poll results | - |

### API Response Examples

**Create Poll Response:**
```json
{
  "success": true,
  "poll_id": "f82c41bb",
  "poll_url": "/poll/f82c41bb"
}
```

**Poll Results Response:**
```json
{
  "poll": {
    "id": "f82c41bb",
    "title": "What's your favorite programming language?",
    "description": "Let's find out what languages are most popular!",
    "is_active": true
  },
  "items": [
    {
      "id": "96e662b2",
      "text": "Python",
      "votes": 3
    },
    {
      "id": "430f7c9c",
      "text": "JavaScript",
      "votes": 2
    }
  ],
  "total_votes": 5
}
```

## 📁 Project Structure

```
webvote/
├── main.py                 # FastAPI application and server
├── templates/              # Jinja2 HTML templates
│   ├── admin.html         # Admin poll creation page
│   └── poll.html          # Poll voting page
├── static/                # Static assets
│   ├── css/
│   │   └── style.css      # Modern CSS styling
│   └── js/
│       ├── admin.js       # Admin page functionality
│       └── poll.js        # Poll page functionality
├── pyproject.toml         # Python project configuration
├── README.md              # This file
└── PRD.md                 # Product Requirements Document
```

### Key Components

**`main.py`** - Core application file containing:
- FastAPI app configuration
- Data models (Poll, PollItem, etc.)
- Thread-safe in-memory storage
- All API endpoints and route handlers

**Templates:**
- `admin.html` - Poll creation interface
- `poll.html` - Voting and results interface

**Static Files:**
- `style.css` - Responsive design with modern gradients
- `admin.js` - Poll creation and URL copying functionality
- `poll.js` - Real-time voting, chart rendering, and updates

## 📸 Screenshots

### Admin Interface
The admin page features a clean, modern interface for creating polls:
- Gradient background design
- Easy-to-use form with validation
- Instant poll URL generation
- Copy-to-clipboard functionality

### Poll Interface
The voting page includes:
- Dynamic item addition
- Real-time vote counting
- Interactive bar chart visualization
- Responsive design for all devices

### Real-time Chart
Custom HTML5 Canvas implementation showing:
- Color-coded bars for each option
- Live vote count updates
- Responsive chart sizing
- Clean, readable labels

## 🛠️ Development

### Running in Development Mode

```bash
# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Code Structure

**Data Models:**
- `Poll`: Main poll object with metadata
- `PollItem`: Individual voting options
- `PollStorage`: Thread-safe storage manager

**Key Features:**
- Thread-safe operations using `threading.RLock()`
- User identification via localStorage
- Real-time updates every 2 seconds
- Automatic chart rendering with HTML5 Canvas

### Customization

**Styling**: Modify `static/css/style.css` to change:
- Color schemes and gradients
- Typography and spacing
- Responsive breakpoints
- Animation effects

**Functionality**: Extend `static/js/poll.js` to add:
- Different chart types
- Vote validation rules
- Additional real-time features
- Enhanced user interactions

## 🧪 Testing

The application has been thoroughly tested with:

✅ **Poll Creation** - Successfully creates polls with unique IDs
✅ **Item Management** - Add/remove items dynamically
✅ **Voting System** - Single vote per user with vote changing
✅ **Real-time Updates** - Automatic refresh every 2 seconds
✅ **API Endpoints** - All REST endpoints functioning
✅ **Thread Safety** - Concurrent request handling
✅ **Responsive Design** - Works on mobile, tablet, desktop
✅ **URL Sharing** - Shareable poll links work correctly

### Manual Testing Example

```bash
# Test poll creation
curl -X POST http://localhost:8000/api/polls \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Poll","description":"Test Description"}'

# Test voting
curl -X POST http://localhost:8000/api/polls/POLL_ID/vote \
  -H "Content-Type: application/json" \
  -d '{"item_id":"ITEM_ID","user_id":"test_user"}'

# Test results
curl http://localhost:8000/api/polls/POLL_ID/results
```

## 🚀 Deployment

### Production Deployment

```bash
# Install production server
pip install gunicorn

# Run with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker Deployment

```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY . /app

RUN pip install fastapi uvicorn jinja2 python-multipart

EXPOSE 8000
CMD ["python", "main.py"]
```

### Environment Variables

```bash
# Optional configuration
export HOST=0.0.0.0
export PORT=8000
export RELOAD=false
```

## ⚠️ Limitations

- **Data Persistence**: Data is stored in memory and lost on server restart
- **Scalability**: Single server instance, no horizontal scaling
- **Authentication**: No user authentication system
- **Rate Limiting**: No built-in rate limiting for API endpoints

## 🔮 Future Enhancements

- [ ] Database integration (PostgreSQL/SQLite)
- [ ] User authentication and authorization
- [ ] Poll expiration and scheduling
- [ ] Advanced chart types (pie charts, line graphs)
- [ ] Email notifications for new polls
- [ ] Export results to CSV/PDF
- [ ] Real-time WebSocket updates
- [ ] Poll templates and categories
- [ ] Anonymous vs authenticated voting
- [ ] Voting restrictions and rules

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- FastAPI for the excellent web framework
- Jinja2 for templating capabilities  
- The Python community for amazing tools and libraries

---

**Made with ❤️ using FastAPI and vanilla JavaScript**

For questions or support, please open an issue on GitHub.

from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from typing import Dict, List, Optional
import uuid
import threading
from datetime import datetime

app = FastAPI(title="Fred Hutch Voting App")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

# Data Models
class PollItem(BaseModel):
    id: str
    text: str
    votes: int = 0
    created_at: datetime

class Poll(BaseModel):
    id: str
    title: str
    description: str
    items: List[PollItem] = []
    votes_by_user: Dict[str, str] = {}  # user_id -> item_id
    created_at: datetime
    is_active: bool = True

class CreatePollRequest(BaseModel):
    title: str
    description: str

class AddItemRequest(BaseModel):
    text: str

class VoteRequest(BaseModel):
    item_id: str
    user_id: str

# In-memory storage with thread safety
class PollStorage:
    def __init__(self):
        self.polls: Dict[str, Poll] = {}
        self.lock = threading.RLock()
    
    def create_poll(self, title: str, description: str) -> Poll:
        with self.lock:
            poll_id = str(uuid.uuid4())[:8]
            poll = Poll(
                id=poll_id,
                title=title,
                description=description,
                created_at=datetime.now()
            )
            self.polls[poll_id] = poll
            return poll
    
    def get_poll(self, poll_id: str) -> Optional[Poll]:
        with self.lock:
            return self.polls.get(poll_id)
    
    def add_item_to_poll(self, poll_id: str, text: str) -> Optional[PollItem]:
        with self.lock:
            poll = self.polls.get(poll_id)
            if not poll:
                return None
            
            item_id = str(uuid.uuid4())[:8]
            item = PollItem(
                id=item_id,
                text=text,
                created_at=datetime.now()
            )
            poll.items.append(item)
            return item
    
    def vote(self, poll_id: str, user_id: str, item_id: str) -> bool:
        with self.lock:
            poll = self.polls.get(poll_id)
            if not poll:
                return False
            
            # Find the item
            item = next((item for item in poll.items if item.id == item_id), None)
            if not item:
                return False
            
            # Remove previous vote if exists
            if user_id in poll.votes_by_user:
                prev_item_id = poll.votes_by_user[user_id]
                prev_item = next((item for item in poll.items if item.id == prev_item_id), None)
                if prev_item:
                    prev_item.votes -= 1
            
            # Add new vote
            poll.votes_by_user[user_id] = item_id
            item.votes += 1
            return True
    
    def get_poll_results(self, poll_id: str) -> Optional[Dict]:
        with self.lock:
            poll = self.polls.get(poll_id)
            if not poll:
                return None
            
            return {
                "poll": {
                    "id": poll.id,
                    "title": poll.title,
                    "description": poll.description,
                    "is_active": poll.is_active
                },
                "items": [
                    {
                        "id": item.id,
                        "text": item.text,
                        "votes": item.votes
                    } for item in poll.items
                ],
                "total_votes": len(poll.votes_by_user)
            }

# Global storage instance
storage = PollStorage()

# Routes
@app.get("/", response_class=HTMLResponse)
async def admin_home(request: Request):
    """Admin home page for creating polls"""
    return templates.TemplateResponse("admin.html", {"request": request})

@app.post("/api/polls")
async def create_poll(poll_data: CreatePollRequest):
    """Create a new poll"""
    poll = storage.create_poll(poll_data.title, poll_data.description)
    return {
        "success": True,
        "poll_id": poll.id,
        "poll_url": f"/poll/{poll.id}"
    }

@app.get("/poll/{poll_id}", response_class=HTMLResponse)
async def poll_page(request: Request, poll_id: str):
    """Poll voting page for participants"""
    poll = storage.get_poll(poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    return templates.TemplateResponse("poll.html", {
        "request": request,
        "poll": poll,
        "poll_id": poll_id
    })

@app.post("/api/polls/{poll_id}/items")
async def add_item_to_poll(poll_id: str, item_data: AddItemRequest):
    """Add a new item to a poll"""
    item = storage.add_item_to_poll(poll_id, item_data.text)
    if not item:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    return {
        "success": True,
        "item": {
            "id": item.id,
            "text": item.text,
            "votes": item.votes
        }
    }

@app.post("/api/polls/{poll_id}/vote")
async def vote_on_item(poll_id: str, vote_data: VoteRequest):
    """Vote on an item in a poll"""
    success = storage.vote(poll_id, vote_data.user_id, vote_data.item_id)
    if not success:
        raise HTTPException(status_code=400, detail="Vote failed")
    
    return {"success": True}

@app.get("/api/polls/{poll_id}/results")
async def get_poll_results(poll_id: str):
    """Get poll results for real-time updates"""
    results = storage.get_poll_results(poll_id)
    if not results:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

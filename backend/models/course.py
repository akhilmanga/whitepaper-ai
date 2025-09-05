# backend/models/course.py
from pydantic import BaseModel
from typing import List, Optional
import uuid

class Flashcard(BaseModel):
    id: str
    front: str
    back: str
    difficulty: int
    lastReviewed: Optional[str] = None
    nextReview: Optional[str] = None

class Question(BaseModel):
    id: str
    type: str  # 'multiple-choice', 'fill-blank', 'short-answer'
    question: str
    options: Optional[List[str]] = None
    correctAnswer: str
    explanation: str

class Quiz(BaseModel):
    id: str = str(uuid.uuid4())  # Auto-generated
    questions: List[Question] = []  # Default empty
    score: Optional[float] = None
    attempts: int = 0

class Module(BaseModel):
    id: str
    title: str
    content: str
    flashcards: List[Flashcard] = []  # Optional with default
    quiz: Optional[Quiz] = None      # Optional with default
    completed: bool = False
    timeSpent: int = 0
    estimatedTime: int = 0

class Course(BaseModel):
    id: str
    user_id: str
    title: str
    description: str
    objectives: List[str]
    modules: List[Module]
    progress: float = 0.0
    estimatedTime: int
    difficulty: str
    createdAt: str  # ISO 8601 string
    updatedAt: Optional[str] = None

class ProcessingStatus(BaseModel):
    id: str
    status: str  # 'processing', 'completed', 'failed'
    progress: int  # 0-100
    message: Optional[str] = None

class UserProgress(BaseModel):
    user_id: str
    course_id: str
    module_id: str
    completed: bool = False
    score: Optional[float] = None
    timeSpent: int = 0
    lastAccessed: Optional[str] = None  # Use string for JSON compatibility
import os
import asyncio
try:
    from motor.motor_asyncio import AsyncIOMotorClient
    from pymongo.errors import ConnectionFailure
    MOTOR_AVAILABLE = True
except ImportError:
    MOTOR_AVAILABLE = False
    print("Motor not available, using mock database")

class Database:
    client = None
    database = None

# Global database instance
db_instance = Database()


async def connect_to_mongo():
    """Create database connection"""
    mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    database_name = os.getenv("DATABASE_NAME", "whitepaper_ai")

    # Use mock database if in development or motor not available
    if os.getenv("DEVELOPMENT", "false").lower() == "true" or not MOTOR_AVAILABLE:
        print("✅ Running in development mode with mock database")
        db_instance.database = MockDatabase()
        return

    try:
        db_instance.client = AsyncIOMotorClient(mongodb_uri)
        # Test connection
        await db_instance.client.admin.command('ping')
        print(f"✅ Connected to MongoDB at {mongodb_uri}")

        db_instance.database = db_instance.client[database_name]
        await create_indexes()

    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        print("🔧 Falling back to mock database")
        db_instance.database = MockDatabase()


async def close_mongo_connection():
    """Close database connection"""
    if db_instance.client:
        db_instance.client.close()
        print("🔌 Disconnected from MongoDB")


async def create_indexes():
    """Create database indexes for better performance"""
    if not db_instance.database:
        return

    try:
        # Courses: unique by user_id + id
        await db_instance.database.courses.create_index([("user_id", 1), ("id", 1)], unique=True)
        await db_instance.database.courses.create_index([("user_id", 1), ("createdAt", -1)])

        # Progress tracking
        await db_instance.database.user_progress.create_index([("user_id", 1), ("course_id", 1)])
        print("✅ Database indexes created")
    except Exception as e:
        print(f"⚠️ Failed to create indexes: {e}")


def get_database():
    """Get current database instance"""
    if not db_instance.database:
        raise RuntimeError("Database not initialized. Call startup_db() first.")
    return db_instance.database


# =======================
# Mock Database for Dev
# =======================

class MockDatabase:
    """In-memory mock database for development and testing"""

    def __init__(self):
        self.courses = MockCollection()
        self.user_progress = MockCollection()


class MockCollection:
    """Mock for MongoDB collection with async interface"""

    def __init__(self):
        self.data = []

    async def insert_one(self, document):
        """Insert a single document"""
        # Avoid duplicates
        for doc in self.data:
            if doc.get("id") == document.get("id") and doc.get("user_id") == document.get("user_id"):
                return MockInsertResult()
        self.data.append(dict(document))  # Copy to prevent mutation
        return MockInsertResult()

    async def find_one(self, filter_dict):
        """Find one document matching filter"""
        for doc in self.data:
            if self._matches_filter(doc, filter_dict):
                return dict(doc)  # Return copy
        return None

    def find(self, filter_dict):
        """Find all matching documents (returns cursor-like object)"""
        matches = [dict(doc) for doc in self.data if self._matches_filter(doc, filter_dict)]
        return MockCursor(matches)

    async def update_one(self, filter_dict, update_dict):
        """Update first matching document"""
        for doc in self.data:
            if self._matches_filter(doc, filter_dict):
                # Apply $set
                if "$set" in update_dict:
                    doc.update(update_dict["$set"])
                # Apply $inc
                if "$inc" in update_dict:
                    for key, value in update_dict["$inc"].items():
                        parts = key.split(".")
                        target = doc
                        for part in parts[:-1]:
                            if part not in target:
                                target[part] = {}
                            target = target[part]
                        final_key = parts[-1]
                        target[final_key] = target.get(final_key, 0) + value
                return MockUpdateResult(matched_count=1, modified_count=1)
        return MockUpdateResult(matched_count=0, modified_count=0)

    async def create_index(self, index_spec):
        """Mock index creation"""
        pass

    def _matches_filter(self, doc, filter_dict):
        """Check if document matches filter (supports nested keys)"""
        for key, value in filter_dict.items():
            if not self._get_nested_value(doc, key) == value:
                return False
        return True

    def _get_nested_value(self, doc, key):
        """Get value from nested key (e.g., 'modules.id')"""
        parts = key.split(".")
        val = doc
        for part in parts:
            if isinstance(val, dict) and part in val:
                val = val[part]
            else:
                return None
        return val


class MockCursor:
    """Mock async cursor for find() operations"""

    def __init__(self, data):
        self._data = data
        self._index = 0

    async def to_list(self, length=None):
        """Return list of documents"""
        if length is None:
            return self._data
        return self._data[:length]


class MockInsertResult:
    """Mock result of insert_one()"""
    def __init__(self):
        self.inserted_id = "mock_id"


class MockUpdateResult:
    """Mock result of update_one()"""
    def __init__(self, matched_count=0, modified_count=0):
        self.matched_count = matched_count
        self.modified_count = modified_count


# =======================
# Lifecycle Functions
# =======================

async def startup_db():
    """Initialize database on startup"""
    await connect_to_mongo()


async def shutdown_db():
    """Cleanup on shutdown"""
    await close_mongo_connection()
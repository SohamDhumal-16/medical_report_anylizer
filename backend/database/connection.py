"""
MongoDB Database Connection Module
Handles database connection using environment variables for security
"""

from pymongo import MongoClient
from pymongo.database import Database
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get MongoDB connection string from environment
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "medical_report_analyzer")

# Global database connection
client: MongoClient = None
db: Database = None


def connect_to_mongo():
    """
    Establish connection to MongoDB database
    Returns: Database instance
    """
    global client, db
    try:
        client = MongoClient(MONGODB_URL)
        db = client[DB_NAME]
        # Test connection
        client.server_info()
        print(f"Successfully connected to MongoDB: {DB_NAME}")
        return db
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise


def close_mongo_connection():
    """
    Close MongoDB connection gracefully
    """
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


def get_database() -> Database:
    """
    Get database instance (lazy initialization)
    Returns: Database instance
    """
    global db
    if db is None:
        db = connect_to_mongo()
    return db

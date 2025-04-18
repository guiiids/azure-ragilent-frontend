# vote_manager.py

import sqlite3
from datetime import datetime

DB_NAME = "votes.db"

def init_db():
    conn = sqlite3.connect("votes.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_query TEXT,
            bot_response TEXT,
            evaluation_json TEXT,
            vote TEXT CHECK(vote IN ('yes', 'no')),
            comment TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def record_vote(user_query, bot_response, evaluation_json, vote, comment=""):
    if vote not in ["yes", "no"]:
        raise ValueError("Vote must be 'yes' or 'no'")
    conn = sqlite3.connect("votes.db")
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO votes (user_query, bot_response, evaluation_json, vote, comment)
        VALUES (?, ?, ?, ?, ?)
    """, (user_query, bot_response, evaluation_json, vote, comment))
    conn.commit()
    conn.close()
    
def fetch_votes(limit=None, offset=0, vote_filter=None, start_date=None, end_date=None):
    """
    Fetch votes with optional filtering and pagination

    Args:
        limit: Maximum number of votes to return (None for all)
        offset: Number of votes to skip
        vote_filter: Filter by vote type ('yes' or 'no')
        start_date: Filter votes from this date (inclusive, format 'YYYY-MM-DD')
        end_date: Filter votes up to this date (inclusive, format 'YYYY-MM-DD')

    Returns:
        List of dictionaries containing vote data
    """
    import logging
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    cursor = conn.cursor()

    query = "SELECT id, user_query, bot_response, evaluation_json, vote, comment, timestamp FROM votes"
    conditions = []
    params = []

    if vote_filter:
        conditions.append("vote = ?")
        params.append(vote_filter)

    if start_date:
        try:
            datetime.strptime(start_date, "%Y-%m-%d")
            conditions.append("DATE(timestamp) >= ?")
            params.append(start_date)
        except Exception as e:
            logging.error(f"Invalid start_date format: {start_date} - {e}")

    if end_date:
        try:
            datetime.strptime(end_date, "%Y-%m-%d")
            conditions.append("DATE(timestamp) <= ?")
            params.append(end_date)
        except Exception as e:
            logging.error(f"Invalid end_date format: {end_date} - {e}")

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " ORDER BY timestamp DESC"

    if limit is not None:
        query += " LIMIT ? OFFSET ?"
        params.extend([limit, offset])

    try:
        cursor.execute(query, params)
        rows = [dict(row) for row in cursor.fetchall()]
    except Exception as e:
        logging.error(f"Error executing fetch_votes query: {e}")
        rows = []
    conn.close()
    return rows

def get_vote_statistics():
    """
    Get statistics about the votes
    
    Returns:
        Dictionary containing vote statistics
    """
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Get total votes
    cursor.execute("SELECT COUNT(*) FROM votes")
    total_votes = cursor.fetchone()[0]
    
    # Get yes votes
    cursor.execute("SELECT COUNT(*) FROM votes WHERE vote = 'yes'")
    yes_votes = cursor.fetchone()[0]
    
    # Get no votes
    cursor.execute("SELECT COUNT(*) FROM votes WHERE vote = 'no'")
    no_votes = cursor.fetchone()[0]
    
    # Get votes with comments
    cursor.execute("SELECT COUNT(*) FROM votes WHERE comment != ''")
    votes_with_comments = cursor.fetchone()[0]
    
    # Get votes per day (last 30 days)
    cursor.execute("""
        SELECT DATE(timestamp) as date, COUNT(*) as count 
        FROM votes 
        WHERE timestamp >= date('now', '-30 days') 
        GROUP BY DATE(timestamp) 
        ORDER BY date
    """)
    votes_per_day = {row[0]: row[1] for row in cursor.fetchall()}
    
    conn.close()
    
    return {
        "total_votes": total_votes,
        "yes_votes": yes_votes,
        "no_votes": no_votes,
        "yes_percentage": (yes_votes / total_votes * 100) if total_votes > 0 else 0,
        "no_percentage": (no_votes / total_votes * 100) if total_votes > 0 else 0,
        "votes_with_comments": votes_with_comments,
        "votes_per_day": votes_per_day
    }

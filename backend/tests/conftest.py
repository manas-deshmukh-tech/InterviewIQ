import os
import sys
import pytest

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Force test database name
os.environ["DB_NAME"] = os.getenv("TEST_DB_NAME", "interviewiq_test")
os.environ.setdefault("DB_ALLOW_SQLITE_FALLBACK", "true")

import database

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """
    Enforces that all automated test executions run strictly against interviewiq_test,
    never against the live production interviewiq database.
    """
    test_db = os.getenv("TEST_DB_NAME", "interviewiq_test")
    if database.ACTIVE_ENGINE == "mysql":
        database.DB_NAME = test_db
        database._mysql_engine = database._init_mysql_engine(test_db)
        assert "test" in database.DB_NAME.lower(), "CRITICAL: Tests cannot run against production database!"
        print(f"\n[TEST HARNESS] Confirmed isolated test database in use: {database.DB_NAME}")

    # Ensure schema is ready in test database
    database.init_db()
    yield


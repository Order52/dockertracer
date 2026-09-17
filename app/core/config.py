import os

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./dockertracer.db")

settings = Settings()

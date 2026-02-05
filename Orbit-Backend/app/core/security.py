"""
Security utilities for authentication and authorization.

This module provides password hashing, JWT token creation/verification,
and OAuth2 authentication scheme for the Orbit backend application.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any

from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


# Password hashing context using bcrypt algorithm
# bcrypt is industry standard for password hashing (slow by design = resistant to brute force)
# deprecated="auto" means if we upgrade to a newer algorithm later, old passwords still work
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for FastAPI dependency injection
# tokenUrl is the endpoint where clients get tokens (will be /auth/login)
# This creates the "Authorize" button in Swagger UI docs
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def hash_password(password: str) -> str:
    """
    Hash a plain-text password using bcrypt.

    Uses bcrypt algorithm with automatic salt generation. The salt is stored
    in the hash itself, so you don't need to store it separately.

    Args:
        password: Plain-text password to hash

    Returns:
        Hashed password string (includes algorithm, cost factor, salt, and hash)

    Example:
        >>> hashed = hash_password("mySecurePassword123")
        >>> print(hashed)
        $2b$12$KIXxLjhT5... (60 character string)

    Security Notes:
        - Never store plain-text passwords in database
        - Never log passwords (even in development)
        - bcrypt automatically handles salting
        - bcrypt is intentionally slow (~100-300ms) to resist brute force attacks
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against a hashed password.

    Compares the provided password with the stored hash using constant-time
    comparison to prevent timing attacks.

    Args:
        plain_password: Plain-text password provided by user
        hashed_password: Hashed password from database

    Returns:
        True if password matches, False otherwise

    Example:
        >>> hashed = hash_password("myPassword")
        >>> verify_password("myPassword", hashed)
        True
        >>> verify_password("wrongPassword", hashed)
        False

    Security Notes:
        - Uses constant-time comparison (prevents timing attacks)
        - Always returns False for invalid hash format (no exceptions)
        - Safe to use in authentication flows
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.

    Generates a JSON Web Token with the provided data and an expiration time.
    The token is signed with the SECRET_KEY from settings.

    Args:
        data: Dictionary of claims to encode in the token (usually {"sub": user_id})
        expires_delta: Optional custom expiration time. If None, uses default from settings.

    Returns:
        Encoded JWT token string

    Example:
        >>> token = create_access_token(data={"sub": "user@example.com"})
        >>> print(token)
        eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

    Token Structure:
        The token contains three parts (separated by dots):
        - Header: {"alg": "HS256", "typ": "JWT"}
        - Payload: Your data + expiration time
        - Signature: HMAC-SHA256 signature for verification

    Security Notes:
        - Token is signed but NOT encrypted (don't put sensitive data in it)
        - Token can be decoded by anyone (but not forged without SECRET_KEY)
        - Keep SECRET_KEY secret and rotate it periodically
        - Use short expiration times (15-60 minutes recommended)
    """
    # Create a copy to avoid modifying the original data
    to_encode = data.copy()

    # Set expiration time
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Default expiration from settings (30 minutes)
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    # Add expiration claim to token payload
    to_encode.update({"exp": expire})

    # Encode and sign the token
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decode and verify a JWT access token.

    Verifies the token signature and expiration time, then returns the payload.
    Raises HTTPException if token is invalid or expired.

    Args:
        token: JWT token string to decode

    Returns:
        Dictionary containing the token payload (claims)

    Raises:
        HTTPException(401): If token is invalid, expired, or malformed

    Example:
        >>> token = create_access_token(data={"sub": "user@example.com"})
        >>> payload = decode_access_token(token)
        >>> print(payload["sub"])
        user@example.com

    Security Notes:
        - Always raises exception on invalid/expired tokens (fail-safe)
        - Verifies signature using SECRET_KEY
        - Checks expiration time automatically
        - Returns user-friendly error messages
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode and verify the token
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        # Check if payload is empty
        if payload is None:
            raise credentials_exception

        return payload

    except JWTError as e:
        # Token is invalid, expired, or malformed
        # Don't expose detailed error messages to prevent information leakage
        raise credentials_exception from e


def get_password_strength(password: str) -> Dict[str, Any]:
    """
    Evaluate password strength (optional utility function).

    Checks password against common security criteria. This is a basic
    implementation - consider using a library like zxcvbn for production.

    Args:
        password: Password to evaluate

    Returns:
        Dictionary with strength analysis:
        - is_strong: bool (meets all criteria)
        - score: int (0-5, number of criteria met)
        - issues: list of strings describing problems

    Example:
        >>> result = get_password_strength("Pass123")
        >>> print(result)
        {
            "is_strong": False,
            "score": 3,
            "issues": ["Password should be at least 8 characters", "Add special characters"]
        }

    Criteria:
        - At least 8 characters
        - Contains uppercase letter
        - Contains lowercase letter
        - Contains digit
        - Contains special character
    """
    issues = []
    score = 0

    # Check length
    if len(password) >= 8:
        score += 1
    else:
        issues.append("Password should be at least 8 characters")

    # Check for uppercase
    if any(c.isupper() for c in password):
        score += 1
    else:
        issues.append("Add at least one uppercase letter")

    # Check for lowercase
    if any(c.islower() for c in password):
        score += 1
    else:
        issues.append("Add at least one lowercase letter")

    # Check for digits
    if any(c.isdigit() for c in password):
        score += 1
    else:
        issues.append("Add at least one number")

    # Check for special characters
    special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    if any(c in special_chars for c in password):
        score += 1
    else:
        issues.append("Add at least one special character (!@#$%^&*...)")

    return {
        "is_strong": score >= 4,  # At least 4 out of 5 criteria
        "score": score,
        "issues": issues
    }


# Token expiration helper for different token types
def create_refresh_token(data: Dict[str, Any]) -> str:
    """
    Create a refresh token with longer expiration.

    Refresh tokens are used to get new access tokens without re-authenticating.
    They have longer expiration times (7-30 days) compared to access tokens.

    Args:
        data: Dictionary of claims to encode in the token

    Returns:
        Encoded JWT refresh token string

    Example:
        >>> refresh = create_refresh_token(data={"sub": "user@example.com"})
        >>> # Store this in httpOnly cookie or secure storage

    Note:
        This is a Phase 2 feature (not needed for MVP).
        Included here for future use.
    """
    # Create token with 7-day expiration
    expires_delta = timedelta(days=7)
    return create_access_token(data=data, expires_delta=expires_delta)
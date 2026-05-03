from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import List
import re
from app.schemas.carts import CartBase


# Base
class BaseConfig:
    from_attributes = True


class UserBase(BaseModel):
    id: int
    username: str
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    carts: List[CartBase]

    class Config(BaseConfig):
        pass


class Signup(BaseModel):
    full_name: str
    username: str
    email: str
    password: str

    @field_validator('password')
    def validate_password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v

    class Config(BaseConfig):
        pass


class UserOut(BaseModel):
    message: str
    data: UserBase

    class Config(BaseConfig):
        pass


# Token
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = 'Bearer'
    expires_in: int

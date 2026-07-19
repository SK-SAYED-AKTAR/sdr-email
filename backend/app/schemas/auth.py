import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class SmtpTestRequest(BaseModel):
    company_email: EmailStr
    smtp_host: str = Field(min_length=1)
    smtp_port: int = Field(ge=1, le=65535)
    smtp_username: str = Field(min_length=1)
    smtp_password: str = Field(min_length=1)


class SmtpTestResponse(BaseModel):
    success: bool
    message: str


class SignupRequest(BaseModel):
    email: EmailStr
    otp: str
    smtp_host: str = Field(min_length=1)
    smtp_port: int = Field(ge=1, le=65535)
    smtp_username: str = Field(min_length=1)
    smtp_password: str = Field(min_length=1)


class LoginRequest(BaseModel):
    email: EmailStr
    otp: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    smtp_verified: bool
    created_at: datetime

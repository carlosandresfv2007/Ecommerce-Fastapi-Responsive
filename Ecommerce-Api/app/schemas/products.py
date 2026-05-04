from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import List, Optional
from app.schemas.categories import CategoryBase


# Base Models
class BaseConfig:
    from_attributes = True


class ProductBase(BaseModel):
    id: int
    title: str
    description: Optional[str]
    price: int
    discount_percentage: float
    rating: float
    stock: int
    brand: str
    thumbnail: str
    images: List[str]
    is_published: bool
    created_at: datetime
    category_id: int
    category: CategoryBase

    @field_validator("discount_percentage", mode="before")
    def validate_discount_percentage(cls, v):
        if v < 0 or v > 100:
            raise ValueError("discount_percentage must be between 0 and 100")
        return v

    class Config(BaseConfig):
        pass


# Create Product
class ProductCreate(BaseModel):
    title: str
    description: Optional[str]
    price: int
    discount_percentage: float
    rating: float
    stock: int
    brand: str
    thumbnail: str
    images: List[str]
    is_published: bool
    category_id: int

    @field_validator("discount_percentage", mode="before")
    def validate_discount_percentage(cls, v):
        if v < 0 or v > 100:
            raise ValueError("discount_percentage must be between 0 and 100")
        return v

    class Config(BaseConfig):
        pass


# Update Product
class ProductUpdate(ProductCreate):
    pass


# Get Products
class ProductOut(BaseModel):
    message: str
    data: ProductBase

    class Config(BaseConfig):
        pass


class ProductsOut(BaseModel):
    message: str
    data: List[ProductBase]

    class Config(BaseConfig):
        pass


# Delete Product
class ProductDelete(BaseModel):
    id: int
    title: str
    description: Optional[str]
    price: int
    discount_percentage: float
    rating: float
    stock: int
    brand: str
    thumbnail: str
    images: List[str]
    is_published: bool
    created_at: datetime
    category_id: int


class ProductOutDelete(BaseModel):
    message: str
    data: ProductDelete

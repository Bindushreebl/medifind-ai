from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, default="")
    password_hash = Column(String, nullable=False)
    role = Column(String, default="USER") # USER, PHARMACY, ADMIN
    created_at = Column(DateTime, default=datetime.utcnow)

    pharmacies = relationship("Pharmacy", back_populates="owner")
    reservations = relationship("Reservation", back_populates="user")
    alerts = relationship("RestockAlert", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


class Pharmacy(Base):
    __tablename__ = "pharmacies"

    id = Column(String, primary_key=True, index=True)
    owner_id = Column(String, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    phone = Column(String, default="")
    opening_time = Column(String, default="08:00 AM")
    closing_time = Column(String, default="10:00 PM")
    verified = Column(Boolean, default=False)
    rating = Column(Float, default=4.5)
    review_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="pharmacies")
    inventory = relationship("Inventory", back_populates="pharmacy")
    reservations = relationship("Reservation", back_populates="pharmacy")


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    generic_name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    dosage_form = Column(String, default="Tablet")
    strength = Column(String, default="N/A")
    manufacturer = Column(String, default="")
    prescription_required = Column(Boolean, default=False)
    description = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    inventory = relationship("Inventory", back_populates="medicine")
    alternatives = relationship("Alternative", foreign_keys="Alternative.medicine_id", back_populates="medicine")


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(String, primary_key=True, index=True)
    pharmacy_id = Column(String, ForeignKey("pharmacies.id"))
    medicine_id = Column(String, ForeignKey("medicines.id"))
    quantity = Column(Integer, default=0)
    price = Column(Float, nullable=False)
    status = Column(String, default="in_stock") # in_stock, low_stock, out_of_stock
    last_updated = Column(DateTime, default=datetime.utcnow)

    pharmacy = relationship("Pharmacy", back_populates="inventory")
    medicine = relationship("Medicine", back_populates="inventory")


class Alternative(Base):
    __tablename__ = "alternatives"

    id = Column(String, primary_key=True, index=True)
    medicine_id = Column(String, ForeignKey("medicines.id"))
    alternative_medicine_id = Column(String, ForeignKey("medicines.id"))
    pharmacist_name = Column(String, nullable=False)
    pharmacist_license = Column(String, default="")
    verification_status = Column(String, default="verified") # verified, pending, rejected
    verification_date = Column(String, default="")
    notes = Column(Text, default="")

    medicine = relationship("Medicine", foreign_keys=[medicine_id], back_populates="alternatives")
    alternative_medicine = relationship("Medicine", foreign_keys=[alternative_medicine_id])


class RestockAlert(Base):
    __tablename__ = "restock_alerts"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    medicine_id = Column(String, ForeignKey("medicines.id"))
    pharmacy_id = Column(String, ForeignKey("pharmacies.id"), nullable=True)
    status = Column(String, default="active") # active, notified, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="alerts")


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    pharmacy_id = Column(String, ForeignKey("pharmacies.id"))
    medicine_id = Column(String, ForeignKey("medicines.id"))
    quantity = Column(Integer, default=1)
    total_price = Column(Float, default=0.0)
    status = Column(String, default="pending") # pending, confirmed, ready_for_pickup, completed, cancelled
    pickup_date = Column(String, nullable=False)
    customer_phone = Column(String, default="")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reservations")
    pharmacy = relationship("Pharmacy", back_populates="reservations")


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=True)
    medicine_id = Column(String, nullable=True)
    query = Column(String, nullable=False)
    searched_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    link = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

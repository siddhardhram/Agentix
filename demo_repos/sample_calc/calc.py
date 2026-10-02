"""
Sample Calculator Demo Module
Provides basic arithmetic operations with graceful validation.
"""

def add(a: float, b: float) -> float:
    return a + b

def subtract(a: float, b: float) -> float:
    return a - b

def multiply(a: float, b: float) -> float:
    return a * b

def divide(a: float, b: float) -> float:
    """Divide a by b. Raises ZeroDivisionError if divisor is zero."""
    if b == 0:
        raise ZeroDivisionError("division by zero")
    return a / b

"""
Unit tests for Sample Calculator Demo Repo
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.resolve()))

import pytest
from calc import add, subtract, multiply, divide

def test_add():
    assert add(2, 3) == 5

def test_subtract():
    assert subtract(5, 2) == 3

def test_multiply():
    assert multiply(3, 4) == 12

def test_divide():
    assert divide(10, 2) == 5

def test_divide_by_zero():
    # Test zero-division error handling
    with pytest.raises(ZeroDivisionError):
        divide(10, 0)

if __name__ == "__main__":
    pytest.main([__file__])

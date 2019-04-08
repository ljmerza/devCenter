"""Test the AESCipher class."""
import pytest

from devcenter.aes_cipher import AESCipher


def test_aes_cipher():
    """Tests AESCipher class."""
    key = 'test_key'
    password = 'password'

    cipher = AESCipher(key=key)
    assert cipher

    encrypted_password = cipher.encrypt(password)
    assert encrypted_password != password

    decrypted_password = cipher.decrypt(encrypted_password)
    assert decrypted_password == password
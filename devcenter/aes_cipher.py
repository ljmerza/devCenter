"""Creates AES based encryption."""
import base64
import hashlib

from Crypto import Random
from Crypto.Cipher import AES


class AESCipher():
    """Creates AES based encryption."""

    def __init__(self, key): 
        """Config the crypto key."""
        self.key = hashlib.sha256(key.encode()).digest()

    @staticmethod
    def _unpad(s):
        return s[:-ord(s[len(s)-1:])]

    @staticmethod
    def _pad(s):
        """Add padding for encryption."""
        return s + (AES.block_size - len(s) % AES.block_size) * chr(AES.block_size - len(s) % AES.block_size)

    def encrypt(self, raw):
        """Encrypt some raw data."""
        raw = self._pad(raw)
        iv = Random.new().read(AES.block_size)
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        return base64.b64encode(iv + cipher.encrypt(raw)).decode("utf-8")

    def decrypt(self, enc):
        """Decrypt some raw data."""
        enc = base64.b64decode(enc)
        iv = enc[:AES.block_size]
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        return self._unpad(cipher.decrypt(enc[AES.block_size:])).decode('utf-8')
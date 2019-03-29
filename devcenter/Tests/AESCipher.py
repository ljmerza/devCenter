from AESCipher import AESCipher

key = 'wqer3456rtehg'
aes = AESCipher(key)

encrypted_password = aes.encrypt('password')
print(encrypted_password)

decrypted_pasword = aes.decrypt(encrypted_password)
print(decrypted_pasword)
https://www.powershellgallery.com/packages/DRTools/4.0.2.3/Content/Functions%5CInvoke-AESEncryption.ps1

A lightweight PowerShell script for AES‑256 CBC encryption with SHA‑256 key derivation.

# Installation
```powershell-session
Import-Module .\Invoke-AESEncryption.ps1
```

# Use
```sh
# Encrypt a string
Invoke-AESEncryption -Mode Encrypt -Key "p@ssw0rd" -Text "SecretText"
# Decrypt a string
Invoke-AESEncryption -Mode Decrypt -Key "p@ssw0rd" -Text "<Base64Cipher>"

# Encrypt a file
Invoke-AESEncryption -Mode Encrypt -Key "p@ssw0rd" -Path .
esults.txt
# Decrypt the file
Invoke-AESEncryption -Mode Decrypt -Key "p@ssw0rd" -Path .
esults.txt.aes
```


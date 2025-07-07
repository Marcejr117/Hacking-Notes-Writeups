Es una herramienta que nos permite conectarnos a instancias de bases de datos oraclepor el protocolo Oracle TNS

# Instalaccion
```shell-session
wget https://download.oracle.com/otn_software/linux/instantclient/214000/instantclient-basic-linux.x64-21.4.0.0.0dbru.zip
wget https://download.oracle.com/otn_software/linux/instantclient/214000/instantclient-sqlplus-linux.x64-21.4.0.0.0dbru.zip
sudo mkdir -p /opt/oracle
sudo unzip -d /opt/oracle instantclient-basic-linux.x64-21.4.0.0.0dbru.zip
sudo unzip -d /opt/oracle instantclient-sqlplus-linux.x64-21.4.0.0.0dbru.zip
export LD_LIBRARY_PATH=/opt/oracle/instantclient_21_4:$LD_LIBRARY_PATH
export PATH=$LD_LIBRARY_PATH:$PATH
source ~/.bashrc
cd ~
git clone https://github.com/quentinhardy/odat.git
cd odat/
pip install python-libnmap
git submodule init
git submodule update
pip3 install cx_Oracle
sudo apt-get install python3-scapy -y
sudo pip3 install colorlog termcolor passlib python-libnmap
sudo apt-get install build-essential libgmp-dev -y
pip3 install pycryptodome
```
# Uso
- conectando a una instancia
```shell-session
sqlplus scott/tiger@10.129.204.235/XE
```

- impersonando a un usuario (concretamente el administrador de la db, para tener mas privilegios)
```shell-session
sqlplus scott/tiger@10.129.204.235/XE as sysdba
```


> [!error]- Error: `sqlplus: error while loading shared libraries: libsqlplus.so: cannot open shared object file: No such file or directory`
> ```shell-session
sudo sh -c "echo /usr/lib/oracle/12.2/client64/lib > /etc/ld.so.conf.d/oracle-instantclient.conf";sudo ldconfig
>```

# Commandos
https://docs.oracle.com/cd/E11882_01/server.112/e41085/sqlqraa001.htm#SQLQR985

- Nombre de todoas las bases de datos
```shell-session
select table_name from all_tables;
```

- Privilegios del usuario
```shell-session
select * from user_role_privs;
```

![[../assets/Pasted image 20250707104435.png]]
- Impersonar
```shell-session
sqlplus scott/tiger@10.129.204.235/XE as sysdba
```

- obtener los hashes de las password de los usuarios
```shell-session
select name, password from sys.user$;
```
![[../assets/Pasted image 20250707104635.png]]

herramienta para enumerar varios tipos de inyecciones
https://github.com/sqlmapproject/sqlmap
web: https://sqlmap.org/

![[Pasted image 20240423174037.png]]
```bash
sqlmap -r requiest.req -p uid --batch --dbs --dbms mysql --proxy http://127.0.0.1:8000
```

- '--batch': es para que te ponga la opcion por defecto cuando te pregunta si quires hacer algo
- '--dbs': es paraobtener las bases de datos
- '--dbms mysql': indicarle que la base de datos es mysql
- '--proxy': ponemos que las peticiones pasen por un proxy
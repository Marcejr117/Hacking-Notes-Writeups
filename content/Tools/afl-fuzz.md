Inyecta datos en el input de un programa en busca de algún fallo o 0Day

Ejemplo con **AFL (American Fuzzy Lop)**:

```shell
sudo apt install afl
afl-fuzz -i inputs/ -o outputs/ -- ./programa @@
```

- **inputs/** → Carpeta con datos de prueba.
- **outputs/** → Carpeta con resultados y crashes.


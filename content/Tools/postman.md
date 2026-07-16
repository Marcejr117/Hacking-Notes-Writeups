Para mas info: [[18. Abuso de APIs]]

https://techbear.co/install-postman-debian-linux/
Instalamos `snapd`
```bash
apt isntall snapd
```
y ahora
```bash
wget https://dl.pstmn.io/download/latest/linux64 -O postman-linux-x64.tar.gz
sudo tar -xzf postman-linux-x64.tar.gz -C /opt
sudo ln -s /opt/Postman/Postman /usr/bin/postman
```

![[Pasted image 20240924183013.png]]

para activar todas las funciones de postman
```
La otra opción personalmente la que utilicé fue la siguiente: Ejecuta Postman (teniendo en cuenta que está en modo "cliente ligero") Abre DevTools (Ctrl+Shift+i) Escribe en la consola pm.settings.setSetting("offlineAPIClientEnabled",0) - esto desactivará el cliente ligero y cambiará a ScratchPad Reinicia Postman (verás brevemente la interfaz de ScratchPad pero estará oculta con una pantalla de login) Abra DevTools de nuevo (si el acceso directo no funciona simplemente vaya a la pestaña Ver->Desarrollador->mostrar DevTools) Escribe en la consola pm.mediator.trigger("hideUserSwitchingExperienceModal") lo malo es que los últimos dos pasos se repiten cada que abran postman **Referencia en el StackOveflow de arriba ^
```
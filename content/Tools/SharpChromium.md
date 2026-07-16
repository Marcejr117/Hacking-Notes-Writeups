https://github.com/djhohnstein/SharpChromium

nos permite extraer las contraseñas en texto claro de Chromium, para que funcione en las ultimas versiones he hecho esta modificacion
![[Pasted image 20240513115511.png]]
para que las rutas esten bien, si quieres que mire las de otros nevegadores basados en chromium, solo debes modificar las rutas a las de ese navegador.
![[Pasted image 20240513115854.png]]

en chrome todo excepto las cookies esta en:
`C:\Users\Marce\AppData\Local\Google\Chrome\User Data\Profile 1`
y las cookies en 
`C:\Users\Marce\AppData\Local\Google\Chrome\User Data\Default\Network\cookies`

otros nevegadores debemos solamente asegurarnos de que los archivos estaan en esas localizaciones

*Este exe esta compilado para Google Chrome en Perfil1*
![[SharpChromium.exe]]

*este es el proyecto (por si lo cerraran)*
![[SharpChromium.rar]]

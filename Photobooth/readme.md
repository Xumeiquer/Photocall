Para que el photocall se ponga en marcha, primero hay que activar la siguiente linea en .bashrc:

python3 /home/pi/project_planb/photocall.py >> /home/pi/project_planb/logs_photocall.txt 2>> /home/pi/project_planb/logs_error_photocall.txt

Es la última linea que hay en el fichero.

Después hay que volver a habilitar los siguientes servicios:

systemctl disable planb-filecontrol.service
systemctl disable planb-googlecontrol.service

Que han sido deshabilitados (justo dichas instrucciones). Los ficheros se guardan en /etc/systemmd/system/

hay una copia de los mismos dentro de la carpeta del proyecto.

Así, los tres procesos arrancan sin problemas.


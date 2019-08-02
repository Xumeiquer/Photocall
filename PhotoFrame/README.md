# Photo Frame 

Este proyecto está basado en el proyecto PhotoFrame de google: 

https://github.com/googlesamples/google-photos/tree/master/REST/PhotoFrame

Pero con cambios para adaptarse a los requisitos particulares del proyecto.

# Limitaciones

Estas son algunas de las limitaciones de la api:
 - Solo se pueden subir fotos a una carpeta que ha sido creada por la propia api
 - Google solo devuelve un máximo de 200 fotos
 
# Cambios Pendientes

Todavía hay algunos cambios pendientes de actualizar o errores que resolver:

- [Cambio] Actualizar la función de createAlbum para que se adapte al nuevo formato de almacenar albumes definido en config.js
- [Error] Al cargar la página, carga sin ningún problema. Sin embargo, al refrescar automáticamente en busca de nuevas fotos (llamada a /newFiles), da un error que no se producía en el momento de implementación y puesta en producción.
    - Se encuentra en la linea 624 en la siguiente instrucción
    >    config.albumList[data.albums[i].id].existing = data.albums[i].mediaItemsCount;
 

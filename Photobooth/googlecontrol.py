from __future__ import print_function
from apiclient.discovery import build
from httplib2 import Http
from oauth2client import file, client, tools

import sys
import json
import requests
import logging
import threading
import signal, os, subprocess
import sys



from datetime import datetime
from time import sleep


import json
import urllib


logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s:%(name)s:%(message)s"
)
    

logging.getLogger('googleapicliet.discovery_cache').setLevel(logging.ERROR)



# TODO cambiar album a albumId, title, shared

class GoogleControl(object):
    def __init__(self):
        self.SCOPES = [
            'https://www.googleapis.com/auth/photoslibrary',
            'https://www.googleapis.com/auth/photoslibrary.sharing',
            'https://www.googleapis.com/auth/photoslibrary.appendonly'
        ]

        self.UPLOAD_URL = 'https://photoslibrary.googleapis.com/v1/uploads'
        self.BATCH_CREATE_URL = 'https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate'
        self.GET_URL = 'https://photoslibrary.googleapis.com/v1/albums'
        self.GET_SHARED_URL = 'https://photoslibrary.googleapis.com/v1/sharedAlbums'
        self.CREATE_ALBUM_URL ='https://photoslibrary.googleapis.com/v1/albums'
        self.SHARE_URL = 'https://photoslibrary.googleapis.com/v1/albums/{}:share'
        
        self.STORAGE = '/home/pi/configGphotos.json'




        self.google_path = "/home/pi/project_planb/images/google_path"
        self.processed_path = "/home/pi/project_planb/images/processed"


        self.task = threading.Thread(target=self._run_task)
        self.active= True

        self.album={"albumId":None,"title":None, "shared": None}
        self.store = file.Storage(self.STORAGE)
        self.creds = self.store.get()

        self.service = None

        self.waiting_time= 60
        if not self.creds or self.creds.invalid:
            self.flow = client.flow_from_clientsecrets('/home/pi/assistant.json', self.SCOPES)
            self.creds = tools.run_flow(self.flow, self.store)
        #self.service = build('photoslibrary', 'v1', http=self.creds.authorize(Http()))
       
        signal.signal(signal.SIGTERM, self.stopthread)
        signal.signal(signal.SIGINT, self.stopthread)
      
    def stopthread(self, signum, frame):
        self.stop()

        
    def setWaiting(self, waiting_time):
        self.waiting_time=waiting_time

    def stop(self):
        self._log("\nStopping Google Control")
       
        self.__del__()
        

    def __del__(self):
        sys.exit(0)

    def _log(self, msg):
        logging.info("[GoogleControl]: %s" % msg)


    def start(self):
        """ Start the application"""
        self._log("Start")
        self.task.start()


        self.createFolder(self.processed_path)
        self.createFolder(self.google_path)


    def _run_task(self):
        
        self._log("Running Task")

        while self.active:
            self._checkNewFiles()
            sleep(self.waiting_time)
        self._log("Stopped")



   

    def token(self):
        if self.creds.access_token_expired:
            self.creds.refresh(Http())
        return self.creds.access_token

    def getHeader(self, type, picture="" ):
        token = self.token()
        header = {'Authorization': 'Bearer ' + token}
        

        if type == "upload":
            header['Content-type']='application/octet-stream'
            header['X-Goog-Upload-File-Name']=picture
            header['X-Goog-Upload-Protocol']= 'raw'

        elif type == "upload" or type =="get" or type =="batchCreate":
            header['Content-type']= 'application/json'
        
        elif type == "createAlbum" or type=='share':
            header['Content-type']= 'application/json'
            header['Accept']= 'application/json'
        
      

        return header



    def getAlbumList(self, shared=False):
        token = self.token()
        

        if shared:
            URL = self.GET_SHARED_URL
            variables = 'sharedAlbums'
        else:
            URL = self.GET_URL
            variables = 'albums'

        r = requests.get(URL, headers=self.getHeader("get"))

        albums = json.loads(r.text)

        items = albums.get(variables, [])

        return items



    def printListOfAlbums(self):
        shared=True
        items = self.getAlbumList(shared)
        if not items:
            self._log('No albums found.')
        else:
            self._log('LISTA DE ALBUMS: (Shared? %r) ' % shared)
            for item in items:
                self._log('{0} ({1})'.format(item['title'].encode('utf8'), item['id']))
                self._log(item)

        shared=False
        items = self.getAlbumList(shared)
        if not items:
            self._log('No albums found.')
        else:
            self._log('LISTA DE ALBUMS: (Shared? %r) ' % shared)
            for item in items:
                self._log('{0} ({1})'.format(item['title'].encode('utf8'), item['id']))
                self._log(item)

    def getAlbum(self, title, setAlbum=True, shared=False):

        if self.album['title'] == title:
            self._log("Devolucion directa")
            return self.album

        if shared:
            items = self.getAlbumList(True)
        else:
            items = self.getAlbumList()


        if not items:
            self._log('No albums found.')
        else:
            self._log('LISTA DE ALBUMS: (Shared? %r) ' % shared)
            for item in items:
                self._log('{0} ({1})'.format(item['title'].encode('utf8'), item['id']))
                if title == item['title']:
                    if 'shareInfo' in item:
                        shared=True
                    else:
                        shared=False
                    if setAlbum:
                        self.album['title'] = title
                        self.album["albumId"] = item['id']
                        self.album["shared"]= shared


                    return self.album
                
        return None




    def upload(self, picture, album=None):
        if album is None:
            album = self.album

        if album['title'] is None:
            self._log("No se puede subir archivo, el album destino no existente")
            return False
        
        
        token = self.token()

        f = open(picture, 'rb').read();
        r = requests.post(self.UPLOAD_URL, headers=self.getHeader("upload"), data=f)#files=files)
       
        if r.ok:
            self._log("Upload successful")
        else:
            self._log("ERROR UPLOADING PICTURE")

        print(r.content)
        upload_token = r.text

        
        return upload_token



    def sendToAlbum(self,uploadToken, album=None, title="Titulo"):
        if album is None:
            album = self.album

        if album['title'] is None:
            print("No se puede asociar al album la imagen")
            return False
            

        token = self.token()
        


        body = {
            'newMediaItems' : [
                    {
                    "description": title,
                    "simpleMediaItem": {
                        "uploadToken": uploadToken
                    }
                }
            ]
        }

       
        body['albumId'] = album['albumId']
        
        bodySerialized = json.dumps(body)

        r = requests.post(self.BATCH_CREATE_URL, headers=self.getHeader("batchCreate"), data=bodySerialized)

        print(r.content)

        data = json.loads(r.text)


        mediaItems = data.get("newMediaItemResults", [])
      

        for item in mediaItems:
            if item['status']['message'] == 'OK':
                self._log("Se ha asociado correctamente la imagen al album")
                self._log("URL: %s" % item['mediaItem']['productUrl'])

      
    


    def shareAlbum(self,album=None,setAlbum=True):
        if album is None:
            album = self.album

        if album['title'] is None:
            self._log("No se puede compartir el album ya que no existe")
            return False
        
        if album['shared'] == True:
            self.album = album
            return True

        body = {
            "sharedAlbumOptions": {
                "isCollaborative": True,
                "isCommentable": True
                }
            }


        bodySerialized = json.dumps(body)

        r = requests.post(self.SHARE_URL.format(album['albumId']), headers=self.getHeader("share"), data=bodySerialized)#, params=paramSerialized)

        data = json.loads(r.text)
        print(r.text)

        if "error" in data:
            self._log("ERROR: %s" % data['error']['message'])
        else:
            self.album=album
            album['shared']=True





    def createAlbum(self, title, setAlbum=True):

        album = self.getAlbum(title)
        if album is not None:
            self._log("Album ya existente")
            return album

        album = self.getAlbum(title, shared=True)
        
        if album is not None:
            return album


        self._log("Creating Album:%s" % title)

        token = self.token()


        body = {
            'album' : 
                    {
                    "title": title
                    }
            
        }

        bodySerialized = json.dumps(body)
        r = requests.post(self.CREATE_ALBUM_URL, headers=self.getHeader("create"), data=bodySerialized)
        #print("Respuesta:%s" % r.text)

        data = json.loads(r.text)
        album = {"albumId":data['id'],"title":data['title'], "shared": False}
        if setAlbum:
            self.album= album

        return album



    def isShared(self, album=None):
        if album is not None:
            return album['shared']

        album = self.album

        if album is not None:
            return album['shared']

        self._log("Album no existente para revisar si es compartido")
        return False
        



    def _getMoveInstruction(self, filename):
        self._log("Moving %s" % filename)
        return "mv " + self.google_path+"/"+filename + " " + self.processed_path + "/" + filename

    def _checkNewFiles(self):
#        if len(os.listdir(self.save_path)) > 2:
        self._log("Files: %d" % len(os.listdir(self.google_path)))
        for item in os.listdir(self.google_path):
            self._log("File: %s" % item)
            if(item.lower().startswith('.')):
                self._log("Omit file: %s" % item)
            elif(item.lower().endswith('.jpg')):
                self._log("Processing:%s"% item)
                #self._log("Instruction: %s" % self._getProcessInstruction(item,self._getFileName()))
                #subprocess.call(self._getProcessInstruction(item,self._getFileName()),shell=True)

                self._log("Uploading: {0}/{1}".format(self.google_path, item))
                token = self.upload("{0}/{1}".format(self.google_path, item))
                self.sendToAlbum(token,title=item)
                self._log("Instruction: %s" % self._getMoveInstruction(item))
                subprocess.call(self._getMoveInstruction(item), shell=True)
            else:
                self._log("Omit file: %s" % item)
        self._log("Processed files")


    def createFolder(self,folder):#,moveToFolder):
        
        try:
            if os.path.isdir(folder) is False:
                self._log("Creating folder: %s" % folder)
                os.makedirs(folder)
            else:
                self._log("Folder %s already exists." % folder)
        except:
            self._log("Failed to create the new directory.")







def main():
    GC= GoogleControl()
    GC.createAlbum("Patricia y Jose Juan")
  #  GC.printListOfAlbums()
     #GC.get()
    """
    print(GC.createAlbum("Ejemplo Subida3"))
    print(GC.getAlbum("Ejemplo Subida3"))
    token = GC.upload("result.jpg")
    GC.sendToAlbum(token)

    print("Shared:")
    GC.getAlbumList(True)
    GC.getAlbum("Ejemplo Subida3")
    print(GC.isShared())
    print(GC.shareAlbum())
    print(GC.isShared())
    """
#    GC.createAlbum("Carga de fotos en pruebas")
#    GC._checkNewFiles()
    GC.start()
    """try:
        
        #GC.get()
        print(GC.createAlbum("Ejemplo Subida"))
        print(GC.getAlbum("Ejemplo Subida"))
        token = GC.upload("result.jpg")
        GC.sendToAlbum(token)

        print("Shared:")
        GC.getAlbumList(True)
        GC.createAlbum("NuevoAlbum")
        print(GC.isShared())

    except Exception as e:
        print("Excepcion capturada")
        print(e)
        GC.stop()
        sys.exit(0)
"""
    

if __name__== '__main__':
    main()

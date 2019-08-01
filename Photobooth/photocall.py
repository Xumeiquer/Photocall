#!/usr/bin/env python3


#from __future__ import print_function

from time import sleep

#from sh import gphoto2 as gp

#import signal, os, subprocess
import signal
import logging
import platform
import sys
import threading
from ledcontrol import LedControl
from filecontrol import FileControl
from buttoncontrol import ButtonControl
from cameracontrol import CameraControl
from googlecontrol import GoogleControl

import subprocess, os

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s:%(name)s:%(message)s"
)
    

class PhotoCall(object):
    """ Class to define the photocall object, 
    that will take pictures after button detection
    """

    def __init__(self):
        self.task = threading.Thread(target=self._run_task)
        
        

        #self.captureDownload =['--capture-image-and-download','--keep-raw','--keep']
                          #/home/pi/project_planb/images/fotos_2018-11-12_PruebaPlanB
        #self.defaultImg = "/home/pi/project_planb/images/fondo_pre_foto.png"
        self.defaultImg = "/home/pi/project_planb/images/default_photo.jpg"
        self.defaultImgLoop = "/home/pi/project_planb/images/processed/*.jpg"
        self.pendingPath = "/home/pi/project_planb/images/pending/"
        self.fbiPID = 0
        self.PREfbipID = 0
        self.fbi = None
        self.PREfbi = None 

        self.led = LedControl()
        self.file = FileControl()
#        self.file.setWaiting(25)

        self.button = ButtonControl()
        self.camera = CameraControl()
#        self.google = GoogleControl()
#        self.google.setWaiting(35)
        
        
        #self.camera=False
        #self.back_counter=3
        #self.audioCall="aplay /home/pi/project_planb/audio/camera-shutter-click-01.wav"

        #signal.signal(signal.SIGINT, signal.SIG_IGN)
        signal.signal(signal.SIGTERM, self.stopthread)
        signal.signal(signal.SIGINT, self.stopthread)
      
    def stopthread(self, signum, frame):
        self.stop()

        

    def stop(self):
        print("\nThanks for Using Plan B Photocall")
       
#        self.file.stop()
#        self.google.stop()   
        self.led.off()
        self.__del__()
        

    def __del__(self):
        
        sys.exit(0)
        

    def start(self):
        """ Start the application"""
        self._log("start")
        #self._killgphoto2Process()

        self.camera.setCamera(True)
        self.camera.start()
#        self.file.start()
        self.file.createFolders()
        self.led.start()
        self.task.start()

        #q = subprocess.Popen(["fbi","-a","-noverbose", "-t 3", self.defaultImgLoop]).pid #, "-t 3"
        self.fbi = subprocess.Popen("fbi -a -noverbose -t 3 {0}".format(self.defaultImgLoop), shell=True)
        #self._log("PID:%d" % self.fbiPID)

     #   img = Image.open(self.defaultImg)
     #   img.show()


#        self.google.createAlbum("Patricia y Jose Juan")
#        self.google.start()
#fbi -a -t 3 *.JPG
    def _run_task(self):
        try:
            self._log("_run_task: Running Task")

            print("Pulsa el boton")


            self.button.setCallback(self._on_button_pressed)

            self.led.start()      
            while True:
                sleep(10)
                self.led.change()

        except KeyboardInterrupt:
            print("Interrupcion detectada")
        except:
            print("ERROR DETECTADO")

    def _on_button_pressed(self):
        self._log("_on_button_pressed")
        #change led light
        #take picture

        #self._log("PID:%d" % self.fbi.pid)
        #os.kill(self.fbi.pid, signal.SIGKILL)
        #self.fbi.stdin.write(b'q') -noverbose
        os.system("sudo killall -9 fbi")
        self.fbi = subprocess.Popen("fbi -noverbose -a  {0}".format(self.defaultImg),shell=True)
        self.led.off()
        self.camera.capture()    
        os.system("sudo killall -9 fbi")

        files = filter(os.path.isfile, os.listdir(self.pendingPath))
        files = [os.path.join(self.pendingPath, f) for f in files]
        files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
        self._log("Files: %s" % files)
        self._log("File: %s" % files[0])

        self.fbi = subprocess.Popen("fbi -noverbose -a  {0}".format(files[0]),shell=True)
#

#        self.fbi = subprocess.Popen('ls -rt -1 /home/pi/project_planb/images/pending | tail -n 1 | awk \'{print "/home/pi/project_planb/images/pending/"$1}\'', shell=True)
#        self.fbi = subprocess.Popen('ls -rt -1 /home/pi/project_planb/images/pending | tail -n 1 | awk \'{print "/home/pi/project_planb/images/pending/"$1}\' | fbi -a', shell=True)
        sleep(10);
        os.system("sudo killall -9 fbi")

        self.led.on()
        #self.fbi.terminate()
        os.system("sudo killall -9 fbi")
        self.fbi = subprocess.Popen("fbi -a -noverbose -u -t 3 {0}".format(self.defaultImgLoop), shell=True)
        #self.PREfbipID = self.fbiPID 
        #os.kill(self.fbiPID, signal.SIGKILL)
        #self.fbiPID = subprocess.Popen("fbi -a -noverbose -t 3 {0}".format(self.defaultImgLoop), shell=True).pid
        #self._log("PID:%d" % self.fbiPID)
        




    def _log(self, msg):
        logging.info("[PhotoCall]: %s" % msg)



def main():
    PC= PhotoCall()
    try:
        
        PC.start()
    except Exception as e:

        print("Excepcion capturada:", e)
        PC.stop()
        try:
            logging.info("Finalizando programa")
            sys.exit(0)
        except SystemExit:
            os._exit(0)
    

if __name__== '__main__':
    main()

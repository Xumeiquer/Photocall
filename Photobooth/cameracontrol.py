from sh import gphoto2 as gp
from time import sleep

import signal, os, subprocess
import logging

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s:%(name)s:%(message)s"
)




class CameraControl(object):
    def __init__(self):
        self.captureDownload =['--capture-image-and-download','--keep-raw','--keep']

        self.liveView = "gphoto2 --capture-movie --stdout > fifo.mjpg & omxplayer fifo.mjpg --live"

        self.camera=False
        self.back_counter=10
        self.audioCall="aplay /home/pi/project_planb/audio/camera-shutter-click-01.wav"

        self.testFoto="/home/pi/project_planb/result.jpg"

        self.WaitingImgLoop = "/home/pi/project_planb/images/waiting/*"
        
        

    def _log(self, msg):
        logging.info("[CameraControl]: %s" % msg)

    def start(self):
        self._log("Starting CameraControl")
        self._killgphoto2Process()

    def setCamera(self, camera):
        self.camera=camera

    def capture(self):
        self._log("Capturing")

        print("pulsado!")
        print("Sonrie en...")
        sleep(1)
        #p = subprocess.Popen(['gphoto2','--capture-movie', '--stdout', '>', '../fifo.mjpg']).pid
        #p = subprocess.call(self.liveView,shell=True).pid
        p = subprocess.call("gphoto2 --capture-movie --stdout > ../fifo.mjpg &", shell=True)
        #q = subprocess.call("omxplayer ../fifo.mjpg --live", shell=True)
        q = subprocess.Popen(["omxplayer","../fifo.mjpg", "--live"]).pid
        logging.info("p %s", p)
        logging.info("q %s", q)
        started = False
        os.system("sudo killall -9 fbi")
        sleep(5)
        subprocess.Popen("fbi -a -noverbose  -t 6 {0}".format(self.WaitingImgLoop), shell=True)
        sleep(3)
        #for i in range (self.back_counter,0,-1):
         #   print(i)
         #   if(i>self.back_counter/2):
         #       subprocess.Popen("fbi -a -noverbose  -t 3 {0}".format(self.WaitingImgLoop), shell=True)
                
          #  if(i>=self.back_counter-2 and started==False):
          #      subprocess.Popen("fbi -a -noverbose  -t 3 {0}".format(self.WaitingImgLoop), shell=True)
          #      started=True
          #  sleep(1)
       
        #os.system("sudo killall -9 fbi")
        
        

        #
        #os.kill(p)
        #os.kill(q, signal.SIGKILL)
        self._killomxplayerProcess()
        sleep(1)
        self._captureImages() 

    def _killomxplayerProcess(self):
        self._log("killing omxplayer")
        p = subprocess.Popen(['ps', '-A'], stdout=subprocess.PIPE)
        out, err = p.communicate()

        for line in out.splitlines():
            if b'omxplayer.bin' in line:
                pid = int(line.split(None,1)[0])
                os.kill(pid, signal.SIGKILL)


    #kill gphoto2 process that starts whenever we connect the camera

    def _killgphoto2Process(self):
        self._log("Killing starting process")
        p = subprocess.Popen(['ps','-A'], stdout=subprocess.PIPE)
        out, err = p.communicate()

        #search for the line that has the subprocess we wan to kill
        for line in out.splitlines():
            if b'gvfsd-gphoto2' in line:
                #kill the process!
                pid = int(line.split(None,1)[0])
                os.kill(pid,signal.SIGKILL)


    def _captureImages(self):
        if self.camera:
            gp(self.captureDownload)
        else:
            print("FOTOOOOOOO!")
            subprocess.call(self.audioCall,shell=True)
            subprocess.call("cp %s /home/pi/project_planb/images/pending/" % (self.testFoto) , shell=True)

        print("Pulsa el boton")
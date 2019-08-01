import logging
import threading
import signal, os, subprocess
import sys


from datetime import datetime
from time import sleep


"""
    TODO: anyadir verificacion para ver si existe el logo
"""



logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s:%(name)s:%(message)s"
)
    





class FileControl(object):
    def __init__(self):
        self.activeLogging=True


        self._log("__init__")
        self.task = threading.Thread(target=self._run_task)
        self.active = True

        self.shot_date = datetime.now().strftime("%Y-%m-%d")
        self.shot_time = datetime.now().strftime("%Y-%m-%d %H%M%S")
        self.picID = "BodaPatriciaJoseJuan"
        
        self.save_path = "/home/pi/project_planb/images/pending"
        self.processed_path = "/home/pi/project_planb/images/processed"
        self.google_path = "/home/pi/project_planb/images/google_path"

        self.folder_name = self.shot_date +"_"+ self.picID
        self.save_location = self.save_path + "_" + self.folder_name
        

        self.logo = "/home/pi/project_planb/images/logo.png"
        self.logo_resized = "/home/pi/project_planb/images/logo1800.png"

        self.size =" 1800 "
        self.waiting_time= 60
        #self.process_file="convert images/pending/_MG_1580.JPG images/logo.png -composite result.jpg"

        self.processing_in_progress=False


    def _log(self, msg):
        if self.activeLogging:
            logging.info("[FileControl]: %s" % msg)

    def setWaiting(self, waiting_time):
        self.waiting_time=waiting_time

    def createFolders(self):
        self.createFolder(self.save_path)
        self.createFolder(self.processed_path)
        self.createFolder(self.google_path)
        self.moveToFolder(self.save_path)

    def start(self):
        """ Start the application"""
        self._log("Start")
        self.createFolders()
        self.task.start()


#        self.moveToFolder(self.save_path)

    def _run_task(self):
        
        self._log("Running Task")

        while self.active:
            self._checkNewFiles()
            sleep(self.waiting_time)
        self._log("Stopped")
        

    def _getResizeInstruction(self,fileName,newFileName):
        self._log("Resizing %s to %s" % (fileName, newFileName))
        return "convert " + self.save_path + "/" + fileName + " -resize " + self.size + self.save_path + "/" + newFileName

    def _getProcessInstruction(self, fileName, newFileName):
        self._log("Converting %s to %s" %(fileName, newFileName))
        return "convert " + self.save_path + "/"+fileName + " " + self.logo_resized + " -composite " + self.google_path +"/" + newFileName 
        #return "mv " + self.save_path+"/"+fileName + " " + self.google_path + "/" + newFileName

    def _getMoveInstruction(self, filename):
        self._log("Moving %s" % filename)
        return "mv " + self.save_path+"/"+filename + " " + self.processed_path + "/" + filename


    def _checkNewFiles(self):
#        if len(os.listdir(self.save_path)) > 2:
        self._log("Files: %d" % len(os.listdir(self.save_path)))
        for item in os.listdir(self.save_path):
            self._log("File: %s" % item)
            if(item.lower().startswith('.')):
                pass
#                self._log("Omit file: %s" % item)
            elif(item.lower().endswith('.jpg')):
                self._log("Processing:%s"% item)
                newName= self._getFileName()
                tempName= "tempFile.jpg"
                self._log("Instruction: %s" % self._getResizeInstruction(item,tempName))
                subprocess.call(self._getResizeInstruction(item, tempName), shell=True)
                self._log("Instruction: %s" % self._getProcessInstruction(tempName,newName))
                subprocess.call(self._getProcessInstruction(tempName,newName),shell=True)
                self._log("Instruction: %s" % self._getMoveInstruction(item))
                subprocess.call(self._getMoveInstruction(item), shell=True)
                subprocess.call(self._getMoveInstruction(tempName), shell=True)

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



    def moveToFolder(self, folder):
        os.chdir(folder)


    def stop(self):
        self._log("Stopping FileControl")
        self.active=False
        sys.exit(0)






    def _getFileName(self):
        return self.picID + "_" + datetime.now().strftime("%y%m%d_%H%M%S") + ".jpg"




def main():
    FC = FileControl()
    FC.start()



if __name__== '__main__':
    main()

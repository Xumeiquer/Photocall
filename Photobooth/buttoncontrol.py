import aiy.voicehat
import logging



logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s:%(name)s:%(message)s"
)
   
# TODO: Comment properly



class ButtonControl(object):

	def __init__(self, callback=None):
		self._log("Setting button Callback")
		self.callback=callback
		aiy.voicehat.get_button().on_press(self.callback)

	def setCallback(self, callback):
		self._log("Setting button Callback")
		self.callback=callback
		aiy.voicehat.get_button().on_press(self.callback)


	def _log(self, msg):
		logging.info("[ButtonControl]: %s" % msg)
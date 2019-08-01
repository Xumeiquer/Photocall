import aiy.voicehat
import logging


logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s:%(name)s:%(message)s"
)


#TODO: Comment Properly


class LedControl(object):
    """ Class to define the led lights control.
        v1: button led
        """
    def __init__(self):
        self.activeLogging= False
        self.led = aiy.voicehat.get_led()
        self.led_state= self.led.BLINK_3
        self.led_status= False

    def _log(self, msg):
        if self.activeLogging:
            logging.info("[LedControl]: %s" % msg)


        # LED CONTROL
    def off(self):
        self._log("Button led Off")
        self.led.set_state(self.led.OFF)
        self.led_status=False

    def on(self):
        self._log("Button led On")
        self.led.set_state(self.led_state)
        self.led_status=True

    def start(self):
        self._log("Start")
        #status_ui = aiy.voicehat.get_status_ui()
        #status_ui.status('starting')
        #status_ui.status('ready')
        self.led.start()
        self.off()
        self.on()

    def change(self):
        self._log("Change")
        if self.led_state==self.led.BLINK:
            self.led_state = self.led.BLINK_3
        elif self.led_state==self.led.BLINK_3:
            self.led_state = self.led.PULSE_QUICK
        elif self.led_state==self.led.PULSE_QUICK:
            self.led_state = self.led.BLINK

        if self.led_status:
            self.led.set_state(self.led_state)
        logging.debug("led state:%s", self.led_state)

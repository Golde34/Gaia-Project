class KafkaMessage:
    def __init__(self, cmd, error_code: str, error_message: str, display_time: str, data: any):
        self.cmd = cmd
        self.error_code = error_code
        self.error_message = error_message
        self.display_time = display_time
        self.data = data
    
    def to_dict(self):
        # Converts the KafkaMessage object to a dictionary for JSON serialization
        return {
            "cmd": self.cmd,
            "errorCode": self.error_code,
            "errorMessage": self.error_message,
            "displayTime": self.display_time,
            "data": self.data
        }
    
    def __str__(self):
        return f"cmd: {self.cmd}, error_code: {self.error_code}, error_message: {self.error_message}, display_time: {self.display_time}, data: {self.data}"
import schedule
import time
from datetime import datetime
import threading
import sys

from AgentTool import start_agent

print("Python executing job:", sys.executable)

def job():
    try:
        start_agent()
        print("PDF generation completed.")
    except Exception as e:
        print(f"Error in start_agent(): {e}")

def start_job():
    print("Scheduled job started")
    try:
        schedule.every(10).seconds.do(job)
        print(f"Running scheduled job at {datetime.now()}")
        def run_scheduler():
            while True:
                schedule.run_pending()
                time.sleep(1)
 
        thread = threading.Thread(target=run_scheduler, daemon=True)
        thread.start()

    except Exception as e:
        print(f"Failed to complete job: {e}")
    
def stop_job():
    print("Stopping scheduled jobs")
    schedule.clear()
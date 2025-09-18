import json
from collections import defaultdict
import os
import schedule
import time


def job():
    from api_connection import data

schedule.every(24).hours.do(job)

while True:
    schedule.run_pending()
    time.sleep(60) # check once per minute
    print("running", end="")

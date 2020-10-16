"""
 *
 * Copyright 2010-2020 Australian Signals Directorate
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
"""

import logging
import time
from celery import shared_task
from app import models
from worker.worker import EXCHANGER_NAME, app


logger = logging.getLogger(__name__)


# Identify the type of change occuring - POST and UPDATE may well be able to
# be merged
POST = 'POST'
UPDATE = 'UPDATE'
DELETE = 'DElETE'


@app.task(bind=True, name='import_starfile_task')
def import_starfile_task(self, arg1, arg2):
    """
    TODO
    This is an example task to allow celery to asynchronously process long
    running jobs. when called, ie with a call like:
    import_starfile_task.s('example', 'argument').delay(), the request to run
    is placed on a celery queue, and executed by a celery worker task
    asynchronously.
    """
    logger.info('DEBUG: This is a test logger message demonstrating the ' +
                'ability to access data from database arg1=' +
                str(arg1) + ', arg2=' + str(arg2))
    results = models.Graph.objects.all()
    logger.info('DEBUG: Graphs=' + str(results))

    # Simulate a slow running process
    time.sleep(60)


@shared_task
def publish_update(model_name, payload):
    """
    Publish supplied payload to message broker (RabbitMQ) exchange. The name
    of the exchange to use is constructed based on supplied model_name value.
    These exchanges have been setup when celery setup is performed.
    some retry handling is added due to issues that can occur when broker
    reconnects - as identified below.
    """
    # Celery package has some issues when broker reconnects, refer to
    # https://github.com/celery/celery/issues/4867 and
    # https://github.com/celery/celery/issues/5358. To address this, use a
    # try/catch block and perform several attempts.
    success = False
    sleep_delay = 0.05  # seconds
    while not success:
        try:
            with app.producer_pool.acquire(block=True) as producer:
                producer.publish(
                    payload,
                    exchange=EXCHANGER_NAME,
                    routing_key=model_name,
                )
                success = True
        except Exception as ex:
            time.sleep(sleep_delay)
            sleep_delay = sleep_delay * 2
            if sleep_delay > 2.0:
                # Need to break out of loop at some point to avoid issues
                return

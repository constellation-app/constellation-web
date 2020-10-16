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

import os
import kombu
from celery import Celery
from django.conf import settings

EXCHANGER_NAME = 'CONSTELLATION.DataUpdates'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webConstellation.settings')
app = Celery()
app.conf.update(settings.CELERY)
app.autodiscover_tasks()


with app.pool.acquire(block=True) as conn:

    # Create one exchange per 'model of interest'. Each exchange will be
    # configured to be in fanout mode, meaning new queues can be attached
    # to it as new clients subscribe.
    exchange = kombu.Exchange(
        name=EXCHANGER_NAME,
        type='fanout',
        durable=True,
        channel=conn,
    )
    exchange.declare()
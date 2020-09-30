import os
import kombu
from celery import Celery
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webConstellation.settings')
app = Celery()
app.conf.update(settings.CELERY)
app.autodiscover_tasks()


SUBSCRIBE_MODELS = ['Schema', 'Graph', 'Vertex', 'Transaction']

# setting publisher
with app.pool.acquire(block=True) as conn:

    for model_name in SUBSCRIBE_MODELS:
        exchange = kombu.Exchange(
            name='CONSTELLATION.' + model_name,
            type='direct',
            durable=True,
            channel=conn,
        )
        exchange.declare()

        queue = kombu.Queue(
            name='temp_queue.' + model_name,
            exchange=exchange,
            routing_key=model_name,
            channel=conn,
            message_ttl=600,
            queue_arguments={
                'x-queue-type': 'classic'
            },
            durable=True
        )
        queue.declare()
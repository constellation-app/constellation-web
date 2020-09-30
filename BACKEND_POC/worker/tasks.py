import os
import logging
import requests
import time

from django.dispatch import receiver

from worker.worker import app
from app import models
from django.conf import settings
from django.db.models.signals import post_save
from celery import shared_task


logger = logging.getLogger(__name__)


# TODO: Identify the type of change occuring
POST = 'POST'
UPDATE = 'UPDATE'
DELETE = 'DElETE'


# TODO: This is a placeholder task to allow celery to asynchronously process
# TODO: long running job
@app.task(bind=True, name='import_starfile_task')
def import_starfile_task(self, arg1, arg2):
    logger.info('This is a test logger message')
    results = models.Graph.objects.all()
    logger.info('Graphs=' + str(results))
    time.sleep(60)


# TODO: A potential bug: https://github.com/celery/celery/issues/4867
@shared_task
def publish_update(model_name, payload):
    # try:
        with app.producer_pool.acquire(block=True) as producer:
            producer.publish(
                payload,
                exchange='CONSTELLATION.' + model_name,
                routing_key=model_name,
            )
    # except Exception as ex:
    #     print(ex)


@receiver(post_save, sender=models.Schema)
def schema_saved(sender, **kwargs):
    schema = kwargs['instance']
    payload = {'schema_id': schema.id, 'operation': POST}
    publish_update(schema.__class__.__name__, payload)


@receiver(post_save, sender=models.Graph)
def graph_saved(sender, **kwargs):
    graph = kwargs['instance']
    payload = {'graph_id': graph.id, 'operation': POST}
    publish_update(graph.__class__.__name__, payload)


@receiver(post_save, sender=models.GraphAttrib)
def graph_attribute_saved(sender, **kwargs):
    graph = kwargs['instance'].graph_fk
    payload = {'graph_id': graph.id, 'attribute_id': kwargs['instance'].id, 'operation': POST}
    publish_update(graph.__class__.__name__, payload)


@receiver(post_save, sender=models.Vertex)
def vertex_saved(sender, **kwargs):
    vertex = kwargs['instance']
    payload = {'graph_id': vertex.graph_fk.id, 'id': vertex.id, 'operation': POST}
    publish_update(vertex.__class__.__name__, payload)


@receiver(post_save, sender=models.VertexAttrib)
def vertex_attribute_saved(sender, **kwargs):
    vertex = kwargs['instance'].vertex_fk
    payload = {'graph_id': vertex.graph_fk.id, 'id': vertex.id,
               'attribute_id': kwargs['instance'].id, 'operation': POST}
    publish_update(vertex.__class__.__name__, payload)


@receiver(post_save, sender=models.Transaction)
def transaction_saved(sender, **kwargs):
    transaction = kwargs['instance']
    payload = {'graph_id': transaction.id, 'id': transaction.id, 'operation': POST}
    publish_update(transaction.__class__.__name__, payload)


@receiver(post_save, sender=models.TransactionAttrib)
def transaction_attribute_saved(sender, **kwargs):
    transaction = kwargs['instance'].transaction_fk
    payload = {'graph_id': transaction.graph_fk.id, 'id': transaction.id,
               'attribute_id': kwargs['instance'].id, 'operation': POST}
    publish_update(transaction.__class__.__name__, payload)

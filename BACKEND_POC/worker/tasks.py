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

from django.dispatch import receiver

from worker.worker import app
from app import models
from django.db.models.signals import post_save, post_delete
from celery import shared_task


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
                    exchange='CONSTELLATION.' + model_name,
                    routing_key=model_name,
                )
                success = True
        except Exception as ex:
            time.sleep(sleep_delay)
            sleep_delay = sleep_delay * 2


@receiver(post_save, sender=models.Schema)
def schema_saved(sender, **kwargs):
    """
    Hook into save event of a Schema, resulting in payload being constructed
    and sent to message broker.
    """
    schema = kwargs['instance']
    operation = POST if kwargs['created'] else UPDATE
    payload = {'schema_id': schema.id, 'operation': operation}
    publish_update(schema.__class__.__name__, payload)


@receiver(post_delete, sender=models.Schema)
def schema_deleted(sender, **kwargs):
    """
    Hook into delete event of a Schema, resulting in payload being constructed
    and sent to message broker.
    """
    schema = kwargs['instance']
    payload = {'schema_id': schema.id, 'operation': DELETE}
    publish_update(schema.__class__.__name__, payload)


@receiver(post_save, sender=models.Graph)
def graph_saved(sender, **kwargs):
    """
    Hook into save event of a Graph, resulting in payload being constructed
    and sent to message broker.
    """
    graph = kwargs['instance']
    operation = POST if kwargs['created'] else UPDATE
    payload = {'graph_id': graph.id, 'operation': POST}
    publish_update(graph.__class__.__name__, payload)


@receiver(post_delete, sender=models.Graph)
def graph_deleted(sender, **kwargs):
    """
    Hook into save event of a Graph, resulting in payload being constructed
    and sent to message broker.
    """
    graph = kwargs['instance']
    payload = {'graph_id': graph.id, 'operation': DELETE}
    publish_update(graph.__class__.__name__, payload)


@receiver(post_save, sender=models.GraphAttrib)
def graph_attribute_saved(sender, **kwargs):
    """
    Hook into save event of a GraphAttrib, resulting in payload being
    constructed and sent to message broker.
    """
    graph = kwargs['instance'].graph_fk
    payload = {'graph_id': graph.id, 'attribute_id': kwargs['instance'].id, 'operation': UPDATE}
    publish_update(graph.__class__.__name__, payload)


@receiver(post_delete, sender=models.GraphAttrib)
def graph_attribute_deleted(sender, **kwargs):
    """
    Hook into delete event of a GraphAttrib, resulting in payload being
    constructed and sent to message broker.
    """
    graph = kwargs['instance'].graph_fk
    payload = {'graph_id': graph.id, 'attribute_id': kwargs['instance'].id, 'operation': UPDATE}
    publish_update(graph.__class__.__name__, payload)


@receiver(post_save, sender=models.Vertex)
def vertex_saved(sender, **kwargs):
    """
    Hook into save event of a Vertex, resulting in payload being constructed
    and sent to message broker.
    """
    vertex = kwargs['instance']
    operation = POST if kwargs['created'] else UPDATE
    payload = {'graph_id': vertex.graph_fk.id, 'id': vertex.id, 'operation': operation}
    publish_update(vertex.__class__.__name__, payload)


@receiver(post_delete, sender=models.Vertex)
def vertex_deleted(sender, **kwargs):
    """
    Hook into delete event of a Vertex, resulting in payload being constructed
    and sent to message broker.
    """
    vertex = kwargs['instance']
    payload = {'graph_id': vertex.graph_fk.id, 'id': vertex.id, 'operation': DELETE}
    publish_update(vertex.__class__.__name__, payload)


@receiver(post_save, sender=models.VertexAttrib)
def vertex_attribute_saved(sender, **kwargs):
    """
    Hook into save event of a VertexAttrib, resulting in payload being
    constructed and sent to message broker.
    """
    vertex = kwargs['instance'].vertex_fk
    payload = {'graph_id': vertex.graph_fk.id, 'id': vertex.id,
               'attribute_id': kwargs['instance'].id, 'operation': UPDATE}
    publish_update(vertex.__class__.__name__, payload)


@receiver(post_delete, sender=models.VertexAttrib)
def vertex_attribute_deleted(sender, **kwargs):
    """
    Hook into delete event of a VertexAttrib, resulting in payload being
    constructed and sent to message broker.
    """
    vertex = kwargs['instance'].vertex_fk
    payload = {'graph_id': vertex.graph_fk.id, 'id': vertex.id,
               'attribute_id': kwargs['instance'].id, 'operation': UPDATE}
    publish_update(vertex.__class__.__name__, payload)


@receiver(post_save, sender=models.Transaction)
def transaction_saved(sender, **kwargs):
    """
    Hook into save event of a Transaction, resulting in payload being
    constructed and sent to message broker.
    """
    transaction = kwargs['instance']
    operation = POST if kwargs['created'] else UPDATE
    payload = {'graph_id': transaction.id, 'id': transaction.id, 'operation': operation}
    publish_update(transaction.__class__.__name__, payload)


@receiver(post_delete, sender=models.Transaction)
def transaction_deleted(sender, **kwargs):
    """
    Hook into delete event of a Transaction, resulting in payload being constructed
    and sent to message broker.
    """
    transaction = kwargs['instance']
    payload = {'graph_id': transaction.graph_fk.id, 'id': transaction.id, 'operation': DELETE}
    publish_update(transaction.__class__.__name__, payload)


@receiver(post_save, sender=models.TransactionAttrib)
def transaction_attribute_saved(sender, **kwargs):
    """
    Hook into save event of a TransactionAttrib, resulting in payload being
    constructed and sent to message broker.
    """
    transaction = kwargs['instance'].transaction_fk
    payload = {'graph_id': transaction.graph_fk.id, 'id': transaction.id,
               'attribute_id': kwargs['instance'].id, 'operation': UPDATE}
    publish_update(transaction.__class__.__name__, payload)


@receiver(post_delete, sender=models.TransactionAttrib)
def transaction_attribute_deleted(sender, **kwargs):
    """
    Hook into delete event of a TransactionAttrib, resulting in payload being
    constructed and sent to message broker.
    """
    transaction = kwargs['instance'].transaction_fk
    payload = {'graph_id': transaction.graph_fk.id, 'id': transaction.id,
               'attribute_id': kwargs['instance'].id, 'operation': UPDATE}
    publish_update(transaction.__class__.__name__, payload)

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

import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from django.dispatch import receiver
from django.db.models.signals import post_save, post_delete
from app import models
from worker import tasks

# Group name used to capture list of updates and used by django_channels
NOTIFICATION_GROUP_NAME = 'CONSTELLATION.DataUpdates'
NOTIFICATION_TYPE = 'data_update'
# Type of changes that can occur to objects
POST = 'POST'
UPDATE = 'UPDATE'
DELETE = 'DELETE'


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    Consumer of web sockets related to notification of data record updates.
    """
    async def connect(self):
        """
        Handle connection of web socket.
        """
        await self.channel_layer.group_add(
            NOTIFICATION_GROUP_NAME,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        """
        Handle disconnection of web socket.
        """
        await self.channel_layer.group_discard(
            NOTIFICATION_GROUP_NAME,
            self.channel_name
        )

    async def receive(self, text_data):
        """
        Process changes to be published to web socket subscribers.
        """
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Send message to room group
        await self.channel_layer.group_send(
            NOTIFICATION_GROUP_NAME,
            {
                'type': NOTIFICATION_TYPE,
                'message': message
            }
        )

    async def data_update(self, event):
        """
        Handler of updates of type = NOTIFICATION_TYPE
        """
        # Send message to WebSocket
        await self.send(text_data=json.dumps({'message': event['message']}))


# ---------------------------------------------------------------------------------------------------------------------
# Receivers set up to capture changes to models. These receivers trigger updates to subscribed receivers, either via
# websockets, or using RabbitMQ for non-web applications.
# ---------------------------------------------------------------------------------------------------------------------

@receiver(post_save, sender=models.Schema)
def schema_saved(sender, **kwargs):
    """
    Hook into save event of a Schema, resulting in payload being constructed
    and sent to message broker.
    """
    schema = kwargs['instance']
    operation = POST if kwargs['created'] else UPDATE
    payload = {'type': schema.__class__.__name__, 'schema_id': schema.id, 'operation': operation}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(schema.__class__.__name__, payload)


@receiver(post_delete, sender=models.Schema)
def schema_deleted(sender, **kwargs):
    """
    Hook into delete event of a Schema, resulting in payload being constructed
    and sent to message broker.
    """
    schema = kwargs['instance']
    payload = {'type': schema.__class__.__name__, 'schema_id': schema.id, 'operation': DELETE}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(schema.__class__.__name__, payload)


@receiver(post_save, sender=models.SchemaAttribDefGraph)
def schema_attribute_def_graph_saved(sender, **kwargs):
    """
    Hook into save event of a SchemaAttribDefGraph, resulting in payload being
    constructed and sent to message broker.
    """
    attribute_def = kwargs['instance']
    schema = attribute_def.schema_fk
    operation = POST if kwargs['created'] else UPDATE
    payload = {'type': attribute_def.__class__.__name__, 'schema_id': schema.id,
               'attribute_def_id': kwargs['instance'].id, 'operation': operation}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(attribute_def.__class__.__name__, payload)


@receiver(post_delete, sender=models.SchemaAttribDefGraph)
def schema_attribute_def_graph_deleted(sender, **kwargs):
    """
    Hook into delete event of a SchemaAttribDefGraph, resulting in payload being
    constructed and sent to message broker.
    """
    attribute_def = kwargs['instance']
    schema = attribute_def.schema_fk
    payload = {'type': attribute_def.__class__.__name__, 'schema_id': schema.id,
               'attribute_def_id': kwargs['instance'].id, 'operation': DELETE}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(attribute_def.__class__.__name__, payload)


@receiver(post_save, sender=models.SchemaAttribDefVertex)
def schema_attribute_def_vertex_saved(sender, **kwargs):
    """
    Hook into save event of a SchemaAttribDefVertex, resulting in payload being
    constructed and sent to message broker.
    """
    attribute_def = kwargs['instance']
    schema = attribute_def.schema_fk
    operation = POST if kwargs['created'] else UPDATE
    payload = {'type': attribute_def.__class__.__name__, 'schema_id': schema.id,
               'attribute_def_id': kwargs['instance'].id, 'operation': operation}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(attribute_def.__class__.__name__, payload)


@receiver(post_delete, sender=models.SchemaAttribDefVertex)
def schema_attribute_def_vertex_deleted(sender, **kwargs):
    """
    Hook into delete event of a SchemaAttribDefVertex, resulting in payload being
    constructed and sent to message broker.
    """
    attribute_def = kwargs['instance']
    schema = attribute_def.schema_fk
    payload = {'type': attribute_def.__class__.__name__, 'schema_id': schema.id,
               'attribute_def_id': kwargs['instance'].id, 'operation': DELETE}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(attribute_def.__class__.__name__, payload)


@receiver(post_save, sender=models.SchemaAttribDefTrans)
def schema_attribute_def_transaction_saved(sender, **kwargs):
    """
    Hook into save event of a SchemaAttribDefTrans, resulting in payload being
    constructed and sent to message broker.
    """
    attribute_def = kwargs['instance']
    schema = attribute_def.schema_fk
    operation = POST if kwargs['created'] else UPDATE
    payload = {'type': attribute_def.__class__.__name__, 'schema_id': schema.id,
               'attribute_def_id': kwargs['instance'].id, 'operation': operation}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(attribute_def.__class__.__name__, payload)


@receiver(post_delete, sender=models.SchemaAttribDefTrans)
def schema_attribute_def_transaction_deleted(sender, **kwargs):
    """
    Hook into delete event of a SchemaAttribDefTrans, resulting in payload being
    constructed and sent to message broker.
    """
    attribute_def = kwargs['instance']
    schema = attribute_def.schema_fk
    payload = {'type': attribute_def.__class__.__name__, 'schema_id': schema.id,
               'attribute_def_id': kwargs['instance'].id, 'operation': DELETE}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(attribute_def.__class__.__name__, payload)


@receiver(post_save, sender=models.Graph)
def graph_saved(sender, **kwargs):
    """
    Hook into save event of a Graph, resulting in payload being constructed
    and sent to message broker.
    """
    graph = kwargs['instance']
    operation = POST if kwargs['created'] else UPDATE
    payload = {'type': graph.__class__.__name__, 'graph_id': graph.id, 'operation': operation}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(graph.__class__.__name__, payload)


@receiver(post_delete, sender=models.Graph)
def graph_deleted(sender, **kwargs):
    """
    Hook into save event of a Graph, resulting in payload being constructed
    and sent to message broker.
    """
    graph = kwargs['instance']
    payload = {'type': graph.__class__.__name__, 'graph_id': graph.id, 'operation': DELETE}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(graph.__class__.__name__, payload)


@receiver(post_save, sender=models.GraphAttribDefGraph)
def graph_attribute_def_graph_saved(sender, **kwargs):
    """
    Hook into save event of a GraphAttribDefGraph, resulting in payload being
    constructed and sent to message broker.
    """
    attribute_def = kwargs['instance']
    graph = attribute_def.graph_fk
    operation = POST if kwargs['created'] else UPDATE
    payload = {'type': attribute_def.__class__.__name__, 'graph_id': graph.id,
               'attribute_def_id': kwargs['instance'].id, 'operation': operation}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(attribute_def.__class__.__name__, payload)


@receiver(post_delete, sender=models.GraphAttribDefGraph)
def graph_attribute_def_graph_deleted(sender, **kwargs):
    """
    Hook into delete event of a GraphAttribDefGraph, resulting in payload being
    constructed and sent to message broker.
    """
    attribute_def = kwargs['instance']
    graph = attribute_def.graph_fk
    payload = {'type': attribute_def.__class__.__name__, 'graph_id': graph.id,
               'attribute_def_id': kwargs['instance'].id, 'operation': DELETE}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(attribute_def.__class__.__name__, payload)


@receiver(post_save, sender=models.GraphAttribDefVertex)
def graph_attribute_def_vertex_saved(sender, **kwargs):
    """
    Hook into save event of a GraphAttribDefVertex, resulting in payload being
    constructed and sent to message broker.
    """
    attribute_def = kwargs['instance']
    graph = attribute_def.graph_fk
    operation = POST if kwargs['created'] else UPDATE
    payload = {'type': attribute_def.__class__.__name__, 'graph_id': graph.id,
               'attribute_def_id': kwargs['instance'].id, 'operation': operation}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(attribute_def.__class__.__name__, payload)


@receiver(post_delete, sender=models.GraphAttribDefVertex)
def graph_attribute_def_vertex_deleted(sender, **kwargs):
    """
    Hook into delete event of a GraphAttribDefVertex, resulting in payload being
    constructed and sent to message broker.
    """
    attribute_def = kwargs['instance']
    graph = attribute_def.graph_fk
    payload = {'type': attribute_def.__class__.__name__, 'graph_id': graph.id,
               'attribute_def_id': kwargs['instance'].id, 'operation': DELETE}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(attribute_def.__class__.__name__, payload)


@receiver(post_save, sender=models.GraphAttribDefTrans)
def graph_attribute_def_transaction_saved(sender, **kwargs):
    """
    Hook into save event of a GraphAttribDefTrans, resulting in payload being
    constructed and sent to message broker.
    """
    attribute_def = kwargs['instance']
    graph = attribute_def.graph_fk
    operation = POST if kwargs['created'] else UPDATE
    payload = {'type': attribute_def.__class__.__name__, 'graph_id': graph.id,
               'attribute_def_id': kwargs['instance'].id, 'operation': operation}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(attribute_def.__class__.__name__, payload)


@receiver(post_delete, sender=models.GraphAttribDefTrans)
def graph_attribute_def_transaction_deleted(sender, **kwargs):
    """
    Hook into delete event of a GraphAttribDefTrans, resulting in payload being
    constructed and sent to message broker.
    """
    attribute_def = kwargs['instance']
    graph = attribute_def.graph_fk
    payload = {'type': attribute_def.__class__.__name__, 'graph_id': graph.id,
               'attribute_def_id': kwargs['instance'].id, 'operation': DELETE}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(attribute_def.__class__.__name__, payload)


@receiver(post_save, sender=models.GraphAttrib)
def graph_attribute_saved(sender, **kwargs):
    """
    Hook into save event of a GraphAttrib, resulting in payload being
    constructed and sent to message broker.
    """
    attribute = kwargs['instance']
    graph = attribute.graph_fk
    operation = POST if kwargs['created'] else UPDATE
    payload = {'type': attribute.__class__.__name__, 'graph_id': graph.id,
               'attribute_id': kwargs['instance'].id, 'operation': operation}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(attribute.__class__.__name__, payload)


@receiver(post_delete, sender=models.GraphAttrib)
def graph_attribute_deleted(sender, **kwargs):
    """
    Hook into delete event of a GraphAttrib, resulting in payload being
    constructed and sent to message broker.
    """
    attribute = kwargs['instance']
    graph = attribute.graph_fk
    payload = {'type': attribute.__class__.__name__, 'graph_id': graph.id,
               'attribute_id': kwargs['instance'].id, 'operation': DELETE}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(attribute.__class__.__name__, payload)


@receiver(post_save, sender=models.Vertex)
def vertex_saved(sender, **kwargs):
    """
    Hook into save event of a Vertex, resulting in payload being constructed
    and sent to message broker.
    """
    vertex = kwargs['instance']
    operation = POST if kwargs['created'] else UPDATE
    payload = {'type': vertex.__class__.__name__, 'graph_id': vertex.graph_fk.id,
               'vertex_id': vertex.id, 'vx_id': vertex.vx_id, 'operation': operation}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(vertex.__class__.__name__, payload)


@receiver(post_delete, sender=models.Vertex)
def vertex_deleted(sender, **kwargs):
    """
    Hook into delete event of a Vertex, resulting in payload being constructed
    and sent to message broker.
    """
    vertex = kwargs['instance']
    payload = {'type': vertex.__class__.__name__, 'graph_id': vertex.graph_fk.id,
               'vertex_id': vertex.id, 'vx_id': vertex.vx_id, 'operation': DELETE}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(vertex.__class__.__name__, payload)


@receiver(post_save, sender=models.VertexAttrib)
def vertex_attribute_saved(sender, **kwargs):
    """
    Hook into save event of a VertexAttrib, resulting in payload being
    constructed and sent to message broker.
    """
    attribute = kwargs['instance']
    vertex = attribute.vertex_fk
    operation = POST if kwargs['created'] else UPDATE
    payload = {'type': attribute.__class__.__name__, 'graph_id': vertex.graph_fk.id,
               'vertex_id': vertex.id, 'vx_id': vertex.vx_id,
               'attribute_id': kwargs['instance'].id, 'operation': operation}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(attribute.__class__.__name__, payload)


@receiver(post_delete, sender=models.VertexAttrib)
def vertex_attribute_deleted(sender, **kwargs):
    """
    Hook into delete event of a VertexAttrib, resulting in payload being
    constructed and sent to message broker.
    """
    attribute = kwargs['instance']
    vertex = attribute.vertex_fk
    payload = {'type': attribute.__class__.__name__, 'graph_id': vertex.graph_fk.id,
               'vertex_id': vertex.id, 'vx_id': vertex.vx_id,
               'attribute_id': kwargs['instance'].id, 'operation': DELETE}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(attribute.__class__.__name__, payload)


@receiver(post_save, sender=models.Transaction)
def transaction_saved(sender, **kwargs):
    """
    Hook into save event of a Transaction, resulting in payload being
    constructed and sent to message broker.
    """
    transaction = kwargs['instance']
    operation = POST if kwargs['created'] else UPDATE
    payload = {'type': transaction.__class__.__name__, 'graph_id': transaction.graph_fk.id,
               'transaction_id': transaction.id, 'tx_id': transaction.tx_id, 'operation': operation}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(transaction.__class__.__name__, payload)


@receiver(post_delete, sender=models.Transaction)
def transaction_deleted(sender, **kwargs):
    """
    Hook into delete event of a Transaction, resulting in payload being constructed
    and sent to message broker.
    """
    transaction = kwargs['instance']
    payload = {'type': transaction.__class__.__name__, 'graph_id': transaction.graph_fk.id,
               'transaction_id': transaction.id, 'tx_id': transaction.tx_id, 'operation': DELETE}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(transaction.__class__.__name__, payload)


@receiver(post_save, sender=models.TransactionAttrib)
def transaction_attribute_saved(sender, **kwargs):
    """
    Hook into save event of a TransactionAttrib, resulting in payload being
    constructed and sent to message broker.
    """
    attribute = kwargs['instance']
    transaction = attribute.transaction_fk
    operation = POST if kwargs['created'] else UPDATE
    payload = {'type': attribute.__class__.__name__, 'graph_id': transaction.graph_fk.id,
               'transaction_id': transaction.id, 'tx_id': transaction.tx_id,
               'attribute_id': kwargs['instance'].id, 'operation': operation}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(attribute.__class__.__name__, payload)


@receiver(post_delete, sender=models.TransactionAttrib)
def transaction_attribute_deleted(sender, **kwargs):
    """
    Hook into delete event of a TransactionAttrib, resulting in payload being
    constructed and sent to message broker.
    """
    attribute = kwargs['instance']
    transaction = attribute.transaction_fk
    payload = {'type': attribute.__class__.__name__, 'graph_id': transaction.graph_fk.id,
               'transaction_id': transaction.id, 'tx_id': transaction.tx_id,
               'attribute_id': kwargs['instance'].id, 'operation': DELETE}
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(NOTIFICATION_GROUP_NAME, {
        'type': NOTIFICATION_TYPE,
        'message': str(payload)
    })
    tasks.publish_update(attribute.__class__.__name__, payload)

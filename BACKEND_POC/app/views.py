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
import json
import zipfile
from os import path
from django.db.models import signals
from rest_framework import permissions, generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from app.models import AttribType, AttribTypeChoice, attrib_str_to_value
from app.models import Schema, SchemaAttribDefGraph, SchemaAttribDefVertex, SchemaAttribDefTrans
from app.models import Graph, GraphAttrib, GraphAttribDefGraph, GraphAttribDefVertex, GraphAttribDefTrans
from app.models import Vertex, VertexAttrib, Transaction, TransactionAttrib
from app.serializers import AttribTypeSerializer, SchemaSerializer
from app.serializers import SchemaAttribDefGraphSerializer, SchemaAttribDefVertexSerializer, SchemaAttribDefTransSerializer
from app.serializers import GraphSerializer, GraphJsonSerializer, GraphAttribSerializer
from app.serializers import GraphAttribDefGraphSerializer, GraphAttribDefVertexSerializer, GraphAttribDefTransSerializer
from app.serializers import VertexSerializer, VertexAttribSerializer
from app.serializers import TransactionSerializer, TransactionAttribSerializer
from app.serializers import GraphJsonVertexesSerializer, GraphJsonTransactionsSerializer
from websockets.consumers import *



# <editor-fold Constants">
ATTRIBUTE_EDITOR_KEY_GRAPH_ID = 'graph_id'  # Key used in POST body to identify parent graph ID
ATTRIBUTE_EDITOR_KEY_VERTEX_ID = 'vx_id'  # Key used in POST body to identify vertex ID (per graph)
ATTRIBUTE_EDITOR_KEY_TRANSACTION_ID = 'tx_id'  # Key used in POST body to identify transaction ID (per graph)
# </editor-fold>

# Configuration of how many records (ie vertexes, transactions, vertex
# attributes, or transaction attributes) should be sent in a hit to the
# database for creation.
IMPORT_BATCH_SIZE = 2000


# <editor-fold Common functions">
class InvalidTypeException(Exception):
    """
    Bespoke exception thrown if object passed to method is of incorrect type.
    """
    pass


def __update_graph_attribute(graph_attribute, value):
    """
    Update supplied graph attribute to the given value. Changes will also be
    reflected back into enclosing graph JSON.
    :param graph_attribute: Object to update
    :param value:  Value to use
    """
    if not isinstance(graph_attribute, GraphAttrib):
        raise InvalidTypeException("Supplied object is not GraphAttrib")

    attrib_type = graph_attribute.attrib_fk.type_fk.raw_type
    if attrib_type == AttribTypeChoice.DICT:
        graph_attribute.value_str = json.dumps(value)
    else:
        graph_attribute.value_str = str(value)

    graph_attribute.save()
    graph = graph_attribute.graph_fk
    graph_attribute_json = json.loads(graph.attribute_json)
    graph_attribute_json[graph_attribute.attrib_fk.label] = \
        attrib_str_to_value(attrib_type, value)
    graph.attribute_json = json.dumps(graph_attribute_json)
    signals.post_save.disconnect(graph_saved, sender=Graph)
    graph.save()
    signals.post_save.connect(graph_saved, sender=Graph)


def __update_vertex_attribute(vertex_attribute, value):
    """
    Update supplied vertex attribute to the given value. Changes will also be
    reflected back into enclosing vertex JSON.
    :param vertex_attribute: Object to update
    :param value:  Value to use
    """
    if not isinstance(vertex_attribute, VertexAttrib):
        raise InvalidTypeException("Supplied object is not VertexAttrib")

    attrib_type = vertex_attribute.attrib_fk.type_fk.raw_type
    if attrib_type == AttribTypeChoice.DICT:
        vertex_attribute.value_str = json.dumps(value)
    else:
        vertex_attribute.value_str = str(value)

    vertex_attribute.save()
    vertex = vertex_attribute.vertex_fk
    vertex_attribute_json = json.loads(vertex.attribute_json)
    vertex_attribute_json[vertex_attribute.attrib_fk.label] = \
        attrib_str_to_value(attrib_type, value)
    vertex.attribute_json = json.dumps(vertex_attribute_json)
    vertex.save()


def __update_transaction_attribute(transaction_attribute, value):
    """
    Update supplied transaction attribute to the given value. Changes will also
    be reflected back into enclosing transaction JSON.
    :param transaction_attribute: Object to update
    :param value:  Value to use
    """
    if not isinstance(transaction_attribute, TransactionAttrib):
        raise InvalidTypeException("Supplied object is not TransactionAttrib")

    attrib_type = transaction_attribute.attrib_fk.type_fk.raw_type
    if attrib_type == AttribTypeChoice.DICT:
        transaction_attribute.value_str = json.dumps(value)
    else:
        transaction_attribute.value_str = str(value)

    transaction_attribute.save()
    transaction = transaction_attribute.transaction_fk
    transaction_attribute_json = json.loads(transaction.attribute_json)
    transaction_attribute_json[transaction_attribute.attrib_fk.label] = \
        attrib_str_to_value(attrib_type, value)
    transaction.attribute_json = json.dumps(transaction_attribute_json)
    transaction.save()
# </editor-fold>


# <editor-fold AttribType Views">
class AttribTypesView(generics.ListCreateAPIView):
    """
    Support Create and List operations of custom application attribute types
    (AttribType) used to data types of attributes.
    """
    queryset = AttribType.objects.all()
    serializer_class = AttribTypeSerializer


class AttribTypeView(generics.RetrieveUpdateDestroyAPIView):
    """
    Support Read, Update, and Destroy operations of custom application
    attribute types (AttribType) used to data types of attributes.
    """
    queryset = AttribType.objects.all()
    serializer_class = AttribTypeSerializer
# </editor-fold>


# <editor-fold Attribute definition hierarchy Views">
class SchemaAttribDefGraphsView(generics.ListCreateAPIView):
    """
    Support Create and List operations of Graph attributes to be defined in a
    Schema.
    """
    queryset = SchemaAttribDefGraph.objects.all()
    serializer_class = SchemaAttribDefGraphSerializer


class SchemaAttribDefGraphView(generics.RetrieveUpdateDestroyAPIView):
    """
    Support Read, Update, and Destroy operations of Graph attributes to be
    defined in a Schema.
    """
    queryset = SchemaAttribDefGraph.objects.all()
    serializer_class = SchemaAttribDefGraphSerializer


class SchemaAttribDefVertexesView(generics.ListCreateAPIView):
    """
    Support Create and List operations of Vertex attributes to be defined in a
    Schema.
    """
    queryset = SchemaAttribDefVertex.objects.all()
    serializer_class = SchemaAttribDefVertexSerializer


class SchemaAttribDefVertexView(generics.RetrieveUpdateDestroyAPIView):
    """
    Support Read, Update, and Destroy operations of Vertex attributes to be
    defined in a Schema.
    """
    queryset = SchemaAttribDefVertex.objects.all()
    serializer_class = SchemaAttribDefVertexSerializer


class SchemaAttribDefTransactionsView(generics.ListCreateAPIView):
    """
    Support Create and List operations of Transaction attributes to be defined
    in a Schema.
    """
    queryset = SchemaAttribDefTrans.objects.all()
    serializer_class = SchemaAttribDefTransSerializer


class SchemaAttribDefTransactionView(generics.RetrieveUpdateDestroyAPIView):
    """
    Support Read, Update, and Destroy operations of Transaction attributes to
    be defined in a Schema.
    """
    queryset = SchemaAttribDefTrans.objects.all()
    serializer_class = SchemaAttribDefTransSerializer


class GraphAttribDefGraphsView(generics.ListCreateAPIView):
    """
    Support Create and List operations of Graph attributes to be tied to a
    specific Graph.
    """
    queryset = GraphAttribDefGraph.objects.all()
    serializer_class = GraphAttribDefGraphSerializer


class GraphAttribDefGraphView(generics.RetrieveUpdateDestroyAPIView):
    """
    Support Read, Update, and Destroy operations of Graph attributes to be
    tied to a specific Graph.
    """
    queryset = GraphAttribDefGraph.objects.all()
    serializer_class = GraphAttribDefGraphSerializer


class GraphAttribDefVertexesView(generics.ListCreateAPIView):
    """
    Support Create and List operations of Vertex attributes to be tied to a
    specific Graph.
    """
    queryset = GraphAttribDefVertex.objects.all()
    serializer_class = GraphAttribDefVertexSerializer


class GraphAttribDefVertexView(generics.RetrieveUpdateDestroyAPIView):
    """
    Support Read, Update, and Destroy operations of Vertex attributes to be
    tied to a specific Graph.
    """
    queryset = GraphAttribDefVertex.objects.all()
    serializer_class = GraphAttribDefVertexSerializer


class GraphAttribDefTransactionsView(generics.ListCreateAPIView):
    """
    Support Read, Update, and Destroy operations of Transaction attributes to
    be tied to a specific Graph.
    """
    queryset = GraphAttribDefTrans.objects.all()
    serializer_class = GraphAttribDefTransSerializer


class GraphAttribDefTransactionView(generics.RetrieveUpdateDestroyAPIView):
    """
    Support Read, Update, and Destroy operations of Transaction attributes to
    be tied to a specific Graph.
    """
    queryset = GraphAttribDefTrans.objects.all()
    serializer_class = GraphAttribDefTransSerializer
# </editor-fold>


# <editor-fold Schema Views">
class SchemasView(generics.ListCreateAPIView):
    """
    Support Create and List operations of graph schemas (Schemas) used to
    define categorized styling for graph information.
    """
    queryset = Schema.objects.all()
    serializer_class = SchemaSerializer


class SchemaView(generics.RetrieveUpdateDestroyAPIView):
    """
    Support Read, Update, and Destroy operations of graph schemas (Schemas)
    used to define categorized styling for graph information.
    """
    queryset = Schema.objects.all()
    serializer_class = SchemaSerializer

    def perform_destroy(self, instance):
        """
        An graph is being deleted, only report this deletion, and not that of
        sub components.
        """
        signals.post_delete.disconnect(schema_attribute_def_graph_deleted, sender=SchemaAttribDefGraph)
        signals.post_delete.disconnect(schema_attribute_def_vertex_deleted, sender=SchemaAttribDefVertex)
        signals.post_delete.disconnect(schema_attribute_def_transaction_deleted, sender=SchemaAttribDefTrans)
        instance.delete()
        signals.post_delete.connect(schema_attribute_def_graph_deleted, sender=SchemaAttribDefGraph)
        signals.post_delete.connect(schema_attribute_def_vertex_deleted, sender=SchemaAttribDefVertex)
        signals.post_delete.connect(schema_attribute_def_transaction_deleted, sender=SchemaAttribDefTrans)
# </editor-fold>


# <editor-fold Graph and GraphAttrib views">
class GraphsView(generics.ListCreateAPIView):
    """
    Support Create and List operations of Graph objects. The Create operation
    will populate definitions of attributes to be used within the graph at
    graph, vertex, and transaction levels based on the graphs associated
    Schema.
    """
    queryset = Graph.objects.all()
    serializer_class = GraphSerializer

    def create(self, request, *args, **kwargs):
        """
        Override default create operation to ensure any default attributes for
        Graph, Vertex, and Transaction are added based on the associated Graph
        Schema object.
        :param request: The request payload
        :param args: Request arguments
        :param kwargs: Request kwargs
        :return: Created Graph object
        """
        # TODO: Does every graph need to be created with a defined Schema ?
        # Check if a schema was selected, if so identify all default attributes
        # defined for the schema
        schema_id = request.data['schema_fk'] if (request.data['schema_fk'] != '') else 0
        graph = super(GraphsView, self).create(request, *args, **kwargs)
        graph_record = Graph.objects.filter(title=request.data['title']).last()

        schema_graph_attribs = SchemaAttribDefGraph.objects.filter(schema_fk=schema_id)
        signals.post_save.disconnect(graph_attribute_def_graph_saved, sender=GraphAttribDefGraph)
        for schema_attrib in schema_graph_attribs:
            graph_attrib = GraphAttribDefGraph(
                graph_fk=graph_record,
                label=schema_attrib.label,
                type_fk=schema_attrib.type_fk,
                descr=schema_attrib.descr,
                default_str=schema_attrib.default_str)
            graph_attrib.save()
        signals.post_save.connect(graph_attribute_def_graph_saved, sender=GraphAttribDefGraph)

        schema_vtx_attribs = SchemaAttribDefVertex.objects.filter(schema_fk=schema_id)
        signals.post_save.disconnect(graph_attribute_def_vertex_saved, sender=GraphAttribDefVertex)
        for schema_attrib in schema_vtx_attribs:
            graph_attrib = GraphAttribDefVertex(
                graph_fk=graph_record,
                label=schema_attrib.label,
                type_fk=schema_attrib.type_fk,
                descr=schema_attrib.descr,
                default_str=schema_attrib.default_str)
            graph_attrib.save()
        signals.post_save.connect(graph_attribute_def_vertex_saved, sender=GraphAttribDefVertex)

        schema_trans_attribs = SchemaAttribDefTrans.objects.filter(schema_fk=schema_id)
        signals.post_save.disconnect(graph_attribute_def_transaction_saved, sender=GraphAttribDefTrans)
        for schema_attrib in schema_trans_attribs:
            graph_attrib = GraphAttribDefTrans(
                graph_fk=graph_record,
                label=schema_attrib.label,
                type_fk=schema_attrib.type_fk,
                descr=schema_attrib.descr,
                default_str=schema_attrib.default_str)
            graph_attrib.save()
        signals.post_save.connect(graph_attribute_def_transaction_saved, sender=GraphAttribDefTrans)
        return graph


class GraphView(generics.RetrieveUpdateDestroyAPIView):
    """
    Support Read, Update, and Destroy operations of Graph objects.
    """
    # TODO prevent update of Schema ?
    queryset = Graph.objects.all()
    serializer_class = GraphSerializer

    def perform_destroy(self, instance):
        """
        An graph is being deleted, only report this deletion, and not that of
        sub components.
        """
        signals.post_delete.disconnect(graph_attribute_def_graph_deleted, sender=GraphAttribDefGraph)
        signals.post_delete.disconnect(graph_attribute_def_vertex_deleted, sender=GraphAttribDefVertex)
        signals.post_delete.disconnect(graph_attribute_def_transaction_deleted, sender=GraphAttribDefTrans)
        signals.post_delete.disconnect(vertex_deleted, sender=Vertex)
        signals.post_delete.disconnect(transaction_deleted, sender=Transaction)
        instance.delete()
        signals.post_delete.connect(graph_attribute_def_graph_deleted, sender=GraphAttribDefGraph)
        signals.post_delete.connect(graph_attribute_def_vertex_deleted, sender=GraphAttribDefVertex)
        signals.post_delete.connect(graph_attribute_def_transaction_deleted, sender=GraphAttribDefTrans)
        signals.post_delete.connect(vertex_deleted, sender=Vertex)
        signals.post_delete.connect(transaction_deleted, sender=Transaction)


class GraphAttributesView(generics.ListCreateAPIView):
    """
    Manage GraphAttrib Create and List operations. Read, Update, Destroy operations are managed in VertexAttribList.
    """
    queryset = GraphAttrib.objects.all()
    serializer_class = GraphAttribSerializer


class GraphAttributeView(generics.RetrieveUpdateDestroyAPIView):
    """
    Manage GraphAttrib Read, Update, Destroy operations. Create and List operations are managed in GraphAttribList.
    """
    queryset = GraphAttrib.objects.all()
    serializer_class = GraphAttribSerializer

    def perform_destroy(self, instance):
        """
        An attribute is being deleted from a graph. The parent graphs cached json needs to be updated to reflect it.
        :param instance: The attribute being deleted
        """
        # Get parent graphs JSON, pop the attribute identified by its label and save to object
        graph = instance.graph_fk
        graph_attribute_json = json.loads(str(graph.attribute_json))

        if instance.attrib_fk.label in graph_attribute_json:
            graph_attribute_json.pop(instance.attrib_fk.label)
        graph.attribute_json = json.dumps(graph_attribute_json)
        signals.post_save.disconnect(graph_saved, sender=Graph)
        graph.save()
        signals.post_save.disconnect(graph_saved, sender=Graph)

        # Delete the record
        instance.delete()
# </editor-fold>


# <editor-fold Graph JSON creation views">
class GraphJson(generics.RetrieveAPIView):
    """
    Generate a JSON representation of the selected graph.
    Refer to get_vertex_json and get_transaction_json serializer code for
    information on performance tuning.
    """
    queryset = Graph.objects.prefetch_related('vertex_set', 'transaction_set')
    serializer_class = GraphJsonSerializer


class GraphJsonVertexes(generics.RetrieveAPIView):
    """
    Generate a JSON representation of the vertex component of the selected
    graph.
    """
    queryset = Graph.objects.all()
    serializer_class = GraphJsonVertexesSerializer


class GraphJsonTransactions(generics.RetrieveAPIView):
    """
    Generate a JSON representation of the transaction component of the selected
    graph.
    """
    queryset = Graph.objects.all()
    serializer_class = GraphJsonTransactionsSerializer
# </editor-fold>


# <editor-fold Vertex and VertexAttrib views">
class VertexesView(generics.ListCreateAPIView):
    """
    Support Create and List operations of Vertexes.
    """
    queryset = Vertex.objects.prefetch_related('vertex_attribs')
    serializer_class = VertexSerializer


class VertexView(generics.RetrieveUpdateDestroyAPIView):
    """
    Support Read, Update, and Destroy operations of Vertexes.
    """
    queryset = Vertex.objects.all()
    serializer_class = VertexSerializer

    def perform_destroy(self, instance):
        # Delete the record
        signals.post_delete.disconnect(vertex_attribute_deleted, sender=VertexAttrib)
        instance.delete()
        signals.post_delete.connect(vertex_attribute_deleted, sender=VertexAttrib)


class VertexAttributesView(generics.ListCreateAPIView):
    """
    Manage VertexAttrib Create and List operations. Read, Update, Destroy operations are managed in VertexAttribList.
    """
    queryset = VertexAttrib.objects.all()
    serializer_class = VertexAttribSerializer


class VertexAttributeView(generics.RetrieveUpdateDestroyAPIView):
    """
    Manage VertexAttrib Read, Update, Destroy operations. Create and List operations are managed in VertexAttribList.
    """
    queryset = VertexAttrib.objects.all()
    serializer_class = VertexAttribSerializer

    def perform_destroy(self, instance):
        """
        An attribute is being deleted from a vertex. The parent vertexes cached json needs to be updated to reflect it.
        :param instance: The attribute being deleted
        """
        # Get parent vertexes JSON, pop the attribute identified by its label and save to object
        vertex = instance.vertex_fk
        vertex_attribute_json = json.loads(str(vertex.attribute_json))

        if instance.attrib_fk.label in vertex_attribute_json:
            vertex_attribute_json.pop(instance.attrib_fk.label)
        vertex.attribute_json = json.dumps(vertex_attribute_json)
        signals.post_save.disconnect(vertex_saved, sender=Vertex)
        vertex.save()
        signals.post_save.connect(vertex_saved, sender=Vertex)

        # Delete the record
        instance.delete()

# </editor-fold>


# <editor-fold Transaction and TransactionAttrib views">
class TransactionsView(generics.ListCreateAPIView):
    """
    Manage Transaction Create and List operations. Read, Update, Destroy
    operations are managed in TransactionRetrieveUpdateDestroyView.
    """
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer


class TransactionView(generics.RetrieveUpdateDestroyAPIView):
    """
    Manage Transaction Read, Update, Destroy operations. Create and List
    operations are managed in TransactionListListCreateView.
    """
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    def perform_destroy(self, instance):
        # Delete the record
        signals.post_delete.disconnect(transaction_attribute_deleted, sender=TransactionAttrib)
        instance.delete()
        signals.post_delete.connect(transaction_attribute_deleted, sender=TransactionAttrib)


class TransactionAttributesView(generics.ListCreateAPIView):
    """
    Manage TransactionAttrib Create and List operations. Read, Update, Destroy
    operations are managed in VertexAttribList.
    """
    queryset = TransactionAttrib.objects.all()
    serializer_class = TransactionAttribSerializer


class TransactionAttributeView(generics.RetrieveUpdateDestroyAPIView):
    """
    Manage TransactionAttrib Read, Update, Destroy operations. Create and List
    operations are managed in TransactionAttribList.
    """
    queryset = TransactionAttrib.objects.all()
    serializer_class = TransactionAttribSerializer

    def perform_destroy(self, instance):
        """
        An attribute is being deleted from a transaction. The parent
        transactions cached json needs to be updated to reflect it.
        :param instance: The attribute being deleted
        """
        # Get parent vertexes JSON, pop the attribute identified by its label and save to object
        transaction = instance.transaction_fk
        transaction_attribute_json = json.loads(str(transaction.attribute_json))

        if instance.attrib_fk.label in transaction_attribute_json:
            transaction_attribute_json.pop(instance.attrib_fk.label)
        transaction.attribute_json = json.dumps(transaction_attribute_json)

        signals.post_save.disconnect(transaction_saved, sender=Transaction)
        transaction.save()
        signals.post_save.connect(transaction_saved, sender=Transaction)

        # Delete the record
        instance.delete()
# </editor-fold>


# <editor-fold Graph/Vertex/Transaction Attribute Edit Views - using graph_id, vx_id/tx_id to identify">
def GetValueString(raw_type, value):
    """
    Given a supplied attribute type (of type AttribTypeChoice) determine return the corresponding string representation
    of the supplied value.
    """
    if raw_type == AttribTypeChoice.DICT:
        return json.dumps(value)
    return str(value)




@api_view(['POST'])
def EditGraphAttributes(request):
    """
    Update one or more attributes for the graph with supplied ID. A series of key/value pairs are then included in the
    payload identifying attributes to update and their assigned new values.
    Example usage 1: (sets the decorators,3d_display values of the graph with id=1)
      {"id": 1, "decorators": "00", "3d_display": true}
    """
    if request.method == 'POST':


        # Attempt to find the identified graph. Ensure a graph was found and store it for later use. If no graph was
        # found return error. While processing, extract a list of attributes that have been  supplied as these are the
        # names of attributes to update.
        graph = None
        attribute_labels = list(request.data.keys())
        if 'id' in request.data:
            graph = Graph.objects.filter(id=request.data['id']).last()
            attribute_labels.remove('id')
            if graph is None:
                return Response({"detail": "Could not find graph with supplied 'id'."},
                                status=status.HTTP_404_NOT_FOUND)

        if graph is None:
            return Response({"detail": "No graph identified - need to supply 'id'."}, status=status.HTTP_404_NOT_FOUND)

        # At this point a graph has been found matching the identifiers, process its attributes.

        # Extract the rolled up attribute_json from the graph and a collection of attributes corresponding to the
        # requested labels - this list will be validated and processed.
        attribute_json = json.loads(str(graph.attribute_json))
        attributes = GraphAttrib.objects.filter(graph_fk=graph.id, attrib_fk__label__in=attribute_labels)

        # Create attributes is they are valid (ie an entry with matching label exists in attribute definitions for the
        # given graph) but don't exist.
        existing_attributes = list(attributes.values_list('attrib_fk__label', flat=True))
        new_attributes = [elem for elem in attribute_labels if elem not in existing_attributes]
        if len(new_attributes) > 0:
            # At least one supplied attribute label doesn't have an attribute created for it. Check if the labels
            # correspond to valid attributes and create if needed.
            attrib_definitions = GraphAttribDefGraph.objects.filter(graph_fk=graph.id, label__in=new_attributes)

            # Ensure every requested attribute label matches an allocated attribute definition, if this is the case then
            # the two list lengths will match - if not there is a mismatch, raise the error.
            if len(attrib_definitions) != len(new_attributes):
                return Response({"detail": "One or more requested attribute(s) do not exist for graph."},
                                status=status.HTTP_404_NOT_FOUND)

            # Create the new attribute.
            for new_attribute_label in new_attributes:
                value = request.data[new_attribute_label]
                definition = GraphAttribDefGraph.objects.filter(graph_fk=graph.id, label=new_attribute_label).last()
                new_attribute = GraphAttrib(graph_fk=graph, attrib_fk=definition,
                                            value_str=GetValueString(definition.type_fk.raw_type, value))
                new_attribute.save()

        # Update values of existing attributes in line with supplied request in the attribute list, ensure the
        # associated graph attribute_json field is kept in synch.
        i = 0
        while i < len(attributes):
            label = attributes[i].attrib_fk.label
            attributes[i].value_str = GetValueString(attributes[i].attrib_fk.type_fk.raw_type, request.data[label])
            attribute_json[label] = request.data[label]
            i += 1

        # Update transactions and save transaction to trigger updates to subscribers.
        GraphAttrib.objects.bulk_update(attributes, ['value_str'])
        graph.attribute_json = json.dumps(attribute_json)
        graph.save()
        return Response({"Info": "Graph update was successful", "data": request.data})

    else:
        # Only post operations are supported
        return Response({"detail": "Invalid operation requested"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def EditVertexAttributes(request):
    """
    Update one or more attributes for the identified vertex. Vertexes are identified either by id, or by a combination
    of graph_id and vx_id. A series of key/value pairs are then included in the payload identifying attributes to update
    and their assigned new values.
    Example usage 1: (sets the x,y,z values of the vertex with id=5)
      {"id": 5, "x": 34.2, "y": 10.0, "z": 0.03}
    Example usage 2: (sets the x,y,z values of the vertex with vx_id=4 belonging to the graph with id=1)
      {"graph_id": 1, "vx_id": 4, "x": 34.2, "y": 10.0, "z": 0.03}
    """
    if request.method == 'POST':

        # Attempt to find the identified vertex using one of two methods. Ensure a vertex was found and store it for
        # later use. If no vertex was found return error. While processing, extract a list of attributes that have been
        # supplied as these are the names of attributes to update.
        vertex = None
        attribute_labels = list(request.data.keys())
        if 'id' in request.data:
            vertex = Vertex.objects.filter(id=request.data['id']).last()
            attribute_labels.remove('id')
            if vertex is None:
                return Response({"detail": "Could not find vertex with supplied 'id'."},
                                status=status.HTTP_404_NOT_FOUND)

        if 'graph_id' in request.data and 'vx_id' in request.data:
            vertex = Vertex.objects.filter(graph_fk__id=request.data['graph_id'], vx_id=request.data['vx_id']).last()
            attribute_labels.remove('graph_id')
            attribute_labels.remove('vx_id')
            if vertex is None:
                return Response({"detail": "Could not find vertex with supplied 'graph_id'/'tx_id' combo."},
                                status=status.HTTP_404_NOT_FOUND)

        if vertex is None:
            return Response({"detail": "No vertex identified - need to supply 'id' or 'graph_id'/'vx_id' combo."},
                            status=status.HTTP_404_NOT_FOUND)

        # At this point a vertex has been found matching the identifiers, process its attributes.

        # Extract the rolled up attribute_json from the vertex and a collection of attributes corresponding to the
        # requested labels - this list will be validated and processed.
        attribute_json = json.loads(str(vertex.attribute_json))
        attributes = VertexAttrib.objects.filter(vertex_fk=vertex.id, attrib_fk__label__in=attribute_labels)

        # Create attributes is they are valid (ie an entry with matching label exists in attribute definitions for the
        # given graph) but don't exist.
        existing_attributes = list(attributes.values_list('attrib_fk__label', flat=True))
        new_attributes = [elem for elem in attribute_labels if elem not in existing_attributes]
        if len(new_attributes) > 0:
            # At least one supplied attribute label doesn't have an attribute created for it. Check if the labels
            # correspond to valid attributes and create if needed.
            attrib_definitions = GraphAttribDefVertex.objects.filter(graph_fk=vertex.graph_fk,
                                                                     label__in=new_attributes)

            # Ensure every requested attribute label matches an allocated attribute definition, if this is the case then
            # the two list lengths will match - if not there is a mismatch, raise the error.
            if len(attrib_definitions) != len(new_attributes):
                return Response({"detail": "One or more requested attribute(s) do not exist for graph."},
                                status=status.HTTP_404_NOT_FOUND)

            # Create the new attribute.
            for new_attribute_label in new_attributes:
                value = request.data[new_attribute_label]
                definition = GraphAttribDefVertex.objects.filter(graph_fk=vertex.graph_fk,
                                                                label=new_attribute_label).last()
                new_attribute = VertexAttrib(vertex_fk=vertex, attrib_fk=definition,
                                             value_str=GetValueString(definition.type_fk.raw_type, value))
                new_attribute.save()

        # Update values of existing attributes in line with supplied request in the attribute list, ensure the
        # associated vertex attribute_json field is kept in synch.
        i = 0
        while i < len(attributes):
            label = attributes[i].attrib_fk.label
            attributes[i].value_str = GetValueString(attributes[i].attrib_fk.type_fk.raw_type, request.data[label])
            attribute_json[label] = request.data[label]
            i += 1

        # Update transactions and save transaction to trigger updates to subscribers.
        VertexAttrib.objects.bulk_update(attributes, ['value_str'])
        vertex.attribute_json = json.dumps(attribute_json)
        vertex.save()
        return Response({"Info": "Vertex update was successful", "data": request.data})

    else:
        # Only post operations are supported
        return Response({"detail": "Invalid operation requested"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def EditTransactionAttributes(request):
    """
    Update one or more attributes for the identified transaction. Transactions are identified either by id, or by a
    combination of graph_id and tx_id. A series of key/value pairs are then included in the payload identifying
    attributes to update and their assigned new values.
    Example usage 1: (sets the Label value of the transaction with id=5)
      {"id": 5, "Identifier": "mylabel"}
    Example usage 2: (sets the Label value of the transaction with tx_id=4 belonging to the graph with id=1)
      {"graph_id": 1, "tx_id": 4, "Identifier": "mylabel"}
    """
    if request.method == 'POST':

        # Attempt to find the identified transaction using one of two methods. Ensure a transaction was found and store
        # it for later use. If no transaction was found return error. While processing, extract a list of attributes
        # that have been supplied as these are the names of attributes to update.
        transaction = None
        attribute_labels = list(request.data.keys())
        if 'id' in request.data:
            transaction = Transaction.objects.filter(id=request.data['id']).last()
            attribute_labels.remove('id')
            if transaction is None:
                return Response({"detail": "Could not find transaction with supplied 'id'."},
                                status=status.HTTP_404_NOT_FOUND)

        if 'graph_id' in request.data and 'tx_id' in request.data:
            transaction = Transaction.objects.filter(graph_fk__id=request.data['graph_id'],
                                                     tx_id=request.data['tx_id']).last()
            attribute_labels.remove('graph_id')
            attribute_labels.remove('tx_id')
            if transaction is None:
                return Response({"detail": "Could not find transaction with supplied 'graph_id'/'tx_id' combo."},
                                status=status.HTTP_404_NOT_FOUND)

        if transaction is None:
            return Response({"detail": "No transaction identified - need to supply 'id' or 'graph_id'/'tx_id' combo."},
                            status=status.HTTP_404_NOT_FOUND)

        # At this point a transaction has been found matching the identifiers, process its attributes.

        # Extract the rolled up attribute_json from the transaction and a collection of attributes corresponding to the
        # requested labels - this list will be validated and processed.
        attribute_json = json.loads(str(transaction.attribute_json))
        attributes = TransactionAttrib.objects.filter(transaction_fk=transaction.id,
                                                      attrib_fk__label__in=attribute_labels)

        # Create attributes is they are valid (ie an entry with matching label exists in attribute definitions for the
        # given graph) but don't exist.
        existing_attributes = list(attributes.values_list('attrib_fk__label', flat=True))
        new_attributes = [elem for elem in attribute_labels if elem not in existing_attributes]
        if len(new_attributes) > 0:
            # At least one supplied attribute label doesn't have an attribute created for it. Check if the labels
            # correspond to valid attributes and create if needed.
            attrib_definitions = GraphAttribDefTrans.objects.filter(graph_fk=transaction.graph_fk,
                                                                    label__in=new_attributes)

            # Ensure every requested attribute label matches an allocated attribute definition, if this is the case then
            # the two list lengths will match - if not there is a mismatch, raise the error.
            if len(attrib_definitions) != len(new_attributes):
                return Response({"detail": "One or more requested attribute(s) do not exist for graph."},
                                status=status.HTTP_404_NOT_FOUND)

            # Create the new attribute.
            for new_attribute_label in new_attributes:
                value = request.data[new_attribute_label]
                definition = GraphAttribDefTrans.objects.filter(graph_fk=transaction.graph_fk,
                                                                label=new_attribute_label).last()
                new_attribute = TransactionAttrib(transaction_fk=transaction, attrib_fk=definition,
                                                  value_str=GetValueString(definition.type_fk.raw_type, value))
                new_attribute.save()

        # Update values of existing attributes in line with supplied request in the attribute list, ensure the
        # associated transaction attribute_json field is kept in synch.
        i = 0
        while i < len(attributes):
            label = attributes[i].attrib_fk.label
            attributes[i].value_str = GetValueString(attributes[i].attrib_fk.type_fk.raw_type, request.data[label])
            attribute_json[label] = request.data[label]
            i += 1

        # Update transactions and save transaction to trigger updates to subscribers.
        TransactionAttrib.objects.bulk_update(attributes, ['value_str'])
        transaction.attribute_json = json.dumps(attribute_json)
        transaction.save()
        return Response({"Info": "Transaction update was successful", "data": request.data})

    else:
        # Only post operations are supported
        return Response({"detail": "Invalid operation requested"}, status=status.HTTP_400_BAD_REQUEST)
# </editor-fold>


# <editor-fold Test Code - Generate Data from Existing Graph JSON file">
@api_view(['POST'])
def ImportLegacyJSON(request):
    """
    This endpoint is provided to allow the import of legacy Graph files into
    the database.
    To load a file, enter a payload such as:
        {"filename": "analyticgraph1.star"}
    Where analyticgraph1.star is a file residing in the ./import subdirectory
    of the Docker container. The easiest way to achieve this is run the batch
    file upload_starfile.bat supplying it the full path of the file to upload.
    This script will output some JSON to cut and paste into the payload of the
    POST command.

    WARNING1: This endpoint is for development purposes only, so is not overly
    robust - it expects valid graph file data to exist.
    WARNING2: The upload process is a slow process, grab a coffee or a chai
    latte and wait a few minutes.
    WARNING3: The imported depends on attrib_type values existing for all types
    defined in the graph file, if any don't exist, they need to manually be
    created first. An error will be returned in the POST output highlighting
    the attrib_type labels that need to be created.
    """
    if request.method == 'POST':

        # Extract filename from the request.data dictionary and ensure it
        # corresponds to a file
        if "filename" not in request.data:
            return Response({"Error": "filename key not found in request.data!", "data": request.data})
        star_filename = path.join('import', str(request.data["filename"]))
        if not path.isfile(star_filename):
            return Response({"Error": "supplied filename could not be found in import directory", "data": request.data})

        # Unzip the file to get its inner graph.txt which contains the JSON to
        # import
        with zipfile.ZipFile(star_filename, 'r') as zip_ref:
            zip_ref.extractall('import')

        # Process the inner graph file
        json_filename = path.join('import', 'graph.txt')
        f = open(json_filename, )
        data = json.load(f, encoding="utf8")

        # Read the blocks of data from the STAR file, which provides the graph
        # elements as an array of 'blocks'
        version_block = data[0]
        graph_block = data[1]
        vertex_block = data[2]
        transaction_block = data[3]
        meta_block = data[4]

        # Ensure all attribute types are already defined. Because the import
        # cannot deduce the 'raw type' of defined attribute types, the user
        # needs to make sure all the attribute types are known before the
        # import
        missing_attribute_types = set()
        attr_types = list(AttribType.objects.all().values_list('label', flat=True))
        attr_type_error = False
        attrs = graph_block['graph'][0]['attrs']
        for attr in attrs:
            typename = attr['type']
            if typename not in attr_types:
                attr_type_error = True
                missing_attribute_types.add(typename)
        attrs = vertex_block['vertex'][0]['attrs']
        for attr in attrs:
            typename = attr['type']
            if typename not in attr_types:
                attr_type_error = True
                missing_attribute_types.add(typename)
        attrs = transaction_block['transaction'][0]['attrs']
        for attr in attrs:
            typename = attr['type']
            if typename not in attr_types:
                attr_type_error = True
                missing_attribute_types.add(typename)
        if attr_type_error:
            return Response({"Error": "Unknown attribute types specified - please create using attrib_types endpoint: "
                                      + str(missing_attribute_types), "data": request.data})

        # Create a dictionary of attribute types indexed by name to allow
        # subsequent processing
        attr_types = {}
        attr_types_queryset = AttribType.objects.all()
        for attr in attr_types_queryset:
            attr_types[attr.label] = attr

        # Handle processing of schema, create a corresponding schema if one
        # doesn't exist
        schema = None
        if 'version' in version_block and 'schema' in version_block:
            schema_name = version_block['schema']
            matching_schemas = Schema.objects.filter(label=schema_name)
            if len(matching_schemas) > 0:
                schema = matching_schemas.last()
            else:
                schema = Schema(label=schema_name)
                schema.save()

        # If graph already exists in DB, delete all its records so it can be
        # recreated

        signals.post_delete.disconnect(graph_attribute_def_graph_deleted, sender=GraphAttribDefGraph)
        signals.post_delete.disconnect(graph_attribute_def_vertex_deleted, sender=GraphAttribDefVertex)
        signals.post_delete.disconnect(graph_attribute_def_transaction_deleted, sender=GraphAttribDefTrans)
        signals.post_delete.disconnect(graph_attribute_deleted, sender=GraphAttrib)
        signals.post_delete.disconnect(vertex_deleted, sender=Vertex)
        signals.post_delete.disconnect(vertex_attribute_deleted, sender=VertexAttrib)
        signals.post_delete.disconnect(transaction_deleted, sender=Transaction)
        signals.post_delete.disconnect(transaction_attribute_deleted, sender=TransactionAttrib)

        Graph.objects.filter(title=request.data["filename"]).delete()
        graph = Graph.objects.create(title=request.data["filename"], schema_fk=schema,
                                     next_vertex_id=1, next_transaction_id=1)

        signals.post_delete.connect(graph_attribute_def_graph_deleted, sender=GraphAttribDefGraph)
        signals.post_delete.connect(graph_attribute_def_vertex_deleted, sender=GraphAttribDefVertex)
        signals.post_delete.connect(graph_attribute_def_transaction_deleted, sender=GraphAttribDefTrans)
        signals.post_delete.connect(graph_attribute_deleted, sender=GraphAttrib)
        signals.post_delete.connect(vertex_deleted, sender=Vertex)
        signals.post_delete.connect(vertex_attribute_deleted, sender=VertexAttrib)
        signals.post_delete.connect(transaction_deleted, sender=Transaction)
        signals.post_delete.connect(transaction_attribute_deleted, sender=TransactionAttrib)

        # Process graph attribute definitions
        attrs = graph_block['graph'][0]['attrs']
        signals.post_save.disconnect(graph_attribute_def_graph_saved, sender=GraphAttribDefGraph)
        for attr in attrs:
            label = attr['label']
            typename = attr['type']
            descr = attr['descr'] if 'descr' in attr else None
            default_str = attr['default'] if 'default' in attr else None
            attr_type = attr_types[typename]
            GraphAttribDefGraph.objects.create(graph_fk=graph, label=label, type_fk=attr_type,
                                               descr=descr, default_str=default_str)
        signals.post_save.connect(graph_attribute_def_graph_saved, sender=GraphAttribDefGraph)

        # Create a dictionary of graph attribute definitions just created for
        # quick lookup when processing actual graph
        graph_attribute_defs = {}
        for attr in GraphAttribDefGraph.objects.filter(graph_fk=graph):
            graph_attribute_defs[attr.label] = attr

        count = 0
        django_attributes = []
        graph_json = {}
        graph_data = graph_block['graph'][1]['data']
        for attr in graph_data[0]:

            # Find corresponding attribute definition
            graph_attrib = graph_attribute_defs[attr]
            value = graph_data[0][attr]


            # TODO: sometime string is either string or json, in this
            # TODO: case, if its json, better to convert to double
            # TODO: quote JSON with json.dumps
            if graph_attrib.type_fk.raw_type == AttribTypeChoice.DICT.value:
                value = json.dumps(value)
            graph_attrib = GraphAttrib(graph_fk=graph, attrib_fk=graph_attrib,
                                       value_str=value)
            django_attributes.append(graph_attrib)
            count = count + 1
            graph_json[str(attr)] = graph_data[0][attr]

            if count >= IMPORT_BATCH_SIZE:
                signals.post_save.disconnect(graph_saved, sender=Graph)
                GraphAttrib.objects.bulk_create(django_attributes)
                signals.post_save.connect(graph_saved, sender=Graph)
                django_attributes = []
                count = 0

        # Create any leftover records
        if count > 0:
            signals.post_save.disconnect(graph_saved, sender=Graph)
            GraphAttrib.objects.bulk_create(django_attributes)
            signals.post_save.connect(graph_saved, sender=Graph)

        # Process vertex attribute definitions
        attrs = vertex_block['vertex'][0]['attrs']
        signals.post_save.disconnect(graph_attribute_def_vertex_saved, sender=GraphAttribDefVertex)
        for attr in attrs:
            label = attr['label']
            typename = attr['type']
            descr = attr['descr'] if 'descr' in attr else None
            default_str = attr['default'] if 'default' in attr else None
            attr_type = attr_types[typename]
            GraphAttribDefVertex.objects.create(graph_fk=graph, label=label, type_fk=attr_type,
                                                descr=descr, default_str=default_str)
        signals.post_save.connect(graph_attribute_def_vertex_saved, sender=GraphAttribDefVertex)

        # Create a dictionary of vertex attribute definitions just created for
        # quick lookup when processing actual vertexes
        graph_vertex_attribute_defs = {}
        for attr in GraphAttribDefVertex.objects.filter(graph_fk=graph):
            graph_vertex_attribute_defs[attr.label] = attr

        # Loop through vertexes and generate them
        vertexes = vertex_block['vertex'][1]['data']
        max_vx_id = 0
        count = 0
        django_vertexes = []
        for vtx in vertexes:
            vx_id = vtx['vx_id_']

            # Keep track of maximum ID to setup auto increment
            max_vx_id = max(max_vx_id, vx_id)

            # Add vertex attributes to rolled up vertex JSON
            vertex_json = {}
            for attr in vtx:
                vertex_json[attr] = vtx[attr]

            # Add vertex to array pending bulk create
            vertex = Vertex(graph_fk=graph, vx_id=vx_id, attribute_json=json.dumps(vertex_json))
            django_vertexes.append(vertex)

            # Manage bulk creation based on list size, chunk up into blocks of
            # up to IMPORT_BATCH_SIZE records at a time
            count = count + 1
            if count >= IMPORT_BATCH_SIZE:
                signals.post_save.disconnect(vertex_saved, sender=Vertex)
                Vertex.objects.bulk_create(django_vertexes)
                signals.post_save.connect(vertex_saved, sender=Vertex)
                django_vertexes = []
                count = 0

        # Create any leftover records
        if count > 0:
            signals.post_save.disconnect(vertex_saved, sender=Vertex)
            Vertex.objects.bulk_create(django_vertexes)
            signals.post_save.connect(vertex_saved, sender=Vertex)

        # Store dictionary of vertexes for this graph, used in lookups by
        # vertex attributes and transaction endpoints
        db_vertexes = Vertex.objects.filter(graph_fk=graph)
        vertex_dict = {}
        for vertex in db_vertexes:
            vertex_dict[vertex.vx_id] = vertex

        # Loop through vertex attributes and generate them
        count = 0
        django_vertex_attributes = []
        for vtx in vertexes:
            for attr in vtx:
                if attr != 'vx_id_':

                    # Find corresponding attribute definition
                    graph_vtx_attrib = graph_vertex_attribute_defs[attr]
                    value = vtx[attr]

                    # TODO: sometime string is either string or json, in this
                    # TODO: case, if its json, better to convert to double
                    # TODO: quote JSON with json.dumps
                    if graph_vtx_attrib.type_fk.raw_type == AttribTypeChoice.DICT.value:
                        value = json.dumps(value)
                    vertex_attrib = VertexAttrib(vertex_fk=vertex_dict[vtx['vx_id_']], attrib_fk=graph_vtx_attrib,
                                                 value_str=value)
                    django_vertex_attributes.append(vertex_attrib)
                    # Keep track of actual attributes processed rather than
                    # vertexes, as such sometimes count will end up greater
                    # than IMPORT_BATCH_SIZE, but not by much.
                    count = count + 1

            # Manage bulk creation based on list size, chunk up into blocks of
            # (about) IMPORT_BATCH_SIZE records at a time
            if count >= IMPORT_BATCH_SIZE:
                signals.post_save.disconnect(vertex_saved, sender=Vertex)
                signals.post_save.disconnect(vertex_attribute_saved, sender=VertexAttrib)
                VertexAttrib.objects.bulk_create(django_vertex_attributes)
                signals.post_save.connect(vertex_saved, sender=Vertex)
                signals.post_save.connect(vertex_attribute_saved, sender=VertexAttrib)
                django_vertex_attributes = []
                count = 0

        # Create any leftover records
        if count > 0:
            signals.post_save.disconnect(vertex_saved, sender=Vertex)
            signals.post_save.disconnect(vertex_attribute_saved, sender=VertexAttrib)
            VertexAttrib.objects.bulk_create(django_vertex_attributes)
            signals.post_save.connect(vertex_saved, sender=Vertex)
            signals.post_save.connect(vertex_attribute_saved, sender=VertexAttrib)

        # Process transaction attribute definitions
        attrs = transaction_block['transaction'][0]['attrs']
        signals.post_save.disconnect(graph_attribute_def_transaction_saved, sender=GraphAttribDefTrans)
        for attr in attrs:
            label = attr['label']
            typename = attr['type']
            descr = attr['descr']
            default_str = attr['default'] if 'default' in attr else None
            attr_type = attr_types[typename]
            GraphAttribDefTrans.objects.create(graph_fk=graph, label=label, type_fk=attr_type,
                                               descr=descr, default_str=default_str)
        signals.post_save.connect(graph_attribute_def_transaction_saved, sender=GraphAttribDefTrans)

        # Create a dictionary of transaction attribute definitions just created for
        # quick lookup when processing actual transactions
        graph_transaction_attribute_defs = {}
        for attr in GraphAttribDefTrans.objects.filter(graph_fk=graph):
            graph_transaction_attribute_defs[attr.label] = attr

        # Loop through transactions and generate them
        transactions = transaction_block['transaction'][1]['data']
        max_tx_id = 0
        count = 0
        django_transactions = []
        for trans in transactions:
            tx_id = trans['tx_id_']
            tx_dir = trans['tx_dir_']
            vx_src = vertex_dict[trans['vx_src_']]
            vx_dst = vertex_dict[trans['vx_dst_']]

            # Keep track of maximum ID to setup auto increment
            max_tx_id = max(max_tx_id, tx_id)

            # Add transaction attributes to rolled up transaction JSON
            transaction_json = {}
            for attr in trans:
                transaction_json[attr] = trans[attr]

            # Add transaction to array pending bulk create
            transaction = Transaction(graph_fk=graph, tx_id=tx_id, vx_src=vx_src, vx_dst=vx_dst,
                                      tx_dir=tx_dir, attribute_json=json.dumps(transaction_json))
            django_transactions.append(transaction)

            # Manage bulk creation based on list size, chunk up into blocks of
            # up to IMPORT_BATCH_SIZE records at a time
            count = count + 1
            if count >= IMPORT_BATCH_SIZE:
                signals.post_save.disconnect(transaction_saved, sender=Transaction)
                Transaction.objects.bulk_create(django_transactions)
                signals.post_save.connect(transaction_saved, sender=Transaction)
                django_transactions = []
                count = 0

        # Create any leftover records
        if count > 0:
            signals.post_save.disconnect(transaction_saved, sender=Transaction)
            Transaction.objects.bulk_create(django_transactions)
            signals.post_save.connect(transaction_saved, sender=Transaction)

        # Store dictionary of transactions for this graph, used in lookups by
        # transaction attributes
        db_transactions = Transaction.objects.filter(graph_fk=graph)
        transaction_dict = {}
        for transaction in db_transactions:
            transaction_dict[transaction.tx_id] = transaction

        # Loop through transaction attributes and generate them
        count = 0
        django_trans_attribs = []
        for trans in transactions:
            for attr in trans:
                if attr != 'tx_id_' and attr != 'vx_src_' and attr != 'vx_dst_' and attr != 'tx_dir_':
                    # Find corresponding attribute definition
                    graph_trans_attrib = graph_transaction_attribute_defs[attr]
                    value = trans[attr]

                    # TODO: sometime string is either string or json, in this
                    # TODO: case, if its json, better to convert to double
                    # TODO: quote JSON with json.dumps
                    if graph_trans_attrib.type_fk.raw_type == AttribTypeChoice.DICT.value:
                        value = json.dumps(value)
                    transaction_attrib = TransactionAttrib(transaction_fk=transaction_dict[trans['tx_id_']],
                                                           attrib_fk=graph_trans_attrib, value_str=value)
                    django_trans_attribs.append(transaction_attrib)
                    # Keep track of actual attributes processed rather than
                    # transactions, as such sometimes count will end up greater
                    # than IMPORT_BATCH_SIZE, but not by much.
                    count = count + 1

            # Manage bulk creation based on list size, chunk up into blocks of
            # (about) IMPORT_BATCH_SIZE records at a time
            if count >= IMPORT_BATCH_SIZE:
                signals.post_save.disconnect(transaction_saved, sender=Transaction)
                signals.post_save.disconnect(transaction_attribute_saved, sender=TransactionAttrib)
                TransactionAttrib.objects.bulk_create(django_trans_attribs)
                signals.post_save.connect(transaction_saved, sender=Transaction)
                signals.post_save.connect(transaction_attribute_saved, sender=TransactionAttrib)
                django_trans_attribs = []
                count = 0
        if count > 0:
            signals.post_save.disconnect(transaction_saved, sender=Transaction)
            signals.post_save.disconnect(transaction_attribute_saved, sender=TransactionAttrib)
            TransactionAttrib.objects.bulk_create(django_trans_attribs)
            signals.post_save.connect(transaction_saved, sender=Transaction)
            signals.post_save.connect(transaction_attribute_saved, sender=TransactionAttrib)

        # Update graph attribute_json and counters and cleanup
        graph.attribute_json = graph_json
        graph.next_vertex_id = max_vx_id + 1
        graph.next_transaction_id = max_tx_id + 1
        graph.save()
        os.remove(json_filename)
        return Response({"message": "Completed processing import", "data": request.data})

    return Response({"Error": "Operation nor permitted"})

# </editor-fold>

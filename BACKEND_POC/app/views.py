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
from rest_framework import permissions, generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from app.models import AttribType, AttribTypeChoice, attrib_str_to_value
from app.models import Schema, SchemaAttribDefGraph, SchemaAttribDefVertex, SchemaAttribDefTrans
from app.models import Graph, GraphAttrib, GraphAttribDefGraph, GraphAttribDefVertex, GraphAttribDefTrans
from app.models import Vertex, VertexAttrib, Transaction, TransactionAttrib
from app.serializers import AttribTypeSerializer, SchemaSerializer
from app.serializers import SchemaAttribDefGraphSerializer, SchemaAttribDefVertexSerializer, SchemaAttribDefTransSerializer
from app.serializers import GraphSerializer, GraphJsonSerializer
from app.serializers import GraphAttribDefGraphSerializer, GraphAttribDefVertexSerializer, GraphAttribDefTransSerializer
from app.serializers import VertexSerializer, VertexAttribSerializer
from app.serializers import TransactionSerializer, TransactionAttribSerializer
from app.serializers import GraphJsonVertexesSerializer, GraphJsonTransactionsSerializer
from os import path
import pathlib


# <editor-fold Constants">
ATTRIBUTE_EDITOR_KEY_GRAPH_ID = 'graph_id'  # Key used in POST body to identify parent graph ID
ATTRIBUTE_EDITOR_KEY_VERTEX_ID = 'vx_id'  # Key used in POST body to identify vertex ID (per graph)
ATTRIBUTE_EDITOR_KEY_TRANSACTION_ID = 'tx_id'  # Key used in POST body to identify transaction ID (per graph)
# </editor-fold>


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
    graph.save()


def __update_vertex_attribute(vertex_attribute, value):
    """
    Update supplied vertex attribute to the given value. Changes will also be
    reflected back into enclosing vertex JSON.
    :param vertex_attribute: Object to update
    :param value:  Value to use
    """
    if not isinstance(vertex_attribute, VertexAttrib):
        raise InvalidTypeException("Supplied object is not VertexAttrib")

    attrib_type = vertex_attribute.attrib_fk.type_fk.type
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

    attrib_type = transaction_attribute.attrib_fk.type_fk.type
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
# </editor-fold>


# <editor-fold Graph Views">
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
        for schema_attrib in schema_graph_attribs:
            graph_attrib = GraphAttribDefGraph(
                graph_fk=graph_record,
                label=schema_attrib.label,
                type_fk=schema_attrib.type_fk,
                descr=schema_attrib.descr,
                default_str=schema_attrib.default_str)
            graph_attrib.save()

        schema_vtx_attribs = SchemaAttribDefVertex.objects.filter(schema_fk=schema_id)
        for schema_attrib in schema_vtx_attribs:
            graph_attrib = GraphAttribDefVertex(
                graph_fk=graph_record,
                label=schema_attrib.label,
                type_fk=schema_attrib.type_fk,
                descr=schema_attrib.descr,
                default_str=schema_attrib.default_str)
            graph_attrib.save()

        schema_trans_attribs = SchemaAttribDefTrans.objects.filter(schema_fk=schema_id)
        for schema_attrib in schema_trans_attribs:
            graph_attrib = GraphAttribDefTrans(
                graph_fk=graph_record,
                label=schema_attrib.label,
                type_fk=schema_attrib.type_fk,
                descr=schema_attrib.descr,
                default_str=schema_attrib.default_str)
            graph_attrib.save()
        return graph


class GraphView(generics.RetrieveUpdateDestroyAPIView):
    """
    Support Read, Update, and Destroy operations of Graph objects.
    """
    # TODO prevent update of Schema ?
    queryset = Graph.objects.all()
    serializer_class = GraphSerializer
# </editor-fold>


# <editor-fold Graph JSON creation views">
class GraphJson(generics.RetrieveAPIView):
    """
    Generate a JSON representation of the selected graph.
    """
    queryset = Graph.objects.all()
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
    queryset = Vertex.objects.all()
    serializer_class = VertexSerializer


class VertexView(generics.RetrieveUpdateDestroyAPIView):
    """
    Support Read, Update, and Destroy operations of Vertexes.
    """
    queryset = Vertex.objects.all()
    serializer_class = VertexSerializer
    lookup_field = 'vx_id'


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
        vertex_attribute_json = json.loads(vertex.attribute_json)
        vertex_attribute_json.pop(instance.attrib_fk.label)
        vertex.attribute_json = json.dumps(vertex_attribute_json)
        vertex.save()

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
    lookup_field = 'tx_id'


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
        transaction_attribute_json = json.loads(transaction.attribute_json)
        transaction_attribute_json.pop(instance.attrib_fk.label)
        transaction.attribute_json = json.dumps(transaction_attribute_json)
        transaction.save()

        # Delete the record
        instance.delete()
# </editor-fold>


# <editor-fold Graph/Vertex/Transaction Attribute Edit Views - using graph_id, vx_id/tx_id to identify">
# Editing of attributes performed in ths block uses the vx_id and tx_id fields
# from the vertex and transaction records along with the container graphs ID to
# uniquely identify the attribute to be changed. These vx_id and tx_id differ
# from the default IDs for the records as they are only unique 'per container
# graph'.
@api_view(['POST'])
def EditGraphAttribute(request):
    """
    Allow a graph attribute to be added, or edited based on its containing
    graph.
    Body of POST should be of the form:
        {"graph_id": 3, "label": "x", "value": 1.0}
    Where graph_id identifies the parent graph, label is the name of the
    attribute being modified and value is the value to change it to.
    """
    if request.method == 'POST':

        # Ensure post has graph_id, label, value
        missing_keys = False
        missing_keys_error = "Missing keys: "
        for key in ['graph_id', 'label', 'value']:
            if key not in request.data:
                missing_keys_error = missing_keys_error + key + " "
                missing_keys = True

        if missing_keys:
            return Response({"Error": missing_keys_error, "data": request.data})

        try:
            graph_fk = request.data['graph_id']
            label = request.data['label']
            value = request.data['value']

            # Get parent Graph
            graph = Graph.objects.filter(graph_fk_id=graph_fk).last()
            if graph is None:
                return Response({"Info": "Could not find graph with supplied graph_fk" +
                                         " value", "data": request.data})
            print("## DEBUG Graph=" + str(graph))
            attribute = GraphAttrib.objects.filter(graph_fk=graph, attrib_fk__label=label).last()
            if attribute is None:
                # See if a graph attribute is defined for the graph with this label
                graph_attribute = graph.graphgraphattrib_set.all().filter(label=label).last()
                if graph_attribute is None:
                    return Response({"Info": "Could not find attribute with supplied label for " +
                                             "selected graph", "data": request.data})
                else:
                    attribute = VertexAttrib(graph_fk=graph, attrib_fk=graph_attribute)

            # Set value
            __update_vertex_attribute(attribute, value)
        except Exception as e:
            return Response({"Error": "An exception occured processing request", "data": request.data})

        return Response({"Info": "Found all keys", "data": request.data})


# AttributeEditing
@api_view(['POST'])
def EditVertexAttribute(request):
    """
    Allow a vertex attribute to be added, or edited based on its containing
    graph and vertex.
    Body of POST should be of the form:
        {"graph_id": 3, "vx_id": 0, "label": "x", "value": 1.0}
    Where graph_id and vx_id identify the parent graph/vertex, label is the name
    of the attribute being modified and value is the value to change it to.
    """
    if request.method == 'POST':

        # Ensure post has graph_id, vx_id, label, value
        missing_keys = False
        missing_keys_error = "Missing keys: "
        for key in ['graph_id', 'vx_id', 'label', 'value']:
            if key not in request.data:
                missing_keys_error = missing_keys_error + key + " "
                missing_keys = True

        if missing_keys:
            return Response({"Error": missing_keys_error, "data": request.data})

        try:
            graph_fk = request.data['graph_id']
            vx_id = request.data['vx_id']
            label = request.data['label']
            value = request.data['value']

            # Get parent Vertex
            vertex = Vertex.objects.filter(graph_fk_id=graph_fk, vx_id=vx_id).last()
            if vertex is None:
                return Response({"Info": "Could not find vertex with supplied graph_fk" +
                                         " and vx_id values", "data": request.data})
            print("## DEBUG Vertex=" + str(vertex))
            attribute = VertexAttrib.objects.filter(vertex_fk=vertex, attrib_fk__label=label).last()
            if attribute is None:
                # See if a vertex attribute is defined for the graph with this label
                graph = vertex.graph_fk
                vertex_attribute = graph.graphvertexattrib_set.all().filter(label=label).last()
                if vertex_attribute is None:
                    return Response({"Info": "Could not find attribute with supplied label for " +
                                             "selected vertex", "data": request.data})
                else:
                    attribute = VertexAttrib(vertex_fk=vertex, attrib_fk=vertex_attribute)

            # Set value
            __update_vertex_attribute(attribute, value)
        except Exception as e:
            return Response({"Error": "An exception occured processing request", "data": request.data})

        return Response({"Info": "Found all keys", "data": request.data})


# AttributeEditing
@api_view(['POST'])
def EditTransactionAttribute(request):
    """
    Allow a transaction attribute to be added, or edited based on its containing
    graph and transaction.
    Body of POST should be of the form:
        {"graph_id": 3, "tx_id": 0, "label": "x", "value": 1.0}
    Where graph_id and tx_id identify the parent graph/transaction, label is the
    name of the attribute being modified and value is the value to change it to.
    """
    if request.method == 'POST':

        # Ensure post has graph_id, tx_id, label, value
        missing_keys = False
        missing_keys_error = "Missing keys: "
        for key in ['graph_id', 'tx_id', 'label', 'value']:
            if key not in request.data:
                missing_keys_error = missing_keys_error + key + " "
                missing_keys = True

        if missing_keys:
            return Response({"Error": missing_keys_error, "data": request.data})

        try:
            graph_fk = request.data['graph_id']
            tx_id = request.data['tx_id']
            label = request.data['label']
            value = request.data['value']

            # Get parent Transaction
            transaction = Transaction.objects.filter(graph_fk_id=graph_fk, tx_id=tx_id).last()
            if transaction is None:
                # See if a transaction attribute is defined for the graph with this label
                graph = transaction.graph_fk
                transaction_attribute = graph.graphtransactionattrib_set.all().filter(label=label).last()
                if transaction_attribute is None:
                    return Response({"Info": "Could not find attribute with supplied label for " +
                                             "selected transaction", "data": request.data})
                else:
                    attribute = VertexAttrib(transaction_fk=transaction, attrib_fk=transaction_attribute)

            # Set value
            __update_transaction_attribute(attribute, value)
        except Exception as e:
            return Response({"Error": "An exception occured processing request", "data": request.data})

        return Response({"Info": "Found all keys", "data": request.data})

# </editor-fold>


# <editor-fold Test Code - Generate Data from Existing Graph JSON file">
@api_view(['POST'])
def ImportLegacyJSON(request):
    """
    This endpoint is provided to allow the import of legacy Graph files into the database.
    These files can be found by extracting the graph.txt file from a star file and placing it
    at a known location on disk.
    To load a file, ente ra payload such as:
    {"filename": "graph.json"}

    Where graph.json is a file residing in the root of the Docker container. The easiest way to
    achieve this is to copy the file into the backend directory prior to running the Docker
    "up --build" command.

    WARNING1: This endpoint os for development purposes onlyu, so is not overly robust - it
    expects valid graph file data to exist.
    WARNING2: The upload process is a slow process, grab a coffee ora chai latte and wait a few
    minutes.
    WARNING3: The imported depends on attrib_type values existing for all types defined in the
    graph file, if any don't exist, they need to manually be created first.

    :param request:
    :return:
    """
    print(pathlib.Path().absolute())
    if request.method == 'POST':
        print('****************************************')
        # Maintain a dictionary of known AttribType, these arethe types attributes are mapped to

        # Look for a "filename" key in the request.data dictionary
        if "filename" not in request.data:
            return Response({"Error": "filename key not found in request.data!", "data": request.data})
        if not path.isfile(str(request.data["filename"])):
            return Response({"Error": "supplied filename could not be found", "data": request.data})

        f = open(request.data["filename"], )
        data = json.load(f, encoding="utf8")

        # TODO, this code currently expecting array of dictionaries
        version_block = data[0]
        graph_block = data[1]
        vertex_block = data[2]
        transaction_block = data[3]
        meta_block = data[4]

        # Ensure all attribute types are already defined
        attr_types = list(AttribType.objects.all().values_list('label', flat=True))
        attr_type_error = False
        attrs = graph_block['graph'][0]['attrs']
        for attr in attrs:
            typename = attr['type']
            if typename not in attr_types:
                attr_type_error = True
                print('ERROR: The (graph) type "' + typename + '" is NOT known, please add before importing')
        attrs = vertex_block['vertex'][0]['attrs']
        for attr in attrs:
            typename = attr['type']
            if typename not in attr_types:
                attr_type_error = True
                print('ERROR: The (vertex) type "' + typename + '" is NOT known, please add before importing')
        attrs = transaction_block['transaction'][0]['attrs']
        for attr in attrs:
            typename = attr['type']
            if typename not in attr_types:
                attr_type_error = True
                print('ERROR: The (transaction) type "' + typename + '" is NOT known, please add before importing')

        if attr_type_error:
            return Response({"Error": "Unknown attribute types specified, refer to log", "data": request.data})

        # Create a dictionary of attribute types indexed by name
        attr_types = {}
        attr_types_queryset = AttribType.objects.all()
        for attr in attr_types_queryset:
            attr_types[attr.label] = attr

        schema = None
        if 'version' in version_block and 'schema' in version_block:
            print('JSON has version block')
            print('JSON has schema=' + str(version_block['schema']))
            schema_name = version_block['schema']

            # Check if schema already exists
            matching_schemas = Schema.objects.filter(label=schema_name)
            if len(matching_schemas) > 0:
                schema = matching_schemas.last()
            else:
                # This is a schema we haven't seen before -add it
                schema = Schema(label=schema_name)
                schema.save()

                # Now get handle to the new schema
                new_schema = Schema.objects.last()
                print("#s### NewSchema=" + str(schema))
            print("#### Schema=" + str(schema) + ":" + str(schema.id))

        # If graph already exists in DB, delete all its records so it can be recreated
        Graph.objects.filter(title=request.data["filename"]).delete()
        graph = Graph(title=request.data["filename"], schema_fk=schema, next_vertex_id=1)
        graph.save()
        graph = Graph.objects.filter(title=request.data["filename"]).last()

        if 'graph' in graph_block:
            print('JSON has graph block')

        print('Processing vertex block')
        print(' .... adding vertex block attributes')
        attrs = vertex_block['vertex'][0]['attrs']
        for attr in attrs:
            label = attr['label']
            typename = attr['type']
            descr = attr['descr'] if 'descr' in attr else None
            default_str = attr['default'] if 'default' in attr else None
            attr_type = attr_types[typename]

            vtx_attrib = GraphAttribDefVertex(graph_fk=graph, label=label, type_fk=attr_type,
                                              descr=descr, default_str=default_str)
            vtx_attrib.save()

        # Create a dictionary of graph vertex attributes indexed by label
        graph_vertex_attributes = {}
        for attr in GraphAttribDefVertex.objects.filter(graph_fk=graph):
            graph_vertex_attributes[attr.label] = attr

        # Loop through vertexes and generate them
        vertexes = vertex_block['vertex'][1]['data']
        max_vx_id = 0
        count = 0
        for vtx in vertexes:
            if divmod(count, 100)[1] == 0:
                print(' .... adding vertex block vertexes: (' + str(count) + ' of ' + str(len(vertexes)) + ')')
            vx_id = vtx['vx_id_']
            max_vx_id = max(max_vx_id, vx_id)

            # Add vertex attributes to rolled up vertex JSON
            vertex_json = {}
            for attr in vtx:
                vertex_json[attr] = vtx[attr]

            vertex = Vertex(graph_fk=graph, vx_id=vx_id, attribute_json=json.dumps(vertex_json))
            vertex.save()
            vertex = Vertex.objects.filter(vx_id=vx_id).last()
            for attr in vtx:
                if attr != 'vx_id_':
                    graph_vtx_attrib = graph_vertex_attributes[attr]
                    value = vtx[attr]

                    # TODO: sometime string is either string or json, in this case, if its json, better to convert
                    # TODO: to double quote JSON with json.dumps
                    if graph_vtx_attrib.type_fk.raw_type == AttribTypeChoice.DICT.value:
                        value = json.dumps(value)
                    vertex_attrib = VertexAttrib(vertex_fk=vertex, attrib_fk=graph_vtx_attrib,
                                                 value_str=value)
                    vertex_attrib.save()
            count = count + 1
        print(' .... adding vertex block vertexes: (' + str(count) + ' of ' + str(len(vertexes)) + ')')

        print('Processing transaction block')
        print(' .... adding transaction block attributes')
        attrs = transaction_block['transaction'][0]['attrs']
        for attr in attrs:
            label = attr['label']
            typename = attr['type']
            descr = attr['descr']
            default_str = attr['default'] if 'default' in attr else None
            attr_type = attr_types[typename]
            trans_attrib = GraphAttribDefTrans(graph_fk=graph, label=label, type_fk=attr_type,
                                               descr=descr, default_str=default_str)
            trans_attrib.save()

        # Loop through transactions and generate them
        transactions = transaction_block['transaction'][1]['data']
        max_tx_id = 0
        count = 0
        for trans in transactions:
            if divmod(count, 100)[1] == 0:
                print(' .... adding transaction block transactions: (' + str(count) + ' of ' + str(len(transactions)) + ')')
            tx_id = trans['tx_id_']
            tx_dir = trans['tx_dir_']
            vx_src = Vertex.objects.get(vx_id=trans['vx_src_'])
            vx_dst = Vertex.objects.get(vx_id=trans['vx_dst_'])
            max_tx_id = max(max_tx_id, tx_id)

            # Add transaction attributes to rolled up transaction JSON
            transaction_json = {}
            for attr in trans:
                transaction_json[attr] = trans[attr]

            transaction = Transaction(graph_fk=graph, tx_id=tx_id, vx_src=vx_src, vx_dst=vx_dst, tx_dir=tx_dir,
                                      attribute_json=json.dumps(transaction_json))
            transaction.save()
            transaction = Transaction.objects.filter(tx_id=tx_id).last()
            for attr in trans:
                if attr != 'tx_id_' and attr != 'vx_src_' and attr != 'vx_dst_' and attr != 'tx_dir_':
                    graph_trans_attrib = GraphAttribDefTrans.objects.filter(label=attr).last()
                    value = trans[attr]

                    # TODO: sometime string is either string or json, in this case, if its json, better to convert
                    # TODO: to double quote JSON with json.dumps
                    if graph_trans_attrib.type_fk.type == AttribTypeChoice.DICT.value:
                        value = json.dumps(value)
                    transaction_attrib = TransactionAttrib(transaction_fk=transaction, attrib_fk=graph_trans_attrib,
                                                           value_str=value)
                    transaction_attrib.save()
            count = count + 1
        print(' .... adding transaction block transactions: (' + str(count) + ' of ' + str(len(transactions)) + ')')

        if 'meta' in meta_block:
            print('JSON has meta block')

        graph.next_vertex_id = max_vx_id + 1
        graph.save()

        return Response({"message": "Completed processing import", "data": request.data})

    return Response({"message": ""})
# </editor-fold>

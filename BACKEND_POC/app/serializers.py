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
from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from django.http.request import QueryDict
from app.models import AttribType, AttribTypeChoice, attrib_str_to_value
from app.models import Schema, SchemaAttribDefGraph, SchemaAttribDefVertex, SchemaAttribDefTrans
from app.models import Graph, GraphAttribDefGraph, GraphAttribDefVertex, GraphAttribDefTrans
from app.models import Vertex, VertexAttrib
from app.models import Transaction, TransactionAttrib


# <editor-fold Common functions">
def get_vertex_json(obj):
    """
    returns "vertex" component of a graph JSON representation. This
    comprises of a list containing two dictionaries as per the following
    sample:
        "vertex": [ {
                "attrs": [ { .. 1 or more vertex attributes .. } ],
                "key" : [ "Identifier", "Type" ]
            },
            {
                "data": [ { .. 0 or more vertexes .. } ]
            }
    :param obj: Parent Graph object.
    :return: JSON representation of the "vertex" component of the object
             made up of attributes and data that have been linked to this
             Graph object via FKs.
    """
    # NOTE: The slowest operation in this function seems to be the looped
    #       calls to json.loads which seems to contribute approximately
    #       40% of the time. I tried some optimized JSON libraries in
    #       preference to the standard python json library but the
    #       improvement was negligible.

    # Extract list of vertex attribute types that are available for the
    # graph, these are used to populate the "attrs" list found in the
    # returned dictionary.
    attrs_list = []
    for attr in GraphAttribDefVertex.objects.filter(graph_fk=obj.id):
        attr_data = VertexAttribJsonSerializer(attr).data
        # Remove "default" fields that do not have a value, as per
        # example legacy JSON
        if attr_data['default'] is None:
            attr_data.pop('default')
        attrs_list.append(attr_data)

    # Extract list of actual vertexes that exist for the graph. In the DB
    # the vertexes are made up of a Vertex object and for each of these
    # Vertex objects will be one or more VertexAttrib objects that are
    # linked to each Vertex via FKs. In the JSON this will just be
    # represented as a Vertex as a dictionary containing one or more
    # key/value pairs. Doing it this way allows these key values to be data
    # driven.
    vertexes = Vertex.objects.filter(graph_fk=obj.id)
    vertex_list = []
    for vertex in vertexes:
        vertex_list.append(json.loads(vertex.attribute_json))

    return [{"attrs": attrs_list, "key": ["Identifier", "Type"]}, {"data": vertex_list}]


def get_transaction_json(obj):
    """
    returns "transaction" component of a graph JSON representation. This
    comprises of a list containing two dictionaries as per the following
    sample:
        "transaction": [ {
                "attrs": [ { .. 1 or more transaction attributes .. } ],
                "key" : [ "Identifier", "Type", "DateTime" ]
            },
            {
                "data": [ { .. 0 or more transactions .. } ]
            }
    :param obj: Parent Graph object.
    :return: JSON representation of the "vertex" component of the object,
    made up of attributes and data that have been linked to this Graph
    object via FKs.
    """
    # NOTE: The slowest operation in this function seems to be the looped
    #       calls to json.loads which seems to contribute approximately
    #       40% of the time. I tried some optimized JSON libraries in
    #       preference to the standard python json library but the
    #       improvement was negligible.

    # Extract list of transaction attribute types that are available for the
    # graph, these are used to populate the "attrs" list found in the
    # returned dictionary.
    attrs_list = []

    for attr in GraphAttribDefTrans.objects.filter(graph_fk=obj.id):
        attr_data = TransactionAttribJsonSerializer(attr).data
        # Remove "default" fields that do not have a value, as per
        # example legacy JSON
        if attr_data['default'] is None:
            attr_data.pop('default')
        attrs_list.append(attr_data)

    # Extract list of actual transactions that exist for the graph. In the
    # DB the transactions are made up of a Transaction object and for each
    # of these Transaction objects will be one or more TransactionAttrib
    # objects that are linked to each Transaction via FKs. In the JSON this
    # will just be represented as a Vertex as a dictionary containing one or
    # more key/value pairs. Doing it this way allows these key values to be
    # data driven.
    transactions = Transaction.objects.filter(graph_fk=obj.id)
    transaction_list = []
    for transaction in transactions:
        transaction_list.append(json.loads(transaction.attribute_json))

    return [{"attrs": attrs_list, "key": ["Identifier", "Type"]}, {"data": transaction_list}]
# </editor-fold>


# <editor-fold AttribType serializer">
class AttribTypeSerializer(serializers.ModelSerializer):
    """
    Serialization of AttribType model.
    """
    raw_type_name = serializers.SerializerMethodField()

    def get_raw_type_name(self, obj):
        """
        Return string representation of raw type, based on AttribTypeChoice
        mappings.
        :param obj: AttribType model instance
        :return: Resulting string
        """
        return str(AttribTypeChoice(obj.raw_type)).replace('AttribTypeChoice.', '')

    class Meta:
        model = AttribType
        fields = ['id', 'label', 'raw_type', 'raw_type_name']
# </editor-fold>


# <editor-fold Attribute definition hierarchy serializers">
class SchemaAttribDefGraphSerializer(serializers.ModelSerializer):
    """
    Serialization of SchemaAttribDefGraph model.
    """
    schema = serializers.SerializerMethodField()

    class Meta:
        model = SchemaAttribDefGraph
        fields = ['id', 'schema_fk', 'schema', 'label', 'type_fk', 'descr', 'default_str']
        validators = [
            UniqueTogetherValidator(
                queryset=SchemaAttribDefGraph.objects.all(),
                fields=['schema_fk', 'label']
            )
        ]

    def get_schema(self, obj):
        return str(obj.schema_fk) + ":" + str(self.label)


class SchemaAttribDefVertexSerializer(serializers.ModelSerializer):
    """
    Serialization of SchemaAttribDefVertex model.
    """
    schema = serializers.SerializerMethodField()

    class Meta:
        model = SchemaAttribDefVertex
        fields = ['id', 'schema_fk', 'schema', 'label', 'type_fk', 'descr', 'default_str']
        validators = [
            UniqueTogetherValidator(
                queryset=SchemaAttribDefVertex.objects.all(),
                fields=['schema_fk', 'label']
            )
        ]

    def get_schema(self, obj):
        return str(obj.schema_fk) + ":" + str(self.label)


class SchemaAttribDefTransSerializer(serializers.ModelSerializer):
    """
    Serialization of SchemaAttribDefTrans model.
    """
    schema = serializers.SerializerMethodField()

    class Meta:
        model = SchemaAttribDefTrans
        fields = ['id', 'schema_fk', 'schema', 'label', 'type_fk', 'descr', 'default_str']
        validators = [
            UniqueTogetherValidator(
                queryset=SchemaAttribDefTrans.objects.all(),
                fields=['schema_fk', 'label']
            )
        ]

    def get_schema(self, obj):
        return str(obj.schema_fk) + ":" + str(self.label)


class GraphAttribDefGraphSerializer(serializers.ModelSerializer):
    """
    Serialization of GraphAttribDefGraph model.
    """
    class Meta:
        model = GraphAttribDefGraph
        fields = ['id', 'graph_fk', 'label', 'type_fk', 'descr', 'default_str']
        validators = [
            UniqueTogetherValidator(
                queryset=GraphAttribDefGraph.objects.all(),
                fields=['graph_fk', 'label']
            )
        ]


class GraphAttribDefVertexSerializer(serializers.ModelSerializer):
    """
    Serialization of GraphAttribDefVertex model.
    """
    # TODO: if a new GraphVtxAttrib is defined, should it be added to all existing Vertex objects for the Graph ?
    class Meta:
        model = GraphAttribDefVertex
        fields = ['id', 'graph_fk', 'label', 'type_fk', 'descr', 'default_str']
        validators = [
            UniqueTogetherValidator(
                queryset=GraphAttribDefVertex.objects.all(),
                fields=['graph_fk', 'label']
            )
        ]


class GraphAttribDefTransSerializer(serializers.ModelSerializer):
    """
    Serialization of GraphAttribDefTrans model.
    """
    # TODO: if a new GraphTransactionAttrib is defined, should it be added to all existing Transaction objects for the Graph ?
    class Meta:
        model = GraphAttribDefTrans
        fields = ['id', 'graph_fk', 'label', 'type_fk', 'descr', 'default_str']
        validators = [
            UniqueTogetherValidator(
                queryset=GraphAttribDefTrans.objects.all(),
                fields=['graph_fk', 'label']
            )
        ]
# </editor-fold>


# <editor-fold Schema serializer">
class SchemaSerializer(serializers.ModelSerializer):
    """
    Serialization of Schema model.
    """
    class Meta:
        model = Schema
        fields = ['id', 'label']
# </editor-fold>


# <editor-fold Graph serializer">
class GraphSerializer(serializers.ModelSerializer):
    """
    Serialization of Graph model.
    This is the default serializer and does not provide a clean Constellation
    Graph format JSON when requesting a Graph object be returned - refer to
    GraphJsonSerializer for that.
    Note the next_vertex_id and next_transaction_id fields are used to add
    pseudo-identifiers to child Vertex and Transaction objects  that are tied
    to this Graph model. Just like the Database maintains next_id values for
    all tables, this value is used to generate a unique ID for these objects
    (per Graph) starting at 1. Some trickery is required to fields and
    read_only_fields to ensure user does not change the value. This is set
    programtically by the associated views create method.
    """
    class Meta:
        model = Graph
        fields = ['id', 'title', 'schema_fk', 'next_vertex_id']
        read_only_fields = ['next_vertex_id']
# </editor-fold>


# <editor-fold Graph JSON creation serializers">
class GraphJsonSerializer(serializers.ModelSerializer):
    """
    Serializer tasked with serialisation of a Graph object and all child
    elements to ultimately build up JSON which aligns to graph JSON found in
    the legacy systems star files.
    """
    schema = serializers.SerializerMethodField()
    vertex = serializers.SerializerMethodField()
    transaction = serializers.SerializerMethodField()

    class Meta:
        model = Graph
        fields = ['schema', 'vertex', 'transaction']

    def get_schema(self, obj):
        """
        Return schema block in legacy star file format
        :param obj: Graph model instance
        :return: JSON representation of Schema
        """
        return str(obj.schema_fk.label)

    def get_vertex(self, obj):
        """
        Return vertex block in legacy star file format
        :param obj: Graph model instance
        :return: JSON representation of graph vertexes
        """
        return get_vertex_json(obj)

    def get_transaction(self, obj):
        """
        Return transaction block in legacy star file format
        :param obj: Graph model instance
        :return: JSON representation of graph transactions
        """
        return get_transaction_json(obj)


class GraphJsonVertexesSerializer(serializers.ModelSerializer):
    """
    Serializer tasked with serialisation of the vertex component of a Graph
    object and all child elements to ultimately build up JSON which aligns to
    graph vertex JSON found in the legacy systems star files.
    """
    vertex = serializers.SerializerMethodField()

    def get_vertex(self, obj):
        """
        Return vertex block in legacy star file format
        :param obj: Graph model instance
        :return: JSON representation of graph vertexes
        """
        return get_vertex_json(obj)

    class Meta:
        model = Graph
        fields = ['vertex']


class GraphJsonTransactionsSerializer(serializers.ModelSerializer):
    """
    Serializer tasked with serialisation of the transaction component of a
    Graph object and all child elements to ultimately build up JSON which
    aligns to graph transaction JSON found in the legacy systems star files.
    """
    transaction = serializers.SerializerMethodField()

    def get_transaction(self, obj):
        """
        Return transaction block in legacy star file format
        :param obj: Graph model instance
        :return: JSON representation of graph transactions
        """
        return get_transaction_json(obj)

    class Meta:
        model = Graph
        fields = ['transaction']


class VertexAttribJsonSerializer(serializers.ModelSerializer):
    """
    Generate JSON output for Vertex attribute definitions as used in graph JSON
    """
    type = serializers.SerializerMethodField()
    default = serializers.SerializerMethodField()
    class Meta:
        model = GraphAttribDefVertex
        fields = ['label', 'type', 'descr', 'default']
        validators = [
            UniqueTogetherValidator(
                queryset=VertexAttrib.objects.all(),
                fields=['graph_fk', 'label']
            )
        ]

    def get_type(self, obj):
        """
        Return type label
        :param obj: Object being processed
        :return: Objects type label
        """
        return str(obj.type_fk.label)

    def get_default(self, obj):
        """
        Return default value
        :param obj: Object being processed
        :return: Objects default value
        """
        return attrib_str_to_value(obj.type_fk.raw_type, obj.default_str)


class TransactionAttribJsonSerializer(serializers.ModelSerializer):
    """
    Generate JSON output for Transaction attribute definitions as used in graph
    JSON
    """
    type = serializers.SerializerMethodField()
    default = serializers.SerializerMethodField()
    class Meta:
        model = GraphAttribDefTrans
        fields = ['label', 'type', 'descr', 'default']
        validators = [
            UniqueTogetherValidator(
                queryset=TransactionAttrib.objects.all(),
                fields=['graph_fk', 'label']
            )
        ]

    def get_type(self, obj):
        """
        Return type label
        :param obj: Object being processed
        :return: Objects type label
        """
        return str(obj.type_fk.label)

    def get_default(self, obj):
        """
        Return default value
        :param obj: Object being processed
        :return: Objects default value
        """
        return attrib_str_to_value(obj.type_fk.raw_type, obj.default_str)
# </editor-fold>


# <editor-fold Vertex and VertexAttrib serializers">
class VertexSerializer(serializers.ModelSerializer):
    """
    Default Vertex serializer. Enforces a two field uniqueness constraint across objects. Vertex creation involves
    adding a unique vx_id value per parent Graph, as well as looping through and creating any child VertexAttribute
    objects required, as determined by the GraphVtxAttrib objects allocated to the parent Graph.
    """

    # Because a uniqueness constraint across graph_fk and vx_id fields, and vx_id is a field which we calculate based on
    # parent Graph field (next_vertex_id), we need to update the value prior to reaching the serializer.
    class Meta:
        model = Vertex
        fields = ['id', 'graph_fk', 'vx_id', 'attribute_json']  # The vx_id field is included, but its value is always overridden
        validators = [
            UniqueTogetherValidator(
                queryset=Vertex.objects.all(),
                fields=['graph_fk', 'vx_id']
            )
        ]

    def to_internal_value(self, data):
        """
        Perform processing to determine the next free vx_id value by obtaining the next_vertex_id stored in the parent
        Grapho object.
        :param data: Vertex data to use in create.
        :return: OrderedDict of object values.
        """
        print("VertexSerializer.to_internal_value: data=" + str(data))
        graph = Graph.objects.get(id=data['graph_fk'])
        if isinstance(data, QueryDict):
            data._mutable = True
            data['vx_id'] = graph.next_vertex_id
            data._mutable = False
        else:
            data['vx_id'] = graph.next_vertex_id
        return super(VertexSerializer, self).to_internal_value(data)

    def create(self, validated_data):
        """
        Perform base class object creation, but additionally, increment the parent Graph objects next_vertex_id value
        and loop through and create linked VertexAttribute objects corresponding to every GraphVtxAttrib object that
        is linked to the parent Graph and has a default value set.
        :param validated_data:
        :return: Created Vertex instance
        """
        print("VertexSerializer.create: validated_data=" + str(validated_data))

        # Get parent Graph object, used for two reasons:
        # 1) as a key to filter for candidate GraphVtxAttrib to be used as basis of VertexAttribute objects to add to
        #    the vertex
        # 2) as the manager of this objects vx_id, which is determined using (and updating) the Graph objects
        #    next_vertex_id field
        instance = super(VertexSerializer, self).create(validated_data)

        # Update graph to reflect the new vertex that has been added, incrementing the next_vertex_id value
        graph = instance.graph_fk
        graph.next_vertex_id = graph.next_vertex_id + 1
        graph.save()

        # Now loop through and create any VertexAttribute objects based on GraphVtxAttrib linked to parent Graph object
        # that have default values
        graph_vertex_attributes = graph.graphvertexattrib_set.exclude(default_str__isnull=True)
        for vertex_object in graph_vertex_attributes:
            vertex_attrib = VertexAttrib(vertex_fk=instance, attrib_fk=vertex_object, value_str=vertex_object.default_str)
            vertex_attrib.save()
        return instance


class VertexAttribSerializer(serializers.ModelSerializer):
    """
    Default VertexAttrib serializer. Enforces a two field uniqueness constraint across objects.
    """
    class Meta:
        model = VertexAttrib
        fields = ['id', 'vertex_fk', 'attrib_fk', 'value_str']
        validators = [
            UniqueTogetherValidator(
                queryset=VertexAttrib.objects.all(),
                fields=['vertex_fk', 'attrib_fk']
            )
        ]

    @staticmethod
    def update_vertex_attrib(vertex, attrib_label, attrib_type, attrib_value_str):
        """
        Common code to handle the propagation of to a VertexAttrib object (Create or Delete) up into the parent Vertex
        objects json field.

        :param vertex: Parent Vertex object to update
        :param attrib_label: Attribute label being updated
        :param attrib_type: The type of the attribute being updated
        :param attrib_value_str: String value of the attribute being updated
        """
        vertex_attribute_json = json.loads(vertex.attribute_json)
        vertex_attribute_json[attrib_label] = attrib_str_to_value(attrib_type, attrib_value_str)
        vertex.attribute_json = json.dumps(vertex_attribute_json)
        vertex.save()

    def create(self, validated_data):
        """
        Handle creation of a VertexAttribute. The only additional processing over the base class processing is to
        update the parent Vertex objects json field to reflect the change.

        :param validated_data: Validated data capturing the creation details.
        :return: Created object instance
        """
        print("VertexAttribSerializer.create: validated_data=" + str(validated_data))
        instance = super(VertexAttribSerializer, self).create(validated_data)
        self.update_vertex_attrib(instance.vertex_fk, instance.attrib_fk.label, instance.attrib_fk.type_fk.type, instance.value_str)
        return instance

    def update(self, instance, validated_data):
        """
        Handle update of a VertexAttribute. The only additional processing over the base class processing is to
        update the parent Vertex objects json field to reflect the change.

        :param validated_data: Validated data capturing the creation details.
        :return: Created object instance
        """
        print("VertexAttribSerializer.update: validated_data=" + str(validated_data))
        instance = super(VertexAttribSerializer, self).update(instance, validated_data)
        self.update_vertex_attrib(instance.vertex_fk, instance.attrib_fk.label, instance.attrib_fk.type_fk.type, instance.value_str)
        return instance
# </editor-fold>


# <editor-fold Transaction and TransactionAttrib serializers">
class TransactionSerializer(serializers.ModelSerializer):
    """
    Default Transaction serializer. Enforces a two field uniqueness constraint
    across objects. Transaction creation involves adding a unique tx_id value
    per parent Graph, as well as looping through and creating any child
    TransactionAttribute objects required, as determined by the
    GraphTransactionAttrib objects allocated to the parent Graph.
    """

    # Because a uniqueness constraint across graph_fk and tx_id fields, and
    # tx_id is a field which we calculate based on parent Graph field
    # (next_transaction_id), we need to update the value prior to reaching the
    # serializer.
    class Meta:
        model = Transaction
        fields = ['id', 'graph_fk', 'vx_src', 'vx_dst', 'tx_id', 'attribute_json']  # The tx_id field is included, but its value is always overridden
        validators = [
            UniqueTogetherValidator(
                queryset=Transaction.objects.all(),
                fields=['graph_fk', 'tx_id']
            )
        ]

    def to_internal_value(self, data):
        """
        Perform processing to determine the next free tx_id value by obtaining
        the next_transaction_id stored in the parent Graph object.
        :param data: Transaction data to use in create.
        :return: OrderedDict of object values.
        """
        print("TransactionSerializer.to_internal_value: data=" + str(data))
        graph = Graph.objects.get(id=data['graph_fk'])
        if isinstance(data, QueryDict):
            data._mutable = True
            data['tx_id'] = graph.next_transaction_id
            data._mutable = False
        else:
            data['tx_id'] = graph.next_transaction_id
        return super(TransactionSerializer, self).to_internal_value(data)

    def create(self, validated_data):
        """
        Perform base class object creation, but additionally, increment the
        parent Graph objects next_transaction_id value and loop through and
        create linked TransactionAttribute objects corresponding to every
        GraphTransactionAttrib object that is linked to the parent Graph and
        has a default value set.
        :param validated_data: ransaction data to use in create.
        :return: Created Vertex instance
        """
        print("TransactionSerializer.create: validated_data=" + str(validated_data))

        # Get parent Graph object, used for two reasons:
        # 1) as a key to filter for candidate GraphTransactionttrib to be used
        #    as basis of TransactionAttribute objects to add to the vertex
        # 2) as the manager of this objects tx_id, which is determined using
        # (and updating) the Graph objects next_transaction_id field
        instance = super(TransactionSerializer, self).create(validated_data)

        # Update graph to reflect the new transaction that has been added,
        # incrementing the next_transaction_id value
        graph = instance.graph_fk
        graph.next_transaction_id = graph.next_transaction_id + 1
        graph.save()

        # Now loop through and create any TransactionAttribute objects based on
        # GraphTransactionAttrib linked to parent Graph object that have
        # default values
        graph_transaction_attributes = graph.graphtransactionattrib_set.exclude(default_str__isnull=True)
        for transaction_object in graph_transaction_attributes:
            transaction_attrib = TransactionAttrib(transaction_fk=instance, attrib_fk=transaction_object,
                                                   value_str=transaction_object.default_str)
            transaction_attrib.save()
        return instance


class TransactionAttribSerializer(serializers.ModelSerializer):
    """
    Default TransactionAttrib serializer. Enforces a two field uniqueness
    constraint across objects.
    """
    class Meta:
        model = TransactionAttrib
        fields = ['id', 'transaction_fk', 'attrib_fk', 'value_str']
        validators = [
            UniqueTogetherValidator(
                queryset=TransactionAttrib.objects.all(),
                fields=['transaction_fk', 'attrib_fk']
            )
        ]

    @staticmethod
    def update_transaction_attrib(transaction, attrib_label, attrib_type, attrib_value_str):
        """
        Common code to handle the propagation of to a TransactionAttrib object
        (Create or Delete) up into the parent Transaction objects json field.

        :param transaction: Parent Transaction object to update
        :param attrib_label: Attribute label being updated
        :param attrib_type: The type of the attribute being updated
        :param attrib_value_str: String value of the attribute being updated
        """
        transaction_attribute_json = json.loads(transaction.attribute_json)
        transaction_attribute_json[attrib_label] = attrib_str_to_value(attrib_type, attrib_value_str)
        transaction.attribute_json = json.dumps(transaction_attribute_json)
        transaction.save()

    def create(self, validated_data):
        """
        Handle creation of a TransactionAttribute. The only additional
        processing over the base class processing is to update the parent
        Transaction objects json field to reflect the change.

        :param validated_data: Validated data capturing the creation details.
        :return: Created object instance
        """
        print("TransactionAttribSerializer.create: validated_data=" + str(validated_data))
        instance = super(TransactionAttribSerializer, self).create(validated_data)
        self.update_transaction_attrib(instance.transaction_fk, instance.attrib_fk.label,
                                       instance.attrib_fk.type_fk.type, instance.value_str)
        return instance

    def update(self, instance, validated_data):
        """
        Handle update of a TransactionAttribute. The only additional processing
        over the base class processing is to update the parent Transaction
        objects json field to reflect the change.

        :param validated_data: Validated data capturing the creation details.
        :return: Created object instance
        """
        print("TransactionAttribSerializer.update: validated_data=" + str(validated_data))
        instance = super(TransactionAttribSerializer, self).update(instance, validated_data)
        self.update_transaction_attrib(instance.transaction_fk, instance.attrib_fk.label,
                                       instance.attrib_fk.type_fk.type, instance.value_str)
        return instance
# </editor-fold>
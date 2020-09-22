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
import enum
from django.db import models


# <editor-fold AttribType model and functions">
class AttribTypeChoice(enum.Enum):
    """
    Defined (and supported) primitive attribute types. Each entry in this list
    needs corresponding handling in the method attrib_str_to_value to convert a
    string of the defined type to an object of the primitive type.
    """
    BOOL = 0
    FLOAT = 1
    INTEGER = 2
    STRING = 3
    DICT = 4


def attrib_str_to_value(value_type, value_str):
    """
    Helper function to take a type and value string and convert the value
    string into the identified type (when possible).
    :param value_type: The type to treat the value_string value as.
    :param value_str: The string to convert.
    :return: Converted value_str value.
    """
    if value_type == AttribTypeChoice.BOOL.value:
        try:
            if value_str.upper() == "TRUE":
                return True
            return False
        except ValueError:
            return None
    elif value_type == AttribTypeChoice.FLOAT.value:
        try:
            return float(value_str)
        except ValueError:
            return None
    elif value_type == AttribTypeChoice.INTEGER.value:
        try:
            return int(value_str)
        except ValueError:
            return None
    elif value_type == AttribTypeChoice.DICT.value:
        try:
            return json.loads(value_str)
        except json.JSONDecodeError as e:
            return None
    return str(value_str)


class AttribType(models.Model):
    """
    Definition of application specific data types and their mappings to
    primitive data types. This mechanism allows for attributes to be defined
    with bespoke names within the application and assist in defining rules for
    their translation into JSON representations.
    """
    label = models.CharField(max_length=128, blank=False, unique=True)
    raw_type = models.IntegerField(choices=[(tag.value, tag.name) for tag in AttribTypeChoice])

    def __str__(self):
        return self.label + ': (' + \
               str(AttribTypeChoice(self.raw_type)).replace('AttribTypeChoice.', '') + ')'
# </editor-fold>


# <editor-fold Attribute definition hierarchy models">
class BaseAttribDef(models.Model):
    """
    Abstract base attribute model used to form basis of Schema and Graph
    attributes for Graph, Vertex, and Transaction objects.
    """
    label = models.CharField(max_length=128, blank=False)
    type_fk = models.ForeignKey(AttribType, null=False, on_delete=models.CASCADE)
    descr = models.CharField(max_length=256, null=True, blank=True, default='')
    default_str = models.TextField(null=True, blank=True, default=None)

    def __str__(self):
        return "ID=" + str(self.id) + ", label=" + str(self.label)

    class Meta:
        abstract = True


class SchemaBaseAttribDef(BaseAttribDef):
    """
    Abstract base Schema attribute model used as base for the three Schema
    attribute models.
    """
    schema_fk = models.ForeignKey('Schema', on_delete=models.CASCADE)

    class Meta:
        abstract = True


class SchemaAttribDefGraph(SchemaBaseAttribDef):
    """
    A Graph attribute object defined for a parent Schema object. These
    attributes are copied into corresponding Graph attributes upon creation
    of a Graph aligned to the parent Schema object.
    """
    pass


class SchemaAttribDefVertex(SchemaBaseAttribDef):
    """
    A Vertex attribute object defined for a parent Schema object. These
    attributes are copied into corresponding Graph attributes upon creation of
    a Graph aligned to the parent Schema object.
    """
    pass


class SchemaAttribDefTrans(SchemaBaseAttribDef):
    """
    A Transaction attribute object defined for a parent Schema object. These
    attributes are copied into corresponding
    Graph attributes upon creation of a Graph aligned to the parent Schema object.
    """
    pass


class GraphBaseAttribDef(BaseAttribDef):
    """
    Abstract base Graph attribute model used as base for the three Graph
    attribute models.
    """
    graph_fk = models.ForeignKey('Graph', on_delete=models.CASCADE)

    class Meta:
        abstract = True


class GraphAttribDefGraph(GraphBaseAttribDef):
    """
    A Graph attribute object defined for a parent Graph object.
    """
    pass


class GraphAttribDefVertex(GraphBaseAttribDef):
    """
    A Vertex attribute object defined for a parent Graph object.
    """
    pass


class GraphAttribDefTrans(GraphBaseAttribDef):
    """
    A Transaction attribute object defined for a parent Graph object.
    """
    pass
# </editor-fold>


# <editor-fold Schema model">
class Schema(models.Model):
    """
    Schema definitions used by Graph objects. Schemas identify expected
    Graph/Vertex/Transaction attributes to be applied within any Graph objects
    using the Schema.
    """
    label = models.CharField(max_length=128, blank=False, unique=True)

    def __str__(self):
        return self.label
# </editor-fold>


# <editor-fold Graph and GraphAttribute models">
# TODO: Can a Graph exist without a Schema ?
class Graph(models.Model):
    """
    Encompassing Graph model. A Graph object contains a collection of Vertex
    objects and Transaction links between these vertexes as well as other
    associated metadata.
    """
    title = models.CharField(max_length=100, blank=False, unique=True)
    schema_fk = models.ForeignKey(Schema, on_delete=models.CASCADE, null=True, blank=True)
    attribute_json = models.JSONField(blank=True, default=dict)
    next_vertex_id = models.IntegerField(blank=False, null=False, default=1)
    next_transaction_id = models.IntegerField(blank=False, null=False, default=1)

    def __str__(self):
        return self.title


class GraphAttrib(models.Model):
    """
    Individual attribute of a container Vertex object. Each attribute is made
    up of a label and type (both extracted from linked GraphVtxAttrib object)
    and a string value. This string will be translated to various types based
    on attributes type definition prior to extract in serializers.
    """
    graph_fk = models.ForeignKey(Graph, on_delete=models.CASCADE, related_name='graph_attribs')
    attrib_fk = models.ForeignKey(GraphAttribDefGraph, on_delete=models.CASCADE)
    value_str = models.TextField(blank=True, default='')

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['graph_fk', 'attrib_fk'], name='unique attrib per graph')
        ]
# </editor-fold>


# <editor-fold Vertex and VertexAttribute models">
class Vertex(models.Model):
    """
    Vertex container. Attributes of each Vertex are defined via vertex_attribs
    field created by related model VertexAttrib. the field json is
    automatically populated based on changes to linked VertexAttrib objects and
    is provided to improve performance when returning an entire graph, rather
    than needing to reverse engineer this JSON from each VertexAttrib and its
    linked attribute label, type and value information.
    """
    graph_fk = models.ForeignKey(Graph, on_delete=models.CASCADE)
    vx_id = models.IntegerField(blank=False, null=False)
    attribute_json = models.JSONField(blank=True, default=dict)

    def __str__(self):
        return "Graph:" + str(self.graph_fk) + ",  Vertex:" + str(self.vx_id)


class VertexAttrib(models.Model):
    """
    Individual attribute of a container Vertex object. Each attribute is made
    up of a label and type (both extracted from linked GraphVtxAttrib object)
    and a string value. This string will be translated to various types based
    on attributes type definition prior to extract in serializers.
    """
    vertex_fk = models.ForeignKey(Vertex, on_delete=models.CASCADE, related_name='vertex_attribs')
    attrib_fk = models.ForeignKey(GraphAttribDefVertex, on_delete=models.CASCADE)
    value_str = models.TextField(blank=True, default='')

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['vertex_fk', 'attrib_fk'], name='unique attrib per vertex')
        ]
# </editor-fold>


# <editor-fold Transaction and TransactionAttribute models">
# TODO: class Transaction
class Transaction(models.Model):
    """

    """
    graph_fk = models.ForeignKey(Graph, on_delete=models.CASCADE)
    tx_id = models.IntegerField(blank=False, null=False)
    vx_src = models.ForeignKey(Vertex, related_name='source', on_delete=models.CASCADE)
    vx_dst = models.ForeignKey(Vertex, related_name='destination', on_delete=models.CASCADE)
    tx_dir = models.BooleanField(default=True, null=False)
    attribute_json = models.JSONField(blank=True, default=dict)

    def __str__(self):
        return str(self.id)


# TODO: class TransactionAttrib
class TransactionAttrib(models.Model):
    """

    """
    transaction_fk = models.ForeignKey(Transaction, on_delete=models.CASCADE)
    attrib_fk = models.ForeignKey(GraphAttribDefTrans, on_delete=models.CASCADE)
    value_str = models.TextField(blank=True, default='')
# </editor-fold>

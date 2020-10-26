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

from django.contrib import admin
from django.urls import path, include
from django.conf.urls import url
from app import views
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
   openapi.Info(
      title="Constellation Backend REST API",
      default_version='v1',
      description="Documentation of Web-Constellation Backend REST Backend Proof of Concept(POC)",
      # terms_of_service="https://www.google.com/policies/terms/",
      # contact=openapi.Contact(email="contact@snippets.local"),
      # license=openapi.License(name="BSD License"),
   ),
   public=True,
   # permission_classes=(permissions.AllowAny,),
)

urlpatterns = [

    # <editor-fold AttribType URLs">
    path('attrib_types/', views.AttribTypesView.as_view(), name='attrib_types'),
    path('attrib_types/<int:pk>', views.AttribTypeView.as_view(), name='attrib_type'),
    # </editor-fold>

    # <editor-fold Attribute definition hierarchy URLs">
    path('schema_graph_attrib_defs/', views.SchemaAttribDefGraphsView.as_view(), name='schema_graph_attrib_defs'),
    path('schema_graph_attrib_defs/<int:pk>', views.SchemaAttribDefGraphView.as_view(), name='schema_graph_attrib_def'),
    path('schema_vertex_attrib_defs/', views.SchemaAttribDefVertexesView.as_view(), name='schema_vertex_attrib_defs'),
    path('schema_vertex_attrib_defs/<int:pk>', views.SchemaAttribDefVertexView.as_view(),
         name='schema_vertex_attrib_def'),
    path('schema_trans_attrib_defs/', views.SchemaAttribDefTransactionsView.as_view(), name='schema_trans_attrib_defs'),
    path('schema_trans_attrib_defs/<int:pk>', views.SchemaAttribDefTransactionView.as_view(),
         name='schema_trans_attrib_def'),
    path('graph_attrib_defs/', views.GraphAttribDefGraphsView.as_view(), name='graph_attrib_defs'),
    path('graph_attrib_defs/<int:pk>', views.GraphAttribDefGraphView.as_view(), name='graph_attrib_def'),
    path('vertex_attrib_defs/', views.GraphAttribDefVertexesView.as_view(), name='vertex_attrib_defs'),
    path('vertex_attrib_defs/<int:pk>', views.GraphAttribDefVertexView.as_view(), name='vertex_attrib_defs'),
    path('trans_attrib_defs/', views.GraphAttribDefTransactionsView.as_view(), name='trans_attrib_defs'),
    path('trans_attrib_defs/<int:pk>', views.GraphAttribDefTransactionView.as_view(), name='trans_attrib_def'),
    # </editor-fold>

    # <editor-fold Schema URLs">
    path('schemas/', views.SchemasView.as_view(), name='schemas'),
    path('schemas/<int:pk>', views.SchemaView.as_view(), name='schema'),
    # </editor-fold>

    # <editor-fold Graph URLs">
    path('graphs/', views.GraphsView.as_view(), name='graphs'),
    path('graphs/<int:pk>', views.GraphView.as_view(), name='graph'),
    path('graph_attributes/', views.GraphAttributesView.as_view(), name='graph_attributes'),
    path('graph_attributes/<int:pk>', views.GraphAttributeView.as_view(), name='graph_attribute'),
    path('edit_graph_attribs/', views.EditGraphAttributes, name='edit_graph_attribs'),
    # </editor-fold>

    # <editor-fold Graph JSON creation URLs">
    path('graphs/<int:pk>/json', views.GraphJson.as_view(), name='JSON_graph'),
    path('graphs/<int:pk>/json/vertexes', views.GraphJsonVertexes.as_view(), name='JSON_graph_vertexes'),
    path('graphs/<int:pk>/json/transactions', views.GraphJsonTransactions.as_view(), name='JSON_graph_transactions'),
    # </editor-fold>

    # <editor-fold Vertex and VertexAttrib URLs">
    path('vertexes/', views.VertexesView.as_view(), name='vertexes'),
    path('vertexes/<int:pk>', views.VertexView.as_view(), name='vertex'),
    path('vertex_attributes/', views.VertexAttributesView.as_view(), name='vertex_attributes'),
    path('vertex_attributes/<int:pk>', views.VertexAttributeView.as_view(), name='vertex_attribute'),
    path('edit_vertex_attribs/', views.EditVertexAttributes, name='edit_vertex_attribs'),
    # </editor-fold>

    # <editor-fold Transaction and TransactionAttrib URLs">
    path('transactions/', views.TransactionsView.as_view(), name='transactions'),
    path('transactions/<int:pk>', views.TransactionView.as_view(), name='transaction'),
    path('transaction_attributes/', views.TransactionAttributesView.as_view(), name='transaction_attributes'),
    path('transaction_attributes/<int:pk>', views.TransactionAttributeView.as_view(), name='transaction_attribute'),
    path('edit_transaction_attribs/', views.EditTransactionAttributes, name='edit_transaction_attribs'),
    # </editor-fold>


    # <editor-fold Generate Data from Existing Graph JSON file, Performance checking">
    # Import legacy graph file JSON into the database. This requires the
    # contents of the .star file to be renamed .zip, then the enclosed file
    # copied out onto the file system and used as an input to the endpoint.
    path('import/', views.ImportLegacyJSON, name='import_json'),

    # Added endpoint for developmental performance tuning
    url(r'^silk/', include('silk.urls', namespace='silk')),
    # </editor-fold>

    # path('admin/', admin.site.urls),
    url(r'^$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),

    path('websockets/', include('websockets.urls')),

]
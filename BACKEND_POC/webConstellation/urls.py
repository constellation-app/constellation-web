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

urlpatterns = [

    # <editor-fold AttribType URLs">
    path('attrib_types/', views.AttribTypeLCView.as_view(),
         name='attrib_types'),
    path('attrib_type/<int:pk>', views.AttribTypeRUDView.as_view(),
         name='attrib_type'),
    # </editor-fold>

    # <editor-fold Attribute definition hierarchy URLs">
    path('schema_graph_attrib_defs/', views.SchemaAttribDefGraphLCView.as_view(),
         name='schema_graph_attrib_defs'),
    path('schema_graph_attrib_def/<int:pk>', views.SchemaAttribDefGraphRUDView.as_view(),
         name='schema_graph_attrib_def'),
    path('schema_vertex_attrib_defs/', views.SchemaAttribDefVertexLCView.as_view(),
         name='schema_vertex_attrib_defs'),
    path('schema_vertex_attrib_def/<int:pk>', views.SchemaAttribDefVertexRUDView.as_view(),
         name='schema_vertex_attrib_def'),
    path('schema_trans_attrib_defs/', views.SchemaAttribDefTransLCView.as_view(),
         name='schema_trans_attrib_defs'),
    path('schema_trans_attrib_def/<int:pk>', views.SchemaAttribDefTransRUDView.as_view(),
         name='schema_trans_attrib_def'),
    path('graph_attrib_defs/', views.GraphAttribDefGraphLCView.as_view(),
         name='graph_attrib_defs'),
    path('graph_attrib_def/<int:pk>', views.GraphAttribDefGraphRUDView.as_view(),
         name='graph_attrib_def'),
    path('vertex_attrib_defs/', views.GraphAttribDefVertexLCView.as_view(),
         name='vertex_attrib_defs'),
    path('vertex_attrib_def/<int:pk>', views.GraphAttribDefVertexRUDView.as_view(),
         name='vertex_attrib_defs'),
    path('trans_attrib_defs/', views.GraphAttribDefTransLCView.as_view(),
         name='trans_attrib_defs'),
    path('trans_attrib_def/<int:pk>', views.GraphAttribDefTransRUDView.as_view(),
         name='trans_attrib_def'),
    # </editor-fold>

    # <editor-fold Schema URLs">
    path('schemas/', views.SchemaLCView.as_view(),
         name='schemas'),
    path('schema/<int:pk>', views.SchemaRUDView.as_view(),
         name='schema'),
    # </editor-fold>

    # <editor-fold Graph URLs">
    path('graphs/', views.GraphLCView.as_view(),
         name='graphs'),
    path('graph/<int:pk>', views.GraphRUDView.as_view(),
         name='graph'),
    # </editor-fold>

    # <editor-fold Graph JSON creation URLs">
    path('graph/<int:pk>/json', views.GraphJson.as_view(),
         name='JSON_graph'),
    path('graph/<int:pk>/json/vertexes', views.GraphJsonVertexes.as_view(),
         name='JSON_graph_vertexes'),
    path('graph/<int:pk>/json/transactions', views.GraphJsonTransactions.as_view(),
         name='JSON_graph_transactions'),
    # </editor-fold>

    # <editor-fold Vertex and VertexAttrib URLs">
    path('vertexes/', views.VertexLCView.as_view(),
         name='vertexes'),
    path('vertex/<int:vx_id>', views.VertexRUDView.as_view(),
         name='vertex'),
    path('vertex_attributes/', views.VertexAttribLCView.as_view(),
         name='vertex_attributes'),
    path('vertex_attribute/<int:pk>', views.VertexAttribRUDView.as_view(),
         name='vertex_attribute'),
    # </editor-fold>

    # <editor-fold Transaction and TransactionAttrib URLs">
    path('transaction/<int:tx_id>', views.TransactionRUDView.as_view(),
         name='transaction'),
    path('transaction_attributes/', views.TransactionAttribLCView.as_view(),
         name='transaction_attributes'),
    path('transaction_attribute/<int:pk>', views.TransactionAttribRUDView.as_view(),
         name='transaction_attribute'),
    # </editor-fold>

    # <editor-fold Graph/Vertex/Transaction Attribute Edit URLs - using graph_id, vx_id/tx_id to identify">
    # Endpoints available for creation/update of graph/vertex/transaction
    # attributes using graph_id, and graph_id/vx_id or graph_id/vx_id to
    # identify attribute under change.
    path('edit_graph_attrib/', views.EditGraphAttribute,
         name='edit_graph_attrib'),
    path('edit_vertex_attrib/', views.EditVertexAttribute,
         name='edit_vertex_attrib'),
    path('edit_transaction_attrib/', views.EditTransactionAttribute,
         name='edit_transaction_attrib'),
    # </editor-fold>


    # <editor-fold Test Code - Generate Data from Existing Graph JSON file, Performance checking">
    # Import legacy graph file JSON into the database. This requires the
    # contents of the .star file to be renamed .zip, then the enclosed file
    # copied out onto the file system and used as an input to the endpoint.
    path('import/', views.ImportJSON, name='import_json'),

    # Added endpoint for developmental performance tuning
    url(r'^silk/', include('silk.urls', namespace='silk')),
    # </editor-fold>

    # path('admin/', admin.site.urls),
]
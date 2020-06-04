Standalone graph view
=====================

This directory contains a standalone ``index.html`` for easier development of ``graph_vis.js`` without the UI getting in the way. Run ``python -m http.server`` in the root directory and browse to ``http://localhost:8000/_web/``.

To see the 1000 node graph, browse to ``http://localhost:8000/?graph=../graph-1000.json``.

The ``get-graph.ipynb`` notebook uses the Constellation REST API to get a graph and produce a JSON document that can be read by the graph visualiser.

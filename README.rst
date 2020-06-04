Constellation web viewer
========================

Run a web server (such as ``python -m http.server`` on port 8000) in the root directory and browse to ``http://localhost:8000/``.

The default graph is graph-5.json (with sprite atlas graph-5-atlas.png).

To see the 1000 node graph, browse to ``http://localhost:8000/?graph=graph-1000.json``.

See the README in the ``_web`` directory for just the graph.

Just for fun, in ``graph_vis.js`` change:

``
const highlight = new Highlighter(scene);
``

to:

``
const highlight = new HighlighterT3(scene);
``

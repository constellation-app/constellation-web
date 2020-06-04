'use strict';

const buildGraphUi = function(data, eventHandler) {
  /**
   * When a user clicks on an element in the grid or sidebar, update everything.
   */
  const selectVxId = function(id) {
    w2ui['sidebar'].select(id);
    const grid = w2ui['grid_nodes'];
    grid.selectNone();
    grid.select(id);
    grid.scrollIntoView(grid.get(id, true));
  }

  const selectLinkId = function(id) {
    const grid = w2ui['grid_links'];
    grid.selectNone();
    id = id + '#';
    const toSelect = grid.records.filter(row => row.recid.startsWith(id));
    grid.select(...toSelect);
    grid.scrollIntoView(grid.get(toSelect[0], true));
  }

  const unselectVertices = function() {
    w2ui['sidebar'].unselect();
    w2ui['grid_nodes'].selectNone();
    // w2ui['grid_links'].selectNone();
  }

  const unselectLinks = function() {
    // w2ui['sidebar'].unselect();
    // w2ui['grid_nodes'].selectNone();
    w2ui['grid_links'].selectNone();
  }

  const pstyle = 'border: 1px solid #dfdfdf; padding: 5px;';
  const config = {
    layout: { // The main layout.
      name: 'layout',
      padding: 1,
      panels: [
          { type: 'top', size: 36, resizable: false, style: pstyle, content: 'top' },
          { type: 'left', size: 192, resizable: true, style: pstyle, content: 'left' },
          { type: 'main', style: pstyle, content: '<canvas id="renderCanvas" touch-action="none"></canvas>' },
          { type: 'bottom', size: 200, resizable: true, style:pstyle, content: 'data' }
      ],
      onResize: function(event) {
        event.done(() => eventHandler('graph', 'resize'));
      }
    },
    layout_grids: { // The main 'bottom' layout contains a nested layout for the node and link grids.
      name: 'layout_grids',
      padding: 1,
      panels: [
        { type:'left', size:'50%', resizable:true, style:pstyle, content:'nodes'},
        { type:'main', resizable:true, style:pstyle, content:'links'},
      ]
    },
    toolbar: {
      name: 'toolbar',
      items: [
          { type: 'button', id: 'reset', text: 'Reset camera', img: 'zoom-reset' },
          { type: 'button', id: 'unselect', text: 'Deselect', img: 'deselect-all' },//,
          { type: 'button', id: 'screenshot', text: 'Screenshot', img: 'screenshot' }//,
          // { type: 'break' },
          // { type: 'check', id: 'item3', text: 'Check 1'},//, icon: 'fas fa-star' },
          // { type: 'check', id: 'item4', text: 'Check 2', icon: 'fas fa-heart' },
          // { type: 'break' },
          // { type: 'radio', id: 'item5', group: '1', text: 'Radio 1', icon: 'fas fa-star', checked: true },
          // { type: 'radio', id: 'item6', group: '1', text: 'Radio 2', icon: 'fas fa-heart' },
          // { type: 'spacer' },
          // { type: 'button', id: 'item7', text: 'Button', icon: 'fas fa-star' }
      ],
      onClick: function (event) {
          switch(event.target) {
            case 'reset':
              eventHandler('graph', 'reset');
              break;
            case 'unselect':
              eventHandler('graph', 'unselect');
              break;
            case 'screenshot':
              eventHandler('graph', 'screenshot');
              break;
            default:
              console.log(`Unknown w2ui click target: ${event.target}`);
          }
      }
    },
    sidebar: {
      name: 'sidebar',
      nodes: [],
      onClick: function(event) {
        eventHandler('v', event.target);
      }
    },
    grid_nodes: {
      name: 'grid_nodes',
      onClick: function(event) {
        eventHandler('v', event.recid);
      }
    },
    grid_links: {
      name: 'grid_links',
      onClick: function(event) {
        // Convert recid 'nn#bb' to a link id nn.
        //
        const linkId = parseInt(event.recid.match('^\\d+'));
        eventHandler('link', linkId);
      }
    }
  };

  $(function () {
    // initialization
    $('#main').w2layout(config.layout);
    w2ui.layout.html('top', $().w2toolbar(config.toolbar));
    w2ui.layout.html('left', $().w2sidebar(config.sidebar));
    // w2ui.layout.html('bottom', $().w2grid(config.grid_nodes));

    w2ui.layout.html('bottom', $().w2layout(config.layout_grids));
    w2ui.layout_grids.html('left', $().w2grid(config.grid_nodes));
    w2ui.layout_grids.html('main', $().w2grid(config.grid_links));



    // w2ui.layout.content('main', $().w2grid(config.grid1));
    // in memory initialization
    // $().w2grid(config.grid2);
  });

  // Which attributes are used for the label and node color attributes?
  //
  const label_attr = data.label_attr;
  // const node_color_attr = data.node_color_attr;

  // Build the list of noted nodes.
  //
  if(data.hasOwnProperty('vx_noted')) {
    data.vx_noted.forEach(id => {
      const vx = data.vertex[id];
      const item = {id:id, text: vx[label_attr], img: 'nodes' };
      // console.log(w2ui['sidebar'].get('vxs').nodes);
      w2ui['sidebar'].nodes.push(item);
    });
    w2ui['sidebar'].refresh();
  }

  // Build the node grid.
  //
  if(data.hasOwnProperty('ui_attrs')) {
      for(const attr of data.ui_attrs) {
        const cap = '<img src="icons/nodes.png">' + attr;
        w2ui['grid_nodes'].addColumn({field:attr.replace(/\./g, '_'), text:cap});
      }

    const rows = [];
    for(const [id, vx] of Object.entries(data.vertex)) {
      // w2ui.grid uses 'recid' as the default unique row identifier.
      //
      const row = {recid:id};
      for(const attr of data.ui_attrs) {
        row[attr.replace(/\./g, '_')] = vx[attr];
      }
      rows.push(row);
    }
    w2ui['grid_nodes'].add(rows);
  }

  // Build the link grid.
  //
  if(data.hasOwnProperty('ui_tx_attrs')) {
    const link_field = [];
    for(const attr of data.ui_tx_attrs) {
      const cap = '<img src="icons/links.png">' + attr;
      const field = attr.replace(/\./g, '_')
      link_field.push(field);
      w2ui['grid_links'].addColumn({field:field, text:cap});
    }

    // So we can zip the attribute names and values.
    //
    const zip = function(...rows) {return [...rows[0].map((_,c)=>rows.map(row=>row[c]))]};

    const rows = [];
    data.transaction.forEach((link, ix) => {
      // w2ui.grid uses 'recid' as the default unique row identifier.
      //
      // const row = {recid:`${link.sid_}/${link.did_}`};

      // Each link can have more than one data row associated with it.
      // Build a unique recid in such a way that we can select the rows
      // belonging to a link by index.
      //
      link.data.forEach(values => {
        const row = {recid:`${ix}#${rows.length}`};
        for(const [field, value] of zip(link_field, values)) {
          row[field] = value;
        }
        rows.push(row);
      });
    });
    w2ui['grid_links'].add(rows);
  }

  return {
    selectVxId: selectVxId,
    selectLinkId: selectLinkId,
    unselectVertices: unselectVertices,
    unselectLinks: unselectLinks
  };
}
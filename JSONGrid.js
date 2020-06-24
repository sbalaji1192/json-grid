'use strict';

(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports);
  }
  else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  }
  else {
    (global = global || self, factory(global))
  }
})(window, function (exports) {
  let expand, updateTable;
  
  function createElement (type, additionalClasses, id) {
    let element = document.createElement(type);
    let classes = additionalClasses || [];

    if (!Array.isArray(classes)) {
      classes = [classes];
    }
    
    DOMTokenList.prototype.add.apply(element.classList, classes);

    if (id) {
      element.id = id;
    }

    return element;
  }
  
  function createExpander (name, expanded) {
    let expander = createElement('span', 'expander');
    
    expander.textContent = getExpanderSign(expanded) + name;
    expander.onclick = onExpanderClick;
    
    return expander;
  }
  
  function onExpanderClick(event) {
    if (event.target.__isShown__) {
      event.target.__isShown__ = false;
      event.target.parentElement.removeChild(event.target.parentElement.lastChild);
    }
    else {
      event.target.__isShown__ = true;
      event.target.parentElement.appendChild(innerTable({data: event.target.__data__}));
    }
    
    event.target.textContent = getExpanderSign(event.target.__isShown__) + event.target.textContent.slice(2);
    updateTable();
  }
  
  function getExpanderSign(expanded) {
    return expanded ? '- ' : '+ ';
  }
  
  function getObjectName(obj, key) {
    return key + ' ' + (typeof obj[key] == 'object' ? (Array.isArray(obj[key]) ? '[]' : '{}') : '')
  }

  function getValue(data) {
    if (Array.isArray(data) || typeof data !== "object") {
      return data;
    }
    else {
      return data.value;
    }
  }

  function processArray(data) {
    let firstElement = data[0],
      rows, headers;
    
    if (firstElement && typeof firstElement == 'object') {
      let keys = data.reduce(function (acc, val) {
        let keys = Object.keys(val);
        return acc.concat(keys);
      }, []);

      keys = keys.filter(function (value, idx) {
        return keys.indexOf(value) === idx;
      });

      headers = createElement('div', 'table-row');
      
      keys.forEach(function (value) {
        let td = createElement('div', ['table-cell', 'table-cell-head']);
        td.textContent = value.toString();
        headers.appendChild(td);
      });

      rows = data.map(function (obj, index) {
        let tr = createElement('div', 'table-row')

        keys.forEach(function (key) {
          let td = createElement('div', 'table-cell');
          let value = (obj[key] === undefined || obj[key] === null)? '' : obj[key];
          
           td.appendChild(generateDOM(new JSONGrid({
              data: value, 
              name: getObjectName(obj, key),
              expand
          })));
          tr.appendChild(td);
        });

        return tr;
      });
    }
    else {
        rows = data.map(function (obj, index) {
        
          let tr = createElement('div', 'table-row');
          let td = createElement('div', 'table-cell');

          td.appendChild(generateDOM(new JSONGrid({data: obj, expand})));
          tr.appendChild(td);
          return tr;
        });
    }

    return {
      headers: [headers],
      rows: rows,
    };
  }

  function processObject(data) {
    let keys = Object.keys(data);
    let headers = createElement('div', 'table-row');
    
    keys.forEach(function (value) {
      var td = createElement('div', ['table-cell', 'table-cell-head']);
      td.textContent = '' + value;
      headers.appendChild(td);
    });
    
    
    let rows = keys.map((key, index) => {
      let tr = createElement('div', 'table-row')
      let keyTd = createElement('div', 'table-cell');
      let value = data[key];
      let tdType = typeof value;

      if (tdType === 'object') {
        value = generateDOM(new JSONGrid({
            data: value,
            name: getObjectName(data, key),
            expand
          }));
      }
      else {
        value = createElement('span', 'value');
        value.textContent = '' + data[key];
      }

      let valTd = createElement('div', 'table-cell');

      keyTd.textContent = key;
      valTd.appendChild(value);
      tr.appendChild(keyTd);
      tr.appendChild(valTd);

      return tr;
    });

    return {
      headers: [],
      rows: rows,
    };
  }
  
  function innerTable(instance) {
    let dom;
    let tableId = 'table-' + instance.instanceNumber;
    let table = createElement('div', 'table-container', tableId);
    let thead = createElement('div', 'table-head');
    let tbody = createElement('div', 'table-body');
    
    let data = getValue(instance.data);

    if (Array.isArray(data)) {
      dom = processArray(data);
    }
    else if (typeof data === 'object') {
      dom = processObject(data);
    }

    dom.headers.forEach(function (val) {
      val && thead.appendChild(val);
    });

    dom.rows.forEach(function (val) {
      tbody.appendChild(val);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    
    return table;
  }

  function generateDOM(instance, topLevel) {
    let data = getValue(instance.data);
    if (!Array.isArray(data) && typeof data !== 'object') {
      let span = createElement('span', '');
      span.textContent = data ? data.toString() : '';
      return span;
    }
    else {
      let containerClass = ['container'];
      topLevel && containerClass.push('outer-container');
      let container = createElement('div', containerClass);
      let expander;

      if (instance.name) {
        expander = createExpander(instance.name, topLevel || expand);
        container.appendChild(expander);
      }
      
      if (topLevel) {
        container.appendChild(innerTable(instance));
      }
      else {
        expander.__data__ = instance.data;
        expander.__isShown__ = false;
        expander.__name__ = instance.name;
        
        if (expand) {
           expander.__isShown__ = true;
           container.appendChild(innerTable(instance));
        }
      }

      return container;
    }
  }

  function JSONGrid(option = {}) {
    if (!option.data) {
      new Error("JSONGrid must be initiated with data");
      return;
    }

    // Clone the data.
    this.data = JSON.parse(JSON.stringify(option.data));
    this.name = option.name;
    expand = option.expand;
    this.instanceNumber = JSONGrid.prototype.instances++;
  }

  JSONGrid.prototype = {
    instances: 0,
    render(container) {
      if (!container instanceof HTMLElement) {
        new Error("JSONGrid.render must be initiated with container");
        return;
      }

      $(container).css({
        'position': 'relative'
      });
      
      container.appendChild(generateDOM(this, true));
      let table = $("#table-0");
      let header = table.find("> .table-head .table-cell-head");
      let width = table.parent().width();
      header.each((i, d) => {
        $(d).css({'min-width' : `${width /header.length }px`});
      });
      
      let clonedHeader = $("#table-0 > .table-head").clone();
      table.parent().append(clonedHeader);
      $("#table-0 > .table-head").css({'opacity': 0});

      table.width(table.parent().width());

      table.on("mousewheel", () => {
        clonedHeader.scrollLeft(table.scrollLeft());
      });
      
      clonedHeader.on("mousewheel", () => {
        table.scrollLeft(clonedHeader.scrollLeft());
      });
      
      updateTable = () => {
        setTimeout(() => {
          clonedHeader.remove();
          clonedHeader = $("#table-0 > .table-head").clone();
          clonedHeader.css({'opacity': 1});
          table.parent().append(clonedHeader);
          clonedHeader.scrollLeft(table.scrollLeft());
          
          clonedHeader.find(".table-cell-head").each((i, d) => {
              $(d).css({'min-width': $(`#table-0 > .table-head .table-cell-head:nth-child(${i + 1})`).width()});
          });
        });
      };
    }
  };
  
  exports.JSONGrid =  JSONGrid;
});
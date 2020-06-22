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
    if (event.target.parentElement.dataset.isShown) {
      event.target.parentElement.dataset.isShown = '';
      event.target.parentElement.removeChild(event.target.parentElement.lastChild);
    }
    else {
      var div = document.createElement('div');
      div.innerHTML = event.target.parentElement.dataset.content;
      let a = div.querySelectorAll(".expander");
      if (a && a.length) {
        a.forEach(d => d.onclick = onExpanderClick);
      }
      event.target.parentElement.dataset.isShown = 'true';
      event.target.parentElement.appendChild(div.firstChild);
      
    }
    event.target.textContent = getExpanderSign(event.target.parentElement.dataset.isShown) + event.target.textContent.slice(2);
  }
  
  function getExpanderSign(expanded) {
    return expanded ? '- ' : '+ ';
  }
  
  function getObjectName(obj, key) {
    return key + ' ' + (typeof obj[key] == 'object' ? (Array.isArray(obj[key]) ? '[]' : '{}') : '')
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
          let value = (obj[key] === undefined || obj[key] === null)
            ? '' + obj[key]
            : obj[key]
          ;
           td.appendChild(generateDOM(new JSONGrid({
              data: value, 
              name: getObjectName(obj, key)
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

          td.appendChild(generateDOM(new JSONGrid({data: obj})));
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
            name: getObjectName(data, key)
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

  function generateDOM(instance, topLevel) {
    let dom;

    if (Array.isArray(instance.data)) {
      dom = processArray(instance.data);
    }
    else if (typeof instance.data === 'object') {
      dom = processObject(instance.data);
    }
    else {
      let span = createElement('span', '');
      span.textContent = '' + instance.data;
      return span;
    }

    let container = createElement('div', 'container');
    let tableId = 'table-' + instance.instanceNumber;
    let table = createElement('div', 'table-container', tableId);
    let thead = createElement('div', 'table-head');
    let tbody = createElement('div', 'table-body');

    if (instance.name) {
      let expander = createExpander(instance.name, topLevel);
      container.appendChild(expander);
    }

    dom.headers.forEach(function (val) {
      val && thead.appendChild(val);
    });

    dom.rows.forEach(function (val) {
      tbody.appendChild(val);
    });

    table.appendChild(thead);
    table.appendChild(tbody);

    if (topLevel) {
      container.appendChild(table);
    }
    else {
      container.dataset['content'] = table.outerHTML;
      container.dataset['isShown'] = ''; // empty represents flase
    }

    return container;
  }

  function JSONGrid(option = {}) {
    if (!option.data) {
      new Error("JSONGrid must be initiated with data");
      return;
    }

    // Clone the data.
    this.data = JSON.parse(JSON.stringify(option.data));
    this.name = option.name;
    this.instanceNumber = JSONGrid.prototype.instances++;
  }

  JSONGrid.prototype = {
    instances: 0,
    render(container) {
      if (!container instanceof HTMLElement) {
        new Error("JSONGrid.render must be initiated with container");
        return;
      }
      
      container.appendChild(generateDOM(this, true));
      let table = $("#table-0");
      let header = table.find("> .table-head .table-cell-head");
      let width = table.parent().width();
      header.each((i, d) => {
        $(d).css({'min-width' : `${width /header.length }px`});
      });
    }
  };
  
  exports.JSONGrid =  JSONGrid;
});
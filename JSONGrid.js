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

  const EXPANDER_TARGET_ATTRIBUTE = 'data-target-id';
  const TABLE_SHRINKED_CLASSNAME = 'shrinked';

  function createElement (type, valueType, additionalClasses, id) {
    let element = document.createElement(type);
    let classes = additionalClasses || [];

    if (!Array.isArray(classes)) {
      classes = [classes];
    }
    if (valueType) {
      classes.push(valueType);
    }

    DOMTokenList.prototype.add.apply(element.classList, classes);

    if (id) {
      element.id = id;
    }

    return element;
  }
  
  function createExpander (name, target) {
    let expander = createElement('span', 'expander');
    
    expander.textContent = '[' + getExpanderSign(target) + '] ' + name;
    expander.setAttribute(EXPANDER_TARGET_ATTRIBUTE, target.id);
    expander.onclick = onExpanderClick;
    
    return expander;
  }
  
  function onExpanderClick(event) {
    let tableId = event.target.getAttribute(EXPANDER_TARGET_ATTRIBUTE);
    let target = document.getElementById(tableId);

    if (target) {
      target.classList.toggle(TABLE_SHRINKED_CLASSNAME);
      event.target.textContent = '[' + getExpanderSign(target) + event.target.textContent.slice(2);
    }
  }
  
  function getExpanderSign(target) {
    return target.classList.contains(TABLE_SHRINKED_CLASSNAME) ? '+' : '-';
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

      headers = createElement('tr');
      
      keys.forEach(function (value) {
        let td = createElement('th');
        td.textContent = value.toString();
        headers.appendChild(td);
      });

      rows = data.map(function (obj, index) {
        let tr = createElement('tr')

        keys.forEach(function (key) {
          let td = createElement('td', typeof obj, 'table-wrapper');
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
        
          let tr = createElement('tr');
          let td = createElement('td', typeof obj, 'table-wrapper');
        
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
    let headers = createElement('tr');
    
    keys.forEach(function (value) {
      var td = createElement('td');
      td.textContent = '' + value;
      headers.appendChild(td);
    });
    
    
    let rows = keys.map((key, index) => {
      let tr = createElement('tr')
      let keyTd = createElement('td', 'string', 'rowName');
      let value = data[key];
      let tdType = typeof value;

      if (tdType === 'object') {
        value = generateDOM(new JSONGrid({
            data: value,
            name: getObjectName(data, key)
          }));
      }
      else {
        value = createElement('span', tdType, 'value');
        value.textContent = '' + data[key];
      }

      let valTd = createElement('td', tdType);

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

  function generateDOM(instance) {
    let dom;

    if (Array.isArray(instance.data)) {
      dom = processArray(instance.data);
    }
    else if (typeof instance.data === 'object') {
      dom = processObject(instance.data);
    }
    else {
      let span = createElement('span', typeof instance.data);
      span.textContent = '' + instance.data;
      return span;
    }

    let container = createElement('div', 'container');
    let tableId = 'table-' + instance.instanceNumber;
    let intialClasses = instance.instanceNumber > 0 ? [TABLE_SHRINKED_CLASSNAME] : [];
    let table = createElement('table', 'table', intialClasses, tableId);
    let tbody = createElement('tbody');

    if (instance.name) {
      let expander = createExpander(instance.name, table);
      container.appendChild(expander);
    }

    dom.headers.forEach(function (val) {
      val && tbody.appendChild(val);
    });

    dom.rows.forEach(function (val) {
      tbody.appendChild(val);
    });

    table.appendChild(tbody);

    container.appendChild(table);

    return container;
  }

  function JSONGrid(option = {}) {
    if (!option.data) {
      new Error("JSONGrid must be initiated with data");
    }

    this.data = option.data;
    this.name = option.name;
    this.instanceNumber = JSONGrid.prototype.instances++;
  }

  JSONGrid.prototype = {
    instances: 0,
    render(container) {
      if (!container instanceof HTMLElement) {
        new Error("JSONGrid.render must be initiated with container");
      }
      
      container.appendChild(generateDOM(this));
    }
  };
  
  exports.JSONGrid =  JSONGrid;
});
var logger = function logger() { try { _.each(_.toArray(arguments), function(v) { console.log(v); }); } catch(err) { console.log(err); } };
var hh = Handlebars.helpers;

Templates = {
  fn: {},
  get_name: function(n) { return _.first(_.last(n.split('/')).split('.')); },
  grab_all: function() { _.each(window.JST, function(t, n) { Templates.fn[Templates.get_name(n)] = t; }); logger('Templates loaded into Templates object.'); },
  render: function(t, e, c, done) { $(e).html(Templates.fn[t](c)); me.add_routes(e); if (done) { done(); } }, 
};

alerts = function(a) {
  var methods = {
    'example' : function() { 
        var text = "This is an example alert.";
        me.make_alert('info', text);
    },
    'Data_Loaded' : function() { 
        var text = "Data Loaded";
        me.make_alert('success', text);
    },
  };
  methods[a]();
};

db = {
    set: function(key, val) { db[key] = val; },
    get: function(key) { 
        return _.isFunction(db[key]) ? db[key].apply(undefined, _.rest(_.toArray(arguments))) : db[key]; 
    },
    setLocal: function(key, val) { me.setLocal(key, val, db.settings); },
    getLocal: function(key) { return me.getLocal(key, db.settings); },
    search: function(item, cond) { return _.where(db.get(item), cond); },
    settings: {},
    current_date: function() { var d = new Date(); return d.toJSON().slice(0,d.toJSON().indexOf('T')); },
    current_time: function() { var d = new Date(); return d.toJSON(); },
    current_state: {},
    set_state: function(view, context) { 
        db['current_state'] = {view: view, context: context};
        Templates[view](context);
    }, 
    get_state: function() { return db['current_state']; },
    save_state: function() { me.setLocal('current_state', {view: view, context: context}, db['settings']); },
    load_state: function() {  
        var state = me.getLocal('current_state', db['settings']); 
        db.set_state.apply(undefined, _.values(state)); },
    refresh_state: function() {  db.set_state.apply(null, _.values(db.current_state)); },
    initial_load: true,
    current : {},
    components: {},
};

function set(key, val) { 
  var keys = {

  };
  if (_.has(keys, key)) { keys[key](val); }
  else { }
}

var saveLocal = function(db_key, keys, then) { 
  var store = _.pick(db, keys);
  localforage.setItem(db_key, store, function() { 
    logger('API calls stored in localforage.');
    if (then) { then(); }
  });
};

var loadLocal = function(db_key, keys, then) {
  localforage.getItem(db_key, function(val) { 
    var store = _.pick(val, keys);
    _.each(store, function(v, k) { db.set(k, v); });
    if (then) { then(); }
  });
};

var api = {
  get: function(url, data, then) { 
    data = data || {};
    then = then || api.cb;
    $.ajax({
      type: "POST", 
      async: true,
      url: url,
      dataType: "json",
      data: api.prep(data),
      success: _.partial(then, url),
      error: function(j, t, e) { logger(j, t, e); },
    });
  },
  method : function(url) { return _.last(url.split('/')); },
  prep : function(d) { return _.reduce(d, function(m, v, k) { m[k] = _.isArray(v) ? v.join('~') : v; return m; }, {}); },
  cb: function(url, resp) { db.set(api.method(url), me.expand(resp)); logger('Data from ' + url + ' stored in db.'); },
  components: function(url, then) { 
    then = then || function(url, resp) { db.components[api.method(url)] = resp; logger('Data from '+ url + ' stored in db.components'); };
    $.ajax({
      type: "GET",
      async: false,
      url: url,
      success: _.partial(then, url),
      error: function(j, t, e) { logger(j, t, e); }
    });
  },
  loadMultiple: function(key, filters, methods, always, done) {
    localforage.getItem(key(filters), function(val) { 
      if (!_.isNull(val)) { 
        loadLocal(key(filters), methods, function() {
          logger('Saved data found, loading from localforage');
          if (always) { _.each(methods, function(m) { always(m); }); }
          if (done) { done(methods); }
        });
      }
      else {
        logger('No data in localforage, loading from server');
        var progress = _.reduce(methods, function(m, v) { m[v] = false; return m; }, {});
        _.each(methods, function(m) { 
          var url = 'api/' + m;
          api.get(
            url,  
            filters,
            function(url, resp) { 
              db.set(api.method(url), me.expand(resp));
              logger('Data from ' + url + ' stored in db.');
              progress[m] = true;
              if (always) { always(m); }
              if (_.every(progress)) { 
                logger('All data loaded');
                saveLocal(key(filters), methods);
                if (done) { done(methods); }
              }
            }
          );
        });
      }
    });
  }
};
    
var postProcess = function(method) { 
  logger('starting post processing for: '+ method);
  var methods = {};
  if (_.has(methods, method)) { methods[method](); }
};

route = function route(i, context) {
  var routes = {
    'go' : function(rest) { db.set_state(rest, context); },
    'show' : function(rest) { Templates.modals_collection(); $('#' + rest).modal('show'); },
    'pop' : function(rest) { $('#' + rest).modal('show'); },
    'alert' : function(rest) { alerts(rest); },
    'exitTo' : function(rest) { exitTo(rest); },
    'toggle' : function(rest) { toggle(rest, context); },
  };
  context = !me.existy(context) ? null : context();
  i = (_.isFunction(i)) ? i() : i;
  var command = extract('command', i);
  var rest = extract('rest', i);
  return routes[command](rest);
};

//This object contains methods for extracting data from strings
extract = function extract(info, str) {
  var methods = {
    'command' : function(str) { return str.slice(0, ((str.indexOf("_") !== -1) ? str.indexOf("_") : str.length)); },
    'rest' : function(str) { return str.slice(str.indexOf("_")+1); }
  };
  return methods[info](str);
};

me.add_helpers({
    'spaces' : function(word) { return me.text_swap(word, "_", " "); },
    'space' : function(n) { return me.repeat('&nbsp;', n); },
    'len' : function(a) { return a.length + 1; },
    'underscore': function(str) { return me.text_swap(me.text_swap(str, " ", "_"), "-", "_"); },
    'capitalize': function(s) { return _.map(s.split(" "), function(w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(" "); },
    'lowercase': function(s) { return _.map(s.split(" "), function(w) { return w.chartAt(0).toLowerCase() + w.slice(1); }).join(" "); },
    'components': function(c) { return _.has(db.components, c) ? db.components[c] : ""; },
    'app_title' : function(c) { return "Lineman Personal Template"; },
});

$(document).ready(function() {
    Templates.grab_all();
    Templates.render('main', '#app_content', {});
});

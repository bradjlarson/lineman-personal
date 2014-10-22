(function(window, undefined) { 
var R = ramda;
me = {
    addCommas : function (n){ return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }, 
    add_helper : function(k, f) { return Handlebars.registerHelper(k, f); },
    add_helpers : function(o) { return _.each(o, function(value, key, list) { me.add_helper(key, value);}); },
    add_event : function(e, v, f) { return $(e)[v](f); },
    add_click : function(e, f) { return $(e).click(f); },
    add_clicks : function(o) { return _.each(o, function(value, key, list) { me.add_click(key, value);}); },
    add_routes : function(e) {
        $(e).find("[class*=route]").each(function() {
            var classes = $(this).attr('class').split(' ');
            var routes = _.filter(classes, function(c) { return (c.indexOf('route') != -1); });
            var e = this;
            _.each(routes, function(r) {
                var opts = r.split('-');
                var args = _.map(opts.slice(2), function(o) { var el = e; var p = o; return function() { return $(el).prop(p) || p;};  });
                me.add_event(e, opts[1], function() { route.apply(undefined, args); }); 
            });
        });
    },
    mAdd_routes : function(els) { 
        $(els).each(function() { 
            var classes = $(this).attr('class').split(' ');
            var routes = _.filter(classes, function(c) { return (c.indexOf('route') != -1); });
            var e = this;
            _.each(routes, function(r) {
                var opts = r.split('-');
                var args = _.map(opts.slice(2), function(o) { var el = e; var p = o; return function() { return $(el).prop(p) || p;};  });
                me.add_event(e, opts[1], function() { route.apply(undefined, args); }); 
            });
        });
    },
    as: function(coll, mappings) {
       return _.map(coll, function(val) { 
           var obj = {};
           _.each(val, function(v, k) {   
                if (_.has(mappings, k)) { obj[mapping[k]] = v; }
                else { obj[k] = v; } });
           return obj; });
    },   
    bookend : function bookend(pre, fix, post) { return pre + fix + post; },
    butLast : function butLast(a) { return a.slice(0,-1); },
    cat : function() { 
        var head = _.first(arguments); 
        if (me.existy(head)) { return head.concat.apply(head, _.rest(arguments)); }
        else { return []; } 
    },
    check: function() {
        var obj = _.first(arguments);
        var keys = _.rest(arguments);
        return _.every(_.map(keys, function (key) { return _.has(obj, key); }));
    },  
    construct : function(head, tail) { return me.cat([head], _.toArray(tail)); },
    contains : function(x, y) { return (x.indexOf(y) != -1); },
    csv2coll : function(coll) { 
        var headers = _.first(coll); 
        var rows = _.rest(coll); 
        return _.map(rows, function(v) { return _.object(headers, v); }); 
    },
    defaults : function(d) { return function(o,k) { var val = fnull(_.identity, d[k]); return o && val(o[k]); }; },
    deparam : function QueryStringToHash (query) {
      var query_string = {};
      var vars = query.split("&");
      for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        pair[0] = decodeURIComponent(pair[0]);
        pair[1] = decodeURIComponent(pair[1]);
            // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
          query_string[pair[0]] = pair[1];
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
          var arr = [ query_string[pair[0]], pair[1] ];
          query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
          query_string[pair[0]].push(pair[1]);
        }
      } 
      return query_string;
    },
    display : function (coll, keys, n) { _.each(me.select.apply(null, me.construct(coll.slice(0,n), keys)), function(o) { console.log(_.reduce(o, function(m, v, k) { return m + k + ":" + v + "; "; }, "")); }); },
    dist : function(coll, key) { return _.reduce(_.pluck(coll, key), function(memo, num) { (num in memo) ? memo[num]+=1 : memo[num] = 1; return memo; }, {}); },
    distinct : function(coll, key) { return _.reduce(_.pluck(coll, key), function(memo, num) { if ($.inArray(num, memo) == -1) { memo.push(num);  } return memo; }, []); },
    escp : function escp(str) { if (_.isObject(str)) { return me.escp_obj(str); } else { return String(str).replace(/'/g, "&#39;&#39;"); }},
    escp_obj : function(obj) { console.log(obj); return _.reduce(obj, function(memo, val, key) { memo[key] = me.escp(val); return memo; }, {}); },
    expand : function(list) { 
        var headers = _.first(list), data = _.rest(list);
        return _.map(data, function(v) { return _.object(headers, v); });   
    },
    excluding : function() {
       var coll = _.first(arguments);  
       var keys = _.rest(arguments);
       return _.map(coll, function(val) {
           var obj = val;
           _.each(keys, function(k) { if (!me.check(obj, k)) { obj[k] = val[k]; } });
           return obj; });
    },
    existy : function existy(o) { return !(_.isNull(o) || _.isUndefined(o)); },
    exDate: function(d) { return d.toJSON().slice(0,d.toJSON().indexOf('T')); },
    exTime: function(d) { return d.toLocaleTimeString(); }, 
    fnull : function(fun /*, defaults */) { var defaults = _.rest(arguments); return function(/* args */) { var args = _.map(arguments, function(e, i) { return existy(e) ? e : defaults[i]; }); return fun.apply(null, args); }; },
    get_JSON : function(file, sync) {
      sync = typeof async !== 'undefined' ? true : false;
      return $.parseJSON($.ajax({
           type:'GET',
           url: file,
           async: false,
           cache : true,
           }).responseText);
    },
    getLocal: function(key, settings) { 
      if (me.check(settings, 'eid', 'app_name')) { 
        var appLocal = me.fromLocal(me.localKey(settings)) || {};
        //Need to check if localStorage has been enabled for this app:
        return (key) ? _.has(appLocal, key) ? appLocal[key] : null : appLocal; } 
//            return (key) ? me.fromLocal(me.localKey(settings))[key] : me.fromLocal(me.localKey(settings)) || {}; }
      else { console.log('Could not save, settings object missing or incomplete'); }
    },
    get_local : function(k) { return localStorage.getItem(k); },
    get_local_obj : function(k) { return JSON.parse(localStorage.getItem(k)); },
    get_session_obj : function(k) { return JSON.parse(sessionStorage.getItem(k)); },    
    get_session : function(k) { return sessionStorage.getItem(k); },
    keep : function(data, text) { return contains(data, text) ? data.slice(position(data, text)+1) : false; },
    ID : function(i) { return function() { return i; }; },
    interpose : function(inter, coll) { return me.butLast(me.mapcat(function(e) { return me.construct(e, [inter]); }, coll)); },
    label : function(label, coll) { var obj = {}; obj[label] = coll; return obj; },
    make_alert : function (type, text) {
    var this_alert = '<div class="alert alert-'+ type +' alert-dimsissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'+ text +'</div>';
    $('#alert_box').html(this_alert);
    },
    make_template : function(e) { var source = $(e).html(); return Handlebars.compile(source); },   
    mapcat : function(fun, coll) { return me.cat.apply(null, _.map(coll, fun)); }, 
    mapVal : function(coll, prop) { return _.map(coll, function(val) { return val[prop]; }); },
    match : function(col, cond) { return _.findWhere(col, cond); },
    merge : function() { return _.extend.apply({}, _.map(_.toArray(arguments), R.cloneDeep)); },
    overwrite : function() { return _.extend.apply({}, _.toArray(arguments)); },
    oMatch : function(obj, map) { return _.findWhere([obj], map) ? true : false; },
    position : function(data, text) { return data.indexOf(text); },
    put_local : function(k, v) { return localStorage.setItem(k, v); },
    put_local_obj : function(k, v) { return localStorage.setItem(k, JSON.stringify(v)); },
    put_session : function(k, v) { return sessionStorage.setItem(k, v); },
    put_session_obj : function(k, v) { return sessionStorage.setItem(k, JSON.stringify(v)); },
    rename : function(obj, mapping) { return _.reduce(obj, function(memo, v, k) { 
        if (_.has(mapping, k)) { memo[mapping[k]] = v; } 
        else { memo[k] = v; }
        return memo; }, {}); },
    render : function(e, t) { $(e).html(t); me.add_routes(e); },
    repeat : function repeat(s, n) { var a = []; while(a.length < n) { a.push(s); } return a.join(''); },
    repeatedly : function repeatedly(fun, n) { for (i=0; i <n; i++) { fun(); } }, 
    select: function() { 
       var coll = _.first(arguments);  
       var keys = _.rest(arguments);
       return _.map(coll, function(val) {
           var obj = {};
           _.each(keys, function(k) { if (me.check(val, k)) {obj[k] = val[k] } });
           return obj; });
    },
    setLocal: function(key, val, settings) {
      if (me.check(settings, 'eid', 'app_name')) {  
      var obj = me.getLocal(false, settings);
      obj[key] = val;
      localStorage.setItem(me.localKey(settings), JSON.stringify(obj));
      }
      else { console.log('Could not save, settings object missing or incomplete'); }
    },
    size_est : function( object ) {
       var objectList = [], stack = [ object ], bytes = 0;
       while ( stack.length ) {
           var value = stack.pop();
           if ( typeof value === 'boolean' ) { bytes += 4; }
           else if ( typeof value === 'string' ) { bytes += value.length * 2; }
           else if ( typeof value === 'number' ) { bytes += 8; }
           else if ( typeof value === 'object' && objectList.indexOf( value ) === -1 ) { 
                objectList.push( value );
                for( i in value ) { stack.push( value[ i ] ); }
           }
       }
       return bytes;
    },
    sortAsc: function sortAsc(coll, f) { return _.sortBy(coll, function(o) { return Number(o[f]); }); },
    sortDesc: function sortDesc(coll, f) { return _.sortBy(coll, function(o) { return -1 * Number(o[f]); }); },
    sortData : function (sorts, data) { return _.flatten(_.reduce(sorts, function(m, s) { return me.doSort(m,s); }, data)); },
    doSort : function (m, s) { return _.flatten(_.map(m, function(p) { return me.sortIt(p, s); }), true); },
    sortIt : function (p, s) { return _.values(_.groupBy(_.sortBy(p, s), s)); },
    splat : function(fun) { return function(array) { return fun.apply(null, array); }; },
    strip : function(data, text) { return me.contains(data, text) ? data.slice(0, position(data, text)) : data; },
    sum_array : function sum_array(a) { return _.reduce(a, function(memo, next) { return memo + next; }, 0); },
    sum_property : function(coll, key) { return _.reduce(_.pluck(coll, key), function(memo, next) { return memo + Number(next); },0); },
    text_swap : function(text, find, replace) { var replace_regex = new RegExp(find, 'g'); return text.replace(replace_regex, replace); },
    toColl : function(dict) { return _.values(dict); },
    toString: function toString(coll, join) { return _.reduce(coll, function(memo, next) { return memo + next + join; }, ""); },
    truthy : function(x) { return (x !== false) && me.existy(x); },
    validate : function(exp, fail) { return (_.isNull(exp) == _.isNaN(exp) == _.isUndefined(exp) == false) ? exp : fail; },
    setSession: function(key, val, settings) {
      var current = sessionStorage.getItem(db.app_name()) || {};
      var updated = current[key] = val;
      sessionStorage.setItem(db.app_name(), updated);
    },
    getSession: function(key) { return sessionStorage.getItem(db.app_name())[key] || null; },
    sendSam: function(data, settings, visitor) {
      if (me.check(settings, 'sam_prefix', 'dp_id')) {
        var doc_name =  settings['sam_prefix'] + "_" + $.now() + "_" + visitor['eid'];
        kl.create_txt(data, doc_name, settings['dp_id'], 'index.html', 'data_packets'); }
      else { console.log('Could not send data, sam_prefix or dp_id missing'); }
    },
    fromLocal: function(key) { return $.parseJSON(localStorage.getItem(key)); },
    localKey: function(settings) { return settings.eid + "_" + settings.app_name; },
};
window.me = me;
})(window);


'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _event = require('./event.js');

var _event2 = _interopRequireDefault(_event);

var _util = require('./util.js');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Props = {
    check: function check(t, val) {
        switch (t) {
            case String:
                return typeof val === 'string';
            case Number:
                return typeof val === 'number';
            case Boolean:
                return typeof val === 'boolean';
            case Function:
                return typeof val === 'function';
            case Object:
                return (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object';
            case Array:
                return toString.call(val) === '[object Array]';
            default:
                return val instanceof t;
        }
    },
    build: function build(props) {
        var rst = {};
        if (typeof props === 'string') {
            rst[props] = {};
        } else if (toString.call(props) === '[object Array]') {
            props.forEach(function (p) {
                rst[p] = {};
            });
        } else {
            Object.keys(props).forEach(function (p) {
                if (typeof props[p] === 'function') {
                    rst[p] = {
                        type: [props[p]]
                    };
                } else if (toString.call(props[p]) === '[object Array]') {
                    rst[p] = {
                        type: props[p]
                    };
                } else rst[p] = props[p];

                if (rst[p].type && toString.call(rst[p].type) !== '[object Array]') rst[p].type = [rst[p].type];
            });
        }
        return rst;
    },
    valid: function valid(props, key, val) {
        var _this = this;

        var valid = false;
        if (props[key]) {
            if (!props[key].type) {
                valid = true;
            } else {
                return props[key].type.some(function (t) {
                    return _this.check(t, val);
                });
            }
        }
        return valid;
    },
    getValue: function getValue(props, key, value) {
        var rst;
        if (value !== undefined && this.valid(props, key, value)) {
            rst = value;
        } else if (typeof props[key].default === 'function') {
            rst = props[key].default();
        } else rst = props[key].default;
        return props[key].coerce ? props[key].coerce(rst) : rst;
    }
};

var _class = function () {
    function _class() {
        _classCallCheck(this, _class);

        this.$com = {};
        this.$mixins = [];
        this.$isComponent = true;
        this.$prefix = '';
        this.$mappingProps = {};
    }

    _createClass(_class, [{
        key: 'init',
        value: function init($wxpage, $root, $parent) {
            var _this2 = this;

            var self = this;

            this.$wxpage = $wxpage;
            if (this.$isComponent) {
                this.$root = $root || this.$root;
                this.$parent = $parent || this.$parent;
                this.$wxapp = this.$root.$parent.$wxapp;
            }

            if (this.props) {
                this.props = Props.build(this.props);
            }

            var k = void 0,
                defaultData = {};

            var props = this.props;
            var key = void 0,
                val = void 0,
                binded = void 0;

            if (this.$props) {
                for (key in this.$props) {
                    for (binded in this.$props[key]) {
                        if (/\.sync$/.test(binded)) {
                            if (!this.$mappingProps[this.$props[key][binded]]) this.$mappingProps[this.$props[key][binded]] = {};
                            this.$mappingProps[this.$props[key][binded]][key] = binded.substring(7, binded.length - 5);
                        }
                    }
                }
            }

            if (props) {
                for (key in props) {
                    val = undefined;
                    if ($parent && $parent.$props && $parent.$props[this.$name]) {
                        val = $parent.$props[this.$name][key];
                        binded = $parent.$props[this.$name]['v-bind:' + key + '.once'] || $parent.$props[this.$name]['v-bind:' + key + '.sync'];
                        if (binded) {
                            val = $parent[binded];
                            if (props[key].twoWay) {
                                if (!this.$mappingProps[key]) this.$mappingProps[key] = {};
                                this.$mappingProps[key]['parent'] = binded;
                            }
                        }
                    }
                    if (!this.data[key]) {
                        val = Props.getValue(props, key, val);
                        this.data[key] = val;
                    }
                }
            }

            for (k in this.data) {
                defaultData['' + this.$prefix + k] = this.data[k];

                this[k] = _util2.default.$copy(this.data[k], true);
            }
            this.setData(defaultData);

            var coms = Object.getOwnPropertyNames(this.$com);
            if (coms.length) {
                coms.forEach(function (name) {
                    _this2.$com[name].init(_this2.getWxPage(), $root, _this2);
                    _this2.$com[name].onLoad && _this2.$com[name].onLoad();
                    _this2.$com[name].$apply();
                });
            }
        }
    }, {
        key: 'initMixins',
        value: function initMixins() {
            var _this3 = this;

            if (this.mixins) {
                if (typeof this.mixins === 'function') {
                    this.mixins = [this.mixins];
                }
            } else {
                this.mixins = [];
            }
            this.mixins.forEach(function (mix) {
                var inst = new mix();
                inst.init(_this3);
                _this3.$mixins.push(inst);
            });
        }
    }, {
        key: 'onLoad',
        value: function onLoad() {}
    }, {
        key: 'setData',
        value: function setData(k, v) {
            if (typeof k === 'string') {
                if (v) {
                    var tmp = {};
                    tmp[k] = v;
                    k = tmp;
                } else {
                    var _tmp = {};
                    _tmp[k] = this.data['' + k];
                    k = _tmp;
                }
                return this.$wxpage.setData(k);
            }
            var t = null,
                reg = new RegExp('^' + this.$prefix.replace(/\$/g, '\\$'), 'ig');
            for (t in k) {
                var noPrefix = t.replace(reg, '');
                this.data[noPrefix] = _util2.default.$copy(k[t], true);
            }
            return this.$wxpage.setData(k);
        }
    }, {
        key: 'getWxPage',
        value: function getWxPage() {
            return this.$wxpage;
        }
    }, {
        key: 'getCurrentPages',
        value: function getCurrentPages() {
            return this.$wxpage.getCurrentPages();
        }
    }, {
        key: '$getComponent',
        value: function $getComponent(com) {
            var _this4 = this;

            if (typeof com === 'string') {
                if (com.indexOf('/') === -1) {
                    return this.$com[com];
                } else if (com === '/') {
                    return this.$parent;
                } else {
                    var path = com.split('/');
                    path.forEach(function (s, i) {
                        if (i === 0) {
                            if (s === '') {
                                com = _this4.$root;
                            } else if (s === '.') {
                                com = _this4;
                            } else if (s === '..') {
                                com = _this4.$parent;
                            } else {
                                com = _this4.$getComponent(s);
                            }
                        } else if (s) {
                            com = com.$com[s];
                        }
                    });
                }
            }
            return (typeof com === 'undefined' ? 'undefined' : _typeof(com)) !== 'object' ? null : com;
        }
    }, {
        key: '$invoke',
        value: function $invoke(com, method) {
            com = this.$getComponent(com);

            if (!com) {
                throw new Error('Invalid path: ' + com);
            }

            var fn = this.$wxpage[com.$prefix + method];

            for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                args[_key - 2] = arguments[_key];
            }

            if (typeof fn === 'function') {
                var evt = new _event2.default('', this, 'invoke');
                return fn.apply(com, [evt].concat(args));
            } else {
                fn = com[method];
            }

            if (typeof fn === 'function') {
                return fn.apply(com, args);
            } else {
                throw new Error('Invalid method: ' + method);
            }
        }
    }, {
        key: '$broadcast',
        value: function $broadcast(evtName) {
            var com = this;
            var $evt = typeof evtName === 'string' ? new _event2.default(evtName, this, 'broadcast') : $evt;
            var queue = [com];

            for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
            }

            while (queue.length && $evt.active) {
                var current = queue.shift();
                for (var c in current.$com) {
                    c = current.$com[c];
                    queue.push(c);
                    var fn = c.events ? c.events[evtName] : undefined;
                    if (typeof fn === 'function') {
                        fn.apply(c, [$evt].concat(args));
                    }
                    if (!$evt.active) break;
                }
            }
        }
    }, {
        key: '$emit',
        value: function $emit(evtName) {
            var com = this;
            var source = this;
            var $evt = new _event2.default(evtName, source, 'emit');

            for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
                args[_key3 - 1] = arguments[_key3];
            }

            while (com && com.$isComponent !== undefined && $evt.active) {
                var fn = com.events ? com.events[evtName] : undefined;
                if (typeof fn === 'function') {
                    fn.apply(com, [$evt].concat(args));
                }
                com = com.$parent;
            }
        }
    }, {
        key: '$apply',
        value: function $apply(fn) {
            if (typeof fn === 'function') {
                fn.call(this);
                this.$apply();
            } else {
                if (this.$$phase) {
                    this.$$phase = '$apply';
                } else {
                    this.$digest();
                }
            }
        }
    }, {
        key: '$digest',
        value: function $digest() {
            var _this5 = this;

            var k = void 0;
            var originData = this.data;
            this.$$phase = '$digest';
            while (this.$$phase) {
                var readyToSet = {};
                for (k in originData) {
                    if (!_util2.default.$isEqual(this[k], originData[k])) {
                        readyToSet[this.$prefix + k] = this[k];
                        originData[k] = _util2.default.$copy(this[k], true);
                        if (this.$mappingProps[k]) {
                            Object.keys(this.$mappingProps[k]).forEach(function (changed) {
                                var mapping = _this5.$mappingProps[k][changed];
                                if (changed === 'parent' && !_util2.default.$isEqual(_this5.$parent[mapping], _this5[k])) {
                                    _this5.$parent[mapping] = _this5[k];
                                    _this5.$parent.$apply();
                                } else if (changed !== 'parent' && !_util2.default.$isEqual(_this5.$com[changed][mapping], _this5[k])) {
                                    _this5.$com[changed][mapping] = _this5[k];
                                    _this5.$com[changed].$apply();
                                }
                            });
                        }
                    }
                }
                if (Object.keys(readyToSet).length) this.setData(readyToSet);
                this.$$phase = false;
            }
        }
    }]);

    return _class;
}();

exports.default = _class;
//# sourceMappingURL=component.js.map
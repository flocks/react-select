require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Select = require('./Select');

var _Select2 = _interopRequireDefault(_Select);

var _utilsStripDiacritics = require('./utils/stripDiacritics');

var _utilsStripDiacritics2 = _interopRequireDefault(_utilsStripDiacritics);

var requestId = 0;

function initCache(cache) {
	if (cache && typeof cache !== 'object') {
		cache = {};
	}
	return cache ? cache : null;
}

function updateCache(cache, input, data) {
	if (!cache) return;
	cache[input] = data;
}

function getFromCache(cache, input) {
	if (!cache) return;
	for (var i = input.length; i >= 0; --i) {
		var cacheKey = input.slice(0, i);
		if (cache[cacheKey] && (input === cacheKey || cache[cacheKey].complete)) {
			return cache[cacheKey];
		}
	}
}

function thenPromise(promise, callback) {
	if (!promise || typeof promise.then !== 'function') return;
	return promise.then(function (data) {
		callback(null, data);
	}, function (err) {
		callback(err);
	});
}

var stringOrNode = _react2['default'].PropTypes.oneOfType([_react2['default'].PropTypes.string, _react2['default'].PropTypes.node]);

var Async = _react2['default'].createClass({
	displayName: 'Async',

	propTypes: {
		cache: _react2['default'].PropTypes.any, // object to use to cache results, can be null to disable cache
		ignoreAccents: _react2['default'].PropTypes.bool, // whether to strip diacritics when filtering (shared with Select)
		ignoreCase: _react2['default'].PropTypes.bool, // whether to perform case-insensitive filtering (shared with Select)
		isLoading: _react2['default'].PropTypes.bool, // overrides the isLoading state when set to true
		loadOptions: _react2['default'].PropTypes.func.isRequired, // function to call to load options asynchronously
		loadingPlaceholder: _react2['default'].PropTypes.string, // replaces the placeholder while options are loading
		minimumInput: _react2['default'].PropTypes.number, // the minimum number of characters that trigger loadOptions
		noResultsText: stringOrNode, // placeholder displayed when there are no matching search results (shared with Select)
		onInputChange: _react2['default'].PropTypes.func, // onInputChange handler: function (inputValue) {}
		placeholder: stringOrNode, // field placeholder, displayed when there's no value (shared with Select)
		searchPromptText: stringOrNode, // label to prompt for search input
		searchingText: _react2['default'].PropTypes.string },
	// message to display while options are loading
	getDefaultProps: function getDefaultProps() {
		return {
			cache: true,
			ignoreAccents: true,
			ignoreCase: true,
			loadingPlaceholder: 'Loading...',
			minimumInput: 0,
			searchingText: 'Searching...',
			searchPromptText: 'Type to search'
		};
	},
	getInitialState: function getInitialState() {
		return {
			cache: initCache(this.props.cache),
			isLoading: false,
			options: []
		};
	},
	componentWillMount: function componentWillMount() {
		this._lastInput = '';
	},
	componentDidMount: function componentDidMount() {
		this.loadOptions('');
	},
	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
		if (nextProps.cache !== this.props.cache) {
			this.setState({
				cache: initCache(nextProps.cache)
			});
		}
	},
	focus: function focus() {
		this.refs.select.focus();
	},
	resetState: function resetState() {
		this._currentRequestId = -1;
		this.setState({
			isLoading: false,
			options: []
		});
	},
	getResponseHandler: function getResponseHandler(input) {
		var _this = this;

		var _requestId = this._currentRequestId = requestId++;
		return function (err, data) {
			if (err) throw err;
			if (!_this.isMounted()) return;
			updateCache(_this.state.cache, input, data);
			if (_requestId !== _this._currentRequestId) return;
			_this.setState({
				isLoading: false,
				options: data && data.options || []
			});
		};
	},
	loadOptions: function loadOptions(input) {
		if (this.props.onInputChange) {
			var nextState = this.props.onInputChange(input);
			// Note: != used deliberately here to catch undefined and null
			if (nextState != null) {
				input = '' + nextState;
			}
		}
		if (this.props.ignoreAccents) input = (0, _utilsStripDiacritics2['default'])(input);
		if (this.props.ignoreCase) input = input.toLowerCase();

		this._lastInput = input;
		if (input.length < this.props.minimumInput) {
			return this.resetState();
		}
		var cacheResult = getFromCache(this.state.cache, input);
		if (cacheResult) {
			return this.setState({
				options: cacheResult.options
			});
		}
		this.setState({
			isLoading: true
		});
		var responseHandler = this.getResponseHandler(input);
		var inputPromise = thenPromise(this.props.loadOptions(input, responseHandler), responseHandler);
		return inputPromise ? inputPromise.then(function () {
			return input;
		}) : input;
	},
	render: function render() {
		var noResultsText = this.props.noResultsText;
		var _state = this.state;
		var isLoading = _state.isLoading;
		var options = _state.options;

		if (this.props.isLoading) isLoading = true;
		var placeholder = isLoading ? this.props.loadingPlaceholder : this.props.placeholder;
		if (isLoading) {
			noResultsText = this.props.searchingText;
		} else if (!options.length && this._lastInput.length < this.props.minimumInput) {
			noResultsText = this.props.searchPromptText;
		}
		return _react2['default'].createElement(_Select2['default'], _extends({}, this.props, {
			ref: 'select',
			isLoading: isLoading,
			noResultsText: noResultsText,
			onInputChange: this.loadOptions,
			options: options,
			placeholder: placeholder
		}));
	}
});

module.exports = Async;

},{"./Select":"react-select","./utils/stripDiacritics":4,"react":undefined}],2:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var Option = _react2['default'].createClass({
	displayName: 'Option',

	propTypes: {
		children: _react2['default'].PropTypes.node,
		className: _react2['default'].PropTypes.string, // className (based on mouse position)
		instancePrefix: _react2['default'].PropTypes.string.isRequired, // unique prefix for the ids (used for aria)
		isDisabled: _react2['default'].PropTypes.bool, // the option is disabled
		isFocused: _react2['default'].PropTypes.bool, // the option is focused
		isSelected: _react2['default'].PropTypes.bool, // the option is selected
		onFocus: _react2['default'].PropTypes.func, // method to handle mouseEnter on option element
		onSelect: _react2['default'].PropTypes.func, // method to handle click on option element
		onUnfocus: _react2['default'].PropTypes.func, // method to handle mouseLeave on option element
		option: _react2['default'].PropTypes.object.isRequired, // object that is base for that option
		optionIndex: _react2['default'].PropTypes.number },
	// index of the option, used to generate unique ids for aria
	blockEvent: function blockEvent(event) {
		event.preventDefault();
		event.stopPropagation();
		if (event.target.tagName !== 'A' || !('href' in event.target)) {
			return;
		}
		if (event.target.target) {
			window.open(event.target.href, event.target.target);
		} else {
			window.location.href = event.target.href;
		}
	},

	handleMouseDown: function handleMouseDown(event) {
		event.preventDefault();
		event.stopPropagation();
		this.props.onSelect(this.props.option, event);
	},

	handleMouseEnter: function handleMouseEnter(event) {
		this.onFocus(event);
	},

	handleMouseMove: function handleMouseMove(event) {
		this.onFocus(event);
	},

	handleTouchEnd: function handleTouchEnd(event) {
		// Check if the view is being dragged, In this case
		// we don't want to fire the click event (because the user only wants to scroll)
		if (this.dragging) return;

		this.handleMouseDown(event);
	},

	handleTouchMove: function handleTouchMove(event) {
		// Set a flag that the view is being dragged
		this.dragging = true;
	},

	handleTouchStart: function handleTouchStart(event) {
		// Set a flag that the view is not being dragged
		this.dragging = false;
	},

	onFocus: function onFocus(event) {
		if (!this.props.isFocused) {
			this.props.onFocus(this.props.option, event);
		}
	},
	render: function render() {
		var _props = this.props;
		var option = _props.option;
		var instancePrefix = _props.instancePrefix;
		var optionIndex = _props.optionIndex;

		var className = (0, _classnames2['default'])(this.props.className, option.className);

		return option.disabled ? _react2['default'].createElement(
			'div',
			{ className: className,
				onMouseDown: this.blockEvent,
				onClick: this.blockEvent },
			this.props.children
		) : _react2['default'].createElement(
			'div',
			{ className: className,
				style: option.style,
				role: 'option',
				onMouseDown: this.handleMouseDown,
				onMouseEnter: this.handleMouseEnter,
				onMouseMove: this.handleMouseMove,
				onTouchStart: this.handleTouchStart,
				onTouchMove: this.handleTouchMove,
				onTouchEnd: this.handleTouchEnd,
				id: instancePrefix + '-option-' + optionIndex,
				title: option.title },
			this.props.children
		);
	}
});

module.exports = Option;

},{"classnames":undefined,"react":undefined}],3:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var Value = _react2['default'].createClass({

	displayName: 'Value',

	propTypes: {
		children: _react2['default'].PropTypes.node,
		disabled: _react2['default'].PropTypes.bool, // disabled prop passed to ReactSelect
		id: _react2['default'].PropTypes.string, // Unique id for the value - used for aria
		onClick: _react2['default'].PropTypes.func, // method to handle click on value label
		onRemove: _react2['default'].PropTypes.func, // method to handle removal of the value
		value: _react2['default'].PropTypes.object.isRequired },

	// the option object for this value
	handleMouseDown: function handleMouseDown(event) {
		if (event.type === 'mousedown' && event.button !== 0) {
			return;
		}
		if (this.props.onClick) {
			event.stopPropagation();
			this.props.onClick(this.props.value, event);
			return;
		}
		if (this.props.value.href) {
			event.stopPropagation();
		}
	},

	onRemove: function onRemove(event) {
		event.preventDefault();
		event.stopPropagation();
		this.props.onRemove(this.props.value);
	},

	handleTouchEndRemove: function handleTouchEndRemove(event) {
		// Check if the view is being dragged, In this case
		// we don't want to fire the click event (because the user only wants to scroll)
		if (this.dragging) return;

		// Fire the mouse events
		this.onRemove(event);
	},

	handleTouchMove: function handleTouchMove(event) {
		// Set a flag that the view is being dragged
		this.dragging = true;
	},

	handleTouchStart: function handleTouchStart(event) {
		// Set a flag that the view is not being dragged
		this.dragging = false;
	},

	renderRemoveIcon: function renderRemoveIcon() {
		if (this.props.disabled || !this.props.onRemove) return;
		return _react2['default'].createElement(
			'span',
			{ className: 'Select-value-icon',
				'aria-hidden': 'true',
				onMouseDown: this.onRemove,
				onTouchEnd: this.handleTouchEndRemove,
				onTouchStart: this.handleTouchStart,
				onTouchMove: this.handleTouchMove },
			'×'
		);
	},

	renderLabel: function renderLabel() {
		var className = 'Select-value-label';
		return this.props.onClick || this.props.value.href ? _react2['default'].createElement(
			'a',
			{ className: className, href: this.props.value.href, target: this.props.value.target, onMouseDown: this.handleMouseDown, onTouchEnd: this.handleMouseDown },
			this.props.children
		) : _react2['default'].createElement(
			'span',
			{ className: className, role: 'option', 'aria-selected': 'true', id: this.props.id },
			this.props.children
		);
	},

	render: function render() {
		return _react2['default'].createElement(
			'div',
			{ className: (0, _classnames2['default'])('Select-value', this.props.value.className),
				style: this.props.value.style,
				title: this.props.value.title
			},
			this.renderRemoveIcon(),
			this.renderLabel()
		);
	}

});

module.exports = Value;

},{"classnames":undefined,"react":undefined}],4:[function(require,module,exports){
'use strict';

var map = [{ 'base': 'A', 'letters': /[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g }, { 'base': 'AA', 'letters': /[\uA732]/g }, { 'base': 'AE', 'letters': /[\u00C6\u01FC\u01E2]/g }, { 'base': 'AO', 'letters': /[\uA734]/g }, { 'base': 'AU', 'letters': /[\uA736]/g }, { 'base': 'AV', 'letters': /[\uA738\uA73A]/g }, { 'base': 'AY', 'letters': /[\uA73C]/g }, { 'base': 'B', 'letters': /[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g }, { 'base': 'C', 'letters': /[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g }, { 'base': 'D', 'letters': /[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g }, { 'base': 'DZ', 'letters': /[\u01F1\u01C4]/g }, { 'base': 'Dz', 'letters': /[\u01F2\u01C5]/g }, { 'base': 'E', 'letters': /[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g }, { 'base': 'F', 'letters': /[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g }, { 'base': 'G', 'letters': /[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g }, { 'base': 'H', 'letters': /[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g }, { 'base': 'I', 'letters': /[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g }, { 'base': 'J', 'letters': /[\u004A\u24BF\uFF2A\u0134\u0248]/g }, { 'base': 'K', 'letters': /[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g }, { 'base': 'L', 'letters': /[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g }, { 'base': 'LJ', 'letters': /[\u01C7]/g }, { 'base': 'Lj', 'letters': /[\u01C8]/g }, { 'base': 'M', 'letters': /[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g }, { 'base': 'N', 'letters': /[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g }, { 'base': 'NJ', 'letters': /[\u01CA]/g }, { 'base': 'Nj', 'letters': /[\u01CB]/g }, { 'base': 'O', 'letters': /[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g }, { 'base': 'OI', 'letters': /[\u01A2]/g }, { 'base': 'OO', 'letters': /[\uA74E]/g }, { 'base': 'OU', 'letters': /[\u0222]/g }, { 'base': 'P', 'letters': /[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g }, { 'base': 'Q', 'letters': /[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g }, { 'base': 'R', 'letters': /[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g }, { 'base': 'S', 'letters': /[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g }, { 'base': 'T', 'letters': /[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g }, { 'base': 'TZ', 'letters': /[\uA728]/g }, { 'base': 'U', 'letters': /[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g }, { 'base': 'V', 'letters': /[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g }, { 'base': 'VY', 'letters': /[\uA760]/g }, { 'base': 'W', 'letters': /[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g }, { 'base': 'X', 'letters': /[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g }, { 'base': 'Y', 'letters': /[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g }, { 'base': 'Z', 'letters': /[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g }, { 'base': 'a', 'letters': /[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g }, { 'base': 'aa', 'letters': /[\uA733]/g }, { 'base': 'ae', 'letters': /[\u00E6\u01FD\u01E3]/g }, { 'base': 'ao', 'letters': /[\uA735]/g }, { 'base': 'au', 'letters': /[\uA737]/g }, { 'base': 'av', 'letters': /[\uA739\uA73B]/g }, { 'base': 'ay', 'letters': /[\uA73D]/g }, { 'base': 'b', 'letters': /[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g }, { 'base': 'c', 'letters': /[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g }, { 'base': 'd', 'letters': /[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g }, { 'base': 'dz', 'letters': /[\u01F3\u01C6]/g }, { 'base': 'e', 'letters': /[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g }, { 'base': 'f', 'letters': /[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g }, { 'base': 'g', 'letters': /[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g }, { 'base': 'h', 'letters': /[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g }, { 'base': 'hv', 'letters': /[\u0195]/g }, { 'base': 'i', 'letters': /[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g }, { 'base': 'j', 'letters': /[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g }, { 'base': 'k', 'letters': /[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g }, { 'base': 'l', 'letters': /[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g }, { 'base': 'lj', 'letters': /[\u01C9]/g }, { 'base': 'm', 'letters': /[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g }, { 'base': 'n', 'letters': /[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g }, { 'base': 'nj', 'letters': /[\u01CC]/g }, { 'base': 'o', 'letters': /[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g }, { 'base': 'oi', 'letters': /[\u01A3]/g }, { 'base': 'ou', 'letters': /[\u0223]/g }, { 'base': 'oo', 'letters': /[\uA74F]/g }, { 'base': 'p', 'letters': /[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g }, { 'base': 'q', 'letters': /[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g }, { 'base': 'r', 'letters': /[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g }, { 'base': 's', 'letters': /[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g }, { 'base': 't', 'letters': /[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g }, { 'base': 'tz', 'letters': /[\uA729]/g }, { 'base': 'u', 'letters': /[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g }, { 'base': 'v', 'letters': /[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g }, { 'base': 'vy', 'letters': /[\uA761]/g }, { 'base': 'w', 'letters': /[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g }, { 'base': 'x', 'letters': /[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g }, { 'base': 'y', 'letters': /[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g }, { 'base': 'z', 'letters': /[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g }];

module.exports = function stripDiacritics(str) {
	for (var i = 0; i < map.length; i++) {
		str = str.replace(map[i].letters, map[i].base);
	}
	return str;
};

},{}],"react-select":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactInputAutosize = require('react-input-autosize');

var _reactInputAutosize2 = _interopRequireDefault(_reactInputAutosize);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _utilsStripDiacritics = require('./utils/stripDiacritics');

var _utilsStripDiacritics2 = _interopRequireDefault(_utilsStripDiacritics);

var _Async = require('./Async');

var _Async2 = _interopRequireDefault(_Async);

var _Option = require('./Option');

var _Option2 = _interopRequireDefault(_Option);

var _Value = require('./Value');

var _Value2 = _interopRequireDefault(_Value);

function stringifyValue(value) {
	if (typeof value === 'object') {
		return JSON.stringify(value);
	} else {
		return value;
	}
}

var stringOrNode = _react2['default'].PropTypes.oneOfType([_react2['default'].PropTypes.string, _react2['default'].PropTypes.node]);

var instanceId = 1;

var Select = _react2['default'].createClass({

	displayName: 'Select',

	propTypes: {
		addLabelText: _react2['default'].PropTypes.string, // placeholder displayed when you want to add a label on a multi-value input
		allowCreate: _react2['default'].PropTypes.bool, // whether to allow creation of new entries
		'aria-label': _react2['default'].PropTypes.string, // Aria label (for assistive tech)
		'aria-labelledby': _react2['default'].PropTypes.string, // HTML ID of an element that should be used as the label (for assistive tech)
		autoBlur: _react2['default'].PropTypes.bool, // automatically blur the component when an option is selected
		autofocus: _react2['default'].PropTypes.bool, // autofocus the component on mount
		autosize: _react2['default'].PropTypes.bool, // whether to enable autosizing or not
		backspaceRemoves: _react2['default'].PropTypes.bool, // whether backspace removes an item if there is no text input
		backspaceToRemoveMessage: _react2['default'].PropTypes.string, // Message to use for screenreaders to press backspace to remove the current item -
		// {label} is replaced with the item label
		className: _react2['default'].PropTypes.string, // className for the outer element
		clearAllText: stringOrNode, // title for the "clear" control when multi: true
		clearValueText: stringOrNode, // title for the "clear" control
		clearable: _react2['default'].PropTypes.bool, // should it be possible to reset value
		delimiter: _react2['default'].PropTypes.string, // delimiter to use to join multiple values for the hidden field value
		disabled: _react2['default'].PropTypes.bool, // whether the Select is disabled or not
		escapeClearsValue: _react2['default'].PropTypes.bool, // whether escape clears the value when the menu is closed
		filterOption: _react2['default'].PropTypes.func, // method to filter a single option (option, filterString)
		filterOptions: _react2['default'].PropTypes.any, // boolean to enable default filtering or function to filter the options array ([options], filterString, [values])
		ignoreAccents: _react2['default'].PropTypes.bool, // whether to strip diacritics when filtering
		ignoreCase: _react2['default'].PropTypes.bool, // whether to perform case-insensitive filtering
		inputProps: _react2['default'].PropTypes.object, // custom attributes for the Input
		inputRenderer: _react2['default'].PropTypes.func, // returns a custom input component
		isLoading: _react2['default'].PropTypes.bool, // whether the Select is loading externally or not (such as options being loaded)
		joinValues: _react2['default'].PropTypes.bool, // joins multiple values into a single form field with the delimiter (legacy mode)
		labelKey: _react2['default'].PropTypes.string, // path of the label value in option objects
		limited: _react2['default'].PropTypes.number, // limit the number of items in the tab
		matchPos: _react2['default'].PropTypes.string, // (any|start) match the start or entire string when filtering
		matchProp: _react2['default'].PropTypes.string, // (any|label|value) which option property to filter on
		menuBuffer: _react2['default'].PropTypes.number, // optional buffer (in px) between the bottom of the viewport and the bottom of the menu
		menuContainerStyle: _react2['default'].PropTypes.object, // optional style to apply to the menu container
		menuRenderer: _react2['default'].PropTypes.func, // renders a custom menu with options
		menuStyle: _react2['default'].PropTypes.object, // optional style to apply to the menu
		multi: _react2['default'].PropTypes.bool, // multi-value input
		name: _react2['default'].PropTypes.string, // generates a hidden <input /> tag with this field name for html forms
		newOptionCreator: _react2['default'].PropTypes.func, // factory to create new options when allowCreate set
		noResultsText: stringOrNode, // placeholder displayed when there are no matching search results
		onBlur: _react2['default'].PropTypes.func, // onBlur handler: function (event) {}
		onBlurResetsInput: _react2['default'].PropTypes.bool, // whether input is cleared on blur
		onChange: _react2['default'].PropTypes.func, // onChange handler: function (newValue) {}
		onClose: _react2['default'].PropTypes.func, // fires when the menu is closed
		onFocus: _react2['default'].PropTypes.func, // onFocus handler: function (event) {}
		onInputChange: _react2['default'].PropTypes.func, // onInputChange handler: function (inputValue) {}
		onMenuScrollToBottom: _react2['default'].PropTypes.func, // fires when the menu is scrolled to the bottom; can be used to paginate options
		onOpen: _react2['default'].PropTypes.func, // fires when the menu is opened
		onValueClick: _react2['default'].PropTypes.func, // onClick handler for value labels: function (value, event) {}
		openAfterFocus: _react2['default'].PropTypes.bool, // boolean to enable opening dropdown when focused
		openOnFocus: _react2['default'].PropTypes.bool, // always open options menu on focus
		optionClassName: _react2['default'].PropTypes.string, // additional class(es) to apply to the <Option /> elements
		optionComponent: _react2['default'].PropTypes.func, // option component to render in dropdown
		optionRenderer: _react2['default'].PropTypes.func, // optionRenderer: function (option) {}
		options: _react2['default'].PropTypes.array, // array of options
		pageSize: _react2['default'].PropTypes.number, // number of entries to page when using page up/down keys
		placeholder: stringOrNode, // field placeholder, displayed when there's no value
		required: _react2['default'].PropTypes.bool, // applies HTML5 required attribute when needed
		resetValue: _react2['default'].PropTypes.any, // value to use when you clear the control
		scrollMenuIntoView: _react2['default'].PropTypes.bool, // boolean to enable the viewport to shift so that the full menu fully visible when engaged
		searchable: _react2['default'].PropTypes.bool, // whether to enable searching feature or not
		simpleValue: _react2['default'].PropTypes.bool, // pass the value to onChange as a simple value (legacy pre 1.0 mode), defaults to false
		style: _react2['default'].PropTypes.object, // optional style to apply to the control
		tabIndex: _react2['default'].PropTypes.string, // optional tab index of the control
		tabSelectsValue: _react2['default'].PropTypes.bool, // whether to treat tabbing out while focused to be value selection
		value: _react2['default'].PropTypes.any, // initial field value
		valueComponent: _react2['default'].PropTypes.func, // value component to render
		valueKey: _react2['default'].PropTypes.string, // path of the label value in option objects
		valueRenderer: _react2['default'].PropTypes.func, // valueRenderer: function (option) {}
		wrapperStyle: _react2['default'].PropTypes.object },

	// optional style to apply to the component wrapper
	statics: { Async: _Async2['default'] },

	getDefaultProps: function getDefaultProps() {
		return {
			addLabelText: 'Add "{label}"?',
			autosize: true,
			allowCreate: false,
			backspaceRemoves: true,
			backspaceToRemoveMessage: 'Press backspace to remove {label}',
			clearable: true,
			clearAllText: 'Clear all',
			clearValueText: 'Clear value',
			delimiter: ',',
			disabled: false,
			escapeClearsValue: true,
			filterOptions: true,
			ignoreAccents: true,
			ignoreCase: true,
			inputProps: {},
			isLoading: false,
			joinValues: false,
			labelKey: 'label',
			matchPos: 'any',
			matchProp: 'any',
			menuBuffer: 0,
			multi: false,
			noResultsText: 'No results found',
			onBlurResetsInput: true,
			openAfterFocus: false,
			optionComponent: _Option2['default'],
			pageSize: 5,
			placeholder: 'Select...',
			required: false,
			resetValue: null,
			scrollMenuIntoView: true,
			searchable: true,
			simpleValue: false,
			tabSelectsValue: true,
			valueComponent: _Value2['default'],
			valueKey: 'value'
		};
	},

	getInitialState: function getInitialState() {
		return {
			inputValue: '',
			isFocused: false,
			isLoading: false,
			isOpen: false,
			isPseudoFocused: false,
			required: false
		};
	},

	componentWillMount: function componentWillMount() {
		this._instancePrefix = 'react-select-' + ++instanceId + '-';
		var valueArray = this.getValueArray(this.props.value);

		if (this.props.required) {
			this.setState({
				required: this.handleRequired(valueArray[0], this.props.multi)
			});
		}
	},

	componentDidMount: function componentDidMount() {
		if (this.props.autofocus) {
			this.focus();
		}
	},

	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
		var valueArray = this.getValueArray(nextProps.value);

		if (nextProps.required) {
			this.setState({
				required: this.handleRequired(valueArray[0], nextProps.multi)
			});
		}
	},

	componentWillUpdate: function componentWillUpdate(nextProps, nextState) {
		if (nextState.isOpen !== this.state.isOpen) {
			var handler = nextState.isOpen ? nextProps.onOpen : nextProps.onClose;
			handler && handler();
		}
	},

	componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
		// focus to the selected option
		if (this.refs.menu && this.refs.focused && this.state.isOpen && !this.hasScrolledToOption) {
			var focusedOptionNode = _reactDom2['default'].findDOMNode(this.refs.focused);
			var menuNode = _reactDom2['default'].findDOMNode(this.refs.menu);
			menuNode.scrollTop = focusedOptionNode.offsetTop;
			this.hasScrolledToOption = true;
		} else if (!this.state.isOpen) {
			this.hasScrolledToOption = false;
		}

		if (this._scrollToFocusedOptionOnUpdate && this.refs.focused && this.refs.menu) {
			this._scrollToFocusedOptionOnUpdate = false;
			var focusedDOM = _reactDom2['default'].findDOMNode(this.refs.focused);
			var menuDOM = _reactDom2['default'].findDOMNode(this.refs.menu);
			var focusedRect = focusedDOM.getBoundingClientRect();
			var menuRect = menuDOM.getBoundingClientRect();
			if (focusedRect.bottom > menuRect.bottom || focusedRect.top < menuRect.top) {
				menuDOM.scrollTop = focusedDOM.offsetTop + focusedDOM.clientHeight - menuDOM.offsetHeight;
			}
		}
		if (this.props.scrollMenuIntoView && this.refs.menuContainer) {
			var menuContainerRect = this.refs.menuContainer.getBoundingClientRect();
			if (window.innerHeight < menuContainerRect.bottom + this.props.menuBuffer) {
				window.scrollBy(0, menuContainerRect.bottom + this.props.menuBuffer - window.innerHeight);
			}
		}
		if (prevProps.disabled !== this.props.disabled) {
			this.setState({ isFocused: false }); // eslint-disable-line react/no-did-update-set-state
			this.closeMenu();
		}
	},

	focus: function focus() {
		if (!this.refs.input) return;
		this.refs.input.focus();

		if (this.props.openAfterFocus) {
			this.setState({
				isOpen: true
			});
		}
	},

	blurInput: function blurInput() {
		if (!this.refs.input) return;
		this.refs.input.blur();
	},

	handleTouchMove: function handleTouchMove(event) {
		// Set a flag that the view is being dragged
		this.dragging = true;
	},

	handleTouchStart: function handleTouchStart(event) {
		// Set a flag that the view is not being dragged
		this.dragging = false;
	},

	handleTouchEnd: function handleTouchEnd(event) {
		// Check if the view is being dragged, In this case
		// we don't want to fire the click event (because the user only wants to scroll)
		if (this.dragging) return;

		// Fire the mouse events
		this.handleMouseDown(event);
	},

	handleTouchEndClearValue: function handleTouchEndClearValue(event) {
		// Check if the view is being dragged, In this case
		// we don't want to fire the click event (because the user only wants to scroll)
		if (this.dragging) return;

		// Clear the value
		this.clearValue(event);
	},

	handleMouseDown: function handleMouseDown(event) {
		// if the event was triggered by a mousedown and not the primary
		// button, or if the component is disabled, ignore it.
		if (this.props.disabled || event.type === 'mousedown' && event.button !== 0) {
			return;
		}

		if (event.target.tagName === 'INPUT') {
			return;
		}

		// prevent default event handlers
		event.stopPropagation();
		event.preventDefault();

		// for the non-searchable select, toggle the menu
		if (!this.props.searchable) {
			this.focus();
			return this.setState({
				isOpen: !this.state.isOpen
			});
		}

		if (this.state.isFocused) {
			// On iOS, we can get into a state where we think the input is focused but it isn't really,
			// since iOS ignores programmatic calls to input.focus() that weren't triggered by a click event.
			// Call focus() again here to be safe.
			this.focus();

			// clears value so that the cursor will be a the end of input then the component re-renders
			this.refs.input.getInput().value = '';

			// if the input is focused, ensure the menu is open
			this.setState({
				isOpen: true,
				isPseudoFocused: false
			});
		} else {
			// otherwise, focus the input and open the menu
			this._openAfterFocus = true;
			this.focus();
		}
	},

	handleMouseDownOnArrow: function handleMouseDownOnArrow(event) {
		// if the event was triggered by a mousedown and not the primary
		// button, or if the component is disabled, ignore it.
		if (this.props.disabled || event.type === 'mousedown' && event.button !== 0) {
			return;
		}
		// If the menu isn't open, let the event bubble to the main handleMouseDown
		if (!this.state.isOpen) {
			return;
		}
		// prevent default event handlers
		event.stopPropagation();
		event.preventDefault();
		// close the menu
		this.closeMenu();
	},

	handleMouseDownOnMenu: function handleMouseDownOnMenu(event) {
		// if the event was triggered by a mousedown and not the primary
		// button, or if the component is disabled, ignore it.
		if (this.props.disabled || event.type === 'mousedown' && event.button !== 0) {
			return;
		}
		event.stopPropagation();
		event.preventDefault();

		this._openAfterFocus = true;
		this.focus();
	},

	closeMenu: function closeMenu() {
		this.setState({
			isOpen: false,
			isPseudoFocused: this.state.isFocused && !this.props.multi,
			inputValue: ''
		});
		this.hasScrolledToOption = false;
	},

	handleInputFocus: function handleInputFocus(event) {
		var isOpen = this.state.isOpen || this._openAfterFocus || this.props.openOnFocus;
		if (this.props.onFocus) {
			this.props.onFocus(event);
		}
		this.setState({
			isFocused: true,
			isOpen: isOpen
		});
		this._openAfterFocus = false;
	},

	handleInputBlur: function handleInputBlur(event) {
		if (this.refs.menu && document.activeElement === this.refs.menu) {
			this.focus();
			return;
		}

		if (this.props.onBlur) {
			this.props.onBlur(event);
		}
		var onBlurredState = {
			isFocused: false,
			isOpen: false,
			isPseudoFocused: false
		};
		if (this.props.onBlurResetsInput) {
			onBlurredState.inputValue = '';
		}
		this.setState(onBlurredState);
	},

	handleInputChange: function handleInputChange(event) {
		var newInputValue = event.target.value;
		if (this.state.inputValue !== event.target.value && this.props.onInputChange) {
			var nextState = this.props.onInputChange(newInputValue);
			// Note: != used deliberately here to catch undefined and null
			if (nextState != null && typeof nextState !== 'object') {
				newInputValue = '' + nextState;
			}
		}
		this.setState({
			isOpen: true,
			isPseudoFocused: false,
			inputValue: newInputValue
		});
	},

	handleKeyDown: function handleKeyDown(event) {
		if (this.props.disabled) return;
		switch (event.keyCode) {
			case 8:
				// backspace
				if (!this.state.inputValue && this.props.backspaceRemoves) {
					event.preventDefault();
					this.popValue();
				}
				return;
			case 9:
				// tab
				if (event.shiftKey || !this.state.isOpen || !this.props.tabSelectsValue) {
					return;
				}
				this.selectFocusedOption();
				return;
			case 13:
				// enter
				if (!this.state.isOpen) return;
				event.stopPropagation();
				this.selectFocusedOption();
				break;
			case 27:
				// escape
				if (this.state.isOpen) {
					this.closeMenu();
				} else if (this.props.clearable && this.props.escapeClearsValue) {
					this.clearValue(event);
				}
				break;
			case 38:
				// up
				this.focusPreviousOption();
				break;
			case 40:
				// down
				this.focusNextOption();
				break;
			case 33:
				// page up
				this.focusPageUpOption();
				break;
			case 34:
				// page down
				this.focusPageDownOption();
				break;
			case 35:
				// end key
				this.focusEndOption();
				break;
			case 36:
				// home key
				this.focusStartOption();
				break;
			// case 188: // ,
			// 	if (this.props.allowCreate && this.props.multi) {
			// 		event.preventDefault();
			// 		event.stopPropagation();
			// 		this.selectFocusedOption();
			// 	} else {
			// 		return;
			// 	}
			// break;
			default:
				return;
		}
		event.preventDefault();
	},

	handleValueClick: function handleValueClick(option, event) {
		if (!this.props.onValueClick) return;
		this.props.onValueClick(option, event);
	},

	handleMenuScroll: function handleMenuScroll(event) {
		if (!this.props.onMenuScrollToBottom) return;
		var target = event.target;

		if (target.scrollHeight > target.offsetHeight && !(target.scrollHeight - target.offsetHeight - target.scrollTop)) {
			this.props.onMenuScrollToBottom();
		}
	},

	handleRequired: function handleRequired(value, multi) {
		if (!value) return true;
		return multi ? value.length === 0 : Object.keys(value).length === 0;
	},

	getOptionLabel: function getOptionLabel(op) {
		return op[this.props.labelKey];
	},

	getValueArray: function getValueArray(value) {
		if (this.props.multi) {
			if (typeof value === 'string') value = value.split(this.props.delimiter);
			if (!Array.isArray(value)) {
				if (value === null || value === undefined) return [];
				value = [value];
			}
			return value.map(this.expandValue).filter(function (i) {
				return i;
			});
		}
		var expandedValue = this.expandValue(value);
		return expandedValue ? [expandedValue] : [];
	},

	expandValue: function expandValue(value) {
		if (typeof value !== 'string' && typeof value !== 'number') return value;
		var _props = this.props;
		var options = _props.options;
		var valueKey = _props.valueKey;

		if (!options) return;
		for (var i = 0; i < options.length; i++) {
			if (options[i][valueKey] === value) return options[i];
		}
	},

	setValue: function setValue(value) {
		var _this = this;

		if (this.props.autoBlur) {
			this.blurInput();
		}
		if (!this.props.onChange) return;
		if (this.props.required) {
			var required = this.handleRequired(value, this.props.multi);
			this.setState({ required: required });
		}
		if (this.props.simpleValue && value) {
			value = this.props.multi ? value.map(function (i) {
				return i[_this.props.valueKey];
			}).join(this.props.delimiter) : value[this.props.valueKey];
		}
		this.props.onChange(value);
	},

	selectValue: function selectValue(value) {
		this.hasScrolledToOption = false;
		if (this.props.multi) {
			this.addValue(value);
			this.setState({
				inputValue: '',
				focusedIndex: null
			});
		} else {
			this.setState({
				isOpen: false,
				inputValue: '',
				isPseudoFocused: this.state.isFocused
			});
			this.setValue(value);
		}
	},

	addValue: function addValue(value) {
		var valueArray = this.getValueArray(this.props.value);
		if (typeof this.props.limited === "undefined" || valueArray.length < this.props.limited) {
			this.setValue(valueArray.concat(value));
		}
	},

	popValue: function popValue() {
		var valueArray = this.getValueArray(this.props.value);
		if (!valueArray.length) return;
		if (valueArray[valueArray.length - 1].clearableValue === false) return;
		this.setValue(valueArray.slice(0, valueArray.length - 1));
	},

	removeValue: function removeValue(value) {
		var valueArray = this.getValueArray(this.props.value);
		this.setValue(valueArray.filter(function (i) {
			return i !== value;
		}));
		this.focus();
	},

	clearValue: function clearValue(event) {
		// if the event was triggered by a mousedown and not the primary
		// button, ignore it.
		if (event && event.type === 'mousedown' && event.button !== 0) {
			return;
		}
		event.stopPropagation();
		event.preventDefault();
		this.setValue(this.props.resetValue);
		this.setState({
			isOpen: false,
			inputValue: ''
		}, this.focus);
	},

	focusOption: function focusOption(option) {
		this.setState({
			focusedOption: option
		});
	},

	focusNextOption: function focusNextOption() {
		this.focusAdjacentOption('next');
	},

	focusPreviousOption: function focusPreviousOption() {
		this.focusAdjacentOption('previous');
	},

	focusPageUpOption: function focusPageUpOption() {
		this.focusAdjacentOption('page_up');
	},

	focusPageDownOption: function focusPageDownOption() {
		this.focusAdjacentOption('page_down');
	},

	focusStartOption: function focusStartOption() {
		this.focusAdjacentOption('start');
	},

	focusEndOption: function focusEndOption() {
		this.focusAdjacentOption('end');
	},

	focusAdjacentOption: function focusAdjacentOption(dir) {
		var options = this._visibleOptions.map(function (option, index) {
			return { option: option, index: index };
		}).filter(function (option) {
			return !option.option.disabled;
		});
		this._scrollToFocusedOptionOnUpdate = true;
		if (!this.state.isOpen) {
			this.setState({
				isOpen: true,
				inputValue: '',
				focusedOption: this._focusedOption || options[dir === 'next' ? 0 : options.length - 1].option
			});
			return;
		}
		if (!options.length) return;
		var focusedIndex = -1;
		for (var i = 0; i < options.length; i++) {
			if (this._focusedOption === options[i].option) {
				focusedIndex = i;
				break;
			}
		}
		if (dir === 'next' && focusedIndex !== -1) {
			focusedIndex = (focusedIndex + 1) % options.length;
		} else if (dir === 'previous') {
			if (focusedIndex > 0) {
				focusedIndex = focusedIndex - 1;
			} else {
				focusedIndex = options.length - 1;
			}
		} else if (dir === 'start') {
			focusedIndex = 0;
		} else if (dir === 'end') {
			focusedIndex = options.length - 1;
		} else if (dir === 'page_up') {
			var potentialIndex = focusedIndex - this.props.pageSize;
			if (potentialIndex < 0) {
				focusedIndex = 0;
			} else {
				focusedIndex = potentialIndex;
			}
		} else if (dir === 'page_down') {
			var potentialIndex = focusedIndex + this.props.pageSize;
			if (potentialIndex > options.length - 1) {
				focusedIndex = options.length - 1;
			} else {
				focusedIndex = potentialIndex;
			}
		}

		if (focusedIndex === -1) {
			focusedIndex = 0;
		}

		this.setState({
			focusedIndex: options[focusedIndex].index,
			focusedOption: options[focusedIndex].option
		});
	},

	selectFocusedOption: function selectFocusedOption() {
		// if (this.props.allowCreate && !this.state.focusedOption) {
		// 	return this.selectValue(this.state.inputValue);
		// }
		if (this._focusedOption) {
			return this.selectValue(this._focusedOption);
		}
	},

	renderLoading: function renderLoading() {
		if (!this.props.isLoading) return;
		return _react2['default'].createElement(
			'span',
			{ className: 'Select-loading-zone', 'aria-hidden': 'true' },
			_react2['default'].createElement('span', { className: 'Select-loading' })
		);
	},

	renderValue: function renderValue(valueArray, isOpen) {
		var _this2 = this;

		var renderLabel = this.props.valueRenderer || this.getOptionLabel;
		var ValueComponent = this.props.valueComponent;
		if (!valueArray.length) {
			return !this.state.inputValue ? _react2['default'].createElement(
				'div',
				{ className: 'Select-placeholder' },
				this.props.placeholder
			) : null;
		}
		var onClick = this.props.onValueClick ? this.handleValueClick : null;
		if (this.props.multi) {
			return valueArray.map(function (value, i) {
				return _react2['default'].createElement(
					ValueComponent,
					{
						id: _this2._instancePrefix + '-value-' + i,
						instancePrefix: _this2._instancePrefix,
						disabled: _this2.props.disabled || value.clearableValue === false,
						key: 'value-' + i + '-' + value[_this2.props.valueKey],
						onClick: onClick,
						onRemove: _this2.removeValue,
						value: value
					},
					renderLabel(value),
					_react2['default'].createElement(
						'span',
						{ className: 'Select-aria-only' },
						' '
					)
				);
			});
		} else if (!this.state.inputValue) {
			if (isOpen) onClick = null;
			return _react2['default'].createElement(
				ValueComponent,
				{
					id: this._instancePrefix + '-value-item',
					disabled: this.props.disabled,
					instancePrefix: this._instancePrefix,
					onClick: onClick,
					value: valueArray[0]
				},
				renderLabel(valueArray[0])
			);
		}
	},

	renderInput: function renderInput(valueArray, focusedOptionIndex) {
		if (this.props.inputRenderer) {
			return this.props.inputRenderer();
		} else {
			var _classNames;

			var className = (0, _classnames2['default'])('Select-input', this.props.inputProps.className);
			var isOpen = !!this.state.isOpen;

			var ariaOwns = (0, _classnames2['default'])((_classNames = {}, _defineProperty(_classNames, this._instancePrefix + '-list', isOpen), _defineProperty(_classNames, this._instancePrefix + '-backspace-remove-message', this.props.multi && !this.props.disabled && this.state.isFocused && !this.state.inputValue), _classNames));

			// TODO: Check how this project includes Object.assign()
			var inputProps = _extends({}, this.props.inputProps, {
				role: 'combobox',
				'aria-expanded': '' + isOpen,
				'aria-owns': ariaOwns,
				'aria-haspopup': '' + isOpen,
				'aria-activedescendant': isOpen ? this._instancePrefix + '-option-' + focusedOptionIndex : this._instancePrefix + '-value',
				'aria-labelledby': this.props['aria-labelledby'],
				'aria-label': this.props['aria-label'],
				className: className,
				tabIndex: this.props.tabIndex,
				onBlur: this.handleInputBlur,
				onChange: this.handleInputChange,
				onFocus: this.handleInputFocus,
				ref: 'input',
				required: this.state.required,
				value: this.state.inputValue
			});

			if (this.props.disabled || !this.props.searchable) {
				return _react2['default'].createElement('div', _extends({}, this.props.inputProps, {
					role: 'combobox',
					'aria-expanded': isOpen,
					'aria-owns': isOpen ? this._instancePrefix + '-list' : this._instancePrefix + '-value',
					'aria-activedescendant': isOpen ? this._instancePrefix + '-option-' + focusedOptionIndex : this._instancePrefix + '-value',
					className: className,
					tabIndex: this.props.tabIndex || 0,
					onBlur: this.handleInputBlur,
					onFocus: this.handleInputFocus,
					ref: 'input',
					'aria-readonly': '' + !!this.props.disabled,
					style: { border: 0, width: 1, display: 'inline-block' } }));
			}

			if (this.props.autosize) {
				return _react2['default'].createElement(_reactInputAutosize2['default'], _extends({}, inputProps, { minWidth: '5px' }));
			}
			return _react2['default'].createElement(
				'div',
				{ className: className },
				_react2['default'].createElement('input', inputProps)
			);
		}
	},

	renderClear: function renderClear() {
		if (!this.props.clearable || !this.props.value || this.props.multi && !this.props.value.length || this.props.disabled || this.props.isLoading) return;
		return _react2['default'].createElement(
			'span',
			{ className: 'Select-clear-zone', title: this.props.multi ? this.props.clearAllText : this.props.clearValueText,
				'aria-label': this.props.multi ? this.props.clearAllText : this.props.clearValueText,
				onMouseDown: this.clearValue,
				onTouchStart: this.handleTouchStart,
				onTouchMove: this.handleTouchMove,
				onTouchEnd: this.handleTouchEndClearValue },
			_react2['default'].createElement('span', { className: 'Select-clear', dangerouslySetInnerHTML: { __html: '&times;' } })
		);
	},

	renderArrow: function renderArrow() {
		return _react2['default'].createElement(
			'span',
			{ className: 'Select-arrow-zone', onMouseDown: this.handleMouseDownOnArrow },
			_react2['default'].createElement('span', { className: 'Select-arrow', onMouseDown: this.handleMouseDownOnArrow })
		);
	},

	filterOptions: function filterOptions(excludeOptions) {
		var _this3 = this;

		var filterValue = this.state.inputValue;
		var options = this.props.options || [];
		if (typeof this.props.filterOptions === 'function') {
			return this.props.filterOptions.call(this, options, filterValue, excludeOptions);
		} else if (this.props.filterOptions) {
			if (this.props.ignoreAccents) {
				filterValue = (0, _utilsStripDiacritics2['default'])(filterValue);
			}
			if (this.props.ignoreCase) {
				filterValue = filterValue.toLowerCase();
			}
			if (excludeOptions) excludeOptions = excludeOptions.map(function (i) {
				return i[_this3.props.valueKey];
			});
			return options.filter(function (option) {
				if (excludeOptions && excludeOptions.indexOf(option[_this3.props.valueKey]) > -1) return false;
				if (_this3.props.filterOption) return _this3.props.filterOption.call(_this3, option, filterValue);
				if (!filterValue) return true;
				var valueTest = String(option[_this3.props.valueKey]);
				var labelTest = String(option[_this3.props.labelKey]);
				if (_this3.props.ignoreAccents) {
					if (_this3.props.matchProp !== 'label') valueTest = (0, _utilsStripDiacritics2['default'])(valueTest);
					if (_this3.props.matchProp !== 'value') labelTest = (0, _utilsStripDiacritics2['default'])(labelTest);
				}
				if (_this3.props.ignoreCase) {
					if (_this3.props.matchProp !== 'label') valueTest = valueTest.toLowerCase();
					if (_this3.props.matchProp !== 'value') labelTest = labelTest.toLowerCase();
				}
				return _this3.props.matchPos === 'start' ? _this3.props.matchProp !== 'label' && valueTest.substr(0, filterValue.length) === filterValue || _this3.props.matchProp !== 'value' && labelTest.substr(0, filterValue.length) === filterValue : _this3.props.matchProp !== 'label' && valueTest.indexOf(filterValue) >= 0 || _this3.props.matchProp !== 'value' && labelTest.indexOf(filterValue) >= 0;
			});
		} else {
			return options;
		}
	},

	renderMenu: function renderMenu(options, valueArray, focusedOption) {
		var _this4 = this;

		if (options && options.length) {
			if (this.props.menuRenderer) {
				return this.props.menuRenderer({
					focusedOption: focusedOption,
					focusOption: this.focusOption,
					labelKey: this.props.labelKey,
					options: options,
					selectValue: this.selectValue,
					valueArray: valueArray
				});
			} else {
				var _ret = (function () {
					var Option = _this4.props.optionComponent;
					var renderLabel = _this4.props.optionRenderer || _this4.getOptionLabel;

					return {
						v: options.map(function (option, i) {
							var isSelected = valueArray && valueArray.indexOf(option) > -1;
							var isFocused = option === focusedOption;
							var optionRef = isFocused ? 'focused' : null;
							var optionClass = (0, _classnames2['default'])(_this4.props.optionClassName, {
								'Select-option': true,
								'is-selected': isSelected,
								'is-focused': isFocused,
								'is-disabled': option.disabled
							});

							return _react2['default'].createElement(
								Option,
								{
									instancePrefix: _this4._instancePrefix,
									optionIndex: i,
									className: optionClass,
									isDisabled: option.disabled,
									isFocused: isFocused,
									key: 'option-' + i + '-' + option[_this4.props.valueKey],
									onSelect: _this4.selectValue,
									onFocus: _this4.focusOption,
									option: option,
									isSelected: isSelected,
									ref: optionRef
								},
								renderLabel(option)
							);
						})
					};
				})();

				if (typeof _ret === 'object') return _ret.v;
			}
		} else if (this.props.noResultsText) {
			return _react2['default'].createElement(
				'div',
				{ className: 'Select-noresults' },
				this.props.noResultsText
			);
		} else {
			return null;
		}
	},

	renderHiddenField: function renderHiddenField(valueArray) {
		var _this5 = this;

		if (!this.props.name) return;
		if (this.props.joinValues) {
			var value = valueArray.map(function (i) {
				return stringifyValue(i[_this5.props.valueKey]);
			}).join(this.props.delimiter);
			return _react2['default'].createElement('input', {
				type: 'hidden',
				ref: 'value',
				name: this.props.name,
				value: value,
				disabled: this.props.disabled });
		}
		return valueArray.map(function (item, index) {
			return _react2['default'].createElement('input', { key: 'hidden.' + index,
				type: 'hidden',
				ref: 'value' + index,
				name: _this5.props.name,
				value: stringifyValue(item[_this5.props.valueKey]),
				disabled: _this5.props.disabled });
		});
	},

	getFocusableOptionIndex: function getFocusableOptionIndex(selectedOption) {
		var options = this._visibleOptions;
		if (!options.length) return null;

		var focusedOption = this.state.focusedOption || selectedOption;
		if (focusedOption && !focusedOption.disabled) {
			var focusedOptionIndex = options.indexOf(focusedOption);
			if (focusedOptionIndex !== -1) {
				return focusedOptionIndex;
			}
		}

		for (var i = 0; i < options.length; i++) {
			if (!options[i].disabled) return i;
		}
		return null;
	},

	renderOuter: function renderOuter(options, valueArray, focusedOption) {
		var menu = this.renderMenu(options, valueArray, focusedOption);
		if (!menu) {
			return null;
		}

		return _react2['default'].createElement(
			'div',
			{ ref: 'menuContainer', className: 'Select-menu-outer', style: this.props.menuContainerStyle },
			_react2['default'].createElement(
				'div',
				{ ref: 'menu', role: 'listbox', className: 'Select-menu', id: this._instancePrefix + '-list',
					style: this.props.menuStyle,
					onScroll: this.handleMenuScroll,
					onMouseDown: this.handleMouseDownOnMenu },
				menu
			)
		);
	},

	render: function render() {
		var valueArray = this.getValueArray(this.props.value);
		var options = this._visibleOptions = this.filterOptions(this.props.multi ? valueArray : null);
		var isOpen = this.state.isOpen;
		if (this.props.multi && !options.length && valueArray.length && !this.state.inputValue) isOpen = false;
		var focusedOptionIndex = this.getFocusableOptionIndex(valueArray[0]);

		var focusedOption = null;
		if (focusedOptionIndex !== null) {
			focusedOption = this._focusedOption = this._visibleOptions[focusedOptionIndex];
		} else {
			focusedOption = this._focusedOption = null;
		}
		var className = (0, _classnames2['default'])('Select', this.props.className, {
			'Select--multi': this.props.multi,
			'Select--single': !this.props.multi,
			'is-disabled': this.props.disabled,
			'is-focused': this.state.isFocused,
			'is-loading': this.props.isLoading,
			'is-open': isOpen,
			'is-pseudo-focused': this.state.isPseudoFocused,
			'is-searchable': this.props.searchable,
			'has-value': valueArray.length
		});

		var removeMessage = null;
		if (this.props.multi && !this.props.disabled && valueArray.length && !this.state.inputValue && this.state.isFocused && this.props.backspaceRemoves) {
			removeMessage = _react2['default'].createElement(
				'span',
				{ id: this._instancePrefix + '-backspace-remove-message', className: 'Select-aria-only', 'aria-live': 'assertive' },
				this.props.backspaceToRemoveMessage.replace('{label}', valueArray[valueArray.length - 1][this.props.labelKey])
			);
		}

		return _react2['default'].createElement(
			'div',
			{ ref: 'wrapper',
				className: className,
				style: this.props.wrapperStyle },
			this.renderHiddenField(valueArray),
			_react2['default'].createElement(
				'div',
				{ ref: 'control',
					className: 'Select-control',
					style: this.props.style,
					onKeyDown: this.handleKeyDown,
					onMouseDown: this.handleMouseDown,
					onTouchEnd: this.handleTouchEnd,
					onTouchStart: this.handleTouchStart,
					onTouchMove: this.handleTouchMove },
				_react2['default'].createElement(
					'span',
					{ className: 'Select-multi-value-wrapper', id: this._instancePrefix + '-value' },
					this.renderValue(valueArray, isOpen),
					this.renderInput(valueArray, focusedOptionIndex)
				),
				removeMessage,
				this.renderLoading(),
				this.renderClear(),
				this.renderArrow()
			),
			isOpen ? this.renderOuter(options, !this.props.multi ? valueArray : null, focusedOption) : null
		);
	}

});

exports['default'] = Select;
module.exports = exports['default'];

},{"./Async":1,"./Option":2,"./Value":3,"./utils/stripDiacritics":4,"classnames":undefined,"react":undefined,"react-dom":undefined,"react-input-autosize":undefined}]},{},[])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9yZWFjdC1jb21wb25lbnQtZ3VscC10YXNrcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2Zsb2Nrcy9yZWFjdC1zZWxlY3Qvc3JjL0FzeW5jLmpzIiwiL1VzZXJzL2Zsb2Nrcy9yZWFjdC1zZWxlY3Qvc3JjL09wdGlvbi5qcyIsIi9Vc2Vycy9mbG9ja3MvcmVhY3Qtc2VsZWN0L3NyYy9WYWx1ZS5qcyIsIi9Vc2Vycy9mbG9ja3MvcmVhY3Qtc2VsZWN0L3NyYy91dGlscy9zdHJpcERpYWNyaXRpY3MuanMiLCIvVXNlcnMvZmxvY2tzL3JlYWN0LXNlbGVjdC9zcmMvU2VsZWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O3FCQ0FrQixPQUFPOzs7O3NCQUVOLFVBQVU7Ozs7b0NBQ0QseUJBQXlCOzs7O0FBRXJELElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQzs7QUFFbEIsU0FBUyxTQUFTLENBQUUsS0FBSyxFQUFFO0FBQzFCLEtBQUksS0FBSyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtBQUN2QyxPQUFLLEdBQUcsRUFBRSxDQUFDO0VBQ1g7QUFDRCxRQUFPLEtBQUssR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDO0NBQzVCOztBQUVELFNBQVMsV0FBVyxDQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO0FBQ3pDLEtBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTztBQUNuQixNQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDO0NBQ3BCOztBQUVELFNBQVMsWUFBWSxDQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDcEMsS0FBSSxDQUFDLEtBQUssRUFBRSxPQUFPO0FBQ25CLE1BQUssSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxF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KGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgU2VsZWN0IGZyb20gJy4vU2VsZWN0JztcbmltcG9ydCBzdHJpcERpYWNyaXRpY3MgZnJvbSAnLi91dGlscy9zdHJpcERpYWNyaXRpY3MnO1xuXG5sZXQgcmVxdWVzdElkID0gMDtcblxuZnVuY3Rpb24gaW5pdENhY2hlIChjYWNoZSkge1xuXHRpZiAoY2FjaGUgJiYgdHlwZW9mIGNhY2hlICE9PSAnb2JqZWN0Jykge1xuXHRcdGNhY2hlID0ge307XG5cdH1cblx0cmV0dXJuIGNhY2hlID8gY2FjaGUgOiBudWxsO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVDYWNoZSAoY2FjaGUsIGlucHV0LCBkYXRhKSB7XG5cdGlmICghY2FjaGUpIHJldHVybjtcblx0Y2FjaGVbaW5wdXRdID0gZGF0YTtcbn1cblxuZnVuY3Rpb24gZ2V0RnJvbUNhY2hlIChjYWNoZSwgaW5wdXQpIHtcblx0aWYgKCFjYWNoZSkgcmV0dXJuO1xuXHRmb3IgKGxldCBpID0gaW5wdXQubGVuZ3RoOyBpID49IDA7IC0taSkge1xuXHRcdGxldCBjYWNoZUtleSA9IGlucHV0LnNsaWNlKDAsIGkpO1xuXHRcdGlmIChjYWNoZVtjYWNoZUtleV0gJiYgKGlucHV0ID09PSBjYWNoZUtleSB8fCBjYWNoZVtjYWNoZUtleV0uY29tcGxldGUpKSB7XG5cdFx0XHRyZXR1cm4gY2FjaGVbY2FjaGVLZXldO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiB0aGVuUHJvbWlzZSAocHJvbWlzZSwgY2FsbGJhY2spIHtcblx0aWYgKCFwcm9taXNlIHx8IHR5cGVvZiBwcm9taXNlLnRoZW4gIT09ICdmdW5jdGlvbicpIHJldHVybjtcblx0cmV0dXJuIHByb21pc2UudGhlbigoZGF0YSkgPT4ge1xuXHRcdGNhbGxiYWNrKG51bGwsIGRhdGEpO1xuXHR9LCAoZXJyKSA9PiB7XG5cdFx0Y2FsbGJhY2soZXJyKTtcblx0fSk7XG59XG5cbmNvbnN0IHN0cmluZ09yTm9kZSA9IFJlYWN0LlByb3BUeXBlcy5vbmVPZlR5cGUoW1xuXHRSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuXHRSZWFjdC5Qcm9wVHlwZXMubm9kZVxuXSk7XG5cbmNvbnN0IEFzeW5jID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRwcm9wVHlwZXM6IHtcblx0XHRjYWNoZTogUmVhY3QuUHJvcFR5cGVzLmFueSwgICAgICAgICAgICAgICAgICAgICAvLyBvYmplY3QgdG8gdXNlIHRvIGNhY2hlIHJlc3VsdHMsIGNhbiBiZSBudWxsIHRvIGRpc2FibGUgY2FjaGVcblx0XHRpZ25vcmVBY2NlbnRzOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgICAvLyB3aGV0aGVyIHRvIHN0cmlwIGRpYWNyaXRpY3Mgd2hlbiBmaWx0ZXJpbmcgKHNoYXJlZCB3aXRoIFNlbGVjdClcblx0XHRpZ25vcmVDYXNlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgICAgICAvLyB3aGV0aGVyIHRvIHBlcmZvcm0gY2FzZS1pbnNlbnNpdGl2ZSBmaWx0ZXJpbmcgKHNoYXJlZCB3aXRoIFNlbGVjdClcblx0XHRpc0xvYWRpbmc6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgICAgICAvLyBvdmVycmlkZXMgdGhlIGlzTG9hZGluZyBzdGF0ZSB3aGVuIHNldCB0byB0cnVlXG5cdFx0bG9hZE9wdGlvbnM6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsICAgLy8gZnVuY3Rpb24gdG8gY2FsbCB0byBsb2FkIG9wdGlvbnMgYXN5bmNocm9ub3VzbHlcblx0XHRsb2FkaW5nUGxhY2Vob2xkZXI6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAvLyByZXBsYWNlcyB0aGUgcGxhY2Vob2xkZXIgd2hpbGUgb3B0aW9ucyBhcmUgbG9hZGluZ1xuXHRcdG1pbmltdW1JbnB1dDogUmVhY3QuUHJvcFR5cGVzLm51bWJlciwgICAgICAgICAgIC8vIHRoZSBtaW5pbXVtIG51bWJlciBvZiBjaGFyYWN0ZXJzIHRoYXQgdHJpZ2dlciBsb2FkT3B0aW9uc1xuXHRcdG5vUmVzdWx0c1RleHQ6IHN0cmluZ09yTm9kZSwgICAgICAgICAgICAgICAgICAgIC8vIHBsYWNlaG9sZGVyIGRpc3BsYXllZCB3aGVuIHRoZXJlIGFyZSBubyBtYXRjaGluZyBzZWFyY2ggcmVzdWx0cyAoc2hhcmVkIHdpdGggU2VsZWN0KVxuXHRcdG9uSW5wdXRDaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgICAgIC8vIG9uSW5wdXRDaGFuZ2UgaGFuZGxlcjogZnVuY3Rpb24gKGlucHV0VmFsdWUpIHt9XG5cdFx0cGxhY2Vob2xkZXI6IHN0cmluZ09yTm9kZSwgICAgICAgICAgICAgICAgICAgICAgLy8gZmllbGQgcGxhY2Vob2xkZXIsIGRpc3BsYXllZCB3aGVuIHRoZXJlJ3Mgbm8gdmFsdWUgKHNoYXJlZCB3aXRoIFNlbGVjdClcblx0XHRzZWFyY2hQcm9tcHRUZXh0OiBzdHJpbmdPck5vZGUsICAgICAgIC8vIGxhYmVsIHRvIHByb21wdCBmb3Igc2VhcmNoIGlucHV0XG5cdFx0c2VhcmNoaW5nVGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAgLy8gbWVzc2FnZSB0byBkaXNwbGF5IHdoaWxlIG9wdGlvbnMgYXJlIGxvYWRpbmdcblx0fSxcblx0Z2V0RGVmYXVsdFByb3BzICgpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0Y2FjaGU6IHRydWUsXG5cdFx0XHRpZ25vcmVBY2NlbnRzOiB0cnVlLFxuXHRcdFx0aWdub3JlQ2FzZTogdHJ1ZSxcblx0XHRcdGxvYWRpbmdQbGFjZWhvbGRlcjogJ0xvYWRpbmcuLi4nLFxuXHRcdFx0bWluaW11bUlucHV0OiAwLFxuXHRcdFx0c2VhcmNoaW5nVGV4dDogJ1NlYXJjaGluZy4uLicsXG5cdFx0XHRzZWFyY2hQcm9tcHRUZXh0OiAnVHlwZSB0byBzZWFyY2gnLFxuXHRcdH07XG5cdH0sXG5cdGdldEluaXRpYWxTdGF0ZSAoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGNhY2hlOiBpbml0Q2FjaGUodGhpcy5wcm9wcy5jYWNoZSksXG5cdFx0XHRpc0xvYWRpbmc6IGZhbHNlLFxuXHRcdFx0b3B0aW9uczogW10sXG5cdFx0fTtcblx0fSxcblx0Y29tcG9uZW50V2lsbE1vdW50ICgpIHtcblx0XHR0aGlzLl9sYXN0SW5wdXQgPSAnJztcblx0fSxcblx0Y29tcG9uZW50RGlkTW91bnQgKCkge1xuXHRcdHRoaXMubG9hZE9wdGlvbnMoJycpO1xuXHR9LFxuXHRjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIChuZXh0UHJvcHMpIHtcblx0XHRpZiAobmV4dFByb3BzLmNhY2hlICE9PSB0aGlzLnByb3BzLmNhY2hlKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0Y2FjaGU6IGluaXRDYWNoZShuZXh0UHJvcHMuY2FjaGUpLFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXHRmb2N1cyAoKSB7XG5cdFx0dGhpcy5yZWZzLnNlbGVjdC5mb2N1cygpO1xuXHR9LFxuXHRyZXNldFN0YXRlICgpIHtcblx0XHR0aGlzLl9jdXJyZW50UmVxdWVzdElkID0gLTE7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRpc0xvYWRpbmc6IGZhbHNlLFxuXHRcdFx0b3B0aW9uczogW10sXG5cdFx0fSk7XG5cdH0sXG5cdGdldFJlc3BvbnNlSGFuZGxlciAoaW5wdXQpIHtcblx0XHRsZXQgX3JlcXVlc3RJZCA9IHRoaXMuX2N1cnJlbnRSZXF1ZXN0SWQgPSByZXF1ZXN0SWQrKztcblx0XHRyZXR1cm4gKGVyciwgZGF0YSkgPT4ge1xuXHRcdFx0aWYgKGVycikgdGhyb3cgZXJyO1xuXHRcdFx0aWYgKCF0aGlzLmlzTW91bnRlZCgpKSByZXR1cm47XG5cdFx0XHR1cGRhdGVDYWNoZSh0aGlzLnN0YXRlLmNhY2hlLCBpbnB1dCwgZGF0YSk7XG5cdFx0XHRpZiAoX3JlcXVlc3RJZCAhPT0gdGhpcy5fY3VycmVudFJlcXVlc3RJZCkgcmV0dXJuO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGlzTG9hZGluZzogZmFsc2UsXG5cdFx0XHRcdG9wdGlvbnM6IGRhdGEgJiYgZGF0YS5vcHRpb25zIHx8IFtdLFxuXHRcdFx0fSk7XG5cdFx0fTtcblx0fSxcblx0bG9hZE9wdGlvbnMgKGlucHV0KSB7XG5cdFx0aWYgKHRoaXMucHJvcHMub25JbnB1dENoYW5nZSkge1xuXHRcdFx0bGV0IG5leHRTdGF0ZSA9IHRoaXMucHJvcHMub25JbnB1dENoYW5nZShpbnB1dCk7XG5cdFx0XHQvLyBOb3RlOiAhPSB1c2VkIGRlbGliZXJhdGVseSBoZXJlIHRvIGNhdGNoIHVuZGVmaW5lZCBhbmQgbnVsbFxuXHRcdFx0aWYgKG5leHRTdGF0ZSAhPSBudWxsKSB7XG5cdFx0XHRcdGlucHV0ID0gJycgKyBuZXh0U3RhdGU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICh0aGlzLnByb3BzLmlnbm9yZUFjY2VudHMpIGlucHV0ID0gc3RyaXBEaWFjcml0aWNzKGlucHV0KTtcblx0XHRpZiAodGhpcy5wcm9wcy5pZ25vcmVDYXNlKSBpbnB1dCA9IGlucHV0LnRvTG93ZXJDYXNlKCk7XG5cblx0XHR0aGlzLl9sYXN0SW5wdXQgPSBpbnB1dDtcblx0XHRpZiAoaW5wdXQubGVuZ3RoIDwgdGhpcy5wcm9wcy5taW5pbXVtSW5wdXQpIHtcblx0XHRcdHJldHVybiB0aGlzLnJlc2V0U3RhdGUoKTtcblx0XHR9XG5cdFx0bGV0IGNhY2hlUmVzdWx0ID0gZ2V0RnJvbUNhY2hlKHRoaXMuc3RhdGUuY2FjaGUsIGlucHV0KTtcblx0XHRpZiAoY2FjaGVSZXN1bHQpIHtcblx0XHRcdHJldHVybiB0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0b3B0aW9uczogY2FjaGVSZXN1bHQub3B0aW9ucyxcblx0XHRcdH0pO1xuXHRcdH1cblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGlzTG9hZGluZzogdHJ1ZSxcblx0XHR9KTtcblx0XHRsZXQgcmVzcG9uc2VIYW5kbGVyID0gdGhpcy5nZXRSZXNwb25zZUhhbmRsZXIoaW5wdXQpO1xuXHRcdGxldCBpbnB1dFByb21pc2UgPSB0aGVuUHJvbWlzZSh0aGlzLnByb3BzLmxvYWRPcHRpb25zKGlucHV0LCByZXNwb25zZUhhbmRsZXIpLCByZXNwb25zZUhhbmRsZXIpO1xuXHRcdHJldHVybiBpbnB1dFByb21pc2UgPyBpbnB1dFByb21pc2UudGhlbigoKSA9PiB7XG5cdFx0XHRyZXR1cm4gaW5wdXQ7XG5cdFx0fSkgOiBpbnB1dDtcblx0fSxcblx0cmVuZGVyICgpIHtcblx0XHRsZXQgeyBub1Jlc3VsdHNUZXh0IH0gPSB0aGlzLnByb3BzO1xuXHRcdGxldCB7IGlzTG9hZGluZywgb3B0aW9ucyB9ID0gdGhpcy5zdGF0ZTtcblx0XHRpZiAodGhpcy5wcm9wcy5pc0xvYWRpbmcpIGlzTG9hZGluZyA9IHRydWU7XG5cdFx0bGV0IHBsYWNlaG9sZGVyID0gaXNMb2FkaW5nID8gdGhpcy5wcm9wcy5sb2FkaW5nUGxhY2Vob2xkZXIgOiB0aGlzLnByb3BzLnBsYWNlaG9sZGVyO1xuXHRcdGlmIChpc0xvYWRpbmcpIHtcblx0XHRcdG5vUmVzdWx0c1RleHQgPSB0aGlzLnByb3BzLnNlYXJjaGluZ1RleHQ7XG5cdFx0fSBlbHNlIGlmICghb3B0aW9ucy5sZW5ndGggJiYgdGhpcy5fbGFzdElucHV0Lmxlbmd0aCA8IHRoaXMucHJvcHMubWluaW11bUlucHV0KSB7XG5cdFx0XHRub1Jlc3VsdHNUZXh0ID0gdGhpcy5wcm9wcy5zZWFyY2hQcm9tcHRUZXh0O1xuXHRcdH1cblx0XHRyZXR1cm4gKFxuXHRcdFx0PFNlbGVjdFxuXHRcdFx0XHR7Li4udGhpcy5wcm9wc31cblx0XHRcdFx0cmVmPVwic2VsZWN0XCJcblx0XHRcdFx0aXNMb2FkaW5nPXtpc0xvYWRpbmd9XG5cdFx0XHRcdG5vUmVzdWx0c1RleHQ9e25vUmVzdWx0c1RleHR9XG5cdFx0XHRcdG9uSW5wdXRDaGFuZ2U9e3RoaXMubG9hZE9wdGlvbnN9XG5cdFx0XHRcdG9wdGlvbnM9e29wdGlvbnN9XG5cdFx0XHRcdHBsYWNlaG9sZGVyPXtwbGFjZWhvbGRlcn1cblx0XHRcdFx0Lz5cblx0XHQpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBc3luYztcbiIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxuY29uc3QgT3B0aW9uID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRwcm9wVHlwZXM6IHtcblx0XHRjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLm5vZGUsXG5cdFx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgICAgICAvLyBjbGFzc05hbWUgKGJhc2VkIG9uIG1vdXNlIHBvc2l0aW9uKVxuXHRcdGluc3RhbmNlUHJlZml4OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsICAvLyB1bmlxdWUgcHJlZml4IGZvciB0aGUgaWRzICh1c2VkIGZvciBhcmlhKVxuXHRcdGlzRGlzYWJsZWQ6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgICAgLy8gdGhlIG9wdGlvbiBpcyBkaXNhYmxlZFxuXHRcdGlzRm9jdXNlZDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAgICAgLy8gdGhlIG9wdGlvbiBpcyBmb2N1c2VkXG5cdFx0aXNTZWxlY3RlZDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAgICAvLyB0aGUgb3B0aW9uIGlzIHNlbGVjdGVkXG5cdFx0b25Gb2N1czogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgICAgICAvLyBtZXRob2QgdG8gaGFuZGxlIG1vdXNlRW50ZXIgb24gb3B0aW9uIGVsZW1lbnRcblx0XHRvblNlbGVjdDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgICAgIC8vIG1ldGhvZCB0byBoYW5kbGUgY2xpY2sgb24gb3B0aW9uIGVsZW1lbnRcblx0XHRvblVuZm9jdXM6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgICAgICAgIC8vIG1ldGhvZCB0byBoYW5kbGUgbW91c2VMZWF2ZSBvbiBvcHRpb24gZWxlbWVudFxuXHRcdG9wdGlvbjogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLCAgICAgLy8gb2JqZWN0IHRoYXQgaXMgYmFzZSBmb3IgdGhhdCBvcHRpb25cblx0XHRvcHRpb25JbmRleDogUmVhY3QuUHJvcFR5cGVzLm51bWJlciwgICAgICAgICAgIC8vIGluZGV4IG9mIHRoZSBvcHRpb24sIHVzZWQgdG8gZ2VuZXJhdGUgdW5pcXVlIGlkcyBmb3IgYXJpYVxuXHR9LFxuXHRibG9ja0V2ZW50IChldmVudCkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0aWYgKChldmVudC50YXJnZXQudGFnTmFtZSAhPT0gJ0EnKSB8fCAhKCdocmVmJyBpbiBldmVudC50YXJnZXQpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmIChldmVudC50YXJnZXQudGFyZ2V0KSB7XG5cdFx0XHR3aW5kb3cub3BlbihldmVudC50YXJnZXQuaHJlZiwgZXZlbnQudGFyZ2V0LnRhcmdldCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gZXZlbnQudGFyZ2V0LmhyZWY7XG5cdFx0fVxuXHR9LFxuXG5cdGhhbmRsZU1vdXNlRG93biAoZXZlbnQpIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdHRoaXMucHJvcHMub25TZWxlY3QodGhpcy5wcm9wcy5vcHRpb24sIGV2ZW50KTtcblx0fSxcblxuXHRoYW5kbGVNb3VzZUVudGVyIChldmVudCkge1xuXHRcdHRoaXMub25Gb2N1cyhldmVudCk7XG5cdH0sXG5cblx0aGFuZGxlTW91c2VNb3ZlIChldmVudCkge1xuXHRcdHRoaXMub25Gb2N1cyhldmVudCk7XG5cdH0sXG5cblx0aGFuZGxlVG91Y2hFbmQoZXZlbnQpe1xuXHRcdC8vIENoZWNrIGlmIHRoZSB2aWV3IGlzIGJlaW5nIGRyYWdnZWQsIEluIHRoaXMgY2FzZVxuXHRcdC8vIHdlIGRvbid0IHdhbnQgdG8gZmlyZSB0aGUgY2xpY2sgZXZlbnQgKGJlY2F1c2UgdGhlIHVzZXIgb25seSB3YW50cyB0byBzY3JvbGwpXG5cdFx0aWYodGhpcy5kcmFnZ2luZykgcmV0dXJuO1xuXG5cdFx0dGhpcy5oYW5kbGVNb3VzZURvd24oZXZlbnQpO1xuXHR9LFxuXG5cdGhhbmRsZVRvdWNoTW92ZSAoZXZlbnQpIHtcblx0XHQvLyBTZXQgYSBmbGFnIHRoYXQgdGhlIHZpZXcgaXMgYmVpbmcgZHJhZ2dlZFxuXHRcdHRoaXMuZHJhZ2dpbmcgPSB0cnVlO1xuXHR9LFxuXG5cdGhhbmRsZVRvdWNoU3RhcnQgKGV2ZW50KSB7XG5cdFx0Ly8gU2V0IGEgZmxhZyB0aGF0IHRoZSB2aWV3IGlzIG5vdCBiZWluZyBkcmFnZ2VkXG5cdFx0dGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xuXHR9LFxuXG5cdG9uRm9jdXMgKGV2ZW50KSB7XG5cdFx0aWYgKCF0aGlzLnByb3BzLmlzRm9jdXNlZCkge1xuXHRcdFx0dGhpcy5wcm9wcy5vbkZvY3VzKHRoaXMucHJvcHMub3B0aW9uLCBldmVudCk7XG5cdFx0fVxuXHR9LFxuXHRyZW5kZXIgKCkge1xuXHRcdHZhciB7IG9wdGlvbiwgaW5zdGFuY2VQcmVmaXgsIG9wdGlvbkluZGV4IH0gPSB0aGlzLnByb3BzO1xuXHRcdHZhciBjbGFzc05hbWUgPSBjbGFzc05hbWVzKHRoaXMucHJvcHMuY2xhc3NOYW1lLCBvcHRpb24uY2xhc3NOYW1lKTtcblxuXHRcdHJldHVybiBvcHRpb24uZGlzYWJsZWQgPyAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lfVxuXHRcdFx0XHRvbk1vdXNlRG93bj17dGhpcy5ibG9ja0V2ZW50fVxuXHRcdFx0XHRvbkNsaWNrPXt0aGlzLmJsb2NrRXZlbnR9PlxuXHRcdFx0XHR7dGhpcy5wcm9wcy5jaGlsZHJlbn1cblx0XHRcdDwvZGl2PlxuXHRcdCkgOiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lfVxuXHRcdFx0XHRzdHlsZT17b3B0aW9uLnN0eWxlfVxuXHRcdFx0XHRyb2xlPVwib3B0aW9uXCJcblx0XHRcdFx0IG9uTW91c2VEb3duPXt0aGlzLmhhbmRsZU1vdXNlRG93bn1cblx0XHRcdFx0b25Nb3VzZUVudGVyPXt0aGlzLmhhbmRsZU1vdXNlRW50ZXJ9XG5cdFx0XHRcdG9uTW91c2VNb3ZlPXt0aGlzLmhhbmRsZU1vdXNlTW92ZX1cblx0XHRcdFx0b25Ub3VjaFN0YXJ0PXt0aGlzLmhhbmRsZVRvdWNoU3RhcnR9XG5cdFx0XHRcdG9uVG91Y2hNb3ZlPXt0aGlzLmhhbmRsZVRvdWNoTW92ZX1cblx0XHRcdFx0b25Ub3VjaEVuZD17dGhpcy5oYW5kbGVUb3VjaEVuZH1cblx0XHRcdFx0aWQ9e2luc3RhbmNlUHJlZml4ICsgJy1vcHRpb24tJyArIG9wdGlvbkluZGV4fVxuXHRcdFx0XHR0aXRsZT17b3B0aW9uLnRpdGxlfT5cblx0XHRcdFx0e3RoaXMucHJvcHMuY2hpbGRyZW59XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBPcHRpb247XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmNvbnN0IFZhbHVlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG5cdGRpc3BsYXlOYW1lOiAnVmFsdWUnLFxuXG5cdHByb3BUeXBlczoge1xuXHRcdGNoaWxkcmVuOiBSZWFjdC5Qcm9wVHlwZXMubm9kZSxcblx0XHRkaXNhYmxlZDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAgICAgLy8gZGlzYWJsZWQgcHJvcCBwYXNzZWQgdG8gUmVhY3RTZWxlY3Rcblx0XHRpZDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAgICAgICAgICAgLy8gVW5pcXVlIGlkIGZvciB0aGUgdmFsdWUgLSB1c2VkIGZvciBhcmlhXG5cdFx0b25DbGljazogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgICAgIC8vIG1ldGhvZCB0byBoYW5kbGUgY2xpY2sgb24gdmFsdWUgbGFiZWxcblx0XHRvblJlbW92ZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgICAgLy8gbWV0aG9kIHRvIGhhbmRsZSByZW1vdmFsIG9mIHRoZSB2YWx1ZVxuXHRcdHZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsICAgICAvLyB0aGUgb3B0aW9uIG9iamVjdCBmb3IgdGhpcyB2YWx1ZVxuXHR9LFxuXG5cdGhhbmRsZU1vdXNlRG93biAoZXZlbnQpIHtcblx0XHRpZiAoZXZlbnQudHlwZSA9PT0gJ21vdXNlZG93bicgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmICh0aGlzLnByb3BzLm9uQ2xpY2spIHtcblx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0dGhpcy5wcm9wcy5vbkNsaWNrKHRoaXMucHJvcHMudmFsdWUsIGV2ZW50KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKHRoaXMucHJvcHMudmFsdWUuaHJlZikge1xuXHRcdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0fVxuXHR9LFxuXG5cdG9uUmVtb3ZlIChldmVudCkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0dGhpcy5wcm9wcy5vblJlbW92ZSh0aGlzLnByb3BzLnZhbHVlKTtcblx0fSxcblxuXHRoYW5kbGVUb3VjaEVuZFJlbW92ZSAoZXZlbnQpe1xuXHRcdC8vIENoZWNrIGlmIHRoZSB2aWV3IGlzIGJlaW5nIGRyYWdnZWQsIEluIHRoaXMgY2FzZVxuXHRcdC8vIHdlIGRvbid0IHdhbnQgdG8gZmlyZSB0aGUgY2xpY2sgZXZlbnQgKGJlY2F1c2UgdGhlIHVzZXIgb25seSB3YW50cyB0byBzY3JvbGwpXG5cdFx0aWYodGhpcy5kcmFnZ2luZykgcmV0dXJuO1xuXG5cdFx0Ly8gRmlyZSB0aGUgbW91c2UgZXZlbnRzXG5cdFx0dGhpcy5vblJlbW92ZShldmVudCk7XG5cdH0sXG5cblx0aGFuZGxlVG91Y2hNb3ZlIChldmVudCkge1xuXHRcdC8vIFNldCBhIGZsYWcgdGhhdCB0aGUgdmlldyBpcyBiZWluZyBkcmFnZ2VkXG5cdFx0dGhpcy5kcmFnZ2luZyA9IHRydWU7XG5cdH0sXG5cblx0aGFuZGxlVG91Y2hTdGFydCAoZXZlbnQpIHtcblx0XHQvLyBTZXQgYSBmbGFnIHRoYXQgdGhlIHZpZXcgaXMgbm90IGJlaW5nIGRyYWdnZWRcblx0XHR0aGlzLmRyYWdnaW5nID0gZmFsc2U7XG5cdH0sXG5cblx0cmVuZGVyUmVtb3ZlSWNvbiAoKSB7XG5cdFx0aWYgKHRoaXMucHJvcHMuZGlzYWJsZWQgfHwgIXRoaXMucHJvcHMub25SZW1vdmUpIHJldHVybjtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwiU2VsZWN0LXZhbHVlLWljb25cIlxuXHRcdFx0XHRhcmlhLWhpZGRlbj1cInRydWVcIlxuXHRcdFx0XHRvbk1vdXNlRG93bj17dGhpcy5vblJlbW92ZX1cblx0XHRcdFx0b25Ub3VjaEVuZD17dGhpcy5oYW5kbGVUb3VjaEVuZFJlbW92ZX1cblx0XHRcdFx0b25Ub3VjaFN0YXJ0PXt0aGlzLmhhbmRsZVRvdWNoU3RhcnR9XG5cdFx0XHRcdG9uVG91Y2hNb3ZlPXt0aGlzLmhhbmRsZVRvdWNoTW92ZX0+XG5cdFx0XHRcdCZ0aW1lcztcblx0XHRcdDwvc3Bhbj5cblx0XHQpO1xuXHR9LFxuXG5cdHJlbmRlckxhYmVsICgpIHtcblx0XHRsZXQgY2xhc3NOYW1lID0gJ1NlbGVjdC12YWx1ZS1sYWJlbCc7XG5cdFx0cmV0dXJuIHRoaXMucHJvcHMub25DbGljayB8fCB0aGlzLnByb3BzLnZhbHVlLmhyZWYgPyAoXG5cdFx0XHQ8YSBjbGFzc05hbWU9e2NsYXNzTmFtZX0gaHJlZj17dGhpcy5wcm9wcy52YWx1ZS5ocmVmfSB0YXJnZXQ9e3RoaXMucHJvcHMudmFsdWUudGFyZ2V0fSBvbk1vdXNlRG93bj17dGhpcy5oYW5kbGVNb3VzZURvd259IG9uVG91Y2hFbmQ9e3RoaXMuaGFuZGxlTW91c2VEb3dufT5cblx0XHRcdFx0e3RoaXMucHJvcHMuY2hpbGRyZW59XG5cdFx0XHQ8L2E+XG5cdFx0KSA6IChcblx0XHRcdDxzcGFuIGNsYXNzTmFtZT17Y2xhc3NOYW1lfSByb2xlPVwib3B0aW9uXCIgYXJpYS1zZWxlY3RlZD1cInRydWVcIiBpZD17dGhpcy5wcm9wcy5pZH0+XG5cdFx0XHRcdHt0aGlzLnByb3BzLmNoaWxkcmVufVxuXHRcdFx0PC9zcGFuPlxuXHRcdCk7XG5cdH0sXG5cblx0cmVuZGVyICgpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9e2NsYXNzTmFtZXMoJ1NlbGVjdC12YWx1ZScsIHRoaXMucHJvcHMudmFsdWUuY2xhc3NOYW1lKX1cblx0XHRcdFx0c3R5bGU9e3RoaXMucHJvcHMudmFsdWUuc3R5bGV9XG5cdFx0XHRcdHRpdGxlPXt0aGlzLnByb3BzLnZhbHVlLnRpdGxlfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdHt0aGlzLnJlbmRlclJlbW92ZUljb24oKX1cblx0XHRcdFx0e3RoaXMucmVuZGVyTGFiZWwoKX1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVmFsdWU7XG4iLCJ2YXIgbWFwID0gW1xuXHR7ICdiYXNlJzonQScsICdsZXR0ZXJzJzovW1xcdTAwNDFcXHUyNEI2XFx1RkYyMVxcdTAwQzBcXHUwMEMxXFx1MDBDMlxcdTFFQTZcXHUxRUE0XFx1MUVBQVxcdTFFQThcXHUwMEMzXFx1MDEwMFxcdTAxMDJcXHUxRUIwXFx1MUVBRVxcdTFFQjRcXHUxRUIyXFx1MDIyNlxcdTAxRTBcXHUwMEM0XFx1MDFERVxcdTFFQTJcXHUwMEM1XFx1MDFGQVxcdTAxQ0RcXHUwMjAwXFx1MDIwMlxcdTFFQTBcXHUxRUFDXFx1MUVCNlxcdTFFMDBcXHUwMTA0XFx1MDIzQVxcdTJDNkZdL2cgfSxcblx0eyAnYmFzZSc6J0FBJywnbGV0dGVycyc6L1tcXHVBNzMyXS9nIH0sXG5cdHsgJ2Jhc2UnOidBRScsJ2xldHRlcnMnOi9bXFx1MDBDNlxcdTAxRkNcXHUwMUUyXS9nIH0sXG5cdHsgJ2Jhc2UnOidBTycsJ2xldHRlcnMnOi9bXFx1QTczNF0vZyB9LFxuXHR7ICdiYXNlJzonQVUnLCdsZXR0ZXJzJzovW1xcdUE3MzZdL2cgfSxcblx0eyAnYmFzZSc6J0FWJywnbGV0dGVycyc6L1tcXHVBNzM4XFx1QTczQV0vZyB9LFxuXHR7ICdiYXNlJzonQVknLCdsZXR0ZXJzJzovW1xcdUE3M0NdL2cgfSxcblx0eyAnYmFzZSc6J0InLCAnbGV0dGVycyc6L1tcXHUwMDQyXFx1MjRCN1xcdUZGMjJcXHUxRTAyXFx1MUUwNFxcdTFFMDZcXHUwMjQzXFx1MDE4MlxcdTAxODFdL2cgfSxcblx0eyAnYmFzZSc6J0MnLCAnbGV0dGVycyc6L1tcXHUwMDQzXFx1MjRCOFxcdUZGMjNcXHUwMTA2XFx1MDEwOFxcdTAxMEFcXHUwMTBDXFx1MDBDN1xcdTFFMDhcXHUwMTg3XFx1MDIzQlxcdUE3M0VdL2cgfSxcblx0eyAnYmFzZSc6J0QnLCAnbGV0dGVycyc6L1tcXHUwMDQ0XFx1MjRCOVxcdUZGMjRcXHUxRTBBXFx1MDEwRVxcdTFFMENcXHUxRTEwXFx1MUUxMlxcdTFFMEVcXHUwMTEwXFx1MDE4QlxcdTAxOEFcXHUwMTg5XFx1QTc3OV0vZyB9LFxuXHR7ICdiYXNlJzonRFonLCdsZXR0ZXJzJzovW1xcdTAxRjFcXHUwMUM0XS9nIH0sXG5cdHsgJ2Jhc2UnOidEeicsJ2xldHRlcnMnOi9bXFx1MDFGMlxcdTAxQzVdL2cgfSxcblx0eyAnYmFzZSc6J0UnLCAnbGV0dGVycyc6L1tcXHUwMDQ1XFx1MjRCQVxcdUZGMjVcXHUwMEM4XFx1MDBDOVxcdTAwQ0FcXHUxRUMwXFx1MUVCRVxcdTFFQzRcXHUxRUMyXFx1MUVCQ1xcdTAxMTJcXHUxRTE0XFx1MUUxNlxcdTAxMTRcXHUwMTE2XFx1MDBDQlxcdTFFQkFcXHUwMTFBXFx1MDIwNFxcdTAyMDZcXHUxRUI4XFx1MUVDNlxcdTAyMjhcXHUxRTFDXFx1MDExOFxcdTFFMThcXHUxRTFBXFx1MDE5MFxcdTAxOEVdL2cgfSxcblx0eyAnYmFzZSc6J0YnLCAnbGV0dGVycyc6L1tcXHUwMDQ2XFx1MjRCQlxcdUZGMjZcXHUxRTFFXFx1MDE5MVxcdUE3N0JdL2cgfSxcblx0eyAnYmFzZSc6J0cnLCAnbGV0dGVycyc6L1tcXHUwMDQ3XFx1MjRCQ1xcdUZGMjdcXHUwMUY0XFx1MDExQ1xcdTFFMjBcXHUwMTFFXFx1MDEyMFxcdTAxRTZcXHUwMTIyXFx1MDFFNFxcdTAxOTNcXHVBN0EwXFx1QTc3RFxcdUE3N0VdL2cgfSxcblx0eyAnYmFzZSc6J0gnLCAnbGV0dGVycyc6L1tcXHUwMDQ4XFx1MjRCRFxcdUZGMjhcXHUwMTI0XFx1MUUyMlxcdTFFMjZcXHUwMjFFXFx1MUUyNFxcdTFFMjhcXHUxRTJBXFx1MDEyNlxcdTJDNjdcXHUyQzc1XFx1QTc4RF0vZyB9LFxuXHR7ICdiYXNlJzonSScsICdsZXR0ZXJzJzovW1xcdTAwNDlcXHUyNEJFXFx1RkYyOVxcdTAwQ0NcXHUwMENEXFx1MDBDRVxcdTAxMjhcXHUwMTJBXFx1MDEyQ1xcdTAxMzBcXHUwMENGXFx1MUUyRVxcdTFFQzhcXHUwMUNGXFx1MDIwOFxcdTAyMEFcXHUxRUNBXFx1MDEyRVxcdTFFMkNcXHUwMTk3XS9nIH0sXG5cdHsgJ2Jhc2UnOidKJywgJ2xldHRlcnMnOi9bXFx1MDA0QVxcdTI0QkZcXHVGRjJBXFx1MDEzNFxcdTAyNDhdL2cgfSxcblx0eyAnYmFzZSc6J0snLCAnbGV0dGVycyc6L1tcXHUwMDRCXFx1MjRDMFxcdUZGMkJcXHUxRTMwXFx1MDFFOFxcdTFFMzJcXHUwMTM2XFx1MUUzNFxcdTAxOThcXHUyQzY5XFx1QTc0MFxcdUE3NDJcXHVBNzQ0XFx1QTdBMl0vZyB9LFxuXHR7ICdiYXNlJzonTCcsICdsZXR0ZXJzJzovW1xcdTAwNENcXHUyNEMxXFx1RkYyQ1xcdTAxM0ZcXHUwMTM5XFx1MDEzRFxcdTFFMzZcXHUxRTM4XFx1MDEzQlxcdTFFM0NcXHUxRTNBXFx1MDE0MVxcdTAyM0RcXHUyQzYyXFx1MkM2MFxcdUE3NDhcXHVBNzQ2XFx1QTc4MF0vZyB9LFxuXHR7ICdiYXNlJzonTEonLCdsZXR0ZXJzJzovW1xcdTAxQzddL2cgfSxcblx0eyAnYmFzZSc6J0xqJywnbGV0dGVycyc6L1tcXHUwMUM4XS9nIH0sXG5cdHsgJ2Jhc2UnOidNJywgJ2xldHRlcnMnOi9bXFx1MDA0RFxcdTI0QzJcXHVGRjJEXFx1MUUzRVxcdTFFNDBcXHUxRTQyXFx1MkM2RVxcdTAxOUNdL2cgfSxcblx0eyAnYmFzZSc6J04nLCAnbGV0dGVycyc6L1tcXHUwMDRFXFx1MjRDM1xcdUZGMkVcXHUwMUY4XFx1MDE0M1xcdTAwRDFcXHUxRTQ0XFx1MDE0N1xcdTFFNDZcXHUwMTQ1XFx1MUU0QVxcdTFFNDhcXHUwMjIwXFx1MDE5RFxcdUE3OTBcXHVBN0E0XS9nIH0sXG5cdHsgJ2Jhc2UnOidOSicsJ2xldHRlcnMnOi9bXFx1MDFDQV0vZyB9LFxuXHR7ICdiYXNlJzonTmonLCdsZXR0ZXJzJzovW1xcdTAxQ0JdL2cgfSxcblx0eyAnYmFzZSc6J08nLCAnbGV0dGVycyc6L1tcXHUwMDRGXFx1MjRDNFxcdUZGMkZcXHUwMEQyXFx1MDBEM1xcdTAwRDRcXHUxRUQyXFx1MUVEMFxcdTFFRDZcXHUxRUQ0XFx1MDBENVxcdTFFNENcXHUwMjJDXFx1MUU0RVxcdTAxNENcXHUxRTUwXFx1MUU1MlxcdTAxNEVcXHUwMjJFXFx1MDIzMFxcdTAwRDZcXHUwMjJBXFx1MUVDRVxcdTAxNTBcXHUwMUQxXFx1MDIwQ1xcdTAyMEVcXHUwMUEwXFx1MUVEQ1xcdTFFREFcXHUxRUUwXFx1MUVERVxcdTFFRTJcXHUxRUNDXFx1MUVEOFxcdTAxRUFcXHUwMUVDXFx1MDBEOFxcdTAxRkVcXHUwMTg2XFx1MDE5RlxcdUE3NEFcXHVBNzRDXS9nIH0sXG5cdHsgJ2Jhc2UnOidPSScsJ2xldHRlcnMnOi9bXFx1MDFBMl0vZyB9LFxuXHR7ICdiYXNlJzonT08nLCdsZXR0ZXJzJzovW1xcdUE3NEVdL2cgfSxcblx0eyAnYmFzZSc6J09VJywnbGV0dGVycyc6L1tcXHUwMjIyXS9nIH0sXG5cdHsgJ2Jhc2UnOidQJywgJ2xldHRlcnMnOi9bXFx1MDA1MFxcdTI0QzVcXHVGRjMwXFx1MUU1NFxcdTFFNTZcXHUwMUE0XFx1MkM2M1xcdUE3NTBcXHVBNzUyXFx1QTc1NF0vZyB9LFxuXHR7ICdiYXNlJzonUScsICdsZXR0ZXJzJzovW1xcdTAwNTFcXHUyNEM2XFx1RkYzMVxcdUE3NTZcXHVBNzU4XFx1MDI0QV0vZyB9LFxuXHR7ICdiYXNlJzonUicsICdsZXR0ZXJzJzovW1xcdTAwNTJcXHUyNEM3XFx1RkYzMlxcdTAxNTRcXHUxRTU4XFx1MDE1OFxcdTAyMTBcXHUwMjEyXFx1MUU1QVxcdTFFNUNcXHUwMTU2XFx1MUU1RVxcdTAyNENcXHUyQzY0XFx1QTc1QVxcdUE3QTZcXHVBNzgyXS9nIH0sXG5cdHsgJ2Jhc2UnOidTJywgJ2xldHRlcnMnOi9bXFx1MDA1M1xcdTI0QzhcXHVGRjMzXFx1MUU5RVxcdTAxNUFcXHUxRTY0XFx1MDE1Q1xcdTFFNjBcXHUwMTYwXFx1MUU2NlxcdTFFNjJcXHUxRTY4XFx1MDIxOFxcdTAxNUVcXHUyQzdFXFx1QTdBOFxcdUE3ODRdL2cgfSxcblx0eyAnYmFzZSc6J1QnLCAnbGV0dGVycyc6L1tcXHUwMDU0XFx1MjRDOVxcdUZGMzRcXHUxRTZBXFx1MDE2NFxcdTFFNkNcXHUwMjFBXFx1MDE2MlxcdTFFNzBcXHUxRTZFXFx1MDE2NlxcdTAxQUNcXHUwMUFFXFx1MDIzRVxcdUE3ODZdL2cgfSxcblx0eyAnYmFzZSc6J1RaJywnbGV0dGVycyc6L1tcXHVBNzI4XS9nIH0sXG5cdHsgJ2Jhc2UnOidVJywgJ2xldHRlcnMnOi9bXFx1MDA1NVxcdTI0Q0FcXHVGRjM1XFx1MDBEOVxcdTAwREFcXHUwMERCXFx1MDE2OFxcdTFFNzhcXHUwMTZBXFx1MUU3QVxcdTAxNkNcXHUwMERDXFx1MDFEQlxcdTAxRDdcXHUwMUQ1XFx1MDFEOVxcdTFFRTZcXHUwMTZFXFx1MDE3MFxcdTAxRDNcXHUwMjE0XFx1MDIxNlxcdTAxQUZcXHUxRUVBXFx1MUVFOFxcdTFFRUVcXHUxRUVDXFx1MUVGMFxcdTFFRTRcXHUxRTcyXFx1MDE3MlxcdTFFNzZcXHUxRTc0XFx1MDI0NF0vZyB9LFxuXHR7ICdiYXNlJzonVicsICdsZXR0ZXJzJzovW1xcdTAwNTZcXHUyNENCXFx1RkYzNlxcdTFFN0NcXHUxRTdFXFx1MDFCMlxcdUE3NUVcXHUwMjQ1XS9nIH0sXG5cdHsgJ2Jhc2UnOidWWScsJ2xldHRlcnMnOi9bXFx1QTc2MF0vZyB9LFxuXHR7ICdiYXNlJzonVycsICdsZXR0ZXJzJzovW1xcdTAwNTdcXHUyNENDXFx1RkYzN1xcdTFFODBcXHUxRTgyXFx1MDE3NFxcdTFFODZcXHUxRTg0XFx1MUU4OFxcdTJDNzJdL2cgfSxcblx0eyAnYmFzZSc6J1gnLCAnbGV0dGVycyc6L1tcXHUwMDU4XFx1MjRDRFxcdUZGMzhcXHUxRThBXFx1MUU4Q10vZyB9LFxuXHR7ICdiYXNlJzonWScsICdsZXR0ZXJzJzovW1xcdTAwNTlcXHUyNENFXFx1RkYzOVxcdTFFRjJcXHUwMEREXFx1MDE3NlxcdTFFRjhcXHUwMjMyXFx1MUU4RVxcdTAxNzhcXHUxRUY2XFx1MUVGNFxcdTAxQjNcXHUwMjRFXFx1MUVGRV0vZyB9LFxuXHR7ICdiYXNlJzonWicsICdsZXR0ZXJzJzovW1xcdTAwNUFcXHUyNENGXFx1RkYzQVxcdTAxNzlcXHUxRTkwXFx1MDE3QlxcdTAxN0RcXHUxRTkyXFx1MUU5NFxcdTAxQjVcXHUwMjI0XFx1MkM3RlxcdTJDNkJcXHVBNzYyXS9nIH0sXG5cdHsgJ2Jhc2UnOidhJywgJ2xldHRlcnMnOi9bXFx1MDA2MVxcdTI0RDBcXHVGRjQxXFx1MUU5QVxcdTAwRTBcXHUwMEUxXFx1MDBFMlxcdTFFQTdcXHUxRUE1XFx1MUVBQlxcdTFFQTlcXHUwMEUzXFx1MDEwMVxcdTAxMDNcXHUxRUIxXFx1MUVBRlxcdTFFQjVcXHUxRUIzXFx1MDIyN1xcdTAxRTFcXHUwMEU0XFx1MDFERlxcdTFFQTNcXHUwMEU1XFx1MDFGQlxcdTAxQ0VcXHUwMjAxXFx1MDIwM1xcdTFFQTFcXHUxRUFEXFx1MUVCN1xcdTFFMDFcXHUwMTA1XFx1MkM2NVxcdTAyNTBdL2cgfSxcblx0eyAnYmFzZSc6J2FhJywnbGV0dGVycyc6L1tcXHVBNzMzXS9nIH0sXG5cdHsgJ2Jhc2UnOidhZScsJ2xldHRlcnMnOi9bXFx1MDBFNlxcdTAxRkRcXHUwMUUzXS9nIH0sXG5cdHsgJ2Jhc2UnOidhbycsJ2xldHRlcnMnOi9bXFx1QTczNV0vZyB9LFxuXHR7ICdiYXNlJzonYXUnLCdsZXR0ZXJzJzovW1xcdUE3MzddL2cgfSxcblx0eyAnYmFzZSc6J2F2JywnbGV0dGVycyc6L1tcXHVBNzM5XFx1QTczQl0vZyB9LFxuXHR7ICdiYXNlJzonYXknLCdsZXR0ZXJzJzovW1xcdUE3M0RdL2cgfSxcblx0eyAnYmFzZSc6J2InLCAnbGV0dGVycyc6L1tcXHUwMDYyXFx1MjREMVxcdUZGNDJcXHUxRTAzXFx1MUUwNVxcdTFFMDdcXHUwMTgwXFx1MDE4M1xcdTAyNTNdL2cgfSxcblx0eyAnYmFzZSc6J2MnLCAnbGV0dGVycyc6L1tcXHUwMDYzXFx1MjREMlxcdUZGNDNcXHUwMTA3XFx1MDEwOVxcdTAxMEJcXHUwMTBEXFx1MDBFN1xcdTFFMDlcXHUwMTg4XFx1MDIzQ1xcdUE3M0ZcXHUyMTg0XS9nIH0sXG5cdHsgJ2Jhc2UnOidkJywgJ2xldHRlcnMnOi9bXFx1MDA2NFxcdTI0RDNcXHVGRjQ0XFx1MUUwQlxcdTAxMEZcXHUxRTBEXFx1MUUxMVxcdTFFMTNcXHUxRTBGXFx1MDExMVxcdTAxOENcXHUwMjU2XFx1MDI1N1xcdUE3N0FdL2cgfSxcblx0eyAnYmFzZSc6J2R6JywnbGV0dGVycyc6L1tcXHUwMUYzXFx1MDFDNl0vZyB9LFxuXHR7ICdiYXNlJzonZScsICdsZXR0ZXJzJzovW1xcdTAwNjVcXHUyNEQ0XFx1RkY0NVxcdTAwRThcXHUwMEU5XFx1MDBFQVxcdTFFQzFcXHUxRUJGXFx1MUVDNVxcdTFFQzNcXHUxRUJEXFx1MDExM1xcdTFFMTVcXHUxRTE3XFx1MDExNVxcdTAxMTdcXHUwMEVCXFx1MUVCQlxcdTAxMUJcXHUwMjA1XFx1MDIwN1xcdTFFQjlcXHUxRUM3XFx1MDIyOVxcdTFFMURcXHUwMTE5XFx1MUUxOVxcdTFFMUJcXHUwMjQ3XFx1MDI1QlxcdTAxRERdL2cgfSxcblx0eyAnYmFzZSc6J2YnLCAnbGV0dGVycyc6L1tcXHUwMDY2XFx1MjRENVxcdUZGNDZcXHUxRTFGXFx1MDE5MlxcdUE3N0NdL2cgfSxcblx0eyAnYmFzZSc6J2cnLCAnbGV0dGVycyc6L1tcXHUwMDY3XFx1MjRENlxcdUZGNDdcXHUwMUY1XFx1MDExRFxcdTFFMjFcXHUwMTFGXFx1MDEyMVxcdTAxRTdcXHUwMTIzXFx1MDFFNVxcdTAyNjBcXHVBN0ExXFx1MUQ3OVxcdUE3N0ZdL2cgfSxcblx0eyAnYmFzZSc6J2gnLCAnbGV0dGVycyc6L1tcXHUwMDY4XFx1MjREN1xcdUZGNDhcXHUwMTI1XFx1MUUyM1xcdTFFMjdcXHUwMjFGXFx1MUUyNVxcdTFFMjlcXHUxRTJCXFx1MUU5NlxcdTAxMjdcXHUyQzY4XFx1MkM3NlxcdTAyNjVdL2cgfSxcblx0eyAnYmFzZSc6J2h2JywnbGV0dGVycyc6L1tcXHUwMTk1XS9nIH0sXG5cdHsgJ2Jhc2UnOidpJywgJ2xldHRlcnMnOi9bXFx1MDA2OVxcdTI0RDhcXHVGRjQ5XFx1MDBFQ1xcdTAwRURcXHUwMEVFXFx1MDEyOVxcdTAxMkJcXHUwMTJEXFx1MDBFRlxcdTFFMkZcXHUxRUM5XFx1MDFEMFxcdTAyMDlcXHUwMjBCXFx1MUVDQlxcdTAxMkZcXHUxRTJEXFx1MDI2OFxcdTAxMzFdL2cgfSxcblx0eyAnYmFzZSc6J2onLCAnbGV0dGVycyc6L1tcXHUwMDZBXFx1MjREOVxcdUZGNEFcXHUwMTM1XFx1MDFGMFxcdTAyNDldL2cgfSxcblx0eyAnYmFzZSc6J2snLCAnbGV0dGVycyc6L1tcXHUwMDZCXFx1MjREQVxcdUZGNEJcXHUxRTMxXFx1MDFFOVxcdTFFMzNcXHUwMTM3XFx1MUUzNVxcdTAxOTlcXHUyQzZBXFx1QTc0MVxcdUE3NDNcXHVBNzQ1XFx1QTdBM10vZyB9LFxuXHR7ICdiYXNlJzonbCcsICdsZXR0ZXJzJzovW1xcdTAwNkNcXHUyNERCXFx1RkY0Q1xcdTAxNDBcXHUwMTNBXFx1MDEzRVxcdTFFMzdcXHUxRTM5XFx1MDEzQ1xcdTFFM0RcXHUxRTNCXFx1MDE3RlxcdTAxNDJcXHUwMTlBXFx1MDI2QlxcdTJDNjFcXHVBNzQ5XFx1QTc4MVxcdUE3NDddL2cgfSxcblx0eyAnYmFzZSc6J2xqJywnbGV0dGVycyc6L1tcXHUwMUM5XS9nIH0sXG5cdHsgJ2Jhc2UnOidtJywgJ2xldHRlcnMnOi9bXFx1MDA2RFxcdTI0RENcXHVGRjREXFx1MUUzRlxcdTFFNDFcXHUxRTQzXFx1MDI3MVxcdTAyNkZdL2cgfSxcblx0eyAnYmFzZSc6J24nLCAnbGV0dGVycyc6L1tcXHUwMDZFXFx1MjRERFxcdUZGNEVcXHUwMUY5XFx1MDE0NFxcdTAwRjFcXHUxRTQ1XFx1MDE0OFxcdTFFNDdcXHUwMTQ2XFx1MUU0QlxcdTFFNDlcXHUwMTlFXFx1MDI3MlxcdTAxNDlcXHVBNzkxXFx1QTdBNV0vZyB9LFxuXHR7ICdiYXNlJzonbmonLCdsZXR0ZXJzJzovW1xcdTAxQ0NdL2cgfSxcblx0eyAnYmFzZSc6J28nLCAnbGV0dGVycyc6L1tcXHUwMDZGXFx1MjRERVxcdUZGNEZcXHUwMEYyXFx1MDBGM1xcdTAwRjRcXHUxRUQzXFx1MUVEMVxcdTFFRDdcXHUxRUQ1XFx1MDBGNVxcdTFFNERcXHUwMjJEXFx1MUU0RlxcdTAxNERcXHUxRTUxXFx1MUU1M1xcdTAxNEZcXHUwMjJGXFx1MDIzMVxcdTAwRjZcXHUwMjJCXFx1MUVDRlxcdTAxNTFcXHUwMUQyXFx1MDIwRFxcdTAyMEZcXHUwMUExXFx1MUVERFxcdTFFREJcXHUxRUUxXFx1MUVERlxcdTFFRTNcXHUxRUNEXFx1MUVEOVxcdTAxRUJcXHUwMUVEXFx1MDBGOFxcdTAxRkZcXHUwMjU0XFx1QTc0QlxcdUE3NERcXHUwMjc1XS9nIH0sXG5cdHsgJ2Jhc2UnOidvaScsJ2xldHRlcnMnOi9bXFx1MDFBM10vZyB9LFxuXHR7ICdiYXNlJzonb3UnLCdsZXR0ZXJzJzovW1xcdTAyMjNdL2cgfSxcblx0eyAnYmFzZSc6J29vJywnbGV0dGVycyc6L1tcXHVBNzRGXS9nIH0sXG5cdHsgJ2Jhc2UnOidwJywgJ2xldHRlcnMnOi9bXFx1MDA3MFxcdTI0REZcXHVGRjUwXFx1MUU1NVxcdTFFNTdcXHUwMUE1XFx1MUQ3RFxcdUE3NTFcXHVBNzUzXFx1QTc1NV0vZyB9LFxuXHR7ICdiYXNlJzoncScsICdsZXR0ZXJzJzovW1xcdTAwNzFcXHUyNEUwXFx1RkY1MVxcdTAyNEJcXHVBNzU3XFx1QTc1OV0vZyB9LFxuXHR7ICdiYXNlJzoncicsICdsZXR0ZXJzJzovW1xcdTAwNzJcXHUyNEUxXFx1RkY1MlxcdTAxNTVcXHUxRTU5XFx1MDE1OVxcdTAyMTFcXHUwMjEzXFx1MUU1QlxcdTFFNURcXHUwMTU3XFx1MUU1RlxcdTAyNERcXHUwMjdEXFx1QTc1QlxcdUE3QTdcXHVBNzgzXS9nIH0sXG5cdHsgJ2Jhc2UnOidzJywgJ2xldHRlcnMnOi9bXFx1MDA3M1xcdTI0RTJcXHVGRjUzXFx1MDBERlxcdTAxNUJcXHUxRTY1XFx1MDE1RFxcdTFFNjFcXHUwMTYxXFx1MUU2N1xcdTFFNjNcXHUxRTY5XFx1MDIxOVxcdTAxNUZcXHUwMjNGXFx1QTdBOVxcdUE3ODVcXHUxRTlCXS9nIH0sXG5cdHsgJ2Jhc2UnOid0JywgJ2xldHRlcnMnOi9bXFx1MDA3NFxcdTI0RTNcXHVGRjU0XFx1MUU2QlxcdTFFOTdcXHUwMTY1XFx1MUU2RFxcdTAyMUJcXHUwMTYzXFx1MUU3MVxcdTFFNkZcXHUwMTY3XFx1MDFBRFxcdTAyODhcXHUyQzY2XFx1QTc4N10vZyB9LFxuXHR7ICdiYXNlJzondHonLCdsZXR0ZXJzJzovW1xcdUE3MjldL2cgfSxcblx0eyAnYmFzZSc6J3UnLCAnbGV0dGVycyc6L1tcXHUwMDc1XFx1MjRFNFxcdUZGNTVcXHUwMEY5XFx1MDBGQVxcdTAwRkJcXHUwMTY5XFx1MUU3OVxcdTAxNkJcXHUxRTdCXFx1MDE2RFxcdTAwRkNcXHUwMURDXFx1MDFEOFxcdTAxRDZcXHUwMURBXFx1MUVFN1xcdTAxNkZcXHUwMTcxXFx1MDFENFxcdTAyMTVcXHUwMjE3XFx1MDFCMFxcdTFFRUJcXHUxRUU5XFx1MUVFRlxcdTFFRURcXHUxRUYxXFx1MUVFNVxcdTFFNzNcXHUwMTczXFx1MUU3N1xcdTFFNzVcXHUwMjg5XS9nIH0sXG5cdHsgJ2Jhc2UnOid2JywgJ2xldHRlcnMnOi9bXFx1MDA3NlxcdTI0RTVcXHVGRjU2XFx1MUU3RFxcdTFFN0ZcXHUwMjhCXFx1QTc1RlxcdTAyOENdL2cgfSxcblx0eyAnYmFzZSc6J3Z5JywnbGV0dGVycyc6L1tcXHVBNzYxXS9nIH0sXG5cdHsgJ2Jhc2UnOid3JywgJ2xldHRlcnMnOi9bXFx1MDA3N1xcdTI0RTZcXHVGRjU3XFx1MUU4MVxcdTFFODNcXHUwMTc1XFx1MUU4N1xcdTFFODVcXHUxRTk4XFx1MUU4OVxcdTJDNzNdL2cgfSxcblx0eyAnYmFzZSc6J3gnLCAnbGV0dGVycyc6L1tcXHUwMDc4XFx1MjRFN1xcdUZGNThcXHUxRThCXFx1MUU4RF0vZyB9LFxuXHR7ICdiYXNlJzoneScsICdsZXR0ZXJzJzovW1xcdTAwNzlcXHUyNEU4XFx1RkY1OVxcdTFFRjNcXHUwMEZEXFx1MDE3N1xcdTFFRjlcXHUwMjMzXFx1MUU4RlxcdTAwRkZcXHUxRUY3XFx1MUU5OVxcdTFFRjVcXHUwMUI0XFx1MDI0RlxcdTFFRkZdL2cgfSxcblx0eyAnYmFzZSc6J3onLCAnbGV0dGVycyc6L1tcXHUwMDdBXFx1MjRFOVxcdUZGNUFcXHUwMTdBXFx1MUU5MVxcdTAxN0NcXHUwMTdFXFx1MUU5M1xcdTFFOTVcXHUwMUI2XFx1MDIyNVxcdTAyNDBcXHUyQzZDXFx1QTc2M10vZyB9LFxuXTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzdHJpcERpYWNyaXRpY3MgKHN0cikge1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IG1hcC5sZW5ndGg7IGkrKykge1xuXHRcdHN0ciA9IHN0ci5yZXBsYWNlKG1hcFtpXS5sZXR0ZXJzLCBtYXBbaV0uYmFzZSk7XG5cdH1cblx0cmV0dXJuIHN0cjtcbn07XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSc7XG5pbXBvcnQgSW5wdXQgZnJvbSAncmVhY3QtaW5wdXQtYXV0b3NpemUnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmltcG9ydCBzdHJpcERpYWNyaXRpY3MgZnJvbSAnLi91dGlscy9zdHJpcERpYWNyaXRpY3MnO1xuXG5pbXBvcnQgQXN5bmMgZnJvbSAnLi9Bc3luYyc7XG5pbXBvcnQgT3B0aW9uIGZyb20gJy4vT3B0aW9uJztcbmltcG9ydCBWYWx1ZSBmcm9tICcuL1ZhbHVlJztcblxuZnVuY3Rpb24gc3RyaW5naWZ5VmFsdWUgKHZhbHVlKSB7XG5cdGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG5cdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gdmFsdWU7XG5cdH1cbn1cblxuY29uc3Qgc3RyaW5nT3JOb2RlID0gUmVhY3QuUHJvcFR5cGVzLm9uZU9mVHlwZShbXG5cdFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG5cdFJlYWN0LlByb3BUeXBlcy5ub2RlXG5dKTtcblxubGV0IGluc3RhbmNlSWQgPSAxO1xuXG5jb25zdCBTZWxlY3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cblx0ZGlzcGxheU5hbWU6ICdTZWxlY3QnLFxuXG5cdHByb3BUeXBlczoge1xuXHRcdGFkZExhYmVsVGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgLy8gcGxhY2Vob2xkZXIgZGlzcGxheWVkIHdoZW4geW91IHdhbnQgdG8gYWRkIGEgbGFiZWwgb24gYSBtdWx0aS12YWx1ZSBpbnB1dFxuXHRcdGFsbG93Q3JlYXRlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgLy8gd2hldGhlciB0byBhbGxvdyBjcmVhdGlvbiBvZiBuZXcgZW50cmllc1xuXHRcdCdhcmlhLWxhYmVsJzogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcdFx0Ly8gQXJpYSBsYWJlbCAoZm9yIGFzc2lzdGl2ZSB0ZWNoKVxuXHRcdCdhcmlhLWxhYmVsbGVkYnknOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFx0Ly8gSFRNTCBJRCBvZiBhbiBlbGVtZW50IHRoYXQgc2hvdWxkIGJlIHVzZWQgYXMgdGhlIGxhYmVsIChmb3IgYXNzaXN0aXZlIHRlY2gpXG5cdFx0YXV0b0JsdXI6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgICAvLyBhdXRvbWF0aWNhbGx5IGJsdXIgdGhlIGNvbXBvbmVudCB3aGVuIGFuIG9wdGlvbiBpcyBzZWxlY3RlZFxuXHRcdGF1dG9mb2N1czogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAgLy8gYXV0b2ZvY3VzIHRoZSBjb21wb25lbnQgb24gbW91bnRcblx0XHRhdXRvc2l6ZTogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAgIC8vIHdoZXRoZXIgdG8gZW5hYmxlIGF1dG9zaXppbmcgb3Igbm90XG5cdFx0YmFja3NwYWNlUmVtb3ZlczogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAvLyB3aGV0aGVyIGJhY2tzcGFjZSByZW1vdmVzIGFuIGl0ZW0gaWYgdGhlcmUgaXMgbm8gdGV4dCBpbnB1dFxuXHRcdGJhY2tzcGFjZVRvUmVtb3ZlTWVzc2FnZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgIC8vIE1lc3NhZ2UgdG8gdXNlIGZvciBzY3JlZW5yZWFkZXJzIHRvIHByZXNzIGJhY2tzcGFjZSB0byByZW1vdmUgdGhlIGN1cnJlbnQgaXRlbSAtXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ICAgLy8ge2xhYmVsfSBpcyByZXBsYWNlZCB3aXRoIHRoZSBpdGVtIGxhYmVsXG5cdFx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgICAvLyBjbGFzc05hbWUgZm9yIHRoZSBvdXRlciBlbGVtZW50XG5cdFx0Y2xlYXJBbGxUZXh0OiBzdHJpbmdPck5vZGUsICAgICAgICAgICAgICAgICAvLyB0aXRsZSBmb3IgdGhlIFwiY2xlYXJcIiBjb250cm9sIHdoZW4gbXVsdGk6IHRydWVcblx0XHRjbGVhclZhbHVlVGV4dDogc3RyaW5nT3JOb2RlLCAgICAgICAgICAgICAgIC8vIHRpdGxlIGZvciB0aGUgXCJjbGVhclwiIGNvbnRyb2xcblx0XHRjbGVhcmFibGU6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgIC8vIHNob3VsZCBpdCBiZSBwb3NzaWJsZSB0byByZXNldCB2YWx1ZVxuXHRcdGRlbGltaXRlcjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAgLy8gZGVsaW1pdGVyIHRvIHVzZSB0byBqb2luIG11bHRpcGxlIHZhbHVlcyBmb3IgdGhlIGhpZGRlbiBmaWVsZCB2YWx1ZVxuXHRcdGRpc2FibGVkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgICAgLy8gd2hldGhlciB0aGUgU2VsZWN0IGlzIGRpc2FibGVkIG9yIG5vdFxuXHRcdGVzY2FwZUNsZWFyc1ZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgLy8gd2hldGhlciBlc2NhcGUgY2xlYXJzIHRoZSB2YWx1ZSB3aGVuIHRoZSBtZW51IGlzIGNsb3NlZFxuXHRcdGZpbHRlck9wdGlvbjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgLy8gbWV0aG9kIHRvIGZpbHRlciBhIHNpbmdsZSBvcHRpb24gKG9wdGlvbiwgZmlsdGVyU3RyaW5nKVxuXHRcdGZpbHRlck9wdGlvbnM6IFJlYWN0LlByb3BUeXBlcy5hbnksICAgICAgICAgLy8gYm9vbGVhbiB0byBlbmFibGUgZGVmYXVsdCBmaWx0ZXJpbmcgb3IgZnVuY3Rpb24gdG8gZmlsdGVyIHRoZSBvcHRpb25zIGFycmF5IChbb3B0aW9uc10sIGZpbHRlclN0cmluZywgW3ZhbHVlc10pXG5cdFx0aWdub3JlQWNjZW50czogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAvLyB3aGV0aGVyIHRvIHN0cmlwIGRpYWNyaXRpY3Mgd2hlbiBmaWx0ZXJpbmdcblx0XHRpZ25vcmVDYXNlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgIC8vIHdoZXRoZXIgdG8gcGVyZm9ybSBjYXNlLWluc2Vuc2l0aXZlIGZpbHRlcmluZ1xuXHRcdGlucHV0UHJvcHM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsICAgICAgICAgLy8gY3VzdG9tIGF0dHJpYnV0ZXMgZm9yIHRoZSBJbnB1dFxuXHRcdGlucHV0UmVuZGVyZXI6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgLy8gcmV0dXJucyBhIGN1c3RvbSBpbnB1dCBjb21wb25lbnRcblx0XHRpc0xvYWRpbmc6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgIC8vIHdoZXRoZXIgdGhlIFNlbGVjdCBpcyBsb2FkaW5nIGV4dGVybmFsbHkgb3Igbm90IChzdWNoIGFzIG9wdGlvbnMgYmVpbmcgbG9hZGVkKVxuXHRcdGpvaW5WYWx1ZXM6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgLy8gam9pbnMgbXVsdGlwbGUgdmFsdWVzIGludG8gYSBzaW5nbGUgZm9ybSBmaWVsZCB3aXRoIHRoZSBkZWxpbWl0ZXIgKGxlZ2FjeSBtb2RlKVxuXHRcdGxhYmVsS2V5OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgICAgLy8gcGF0aCBvZiB0aGUgbGFiZWwgdmFsdWUgaW4gb3B0aW9uIG9iamVjdHNcblx0XHRsaW1pdGVkOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFx0XHRcdFx0XHQgIC8vIGxpbWl0IHRoZSBudW1iZXIgb2YgaXRlbXMgaW4gdGhlIHRhYlxuXHRcdG1hdGNoUG9zOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgICAgLy8gKGFueXxzdGFydCkgbWF0Y2ggdGhlIHN0YXJ0IG9yIGVudGlyZSBzdHJpbmcgd2hlbiBmaWx0ZXJpbmdcblx0XHRtYXRjaFByb3A6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgIC8vIChhbnl8bGFiZWx8dmFsdWUpIHdoaWNoIG9wdGlvbiBwcm9wZXJ0eSB0byBmaWx0ZXIgb25cblx0XHRtZW51QnVmZmVyOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLCAgICAgICAgIC8vIG9wdGlvbmFsIGJ1ZmZlciAoaW4gcHgpIGJldHdlZW4gdGhlIGJvdHRvbSBvZiB0aGUgdmlld3BvcnQgYW5kIHRoZSBib3R0b20gb2YgdGhlIG1lbnVcblx0XHRtZW51Q29udGFpbmVyU3R5bGU6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsIC8vIG9wdGlvbmFsIHN0eWxlIHRvIGFwcGx5IHRvIHRoZSBtZW51IGNvbnRhaW5lclxuXHRcdG1lbnVSZW5kZXJlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgLy8gcmVuZGVycyBhIGN1c3RvbSBtZW51IHdpdGggb3B0aW9uc1xuXHRcdG1lbnVTdHlsZTogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCwgICAgICAgICAgLy8gb3B0aW9uYWwgc3R5bGUgdG8gYXBwbHkgdG8gdGhlIG1lbnVcblx0XHRtdWx0aTogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAgICAgIC8vIG11bHRpLXZhbHVlIGlucHV0XG5cdFx0bmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAgICAgICAvLyBnZW5lcmF0ZXMgYSBoaWRkZW4gPGlucHV0IC8+IHRhZyB3aXRoIHRoaXMgZmllbGQgbmFtZSBmb3IgaHRtbCBmb3Jtc1xuXHRcdG5ld09wdGlvbkNyZWF0b3I6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgLy8gZmFjdG9yeSB0byBjcmVhdGUgbmV3IG9wdGlvbnMgd2hlbiBhbGxvd0NyZWF0ZSBzZXRcblx0XHRub1Jlc3VsdHNUZXh0OiBzdHJpbmdPck5vZGUsICAgICAgICAgICAgICAgIC8vIHBsYWNlaG9sZGVyIGRpc3BsYXllZCB3aGVuIHRoZXJlIGFyZSBubyBtYXRjaGluZyBzZWFyY2ggcmVzdWx0c1xuXHRcdG9uQmx1cjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgICAgLy8gb25CbHVyIGhhbmRsZXI6IGZ1bmN0aW9uIChldmVudCkge31cblx0XHRvbkJsdXJSZXNldHNJbnB1dDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgIC8vIHdoZXRoZXIgaW5wdXQgaXMgY2xlYXJlZCBvbiBibHVyXG5cdFx0b25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgICAgICAvLyBvbkNoYW5nZSBoYW5kbGVyOiBmdW5jdGlvbiAobmV3VmFsdWUpIHt9XG5cdFx0b25DbG9zZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgICAvLyBmaXJlcyB3aGVuIHRoZSBtZW51IGlzIGNsb3NlZFxuXHRcdG9uRm9jdXM6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgICAgICAgLy8gb25Gb2N1cyBoYW5kbGVyOiBmdW5jdGlvbiAoZXZlbnQpIHt9XG5cdFx0b25JbnB1dENoYW5nZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAvLyBvbklucHV0Q2hhbmdlIGhhbmRsZXI6IGZ1bmN0aW9uIChpbnB1dFZhbHVlKSB7fVxuXHRcdG9uTWVudVNjcm9sbFRvQm90dG9tOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgLy8gZmlyZXMgd2hlbiB0aGUgbWVudSBpcyBzY3JvbGxlZCB0byB0aGUgYm90dG9tOyBjYW4gYmUgdXNlZCB0byBwYWdpbmF0ZSBvcHRpb25zXG5cdFx0b25PcGVuOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAgICAvLyBmaXJlcyB3aGVuIHRoZSBtZW51IGlzIG9wZW5lZFxuXHRcdG9uVmFsdWVDbGljazogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgLy8gb25DbGljayBoYW5kbGVyIGZvciB2YWx1ZSBsYWJlbHM6IGZ1bmN0aW9uICh2YWx1ZSwgZXZlbnQpIHt9XG5cdFx0b3BlbkFmdGVyRm9jdXM6IFJlYWN0LlByb3BUeXBlcy5ib29sLFx0XHQvLyBib29sZWFuIHRvIGVuYWJsZSBvcGVuaW5nIGRyb3Bkb3duIHdoZW4gZm9jdXNlZFxuXHRcdG9wZW5PbkZvY3VzOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgLy8gYWx3YXlzIG9wZW4gb3B0aW9ucyBtZW51IG9uIGZvY3VzXG5cdFx0b3B0aW9uQ2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAvLyBhZGRpdGlvbmFsIGNsYXNzKGVzKSB0byBhcHBseSB0byB0aGUgPE9wdGlvbiAvPiBlbGVtZW50c1xuXHRcdG9wdGlvbkNvbXBvbmVudDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgLy8gb3B0aW9uIGNvbXBvbmVudCB0byByZW5kZXIgaW4gZHJvcGRvd25cblx0XHRvcHRpb25SZW5kZXJlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgIC8vIG9wdGlvblJlbmRlcmVyOiBmdW5jdGlvbiAob3B0aW9uKSB7fVxuXHRcdG9wdGlvbnM6IFJlYWN0LlByb3BUeXBlcy5hcnJheSwgICAgICAgICAgICAgLy8gYXJyYXkgb2Ygb3B0aW9uc1xuXHRcdHBhZ2VTaXplOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLCAgICAgICAgICAgLy8gbnVtYmVyIG9mIGVudHJpZXMgdG8gcGFnZSB3aGVuIHVzaW5nIHBhZ2UgdXAvZG93biBrZXlzXG5cdFx0cGxhY2Vob2xkZXI6IHN0cmluZ09yTm9kZSwgICAgICAgICAgICAgICAgICAvLyBmaWVsZCBwbGFjZWhvbGRlciwgZGlzcGxheWVkIHdoZW4gdGhlcmUncyBubyB2YWx1ZVxuXHRcdHJlcXVpcmVkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgICAgLy8gYXBwbGllcyBIVE1MNSByZXF1aXJlZCBhdHRyaWJ1dGUgd2hlbiBuZWVkZWRcblx0XHRyZXNldFZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMuYW55LCAgICAgICAgICAgIC8vIHZhbHVlIHRvIHVzZSB3aGVuIHlvdSBjbGVhciB0aGUgY29udHJvbFxuXHRcdHNjcm9sbE1lbnVJbnRvVmlldzogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgLy8gYm9vbGVhbiB0byBlbmFibGUgdGhlIHZpZXdwb3J0IHRvIHNoaWZ0IHNvIHRoYXQgdGhlIGZ1bGwgbWVudSBmdWxseSB2aXNpYmxlIHdoZW4gZW5nYWdlZFxuXHRcdHNlYXJjaGFibGU6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgLy8gd2hldGhlciB0byBlbmFibGUgc2VhcmNoaW5nIGZlYXR1cmUgb3Igbm90XG5cdFx0c2ltcGxlVmFsdWU6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAvLyBwYXNzIHRoZSB2YWx1ZSB0byBvbkNoYW5nZSBhcyBhIHNpbXBsZSB2YWx1ZSAobGVnYWN5IHByZSAxLjAgbW9kZSksIGRlZmF1bHRzIHRvIGZhbHNlXG5cdFx0c3R5bGU6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsICAgICAgICAgICAgICAvLyBvcHRpb25hbCBzdHlsZSB0byBhcHBseSB0byB0aGUgY29udHJvbFxuXHRcdHRhYkluZGV4OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgICAgLy8gb3B0aW9uYWwgdGFiIGluZGV4IG9mIHRoZSBjb250cm9sXG5cdFx0dGFiU2VsZWN0c1ZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAvLyB3aGV0aGVyIHRvIHRyZWF0IHRhYmJpbmcgb3V0IHdoaWxlIGZvY3VzZWQgdG8gYmUgdmFsdWUgc2VsZWN0aW9uXG5cdFx0dmFsdWU6IFJlYWN0LlByb3BUeXBlcy5hbnksICAgICAgICAgICAgICAgICAvLyBpbml0aWFsIGZpZWxkIHZhbHVlXG5cdFx0dmFsdWVDb21wb25lbnQ6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAvLyB2YWx1ZSBjb21wb25lbnQgdG8gcmVuZGVyXG5cdFx0dmFsdWVLZXk6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgICAvLyBwYXRoIG9mIHRoZSBsYWJlbCB2YWx1ZSBpbiBvcHRpb24gb2JqZWN0c1xuXHRcdHZhbHVlUmVuZGVyZXI6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgLy8gdmFsdWVSZW5kZXJlcjogZnVuY3Rpb24gKG9wdGlvbikge31cblx0XHR3cmFwcGVyU3R5bGU6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsICAgICAgIC8vIG9wdGlvbmFsIHN0eWxlIHRvIGFwcGx5IHRvIHRoZSBjb21wb25lbnQgd3JhcHBlclxuXHR9LFxuXG5cdHN0YXRpY3M6IHsgQXN5bmMgfSxcblxuXHRnZXREZWZhdWx0UHJvcHMgKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRhZGRMYWJlbFRleHQ6ICdBZGQgXCJ7bGFiZWx9XCI/Jyxcblx0XHRcdGF1dG9zaXplOiB0cnVlLFxuXHRcdFx0YWxsb3dDcmVhdGU6IGZhbHNlLFxuXHRcdFx0YmFja3NwYWNlUmVtb3ZlczogdHJ1ZSxcblx0XHRcdGJhY2tzcGFjZVRvUmVtb3ZlTWVzc2FnZTogJ1ByZXNzIGJhY2tzcGFjZSB0byByZW1vdmUge2xhYmVsfScsXG5cdFx0XHRjbGVhcmFibGU6IHRydWUsXG5cdFx0XHRjbGVhckFsbFRleHQ6ICdDbGVhciBhbGwnLFxuXHRcdFx0Y2xlYXJWYWx1ZVRleHQ6ICdDbGVhciB2YWx1ZScsXG5cdFx0XHRkZWxpbWl0ZXI6ICcsJyxcblx0XHRcdGRpc2FibGVkOiBmYWxzZSxcblx0XHRcdGVzY2FwZUNsZWFyc1ZhbHVlOiB0cnVlLFxuXHRcdFx0ZmlsdGVyT3B0aW9uczogdHJ1ZSxcblx0XHRcdGlnbm9yZUFjY2VudHM6IHRydWUsXG5cdFx0XHRpZ25vcmVDYXNlOiB0cnVlLFxuXHRcdFx0aW5wdXRQcm9wczoge30sXG5cdFx0XHRpc0xvYWRpbmc6IGZhbHNlLFxuXHRcdFx0am9pblZhbHVlczogZmFsc2UsXG5cdFx0XHRsYWJlbEtleTogJ2xhYmVsJyxcblx0XHRcdG1hdGNoUG9zOiAnYW55Jyxcblx0XHRcdG1hdGNoUHJvcDogJ2FueScsXG5cdFx0XHRtZW51QnVmZmVyOiAwLFxuXHRcdFx0bXVsdGk6IGZhbHNlLFxuXHRcdFx0bm9SZXN1bHRzVGV4dDogJ05vIHJlc3VsdHMgZm91bmQnLFxuXHRcdFx0b25CbHVyUmVzZXRzSW5wdXQ6IHRydWUsXG5cdFx0XHRvcGVuQWZ0ZXJGb2N1czogZmFsc2UsXG5cdFx0XHRvcHRpb25Db21wb25lbnQ6IE9wdGlvbixcblx0XHRcdHBhZ2VTaXplOiA1LFxuXHRcdFx0cGxhY2Vob2xkZXI6ICdTZWxlY3QuLi4nLFxuXHRcdFx0cmVxdWlyZWQ6IGZhbHNlLFxuXHRcdFx0cmVzZXRWYWx1ZTogbnVsbCxcblx0XHRcdHNjcm9sbE1lbnVJbnRvVmlldzogdHJ1ZSxcblx0XHRcdHNlYXJjaGFibGU6IHRydWUsXG5cdFx0XHRzaW1wbGVWYWx1ZTogZmFsc2UsXG5cdFx0XHR0YWJTZWxlY3RzVmFsdWU6IHRydWUsXG5cdFx0XHR2YWx1ZUNvbXBvbmVudDogVmFsdWUsXG5cdFx0XHR2YWx1ZUtleTogJ3ZhbHVlJyxcblx0XHR9O1xuXHR9LFxuXG5cdGdldEluaXRpYWxTdGF0ZSAoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGlucHV0VmFsdWU6ICcnLFxuXHRcdFx0aXNGb2N1c2VkOiBmYWxzZSxcblx0XHRcdGlzTG9hZGluZzogZmFsc2UsXG5cdFx0XHRpc09wZW46IGZhbHNlLFxuXHRcdFx0aXNQc2V1ZG9Gb2N1c2VkOiBmYWxzZSxcblx0XHRcdHJlcXVpcmVkOiBmYWxzZSxcblx0XHR9O1xuXHR9LFxuXG5cdGNvbXBvbmVudFdpbGxNb3VudCAoKSB7XG5cdFx0dGhpcy5faW5zdGFuY2VQcmVmaXggPSAncmVhY3Qtc2VsZWN0LScgKyAoKytpbnN0YW5jZUlkKSArICctJztcblx0XHRjb25zdCB2YWx1ZUFycmF5ID0gdGhpcy5nZXRWYWx1ZUFycmF5KHRoaXMucHJvcHMudmFsdWUpO1xuXG5cdFx0aWYgKHRoaXMucHJvcHMucmVxdWlyZWQpIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRyZXF1aXJlZDogdGhpcy5oYW5kbGVSZXF1aXJlZCh2YWx1ZUFycmF5WzBdLCB0aGlzLnByb3BzLm11bHRpKSxcblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblxuXHRjb21wb25lbnREaWRNb3VudCAoKSB7XG5cdFx0aWYgKHRoaXMucHJvcHMuYXV0b2ZvY3VzKSB7XG5cdFx0XHR0aGlzLmZvY3VzKCk7XG5cdFx0fVxuXHR9LFxuXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG5cdFx0Y29uc3QgdmFsdWVBcnJheSA9IHRoaXMuZ2V0VmFsdWVBcnJheShuZXh0UHJvcHMudmFsdWUpO1xuXG5cdFx0aWYgKG5leHRQcm9wcy5yZXF1aXJlZCkge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdHJlcXVpcmVkOiB0aGlzLmhhbmRsZVJlcXVpcmVkKHZhbHVlQXJyYXlbMF0sIG5leHRQcm9wcy5tdWx0aSksXG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cblx0Y29tcG9uZW50V2lsbFVwZGF0ZSAobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcblx0XHRpZiAobmV4dFN0YXRlLmlzT3BlbiAhPT0gdGhpcy5zdGF0ZS5pc09wZW4pIHtcblx0XHRcdGNvbnN0IGhhbmRsZXIgPSBuZXh0U3RhdGUuaXNPcGVuID8gbmV4dFByb3BzLm9uT3BlbiA6IG5leHRQcm9wcy5vbkNsb3NlO1xuXHRcdFx0aGFuZGxlciAmJiBoYW5kbGVyKCk7XG5cdFx0fVxuXHR9LFxuXG5cdGNvbXBvbmVudERpZFVwZGF0ZSAocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcblx0XHQvLyBmb2N1cyB0byB0aGUgc2VsZWN0ZWQgb3B0aW9uXG5cdFx0aWYgKHRoaXMucmVmcy5tZW51ICYmIHRoaXMucmVmcy5mb2N1c2VkICYmIHRoaXMuc3RhdGUuaXNPcGVuICYmICF0aGlzLmhhc1Njcm9sbGVkVG9PcHRpb24pIHtcblx0XHRcdGxldCBmb2N1c2VkT3B0aW9uTm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmcy5mb2N1c2VkKTtcblx0XHRcdGxldCBtZW51Tm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmcy5tZW51KTtcblx0XHRcdG1lbnVOb2RlLnNjcm9sbFRvcCA9IGZvY3VzZWRPcHRpb25Ob2RlLm9mZnNldFRvcDtcblx0XHRcdHRoaXMuaGFzU2Nyb2xsZWRUb09wdGlvbiA9IHRydWU7XG5cdFx0fSBlbHNlIGlmICghdGhpcy5zdGF0ZS5pc09wZW4pIHtcblx0XHRcdHRoaXMuaGFzU2Nyb2xsZWRUb09wdGlvbiA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9zY3JvbGxUb0ZvY3VzZWRPcHRpb25PblVwZGF0ZSAmJiB0aGlzLnJlZnMuZm9jdXNlZCAmJiB0aGlzLnJlZnMubWVudSkge1xuXHRcdFx0dGhpcy5fc2Nyb2xsVG9Gb2N1c2VkT3B0aW9uT25VcGRhdGUgPSBmYWxzZTtcblx0XHRcdHZhciBmb2N1c2VkRE9NID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzLmZvY3VzZWQpO1xuXHRcdFx0dmFyIG1lbnVET00gPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnMubWVudSk7XG5cdFx0XHR2YXIgZm9jdXNlZFJlY3QgPSBmb2N1c2VkRE9NLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0dmFyIG1lbnVSZWN0ID0gbWVudURPTS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHRcdGlmIChmb2N1c2VkUmVjdC5ib3R0b20gPiBtZW51UmVjdC5ib3R0b20gfHwgZm9jdXNlZFJlY3QudG9wIDwgbWVudVJlY3QudG9wKSB7XG5cdFx0XHRcdG1lbnVET00uc2Nyb2xsVG9wID0gKGZvY3VzZWRET00ub2Zmc2V0VG9wICsgZm9jdXNlZERPTS5jbGllbnRIZWlnaHQgLSBtZW51RE9NLm9mZnNldEhlaWdodCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICh0aGlzLnByb3BzLnNjcm9sbE1lbnVJbnRvVmlldyAmJiB0aGlzLnJlZnMubWVudUNvbnRhaW5lcikge1xuXHRcdFx0dmFyIG1lbnVDb250YWluZXJSZWN0ID0gdGhpcy5yZWZzLm1lbnVDb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0XHRpZiAod2luZG93LmlubmVySGVpZ2h0IDwgbWVudUNvbnRhaW5lclJlY3QuYm90dG9tICsgdGhpcy5wcm9wcy5tZW51QnVmZmVyKSB7XG5cdFx0XHRcdHdpbmRvdy5zY3JvbGxCeSgwLCBtZW51Q29udGFpbmVyUmVjdC5ib3R0b20gKyB0aGlzLnByb3BzLm1lbnVCdWZmZXIgLSB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAocHJldlByb3BzLmRpc2FibGVkICE9PSB0aGlzLnByb3BzLmRpc2FibGVkKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHsgaXNGb2N1c2VkOiBmYWxzZSB9KTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSByZWFjdC9uby1kaWQtdXBkYXRlLXNldC1zdGF0ZVxuXHRcdFx0dGhpcy5jbG9zZU1lbnUoKTtcblx0XHR9XG5cdH0sXG5cblx0Zm9jdXMgKCkge1xuXHRcdGlmICghdGhpcy5yZWZzLmlucHV0KSByZXR1cm47XG5cdFx0dGhpcy5yZWZzLmlucHV0LmZvY3VzKCk7XG5cblx0XHRpZiAodGhpcy5wcm9wcy5vcGVuQWZ0ZXJGb2N1cykge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGlzT3BlbjogdHJ1ZSxcblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblxuXHRibHVySW5wdXQoKSB7XG5cdFx0aWYgKCF0aGlzLnJlZnMuaW5wdXQpIHJldHVybjtcblx0XHR0aGlzLnJlZnMuaW5wdXQuYmx1cigpO1xuXHR9LFxuXG5cdGhhbmRsZVRvdWNoTW92ZSAoZXZlbnQpIHtcblx0XHQvLyBTZXQgYSBmbGFnIHRoYXQgdGhlIHZpZXcgaXMgYmVpbmcgZHJhZ2dlZFxuXHRcdHRoaXMuZHJhZ2dpbmcgPSB0cnVlO1xuXHR9LFxuXG5cdGhhbmRsZVRvdWNoU3RhcnQgKGV2ZW50KSB7XG5cdFx0Ly8gU2V0IGEgZmxhZyB0aGF0IHRoZSB2aWV3IGlzIG5vdCBiZWluZyBkcmFnZ2VkXG5cdFx0dGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xuXHR9LFxuXG5cdGhhbmRsZVRvdWNoRW5kIChldmVudCkge1xuXHRcdC8vIENoZWNrIGlmIHRoZSB2aWV3IGlzIGJlaW5nIGRyYWdnZWQsIEluIHRoaXMgY2FzZVxuXHRcdC8vIHdlIGRvbid0IHdhbnQgdG8gZmlyZSB0aGUgY2xpY2sgZXZlbnQgKGJlY2F1c2UgdGhlIHVzZXIgb25seSB3YW50cyB0byBzY3JvbGwpXG5cdFx0aWYodGhpcy5kcmFnZ2luZykgcmV0dXJuO1xuXG5cdFx0Ly8gRmlyZSB0aGUgbW91c2UgZXZlbnRzXG5cdFx0dGhpcy5oYW5kbGVNb3VzZURvd24oZXZlbnQpO1xuXHR9LFxuXG5cdGhhbmRsZVRvdWNoRW5kQ2xlYXJWYWx1ZSAoZXZlbnQpIHtcblx0XHQvLyBDaGVjayBpZiB0aGUgdmlldyBpcyBiZWluZyBkcmFnZ2VkLCBJbiB0aGlzIGNhc2Vcblx0XHQvLyB3ZSBkb24ndCB3YW50IHRvIGZpcmUgdGhlIGNsaWNrIGV2ZW50IChiZWNhdXNlIHRoZSB1c2VyIG9ubHkgd2FudHMgdG8gc2Nyb2xsKVxuXHRcdGlmKHRoaXMuZHJhZ2dpbmcpIHJldHVybjtcblxuXHRcdC8vIENsZWFyIHRoZSB2YWx1ZVxuXHRcdHRoaXMuY2xlYXJWYWx1ZShldmVudCk7XG5cdH0sXG5cblx0aGFuZGxlTW91c2VEb3duIChldmVudCkge1xuXHRcdC8vIGlmIHRoZSBldmVudCB3YXMgdHJpZ2dlcmVkIGJ5IGEgbW91c2Vkb3duIGFuZCBub3QgdGhlIHByaW1hcnlcblx0XHQvLyBidXR0b24sIG9yIGlmIHRoZSBjb21wb25lbnQgaXMgZGlzYWJsZWQsIGlnbm9yZSBpdC5cblx0XHRpZiAodGhpcy5wcm9wcy5kaXNhYmxlZCB8fCAoZXZlbnQudHlwZSA9PT0gJ21vdXNlZG93bicgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmIChldmVudC50YXJnZXQudGFnTmFtZSA9PT0gJ0lOUFVUJykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIHByZXZlbnQgZGVmYXVsdCBldmVudCBoYW5kbGVyc1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHQvLyBmb3IgdGhlIG5vbi1zZWFyY2hhYmxlIHNlbGVjdCwgdG9nZ2xlIHRoZSBtZW51XG5cdFx0aWYgKCF0aGlzLnByb3BzLnNlYXJjaGFibGUpIHtcblx0XHRcdHRoaXMuZm9jdXMoKTtcblx0XHRcdHJldHVybiB0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXNPcGVuOiAhdGhpcy5zdGF0ZS5pc09wZW4sXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5zdGF0ZS5pc0ZvY3VzZWQpIHtcblx0XHRcdC8vIE9uIGlPUywgd2UgY2FuIGdldCBpbnRvIGEgc3RhdGUgd2hlcmUgd2UgdGhpbmsgdGhlIGlucHV0IGlzIGZvY3VzZWQgYnV0IGl0IGlzbid0IHJlYWxseSxcblx0XHRcdC8vIHNpbmNlIGlPUyBpZ25vcmVzIHByb2dyYW1tYXRpYyBjYWxscyB0byBpbnB1dC5mb2N1cygpIHRoYXQgd2VyZW4ndCB0cmlnZ2VyZWQgYnkgYSBjbGljayBldmVudC5cblx0XHRcdC8vIENhbGwgZm9jdXMoKSBhZ2FpbiBoZXJlIHRvIGJlIHNhZmUuXG5cdFx0XHR0aGlzLmZvY3VzKCk7XG5cblx0XHRcdC8vIGNsZWFycyB2YWx1ZSBzbyB0aGF0IHRoZSBjdXJzb3Igd2lsbCBiZSBhIHRoZSBlbmQgb2YgaW5wdXQgdGhlbiB0aGUgY29tcG9uZW50IHJlLXJlbmRlcnNcblx0XHRcdHRoaXMucmVmcy5pbnB1dC5nZXRJbnB1dCgpLnZhbHVlID0gJyc7XG5cblx0XHRcdC8vIGlmIHRoZSBpbnB1dCBpcyBmb2N1c2VkLCBlbnN1cmUgdGhlIG1lbnUgaXMgb3BlblxuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGlzT3BlbjogdHJ1ZSxcblx0XHRcdFx0aXNQc2V1ZG9Gb2N1c2VkOiBmYWxzZSxcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBvdGhlcndpc2UsIGZvY3VzIHRoZSBpbnB1dCBhbmQgb3BlbiB0aGUgbWVudVxuXHRcdFx0dGhpcy5fb3BlbkFmdGVyRm9jdXMgPSB0cnVlO1xuXHRcdFx0dGhpcy5mb2N1cygpO1xuXHRcdH1cblx0fSxcblxuXHRoYW5kbGVNb3VzZURvd25PbkFycm93IChldmVudCkge1xuXHRcdC8vIGlmIHRoZSBldmVudCB3YXMgdHJpZ2dlcmVkIGJ5IGEgbW91c2Vkb3duIGFuZCBub3QgdGhlIHByaW1hcnlcblx0XHQvLyBidXR0b24sIG9yIGlmIHRoZSBjb21wb25lbnQgaXMgZGlzYWJsZWQsIGlnbm9yZSBpdC5cblx0XHRpZiAodGhpcy5wcm9wcy5kaXNhYmxlZCB8fCAoZXZlbnQudHlwZSA9PT0gJ21vdXNlZG93bicgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHQvLyBJZiB0aGUgbWVudSBpc24ndCBvcGVuLCBsZXQgdGhlIGV2ZW50IGJ1YmJsZSB0byB0aGUgbWFpbiBoYW5kbGVNb3VzZURvd25cblx0XHRpZiAoIXRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdC8vIHByZXZlbnQgZGVmYXVsdCBldmVudCBoYW5kbGVyc1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0Ly8gY2xvc2UgdGhlIG1lbnVcblx0XHR0aGlzLmNsb3NlTWVudSgpO1xuXHR9LFxuXG5cdGhhbmRsZU1vdXNlRG93bk9uTWVudSAoZXZlbnQpIHtcblx0XHQvLyBpZiB0aGUgZXZlbnQgd2FzIHRyaWdnZXJlZCBieSBhIG1vdXNlZG93biBhbmQgbm90IHRoZSBwcmltYXJ5XG5cdFx0Ly8gYnV0dG9uLCBvciBpZiB0aGUgY29tcG9uZW50IGlzIGRpc2FibGVkLCBpZ25vcmUgaXQuXG5cdFx0aWYgKHRoaXMucHJvcHMuZGlzYWJsZWQgfHwgKGV2ZW50LnR5cGUgPT09ICdtb3VzZWRvd24nICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdHRoaXMuX29wZW5BZnRlckZvY3VzID0gdHJ1ZTtcblx0XHR0aGlzLmZvY3VzKCk7XG5cdH0sXG5cblx0Y2xvc2VNZW51ICgpIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGlzT3BlbjogZmFsc2UsXG5cdFx0XHRpc1BzZXVkb0ZvY3VzZWQ6IHRoaXMuc3RhdGUuaXNGb2N1c2VkICYmICF0aGlzLnByb3BzLm11bHRpLFxuXHRcdFx0aW5wdXRWYWx1ZTogJycsXG5cdFx0fSk7XG5cdFx0dGhpcy5oYXNTY3JvbGxlZFRvT3B0aW9uID0gZmFsc2U7XG5cdH0sXG5cblx0aGFuZGxlSW5wdXRGb2N1cyAoZXZlbnQpIHtcblx0XHR2YXIgaXNPcGVuID0gdGhpcy5zdGF0ZS5pc09wZW4gfHwgdGhpcy5fb3BlbkFmdGVyRm9jdXMgfHwgdGhpcy5wcm9wcy5vcGVuT25Gb2N1cztcblx0XHRpZiAodGhpcy5wcm9wcy5vbkZvY3VzKSB7XG5cdFx0XHR0aGlzLnByb3BzLm9uRm9jdXMoZXZlbnQpO1xuXHRcdH1cblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGlzRm9jdXNlZDogdHJ1ZSxcblx0XHRcdGlzT3BlbjogaXNPcGVuXG5cdFx0fSk7XG5cdFx0dGhpcy5fb3BlbkFmdGVyRm9jdXMgPSBmYWxzZTtcblx0fSxcblxuXHRoYW5kbGVJbnB1dEJsdXIgKGV2ZW50KSB7XG5cdFx0aWYgKHRoaXMucmVmcy5tZW51ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgPT09IHRoaXMucmVmcy5tZW51KSB7XG5cdFx0XHR0aGlzLmZvY3VzKCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMucHJvcHMub25CbHVyKSB7XG5cdFx0XHR0aGlzLnByb3BzLm9uQmx1cihldmVudCk7XG5cdFx0fVxuXHRcdHZhciBvbkJsdXJyZWRTdGF0ZSA9IHtcblx0XHRcdGlzRm9jdXNlZDogZmFsc2UsXG5cdFx0XHRpc09wZW46IGZhbHNlLFxuXHRcdFx0aXNQc2V1ZG9Gb2N1c2VkOiBmYWxzZSxcblx0XHR9O1xuXHRcdGlmICh0aGlzLnByb3BzLm9uQmx1clJlc2V0c0lucHV0KSB7XG5cdFx0XHRvbkJsdXJyZWRTdGF0ZS5pbnB1dFZhbHVlID0gJyc7XG5cdFx0fVxuXHRcdHRoaXMuc2V0U3RhdGUob25CbHVycmVkU3RhdGUpO1xuXHR9LFxuXG5cdGhhbmRsZUlucHV0Q2hhbmdlIChldmVudCkge1xuXHRcdGxldCBuZXdJbnB1dFZhbHVlID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuXHRcdGlmICh0aGlzLnN0YXRlLmlucHV0VmFsdWUgIT09IGV2ZW50LnRhcmdldC52YWx1ZSAmJiB0aGlzLnByb3BzLm9uSW5wdXRDaGFuZ2UpIHtcblx0XHRcdGxldCBuZXh0U3RhdGUgPSB0aGlzLnByb3BzLm9uSW5wdXRDaGFuZ2UobmV3SW5wdXRWYWx1ZSk7XG5cdFx0XHQvLyBOb3RlOiAhPSB1c2VkIGRlbGliZXJhdGVseSBoZXJlIHRvIGNhdGNoIHVuZGVmaW5lZCBhbmQgbnVsbFxuXHRcdFx0aWYgKG5leHRTdGF0ZSAhPSBudWxsICYmIHR5cGVvZiBuZXh0U3RhdGUgIT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdG5ld0lucHV0VmFsdWUgPSAnJyArIG5leHRTdGF0ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRpc09wZW46IHRydWUsXG5cdFx0XHRpc1BzZXVkb0ZvY3VzZWQ6IGZhbHNlLFxuXHRcdFx0aW5wdXRWYWx1ZTogbmV3SW5wdXRWYWx1ZVxuXHRcdH0pO1xuXHR9LFxuXG5cdGhhbmRsZUtleURvd24gKGV2ZW50KSB7XG5cdFx0aWYgKHRoaXMucHJvcHMuZGlzYWJsZWQpIHJldHVybjtcblx0XHRzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcblx0XHRcdGNhc2UgODogLy8gYmFja3NwYWNlXG5cdFx0XHRcdGlmICghdGhpcy5zdGF0ZS5pbnB1dFZhbHVlICYmIHRoaXMucHJvcHMuYmFja3NwYWNlUmVtb3Zlcykge1xuXHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0dGhpcy5wb3BWYWx1ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRyZXR1cm47XG5cdFx0XHRjYXNlIDk6IC8vIHRhYlxuXHRcdFx0XHRpZiAoZXZlbnQuc2hpZnRLZXkgfHwgIXRoaXMuc3RhdGUuaXNPcGVuIHx8ICF0aGlzLnByb3BzLnRhYlNlbGVjdHNWYWx1ZSkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnNlbGVjdEZvY3VzZWRPcHRpb24oKTtcblx0XHRcdHJldHVybjtcblx0XHRcdGNhc2UgMTM6IC8vIGVudGVyXG5cdFx0XHRcdGlmICghdGhpcy5zdGF0ZS5pc09wZW4pIHJldHVybjtcblx0XHRcdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0XHRcdHRoaXMuc2VsZWN0Rm9jdXNlZE9wdGlvbigpO1xuXHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDI3OiAvLyBlc2NhcGVcblx0XHRcdFx0aWYgKHRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHRcdFx0dGhpcy5jbG9zZU1lbnUoKTtcblx0XHRcdFx0fSBlbHNlIGlmICh0aGlzLnByb3BzLmNsZWFyYWJsZSAmJiB0aGlzLnByb3BzLmVzY2FwZUNsZWFyc1ZhbHVlKSB7XG5cdFx0XHRcdFx0dGhpcy5jbGVhclZhbHVlKGV2ZW50KTtcblx0XHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDM4OiAvLyB1cFxuXHRcdFx0XHR0aGlzLmZvY3VzUHJldmlvdXNPcHRpb24oKTtcblx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSA0MDogLy8gZG93blxuXHRcdFx0XHR0aGlzLmZvY3VzTmV4dE9wdGlvbigpO1xuXHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDMzOiAvLyBwYWdlIHVwXG5cdFx0XHRcdHRoaXMuZm9jdXNQYWdlVXBPcHRpb24oKTtcblx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAzNDogLy8gcGFnZSBkb3duXG5cdFx0XHRcdHRoaXMuZm9jdXNQYWdlRG93bk9wdGlvbigpO1xuXHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDM1OiAvLyBlbmQga2V5XG5cdFx0XHRcdHRoaXMuZm9jdXNFbmRPcHRpb24oKTtcblx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAzNjogLy8gaG9tZSBrZXlcblx0XHRcdFx0dGhpcy5mb2N1c1N0YXJ0T3B0aW9uKCk7XG5cdFx0XHRicmVhaztcblx0XHRcdC8vIGNhc2UgMTg4OiAvLyAsXG5cdFx0XHQvLyBcdGlmICh0aGlzLnByb3BzLmFsbG93Q3JlYXRlICYmIHRoaXMucHJvcHMubXVsdGkpIHtcblx0XHRcdC8vIFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0Ly8gXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0Ly8gXHRcdHRoaXMuc2VsZWN0Rm9jdXNlZE9wdGlvbigpO1xuXHRcdFx0Ly8gXHR9IGVsc2Uge1xuXHRcdFx0Ly8gXHRcdHJldHVybjtcblx0XHRcdC8vIFx0fVxuXHRcdFx0Ly8gYnJlYWs7XG5cdFx0XHRkZWZhdWx0OiByZXR1cm47XG5cdFx0fVxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdH0sXG5cblx0aGFuZGxlVmFsdWVDbGljayAob3B0aW9uLCBldmVudCkge1xuXHRcdGlmICghdGhpcy5wcm9wcy5vblZhbHVlQ2xpY2spIHJldHVybjtcblx0XHR0aGlzLnByb3BzLm9uVmFsdWVDbGljayhvcHRpb24sIGV2ZW50KTtcblx0fSxcblxuXHRoYW5kbGVNZW51U2Nyb2xsIChldmVudCkge1xuXHRcdGlmICghdGhpcy5wcm9wcy5vbk1lbnVTY3JvbGxUb0JvdHRvbSkgcmV0dXJuO1xuXHRcdGxldCB7IHRhcmdldCB9ID0gZXZlbnQ7XG5cdFx0aWYgKHRhcmdldC5zY3JvbGxIZWlnaHQgPiB0YXJnZXQub2Zmc2V0SGVpZ2h0ICYmICEodGFyZ2V0LnNjcm9sbEhlaWdodCAtIHRhcmdldC5vZmZzZXRIZWlnaHQgLSB0YXJnZXQuc2Nyb2xsVG9wKSkge1xuXHRcdFx0dGhpcy5wcm9wcy5vbk1lbnVTY3JvbGxUb0JvdHRvbSgpO1xuXHRcdH1cblx0fSxcblxuXHRoYW5kbGVSZXF1aXJlZCAodmFsdWUsIG11bHRpKSB7XG5cdFx0aWYgKCF2YWx1ZSkgcmV0dXJuIHRydWU7XG5cdFx0cmV0dXJuIChtdWx0aSA/IHZhbHVlLmxlbmd0aCA9PT0gMCA6IE9iamVjdC5rZXlzKHZhbHVlKS5sZW5ndGggPT09IDApO1xuXHR9LFxuXG5cdGdldE9wdGlvbkxhYmVsIChvcCkge1xuXHRcdHJldHVybiBvcFt0aGlzLnByb3BzLmxhYmVsS2V5XTtcblx0fSxcblxuXHRnZXRWYWx1ZUFycmF5ICh2YWx1ZSkge1xuXHRcdGlmICh0aGlzLnByb3BzLm11bHRpKSB7XG5cdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykgdmFsdWUgPSB2YWx1ZS5zcGxpdCh0aGlzLnByb3BzLmRlbGltaXRlcik7XG5cdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gW107XG5cdFx0XHRcdHZhbHVlID0gW3ZhbHVlXTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB2YWx1ZS5tYXAodGhpcy5leHBhbmRWYWx1ZSkuZmlsdGVyKGkgPT4gaSk7XG5cdFx0fVxuXHRcdHZhciBleHBhbmRlZFZhbHVlID0gdGhpcy5leHBhbmRWYWx1ZSh2YWx1ZSk7XG5cdFx0cmV0dXJuIGV4cGFuZGVkVmFsdWUgPyBbZXhwYW5kZWRWYWx1ZV0gOiBbXTtcblx0fSxcblxuXHRleHBhbmRWYWx1ZSAodmFsdWUpIHtcblx0XHRpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJyAmJiB0eXBlb2YgdmFsdWUgIT09ICdudW1iZXInKSByZXR1cm4gdmFsdWU7XG5cdFx0bGV0IHsgb3B0aW9ucywgdmFsdWVLZXkgfSA9IHRoaXMucHJvcHM7XG5cdFx0aWYgKCFvcHRpb25zKSByZXR1cm47XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBvcHRpb25zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAob3B0aW9uc1tpXVt2YWx1ZUtleV0gPT09IHZhbHVlKSByZXR1cm4gb3B0aW9uc1tpXTtcblx0XHR9XG5cdH0sXG5cblx0c2V0VmFsdWUgKHZhbHVlKSB7XG5cdFx0aWYgKHRoaXMucHJvcHMuYXV0b0JsdXIpe1xuXHRcdFx0dGhpcy5ibHVySW5wdXQoKTtcblx0XHR9XG5cdFx0aWYgKCF0aGlzLnByb3BzLm9uQ2hhbmdlKSByZXR1cm47XG5cdFx0aWYgKHRoaXMucHJvcHMucmVxdWlyZWQpIHtcblx0XHRcdGNvbnN0IHJlcXVpcmVkID0gdGhpcy5oYW5kbGVSZXF1aXJlZCh2YWx1ZSwgdGhpcy5wcm9wcy5tdWx0aSk7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHsgcmVxdWlyZWQgfSk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLnByb3BzLnNpbXBsZVZhbHVlICYmIHZhbHVlKSB7XG5cdFx0XHR2YWx1ZSA9IHRoaXMucHJvcHMubXVsdGkgPyB2YWx1ZS5tYXAoaSA9PiBpW3RoaXMucHJvcHMudmFsdWVLZXldKS5qb2luKHRoaXMucHJvcHMuZGVsaW1pdGVyKSA6IHZhbHVlW3RoaXMucHJvcHMudmFsdWVLZXldO1xuXHRcdH1cblx0XHR0aGlzLnByb3BzLm9uQ2hhbmdlKHZhbHVlKTtcblx0fSxcblxuXHRzZWxlY3RWYWx1ZSAodmFsdWUpIHtcblx0XHR0aGlzLmhhc1Njcm9sbGVkVG9PcHRpb24gPSBmYWxzZTtcblx0XHRpZiAodGhpcy5wcm9wcy5tdWx0aSkge1xuXHRcdFx0dGhpcy5hZGRWYWx1ZSh2YWx1ZSk7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aW5wdXRWYWx1ZTogJycsXG5cdFx0XHRcdGZvY3VzZWRJbmRleDogbnVsbFxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRpc09wZW46IGZhbHNlLFxuXHRcdFx0XHRpbnB1dFZhbHVlOiAnJyxcblx0XHRcdFx0aXNQc2V1ZG9Gb2N1c2VkOiB0aGlzLnN0YXRlLmlzRm9jdXNlZCxcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5zZXRWYWx1ZSh2YWx1ZSk7XG5cdFx0fVxuXHR9LFxuXG5cdGFkZFZhbHVlICh2YWx1ZSkge1xuXHRcdHZhciB2YWx1ZUFycmF5ID0gdGhpcy5nZXRWYWx1ZUFycmF5KHRoaXMucHJvcHMudmFsdWUpO1xuXHRcdGlmICh0eXBlb2YgdGhpcy5wcm9wcy5saW1pdGVkID09PSBcInVuZGVmaW5lZFwiIHx8IHZhbHVlQXJyYXkubGVuZ3RoIDwgdGhpcy5wcm9wcy5saW1pdGVkKSB7XG5cdFx0XHR0aGlzLnNldFZhbHVlKHZhbHVlQXJyYXkuY29uY2F0KHZhbHVlKSk7XG5cdFx0fVxuXHR9LFxuXG5cdHBvcFZhbHVlICgpIHtcblx0XHR2YXIgdmFsdWVBcnJheSA9IHRoaXMuZ2V0VmFsdWVBcnJheSh0aGlzLnByb3BzLnZhbHVlKTtcblx0XHRpZiAoIXZhbHVlQXJyYXkubGVuZ3RoKSByZXR1cm47XG5cdFx0aWYgKHZhbHVlQXJyYXlbdmFsdWVBcnJheS5sZW5ndGgtMV0uY2xlYXJhYmxlVmFsdWUgPT09IGZhbHNlKSByZXR1cm47XG5cdFx0dGhpcy5zZXRWYWx1ZSh2YWx1ZUFycmF5LnNsaWNlKDAsIHZhbHVlQXJyYXkubGVuZ3RoIC0gMSkpO1xuXHR9LFxuXG5cdHJlbW92ZVZhbHVlICh2YWx1ZSkge1xuXHRcdHZhciB2YWx1ZUFycmF5ID0gdGhpcy5nZXRWYWx1ZUFycmF5KHRoaXMucHJvcHMudmFsdWUpO1xuXHRcdHRoaXMuc2V0VmFsdWUodmFsdWVBcnJheS5maWx0ZXIoaSA9PiBpICE9PSB2YWx1ZSkpO1xuXHRcdHRoaXMuZm9jdXMoKTtcblx0fSxcblxuXHRjbGVhclZhbHVlIChldmVudCkge1xuXHRcdC8vIGlmIHRoZSBldmVudCB3YXMgdHJpZ2dlcmVkIGJ5IGEgbW91c2Vkb3duIGFuZCBub3QgdGhlIHByaW1hcnlcblx0XHQvLyBidXR0b24sIGlnbm9yZSBpdC5cblx0XHRpZiAoZXZlbnQgJiYgZXZlbnQudHlwZSA9PT0gJ21vdXNlZG93bicgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0dGhpcy5zZXRWYWx1ZSh0aGlzLnByb3BzLnJlc2V0VmFsdWUpO1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0aXNPcGVuOiBmYWxzZSxcblx0XHRcdGlucHV0VmFsdWU6ICcnLFxuXHRcdH0sIHRoaXMuZm9jdXMpO1xuXHR9LFxuXG5cdGZvY3VzT3B0aW9uIChvcHRpb24pIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGZvY3VzZWRPcHRpb246IG9wdGlvblxuXHRcdH0pO1xuXHR9LFxuXG5cdGZvY3VzTmV4dE9wdGlvbiAoKSB7XG5cdFx0dGhpcy5mb2N1c0FkamFjZW50T3B0aW9uKCduZXh0Jyk7XG5cdH0sXG5cblx0Zm9jdXNQcmV2aW91c09wdGlvbiAoKSB7XG5cdFx0dGhpcy5mb2N1c0FkamFjZW50T3B0aW9uKCdwcmV2aW91cycpO1xuXHR9LFxuXG5cdGZvY3VzUGFnZVVwT3B0aW9uICgpIHtcblx0XHR0aGlzLmZvY3VzQWRqYWNlbnRPcHRpb24oJ3BhZ2VfdXAnKTtcblx0fSxcblxuXHRmb2N1c1BhZ2VEb3duT3B0aW9uICgpIHtcblx0XHR0aGlzLmZvY3VzQWRqYWNlbnRPcHRpb24oJ3BhZ2VfZG93bicpO1xuXHR9LFxuXG5cdGZvY3VzU3RhcnRPcHRpb24gKCkge1xuXHRcdHRoaXMuZm9jdXNBZGphY2VudE9wdGlvbignc3RhcnQnKTtcblx0fSxcblxuXHRmb2N1c0VuZE9wdGlvbiAoKSB7XG5cdFx0dGhpcy5mb2N1c0FkamFjZW50T3B0aW9uKCdlbmQnKTtcblx0fSxcblxuXHRmb2N1c0FkamFjZW50T3B0aW9uIChkaXIpIHtcblx0XHR2YXIgb3B0aW9ucyA9IHRoaXMuX3Zpc2libGVPcHRpb25zXG5cdFx0XHQubWFwKChvcHRpb24sIGluZGV4KSA9PiAoeyBvcHRpb24sIGluZGV4IH0pKVxuXHRcdFx0LmZpbHRlcihvcHRpb24gPT4gIW9wdGlvbi5vcHRpb24uZGlzYWJsZWQpO1xuXHRcdHRoaXMuX3Njcm9sbFRvRm9jdXNlZE9wdGlvbk9uVXBkYXRlID0gdHJ1ZTtcblx0XHRpZiAoIXRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXNPcGVuOiB0cnVlLFxuXHRcdFx0XHRpbnB1dFZhbHVlOiAnJyxcblx0XHRcdFx0Zm9jdXNlZE9wdGlvbjogdGhpcy5fZm9jdXNlZE9wdGlvbiB8fCBvcHRpb25zW2RpciA9PT0gJ25leHQnID8gMCA6IG9wdGlvbnMubGVuZ3RoIC0gMV0ub3B0aW9uXG5cdFx0XHR9KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKCFvcHRpb25zLmxlbmd0aCkgcmV0dXJuO1xuXHRcdHZhciBmb2N1c2VkSW5kZXggPSAtMTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG9wdGlvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmICh0aGlzLl9mb2N1c2VkT3B0aW9uID09PSBvcHRpb25zW2ldLm9wdGlvbikge1xuXHRcdFx0XHRmb2N1c2VkSW5kZXggPSBpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGRpciA9PT0gJ25leHQnICYmIGZvY3VzZWRJbmRleCAhPT0gLTEgKSB7XG5cdFx0XHRmb2N1c2VkSW5kZXggPSAoZm9jdXNlZEluZGV4ICsgMSkgJSBvcHRpb25zLmxlbmd0aDtcblx0XHR9IGVsc2UgaWYgKGRpciA9PT0gJ3ByZXZpb3VzJykge1xuXHRcdFx0aWYgKGZvY3VzZWRJbmRleCA+IDApIHtcblx0XHRcdFx0Zm9jdXNlZEluZGV4ID0gZm9jdXNlZEluZGV4IC0gMTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZvY3VzZWRJbmRleCA9IG9wdGlvbnMubGVuZ3RoIC0gMTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKGRpciA9PT0gJ3N0YXJ0Jykge1xuXHRcdFx0Zm9jdXNlZEluZGV4ID0gMDtcblx0XHR9IGVsc2UgaWYgKGRpciA9PT0gJ2VuZCcpIHtcblx0XHRcdGZvY3VzZWRJbmRleCA9IG9wdGlvbnMubGVuZ3RoIC0gMTtcblx0XHR9IGVsc2UgaWYgKGRpciA9PT0gJ3BhZ2VfdXAnKSB7XG5cdFx0XHR2YXIgcG90ZW50aWFsSW5kZXggPSBmb2N1c2VkSW5kZXggLSB0aGlzLnByb3BzLnBhZ2VTaXplO1xuXHRcdFx0aWYgKCBwb3RlbnRpYWxJbmRleCA8IDAgKSB7XG5cdFx0XHRcdGZvY3VzZWRJbmRleCA9IDA7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmb2N1c2VkSW5kZXggPSBwb3RlbnRpYWxJbmRleDtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKGRpciA9PT0gJ3BhZ2VfZG93bicpIHtcblx0XHRcdHZhciBwb3RlbnRpYWxJbmRleCA9IGZvY3VzZWRJbmRleCArIHRoaXMucHJvcHMucGFnZVNpemU7XG5cdFx0XHRpZiAoIHBvdGVudGlhbEluZGV4ID4gb3B0aW9ucy5sZW5ndGggLSAxICkge1xuXHRcdFx0XHRmb2N1c2VkSW5kZXggPSBvcHRpb25zLmxlbmd0aCAtIDE7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmb2N1c2VkSW5kZXggPSBwb3RlbnRpYWxJbmRleDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoZm9jdXNlZEluZGV4ID09PSAtMSkge1xuXHRcdFx0Zm9jdXNlZEluZGV4ID0gMDtcblx0XHR9XG5cblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGZvY3VzZWRJbmRleDogb3B0aW9uc1tmb2N1c2VkSW5kZXhdLmluZGV4LFxuXHRcdFx0Zm9jdXNlZE9wdGlvbjogb3B0aW9uc1tmb2N1c2VkSW5kZXhdLm9wdGlvblxuXHRcdH0pO1xuXHR9LFxuXG5cdHNlbGVjdEZvY3VzZWRPcHRpb24gKCkge1xuXHRcdC8vIGlmICh0aGlzLnByb3BzLmFsbG93Q3JlYXRlICYmICF0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24pIHtcblx0XHQvLyBcdHJldHVybiB0aGlzLnNlbGVjdFZhbHVlKHRoaXMuc3RhdGUuaW5wdXRWYWx1ZSk7XG5cdFx0Ly8gfVxuXHRcdGlmICh0aGlzLl9mb2N1c2VkT3B0aW9uKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5zZWxlY3RWYWx1ZSh0aGlzLl9mb2N1c2VkT3B0aW9uKTtcblx0XHR9XG5cdH0sXG5cblx0cmVuZGVyTG9hZGluZyAoKSB7XG5cdFx0aWYgKCF0aGlzLnByb3BzLmlzTG9hZGluZykgcmV0dXJuO1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJTZWxlY3QtbG9hZGluZy16b25lXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG5cdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1sb2FkaW5nXCIgLz5cblx0XHRcdDwvc3Bhbj5cblx0XHQpO1xuXHR9LFxuXG5cdHJlbmRlclZhbHVlICh2YWx1ZUFycmF5LCBpc09wZW4pIHtcblx0XHRsZXQgcmVuZGVyTGFiZWwgPSB0aGlzLnByb3BzLnZhbHVlUmVuZGVyZXIgfHwgdGhpcy5nZXRPcHRpb25MYWJlbDtcblx0XHRsZXQgVmFsdWVDb21wb25lbnQgPSB0aGlzLnByb3BzLnZhbHVlQ29tcG9uZW50O1xuXHRcdGlmICghdmFsdWVBcnJheS5sZW5ndGgpIHtcblx0XHRcdHJldHVybiAhdGhpcy5zdGF0ZS5pbnB1dFZhbHVlID8gPGRpdiBjbGFzc05hbWU9XCJTZWxlY3QtcGxhY2Vob2xkZXJcIj57dGhpcy5wcm9wcy5wbGFjZWhvbGRlcn08L2Rpdj4gOiBudWxsO1xuXHRcdH1cblx0XHRsZXQgb25DbGljayA9IHRoaXMucHJvcHMub25WYWx1ZUNsaWNrID8gdGhpcy5oYW5kbGVWYWx1ZUNsaWNrIDogbnVsbDtcblx0XHRpZiAodGhpcy5wcm9wcy5tdWx0aSkge1xuXHRcdFx0cmV0dXJuIHZhbHVlQXJyYXkubWFwKCh2YWx1ZSwgaSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdDxWYWx1ZUNvbXBvbmVudFxuXHRcdFx0XHRcdFx0aWQ9e3RoaXMuX2luc3RhbmNlUHJlZml4ICsgJy12YWx1ZS0nICsgaX1cblx0XHRcdFx0XHRcdGluc3RhbmNlUHJlZml4PXt0aGlzLl9pbnN0YW5jZVByZWZpeH1cblx0XHRcdFx0XHRcdGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkIHx8IHZhbHVlLmNsZWFyYWJsZVZhbHVlID09PSBmYWxzZX1cblx0XHRcdFx0XHRcdGtleT17YHZhbHVlLSR7aX0tJHt2YWx1ZVt0aGlzLnByb3BzLnZhbHVlS2V5XX1gfVxuXHRcdFx0XHRcdFx0b25DbGljaz17b25DbGlja31cblx0XHRcdFx0XHRcdG9uUmVtb3ZlPXt0aGlzLnJlbW92ZVZhbHVlfVxuXHRcdFx0XHRcdFx0dmFsdWU9e3ZhbHVlfVxuXHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdHtyZW5kZXJMYWJlbCh2YWx1ZSl9XG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJTZWxlY3QtYXJpYS1vbmx5XCI+Jm5ic3A7PC9zcGFuPlxuXHRcdFx0XHRcdDwvVmFsdWVDb21wb25lbnQ+XG5cdFx0XHRcdCk7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2UgaWYgKCF0aGlzLnN0YXRlLmlucHV0VmFsdWUpIHtcblx0XHRcdGlmIChpc09wZW4pIG9uQ2xpY2sgPSBudWxsO1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PFZhbHVlQ29tcG9uZW50XG5cdFx0XHRcdFx0aWQ9e3RoaXMuX2luc3RhbmNlUHJlZml4ICsgJy12YWx1ZS1pdGVtJ31cblx0XHRcdFx0XHRkaXNhYmxlZD17dGhpcy5wcm9wcy5kaXNhYmxlZH1cblx0XHRcdFx0XHRpbnN0YW5jZVByZWZpeD17dGhpcy5faW5zdGFuY2VQcmVmaXh9XG5cdFx0XHRcdFx0b25DbGljaz17b25DbGlja31cblx0XHRcdFx0XHR2YWx1ZT17dmFsdWVBcnJheVswXX1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdHtyZW5kZXJMYWJlbCh2YWx1ZUFycmF5WzBdKX1cblx0XHRcdFx0PC9WYWx1ZUNvbXBvbmVudD5cblx0XHRcdCk7XG5cdFx0fVxuXHR9LFxuXG5cdHJlbmRlcklucHV0ICh2YWx1ZUFycmF5LCBmb2N1c2VkT3B0aW9uSW5kZXgpIHtcblx0XHRpZiAodGhpcy5wcm9wcy5pbnB1dFJlbmRlcmVyKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5wcm9wcy5pbnB1dFJlbmRlcmVyKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBjbGFzc05hbWUgPSBjbGFzc05hbWVzKCdTZWxlY3QtaW5wdXQnLCB0aGlzLnByb3BzLmlucHV0UHJvcHMuY2xhc3NOYW1lKTtcblx0XHRcdGNvbnN0IGlzT3BlbiA9ICEhdGhpcy5zdGF0ZS5pc09wZW47XG5cblx0XHRcdGNvbnN0IGFyaWFPd25zID0gY2xhc3NOYW1lcyh7XG5cdFx0XHRcdFt0aGlzLl9pbnN0YW5jZVByZWZpeCArICctbGlzdCddOiBpc09wZW4sXG5cdFx0XHRcdFt0aGlzLl9pbnN0YW5jZVByZWZpeCArICctYmFja3NwYWNlLXJlbW92ZS1tZXNzYWdlJ106IHRoaXMucHJvcHMubXVsdGkgJiZcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQgICF0aGlzLnByb3BzLmRpc2FibGVkICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ICB0aGlzLnN0YXRlLmlzRm9jdXNlZCAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQgICAgICAhdGhpcy5zdGF0ZS5pbnB1dFZhbHVlXG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gVE9ETzogQ2hlY2sgaG93IHRoaXMgcHJvamVjdCBpbmNsdWRlcyBPYmplY3QuYXNzaWduKClcblx0XHRcdGNvbnN0IGlucHV0UHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb3BzLmlucHV0UHJvcHMsIHtcblx0XHRcdCAgICByb2xlOiAnY29tYm9ib3gnLFxuXHRcdFx0XHQnYXJpYS1leHBhbmRlZCc6ICcnICsgaXNPcGVuLFxuXHRcdFx0ICAgICdhcmlhLW93bnMnOiBhcmlhT3ducyxcblx0XHRcdCAgICAnYXJpYS1oYXNwb3B1cCc6ICcnICsgaXNPcGVuLFxuXHRcdFx0XHQnYXJpYS1hY3RpdmVkZXNjZW5kYW50JzogaXNPcGVuID8gdGhpcy5faW5zdGFuY2VQcmVmaXggKyAnLW9wdGlvbi0nICsgZm9jdXNlZE9wdGlvbkluZGV4IDogdGhpcy5faW5zdGFuY2VQcmVmaXggKyAnLXZhbHVlJyxcblx0XHRcdFx0J2FyaWEtbGFiZWxsZWRieSc6IHRoaXMucHJvcHNbJ2FyaWEtbGFiZWxsZWRieSddLFxuXHRcdFx0XHQnYXJpYS1sYWJlbCc6IHRoaXMucHJvcHNbJ2FyaWEtbGFiZWwnXSxcblx0XHRcdFx0Y2xhc3NOYW1lOiBjbGFzc05hbWUsXG5cdFx0XHRcdHRhYkluZGV4OiB0aGlzLnByb3BzLnRhYkluZGV4LFxuXHRcdFx0XHRvbkJsdXI6IHRoaXMuaGFuZGxlSW5wdXRCbHVyLFxuXHRcdFx0XHRvbkNoYW5nZTogdGhpcy5oYW5kbGVJbnB1dENoYW5nZSxcblx0XHRcdFx0b25Gb2N1czogdGhpcy5oYW5kbGVJbnB1dEZvY3VzLFxuXHRcdFx0XHRyZWY6ICdpbnB1dCcsXG5cdFx0XHRcdHJlcXVpcmVkOiB0aGlzLnN0YXRlLnJlcXVpcmVkLFxuXHRcdFx0XHR2YWx1ZTogdGhpcy5zdGF0ZS5pbnB1dFZhbHVlXG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKHRoaXMucHJvcHMuZGlzYWJsZWQgfHwgIXRoaXMucHJvcHMuc2VhcmNoYWJsZSkge1xuXHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdDxkaXZcblx0XHRcdFx0XHRcdHsuLi50aGlzLnByb3BzLmlucHV0UHJvcHN9XG5cdFx0XHRcdFx0XHRyb2xlPVwiY29tYm9ib3hcIlxuXHRcdFx0XHRcdFx0YXJpYS1leHBhbmRlZD17aXNPcGVufVxuXHRcdFx0XHRcdFx0YXJpYS1vd25zPXtpc09wZW4gPyB0aGlzLl9pbnN0YW5jZVByZWZpeCArICctbGlzdCcgOiB0aGlzLl9pbnN0YW5jZVByZWZpeCArICctdmFsdWUnfVxuXHRcdFx0XHRcdFx0YXJpYS1hY3RpdmVkZXNjZW5kYW50PXtpc09wZW4gPyB0aGlzLl9pbnN0YW5jZVByZWZpeCArICctb3B0aW9uLScgKyBmb2N1c2VkT3B0aW9uSW5kZXggOiB0aGlzLl9pbnN0YW5jZVByZWZpeCArICctdmFsdWUnfVxuXHRcdFx0XHRcdFx0Y2xhc3NOYW1lPXtjbGFzc05hbWV9XG5cdFx0XHRcdFx0XHR0YWJJbmRleD17dGhpcy5wcm9wcy50YWJJbmRleCB8fCAwfVxuXHRcdFx0XHRcdFx0b25CbHVyPXt0aGlzLmhhbmRsZUlucHV0Qmx1cn1cblx0XHRcdFx0XHRcdG9uRm9jdXM9e3RoaXMuaGFuZGxlSW5wdXRGb2N1c31cblx0XHRcdFx0XHRcdHJlZj1cImlucHV0XCJcblx0XHRcdFx0XHRcdGFyaWEtcmVhZG9ubHk9eycnICsgISF0aGlzLnByb3BzLmRpc2FibGVkfVxuXHRcdFx0XHRcdFx0c3R5bGU9e3sgYm9yZGVyOiAwLCB3aWR0aDogMSwgZGlzcGxheTonaW5saW5lLWJsb2NrJyB9fS8+XG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLnByb3BzLmF1dG9zaXplKSB7XG5cdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0PElucHV0IHsuLi5pbnB1dFByb3BzfSBtaW5XaWR0aD1cIjVweFwiIC8+XG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT17IGNsYXNzTmFtZSB9PlxuXHRcdFx0XHRcdDxpbnB1dCB7Li4uaW5wdXRQcm9wc30gLz5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblx0fSxcblxuXHRyZW5kZXJDbGVhciAoKSB7XG5cdFx0aWYgKCF0aGlzLnByb3BzLmNsZWFyYWJsZSB8fCAhdGhpcy5wcm9wcy52YWx1ZSB8fCAodGhpcy5wcm9wcy5tdWx0aSAmJiAhdGhpcy5wcm9wcy52YWx1ZS5sZW5ndGgpIHx8IHRoaXMucHJvcHMuZGlzYWJsZWQgfHwgdGhpcy5wcm9wcy5pc0xvYWRpbmcpIHJldHVybjtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwiU2VsZWN0LWNsZWFyLXpvbmVcIiB0aXRsZT17dGhpcy5wcm9wcy5tdWx0aSA/IHRoaXMucHJvcHMuY2xlYXJBbGxUZXh0IDogdGhpcy5wcm9wcy5jbGVhclZhbHVlVGV4dH1cblx0XHRcdFx0XHRcdGFyaWEtbGFiZWw9e3RoaXMucHJvcHMubXVsdGkgPyB0aGlzLnByb3BzLmNsZWFyQWxsVGV4dCA6IHRoaXMucHJvcHMuY2xlYXJWYWx1ZVRleHR9XG5cdFx0XHRcdFx0XHRvbk1vdXNlRG93bj17dGhpcy5jbGVhclZhbHVlfVxuXHRcdFx0XHRcdFx0b25Ub3VjaFN0YXJ0PXt0aGlzLmhhbmRsZVRvdWNoU3RhcnR9XG5cdFx0XHRcdFx0XHRvblRvdWNoTW92ZT17dGhpcy5oYW5kbGVUb3VjaE1vdmV9XG5cdFx0XHRcdFx0XHRvblRvdWNoRW5kPXt0aGlzLmhhbmRsZVRvdWNoRW5kQ2xlYXJWYWx1ZX0+XG5cdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1jbGVhclwiIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7IF9faHRtbDogJyZ0aW1lczsnIH19IC8+XG5cdFx0XHQ8L3NwYW4+XG5cdFx0KTtcblx0fSxcblxuXHRyZW5kZXJBcnJvdyAoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1hcnJvdy16b25lXCIgb25Nb3VzZURvd249e3RoaXMuaGFuZGxlTW91c2VEb3duT25BcnJvd30+XG5cdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1hcnJvd1wiIG9uTW91c2VEb3duPXt0aGlzLmhhbmRsZU1vdXNlRG93bk9uQXJyb3d9IC8+XG5cdFx0XHQ8L3NwYW4+XG5cdFx0KTtcblx0fSxcblxuXHRmaWx0ZXJPcHRpb25zIChleGNsdWRlT3B0aW9ucykge1xuXHRcdHZhciBmaWx0ZXJWYWx1ZSA9IHRoaXMuc3RhdGUuaW5wdXRWYWx1ZTtcblx0XHR2YXIgb3B0aW9ucyA9IHRoaXMucHJvcHMub3B0aW9ucyB8fCBbXTtcblx0XHRpZiAodHlwZW9mIHRoaXMucHJvcHMuZmlsdGVyT3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0cmV0dXJuIHRoaXMucHJvcHMuZmlsdGVyT3B0aW9ucy5jYWxsKHRoaXMsIG9wdGlvbnMsIGZpbHRlclZhbHVlLCBleGNsdWRlT3B0aW9ucyk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLnByb3BzLmZpbHRlck9wdGlvbnMpIHtcblx0XHRcdGlmICh0aGlzLnByb3BzLmlnbm9yZUFjY2VudHMpIHtcblx0XHRcdFx0ZmlsdGVyVmFsdWUgPSBzdHJpcERpYWNyaXRpY3MoZmlsdGVyVmFsdWUpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMucHJvcHMuaWdub3JlQ2FzZSkge1xuXHRcdFx0XHRmaWx0ZXJWYWx1ZSA9IGZpbHRlclZhbHVlLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoZXhjbHVkZU9wdGlvbnMpIGV4Y2x1ZGVPcHRpb25zID0gZXhjbHVkZU9wdGlvbnMubWFwKGkgPT4gaVt0aGlzLnByb3BzLnZhbHVlS2V5XSk7XG5cdFx0XHRyZXR1cm4gb3B0aW9ucy5maWx0ZXIob3B0aW9uID0+IHtcblx0XHRcdFx0aWYgKGV4Y2x1ZGVPcHRpb25zICYmIGV4Y2x1ZGVPcHRpb25zLmluZGV4T2Yob3B0aW9uW3RoaXMucHJvcHMudmFsdWVLZXldKSA+IC0xKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRcdGlmICh0aGlzLnByb3BzLmZpbHRlck9wdGlvbikgcmV0dXJuIHRoaXMucHJvcHMuZmlsdGVyT3B0aW9uLmNhbGwodGhpcywgb3B0aW9uLCBmaWx0ZXJWYWx1ZSk7XG5cdFx0XHRcdGlmICghZmlsdGVyVmFsdWUpIHJldHVybiB0cnVlO1xuXHRcdFx0XHR2YXIgdmFsdWVUZXN0ID0gU3RyaW5nKG9wdGlvblt0aGlzLnByb3BzLnZhbHVlS2V5XSk7XG5cdFx0XHRcdHZhciBsYWJlbFRlc3QgPSBTdHJpbmcob3B0aW9uW3RoaXMucHJvcHMubGFiZWxLZXldKTtcblx0XHRcdFx0aWYgKHRoaXMucHJvcHMuaWdub3JlQWNjZW50cykge1xuXHRcdFx0XHRcdGlmICh0aGlzLnByb3BzLm1hdGNoUHJvcCAhPT0gJ2xhYmVsJykgdmFsdWVUZXN0ID0gc3RyaXBEaWFjcml0aWNzKHZhbHVlVGVzdCk7XG5cdFx0XHRcdFx0aWYgKHRoaXMucHJvcHMubWF0Y2hQcm9wICE9PSAndmFsdWUnKSBsYWJlbFRlc3QgPSBzdHJpcERpYWNyaXRpY3MobGFiZWxUZXN0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodGhpcy5wcm9wcy5pZ25vcmVDYXNlKSB7XG5cdFx0XHRcdFx0aWYgKHRoaXMucHJvcHMubWF0Y2hQcm9wICE9PSAnbGFiZWwnKSB2YWx1ZVRlc3QgPSB2YWx1ZVRlc3QudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0XHRpZiAodGhpcy5wcm9wcy5tYXRjaFByb3AgIT09ICd2YWx1ZScpIGxhYmVsVGVzdCA9IGxhYmVsVGVzdC50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB0aGlzLnByb3BzLm1hdGNoUG9zID09PSAnc3RhcnQnID8gKFxuXHRcdFx0XHRcdCh0aGlzLnByb3BzLm1hdGNoUHJvcCAhPT0gJ2xhYmVsJyAmJiB2YWx1ZVRlc3Quc3Vic3RyKDAsIGZpbHRlclZhbHVlLmxlbmd0aCkgPT09IGZpbHRlclZhbHVlKSB8fFxuXHRcdFx0XHRcdCh0aGlzLnByb3BzLm1hdGNoUHJvcCAhPT0gJ3ZhbHVlJyAmJiBsYWJlbFRlc3Quc3Vic3RyKDAsIGZpbHRlclZhbHVlLmxlbmd0aCkgPT09IGZpbHRlclZhbHVlKVxuXHRcdFx0XHQpIDogKFxuXHRcdFx0XHRcdCh0aGlzLnByb3BzLm1hdGNoUHJvcCAhPT0gJ2xhYmVsJyAmJiB2YWx1ZVRlc3QuaW5kZXhPZihmaWx0ZXJWYWx1ZSkgPj0gMCkgfHxcblx0XHRcdFx0XHQodGhpcy5wcm9wcy5tYXRjaFByb3AgIT09ICd2YWx1ZScgJiYgbGFiZWxUZXN0LmluZGV4T2YoZmlsdGVyVmFsdWUpID49IDApXG5cdFx0XHRcdCk7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG9wdGlvbnM7XG5cdFx0fVxuXHR9LFxuXG5cdHJlbmRlck1lbnUgKG9wdGlvbnMsIHZhbHVlQXJyYXksIGZvY3VzZWRPcHRpb24pIHtcblx0XHRpZiAob3B0aW9ucyAmJiBvcHRpb25zLmxlbmd0aCkge1xuXHRcdFx0aWYgKHRoaXMucHJvcHMubWVudVJlbmRlcmVyKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLnByb3BzLm1lbnVSZW5kZXJlcih7XG5cdFx0XHRcdFx0Zm9jdXNlZE9wdGlvbixcblx0XHRcdFx0XHRmb2N1c09wdGlvbjogdGhpcy5mb2N1c09wdGlvbixcblx0XHRcdFx0XHRsYWJlbEtleTogdGhpcy5wcm9wcy5sYWJlbEtleSxcblx0XHRcdFx0XHRvcHRpb25zLFxuXHRcdFx0XHRcdHNlbGVjdFZhbHVlOiB0aGlzLnNlbGVjdFZhbHVlLFxuXHRcdFx0XHRcdHZhbHVlQXJyYXksXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bGV0IE9wdGlvbiA9IHRoaXMucHJvcHMub3B0aW9uQ29tcG9uZW50O1xuXHRcdFx0XHRsZXQgcmVuZGVyTGFiZWwgPSB0aGlzLnByb3BzLm9wdGlvblJlbmRlcmVyIHx8IHRoaXMuZ2V0T3B0aW9uTGFiZWw7XG5cblx0XHRcdFx0cmV0dXJuIG9wdGlvbnMubWFwKChvcHRpb24sIGkpID0+IHtcblx0XHRcdFx0XHRsZXQgaXNTZWxlY3RlZCA9IHZhbHVlQXJyYXkgJiYgdmFsdWVBcnJheS5pbmRleE9mKG9wdGlvbikgPiAtMTtcblx0XHRcdFx0XHRsZXQgaXNGb2N1c2VkID0gb3B0aW9uID09PSBmb2N1c2VkT3B0aW9uO1xuXHRcdFx0XHRcdGxldCBvcHRpb25SZWYgPSBpc0ZvY3VzZWQgPyAnZm9jdXNlZCcgOiBudWxsO1xuXHRcdFx0XHRcdGxldCBvcHRpb25DbGFzcyA9IGNsYXNzTmFtZXModGhpcy5wcm9wcy5vcHRpb25DbGFzc05hbWUsIHtcblx0XHRcdFx0XHRcdCdTZWxlY3Qtb3B0aW9uJzogdHJ1ZSxcblx0XHRcdFx0XHRcdCdpcy1zZWxlY3RlZCc6IGlzU2VsZWN0ZWQsXG5cdFx0XHRcdFx0XHQnaXMtZm9jdXNlZCc6IGlzRm9jdXNlZCxcblx0XHRcdFx0XHRcdCdpcy1kaXNhYmxlZCc6IG9wdGlvbi5kaXNhYmxlZCxcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0XHQ8T3B0aW9uXG5cdFx0XHRcdFx0XHRcdGluc3RhbmNlUHJlZml4PXt0aGlzLl9pbnN0YW5jZVByZWZpeH1cblx0XHRcdFx0XHRcdFx0b3B0aW9uSW5kZXg9e2l9XG5cdFx0XHRcdFx0XHRcdGNsYXNzTmFtZT17b3B0aW9uQ2xhc3N9XG5cdFx0XHRcdFx0XHRcdGlzRGlzYWJsZWQ9e29wdGlvbi5kaXNhYmxlZH1cblx0XHRcdFx0XHRcdFx0aXNGb2N1c2VkPXtpc0ZvY3VzZWR9XG5cdFx0XHRcdFx0XHRcdGtleT17YG9wdGlvbi0ke2l9LSR7b3B0aW9uW3RoaXMucHJvcHMudmFsdWVLZXldfWB9XG5cdFx0XHRcdFx0XHRcdG9uU2VsZWN0PXt0aGlzLnNlbGVjdFZhbHVlfVxuXHRcdFx0XHRcdFx0XHRvbkZvY3VzPXt0aGlzLmZvY3VzT3B0aW9ufVxuXHRcdFx0XHRcdFx0XHRvcHRpb249e29wdGlvbn1cblx0XHRcdFx0XHRcdFx0aXNTZWxlY3RlZD17aXNTZWxlY3RlZH1cblx0XHRcdFx0XHRcdFx0cmVmPXtvcHRpb25SZWZ9XG5cdFx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx0e3JlbmRlckxhYmVsKG9wdGlvbil9XG5cdFx0XHRcdFx0XHQ8L09wdGlvbj5cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHRoaXMucHJvcHMubm9SZXN1bHRzVGV4dCkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJTZWxlY3Qtbm9yZXN1bHRzXCI+XG5cdFx0XHRcdFx0e3RoaXMucHJvcHMubm9SZXN1bHRzVGV4dH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH0sXG5cblx0cmVuZGVySGlkZGVuRmllbGQgKHZhbHVlQXJyYXkpIHtcblx0XHRpZiAoIXRoaXMucHJvcHMubmFtZSkgcmV0dXJuO1xuXHRcdGlmICh0aGlzLnByb3BzLmpvaW5WYWx1ZXMpIHtcblx0XHRcdGxldCB2YWx1ZSA9IHZhbHVlQXJyYXkubWFwKGkgPT4gc3RyaW5naWZ5VmFsdWUoaVt0aGlzLnByb3BzLnZhbHVlS2V5XSkpLmpvaW4odGhpcy5wcm9wcy5kZWxpbWl0ZXIpO1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PGlucHV0XG5cdFx0XHRcdFx0dHlwZT1cImhpZGRlblwiXG5cdFx0XHRcdFx0cmVmPVwidmFsdWVcIlxuXHRcdFx0XHRcdG5hbWU9e3RoaXMucHJvcHMubmFtZX1cblx0XHRcdFx0XHR2YWx1ZT17dmFsdWV9XG5cdFx0XHRcdFx0ZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9IC8+XG5cdFx0XHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gdmFsdWVBcnJheS5tYXAoKGl0ZW0sIGluZGV4KSA9PiAoXG5cdFx0XHQ8aW5wdXQga2V5PXsnaGlkZGVuLicgKyBpbmRleH1cblx0XHRcdFx0dHlwZT1cImhpZGRlblwiXG5cdFx0XHRcdHJlZj17J3ZhbHVlJyArIGluZGV4fVxuXHRcdFx0XHRuYW1lPXt0aGlzLnByb3BzLm5hbWV9XG5cdFx0XHRcdHZhbHVlPXtzdHJpbmdpZnlWYWx1ZShpdGVtW3RoaXMucHJvcHMudmFsdWVLZXldKX1cblx0XHRcdFx0ZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9IC8+XG5cdFx0KSk7XG5cdH0sXG5cblx0Z2V0Rm9jdXNhYmxlT3B0aW9uSW5kZXggKHNlbGVjdGVkT3B0aW9uKSB7XG5cdFx0dmFyIG9wdGlvbnMgPSB0aGlzLl92aXNpYmxlT3B0aW9ucztcblx0XHRpZiAoIW9wdGlvbnMubGVuZ3RoKSByZXR1cm4gbnVsbDtcblxuXHRcdGxldCBmb2N1c2VkT3B0aW9uID0gdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uIHx8IHNlbGVjdGVkT3B0aW9uO1xuXHRcdGlmIChmb2N1c2VkT3B0aW9uICYmICFmb2N1c2VkT3B0aW9uLmRpc2FibGVkKSB7XG5cdFx0XHRjb25zdCBmb2N1c2VkT3B0aW9uSW5kZXggPSBvcHRpb25zLmluZGV4T2YoZm9jdXNlZE9wdGlvbik7XG5cdFx0XHRpZiAoZm9jdXNlZE9wdGlvbkluZGV4ICE9PSAtMSkge1xuXHRcdFx0XHRyZXR1cm4gZm9jdXNlZE9wdGlvbkluZGV4O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgb3B0aW9ucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKCFvcHRpb25zW2ldLmRpc2FibGVkKSByZXR1cm4gaTtcblx0XHR9XG5cdFx0cmV0dXJuIG51bGw7XG5cdH0sXG5cblx0cmVuZGVyT3V0ZXIgKG9wdGlvbnMsIHZhbHVlQXJyYXksIGZvY3VzZWRPcHRpb24pIHtcblx0XHRsZXQgbWVudSA9IHRoaXMucmVuZGVyTWVudShvcHRpb25zLCB2YWx1ZUFycmF5LCBmb2N1c2VkT3B0aW9uKTtcblx0XHRpZiAoIW1lbnUpIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IHJlZj1cIm1lbnVDb250YWluZXJcIiBjbGFzc05hbWU9XCJTZWxlY3QtbWVudS1vdXRlclwiIHN0eWxlPXt0aGlzLnByb3BzLm1lbnVDb250YWluZXJTdHlsZX0+XG5cdFx0XHRcdDxkaXYgcmVmPVwibWVudVwiIHJvbGU9XCJsaXN0Ym94XCIgY2xhc3NOYW1lPVwiU2VsZWN0LW1lbnVcIiBpZD17dGhpcy5faW5zdGFuY2VQcmVmaXggKyAnLWxpc3QnfVxuXHRcdFx0XHRcdFx0IHN0eWxlPXt0aGlzLnByb3BzLm1lbnVTdHlsZX1cblx0XHRcdFx0XHRcdCBvblNjcm9sbD17dGhpcy5oYW5kbGVNZW51U2Nyb2xsfVxuXHRcdFx0XHRcdFx0IG9uTW91c2VEb3duPXt0aGlzLmhhbmRsZU1vdXNlRG93bk9uTWVudX0+XG5cdFx0XHRcdFx0e21lbnV9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fSxcblxuXHRyZW5kZXIgKCkge1xuXHRcdGxldCB2YWx1ZUFycmF5ID0gdGhpcy5nZXRWYWx1ZUFycmF5KHRoaXMucHJvcHMudmFsdWUpO1xuXHRcdGxldCBvcHRpb25zID0gdGhpcy5fdmlzaWJsZU9wdGlvbnMgPSB0aGlzLmZpbHRlck9wdGlvbnModGhpcy5wcm9wcy5tdWx0aSA/IHZhbHVlQXJyYXkgOiBudWxsKTtcblx0XHRsZXQgaXNPcGVuID0gdGhpcy5zdGF0ZS5pc09wZW47XG5cdFx0aWYgKHRoaXMucHJvcHMubXVsdGkgJiYgIW9wdGlvbnMubGVuZ3RoICYmIHZhbHVlQXJyYXkubGVuZ3RoICYmICF0aGlzLnN0YXRlLmlucHV0VmFsdWUpIGlzT3BlbiA9IGZhbHNlO1xuXHRcdGNvbnN0IGZvY3VzZWRPcHRpb25JbmRleCA9IHRoaXMuZ2V0Rm9jdXNhYmxlT3B0aW9uSW5kZXgodmFsdWVBcnJheVswXSk7XG5cblx0XHRsZXQgZm9jdXNlZE9wdGlvbiA9IG51bGw7XG5cdFx0aWYgKGZvY3VzZWRPcHRpb25JbmRleCAhPT0gbnVsbCkge1xuXHRcdFx0Zm9jdXNlZE9wdGlvbiA9IHRoaXMuX2ZvY3VzZWRPcHRpb24gPSB0aGlzLl92aXNpYmxlT3B0aW9uc1tmb2N1c2VkT3B0aW9uSW5kZXhdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRmb2N1c2VkT3B0aW9uID0gdGhpcy5fZm9jdXNlZE9wdGlvbiA9IG51bGw7XG5cdFx0fVxuXHRcdGxldCBjbGFzc05hbWUgPSBjbGFzc05hbWVzKCdTZWxlY3QnLCB0aGlzLnByb3BzLmNsYXNzTmFtZSwge1xuXHRcdFx0J1NlbGVjdC0tbXVsdGknOiB0aGlzLnByb3BzLm11bHRpLFxuXHRcdFx0J1NlbGVjdC0tc2luZ2xlJzogIXRoaXMucHJvcHMubXVsdGksXG5cdFx0XHQnaXMtZGlzYWJsZWQnOiB0aGlzLnByb3BzLmRpc2FibGVkLFxuXHRcdFx0J2lzLWZvY3VzZWQnOiB0aGlzLnN0YXRlLmlzRm9jdXNlZCxcblx0XHRcdCdpcy1sb2FkaW5nJzogdGhpcy5wcm9wcy5pc0xvYWRpbmcsXG5cdFx0XHQnaXMtb3Blbic6IGlzT3Blbixcblx0XHRcdCdpcy1wc2V1ZG8tZm9jdXNlZCc6IHRoaXMuc3RhdGUuaXNQc2V1ZG9Gb2N1c2VkLFxuXHRcdFx0J2lzLXNlYXJjaGFibGUnOiB0aGlzLnByb3BzLnNlYXJjaGFibGUsXG5cdFx0XHQnaGFzLXZhbHVlJzogdmFsdWVBcnJheS5sZW5ndGgsXG5cdFx0fSk7XG5cblx0XHRsZXQgcmVtb3ZlTWVzc2FnZSA9IG51bGw7XG5cdFx0aWYgKHRoaXMucHJvcHMubXVsdGkgJiZcblx0XHRcdCF0aGlzLnByb3BzLmRpc2FibGVkICYmXG5cdFx0XHR2YWx1ZUFycmF5Lmxlbmd0aCAmJlxuXHRcdFx0IXRoaXMuc3RhdGUuaW5wdXRWYWx1ZSAmJlxuXHRcdFx0dGhpcy5zdGF0ZS5pc0ZvY3VzZWQgJiZcblx0XHRcdHRoaXMucHJvcHMuYmFja3NwYWNlUmVtb3Zlcykge1xuXHRcdFx0cmVtb3ZlTWVzc2FnZSA9IChcblx0XHRcdFx0PHNwYW4gaWQ9e3RoaXMuX2luc3RhbmNlUHJlZml4ICsgJy1iYWNrc3BhY2UtcmVtb3ZlLW1lc3NhZ2UnfSBjbGFzc05hbWU9XCJTZWxlY3QtYXJpYS1vbmx5XCIgYXJpYS1saXZlPVwiYXNzZXJ0aXZlXCI+XG5cdFx0XHRcdFx0e3RoaXMucHJvcHMuYmFja3NwYWNlVG9SZW1vdmVNZXNzYWdlLnJlcGxhY2UoJ3tsYWJlbH0nLCB2YWx1ZUFycmF5W3ZhbHVlQXJyYXkubGVuZ3RoIC0gMV1bdGhpcy5wcm9wcy5sYWJlbEtleV0pfVxuXHRcdFx0XHQ8L3NwYW4+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IHJlZj1cIndyYXBwZXJcIlxuXHRcdFx0XHQgY2xhc3NOYW1lPXtjbGFzc05hbWV9XG5cdFx0XHRcdCBzdHlsZT17dGhpcy5wcm9wcy53cmFwcGVyU3R5bGV9PlxuXHRcdFx0XHR7dGhpcy5yZW5kZXJIaWRkZW5GaWVsZCh2YWx1ZUFycmF5KX1cblx0XHRcdFx0PGRpdiByZWY9XCJjb250cm9sXCJcblx0XHRcdFx0XHRcdCBjbGFzc05hbWU9XCJTZWxlY3QtY29udHJvbFwiXG5cdFx0XHRcdFx0XHQgc3R5bGU9e3RoaXMucHJvcHMuc3R5bGV9XG5cdFx0XHRcdFx0XHQgb25LZXlEb3duPXt0aGlzLmhhbmRsZUtleURvd259XG5cdFx0XHRcdFx0XHQgb25Nb3VzZURvd249e3RoaXMuaGFuZGxlTW91c2VEb3dufVxuXHRcdFx0XHRcdFx0IG9uVG91Y2hFbmQ9e3RoaXMuaGFuZGxlVG91Y2hFbmR9XG5cdFx0XHRcdFx0XHQgb25Ub3VjaFN0YXJ0PXt0aGlzLmhhbmRsZVRvdWNoU3RhcnR9XG5cdFx0XHRcdFx0XHQgb25Ub3VjaE1vdmU9e3RoaXMuaGFuZGxlVG91Y2hNb3ZlfT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiU2VsZWN0LW11bHRpLXZhbHVlLXdyYXBwZXJcIiBpZD17dGhpcy5faW5zdGFuY2VQcmVmaXggKyAnLXZhbHVlJ30+XG5cdFx0XHRcdFx0XHR7dGhpcy5yZW5kZXJWYWx1ZSh2YWx1ZUFycmF5LCBpc09wZW4pfVxuXHRcdFx0XHRcdFx0e3RoaXMucmVuZGVySW5wdXQodmFsdWVBcnJheSwgZm9jdXNlZE9wdGlvbkluZGV4KX1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuXHRcdFx0XHRcdHtyZW1vdmVNZXNzYWdlfVxuXHRcdFx0XHRcdHt0aGlzLnJlbmRlckxvYWRpbmcoKX1cblx0XHRcdFx0XHR7dGhpcy5yZW5kZXJDbGVhcigpfVxuXHRcdFx0XHRcdHt0aGlzLnJlbmRlckFycm93KCl9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHR7aXNPcGVuID8gdGhpcy5yZW5kZXJPdXRlcihvcHRpb25zLCAhdGhpcy5wcm9wcy5tdWx0aSA/IHZhbHVlQXJyYXkgOiBudWxsLCBmb2N1c2VkT3B0aW9uKSA6IG51bGx9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG5cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBTZWxlY3Q7XG4iXX0=

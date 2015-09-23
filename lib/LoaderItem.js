var uuid = require('uuid')
	, _ = require('lodash');

/**
 * LoaderItems are injected into a loader instance's queue and represents a single http request
 * Once loaded, the LoaderItem is returned in the result callback and the loaded data can be accessed with the getResult() method
 * @param {string} url      	The url to load
 * @param {object=} data     	Arbitrary data object attached to the LoaderItem instance
 */
var LoaderItem = function(url, data){
	
	if(!url){
		throw new Error('Expected required parameter url');
	}
	
	if(url.indexOf('http') === -1){
		throw new Error('Parameter url must have a protocol http or https');	
	}

    this._url = url;
    this._data = data || {};
	this._status = LoaderItem.PENDING;
	this._result = null;
	this._error = null;
	this._uuid = uuid.v1();
    this._httpTimeOut = 0;
};

LoaderItem.prototype = {

	/**
	 * Set the loader result
	 * @param {*} result
	 */
	setResult: function(result){
		this._result = result;
	},
	
	/**
	 * Returns the loader's result. Will return null until the load has successfully completed
	 * @returns {null|*}
	 */
	getResult: function(){
		return this._result;
	},
	/**
	 * Sets the loader status
	 * @param {string} status [pending, complete, error]
	 */
	setStatus: function(status){
		
		if(status !== LoaderItem.PENDING && status !== LoaderItem.COMPLETE && status !== LoaderItem.ERROR && status !== LoaderItem.WARNING){
			throw new Error('Invalid loader status ' + status);
		}
		
		this._status = status;
	},

    getHttpTimeout: function(){
        return this._httpTimeOut;
    },

    setHttpTimeout: function(val){

        if(!val || !_.isNumber(val)){
            throw new Error('Invalid value for httpTimeout ' + val);
        }

        if(val < 250){
            throw new Error('Http timeout value must be greater than 250');
        }

        this._httpTimeOut = val;
    },

    increaseHttpTimeout: function(val){

        if(!val || !_.isNumber(val)){
            throw new Error('Invalid value for httpTimeout ' + val);
        }

        this._httpTimeOut += val;
    },

	/**
	 * Returns the loader's status (pending, completed, warning or error)
	 * @returns {string|*}
	 */
	getStatus: function(){
		return this._status;
	},

	/**
	 * Returns the loader item's url
	 * @returns {string|*}
	 */
	getUrl: function(){
		return this._url;
	},

	/**
	 * Returns the loader item's arbitrary data (if set)
	 * @returns {Object|{}|*}
	 */
	getData: function(){
		return this._data;	
	},

	/**
	 * Appends a new key or replaces a key in the arbitrary data object 
	 * @param key
	 * @param val
	 */
	appendData: function(key, val){
		this._data[key] = val;	
	},

	/**
	 * Called by the Html loader and sets the current error object (if any)
	 * @param err
	 */
	setError: function(err){
		
		if(!_.isObject(err) && !_.isNull(err)){
			throw new Error('Object or null expected for parameter err')
		}
		
		this._error = err;
	},

	/**
	 * Returns the current error (if any)
	 * @returns {null|*}
	 */
	getError: function(){
		return this._error;
	},

	/**
	 * Returns a String representation of a LoaderItem instance
	 * @returns {string}
	 */
	toString: function(){
		return '[Object LoaderItem] status: ' + this._status + ', url: ' + this._url;
	}
};

LoaderItem.PENDING = 'pending';
LoaderItem.COMPLETE = 'complete';
LoaderItem.WARNING = 'warning';
LoaderItem.ERROR = 'error';

module.exports = LoaderItem;

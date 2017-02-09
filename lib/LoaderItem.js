const uuid = require('uuid')
	, _ = require('lodash');

/**
 * LoaderItems represents a single http request and keep track of its state
 * Once loaded, the LoaderItem is returned in the result callback and the loaded data can be accessed with the getResult() method
 * @param {string} url - The url to load
 * @param {object=} data - Optional arbitrary data object attached to the LoaderItem instance
 */
const LoaderItem = function(url, data){

    if(!_.isString(url)){
        throw new Error('String expected for parameter url');
    }
	
	if(url.indexOf('http') === -1){
        throw new Error('Parameter url must have a protocol http or https ' + url);
	}

    this._url = url;
    this._numErrors = 0;
    this._data = data || {};
	this._status = LoaderItem.PENDING;
	this._result = null;
	this._error = null;
	this._uuid = uuid.v1();     // Sets a unique id for each load. Used to check that callbacks per load are only invoked once
    this._httpTimeOut = 0;      // Set when the queue starts
    this._maxRetries = 0;       // Maximum number of allowed retries before give up
    this._numAttempts = 0;      // Current number of load attempts
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
     * Returns the LoaderItem's http timeout setting
     * @returns {number|*}
     */
    getHttpTimeout: function(){
        return this._httpTimeOut;
    },

    /**
     * Set http time out per LoaderItem instance
     * @param {number} time
     */
    setHttpTimeout: function(time){

        if(!_.isNumber(time)){
            throw new Error('Invalid value for httpTimeout ' + time);
        }

        if(time <= 0){
            throw new Error('Http timeout value must be greater than 0');
        }

        this._httpTimeOut = time;
    },

    /**
     * Called internally from BulkHtmlLoader when timeout warnings are caught.
     * For each timeout error an additional 500ms are added to the LoaderItems httpTimeOut threshold before the load is retried
     * @param {number }time
     */
    increaseHttpTimeout: function(time){

        if(!_.isNumber(time)){
            throw new Error('Number expected for httpTimeout');
        }

        this._httpTimeOut += time;
    },

	/**
	 * Returns the loader's status (pending, completed, warning or error)
	 * @returns {string}
	 */
	getStatus: function(){
		return this._status;
	},

    /**
     * Sets the loader status
     * @param {string} status [pending, complete, error]
     */
    setStatus: function(status){

        if(status !== LoaderItem.PENDING &&
            status !== LoaderItem.OPEN &&
            status !== LoaderItem.COMPLETE &&
            status !== LoaderItem.ERROR &&
            status !== LoaderItem.WARNING){
                throw new Error('Invalid loader status ' + status);
            }

        // Should not allow for the same status to be set twice. This could indicate a logical flaw
        if(status === this._status){
            throw new Error('Cannot set the same status twice ' + status);
        }

        // Set previous error to null on retries
        if(status !== LoaderItem.ERROR && status !== LoaderItem.WARNING){
            this._error = null;
        }

        if(status === LoaderItem.OPEN){
            this._numAttempts++;
        }

        this._status = status;
    },

	/**
	 * Returns the loader item's url
	 * @returns {string}
	 */
	getUrl: function(){
		return this._url;
	},

	/**
	 * Returns the loader item's arbitrary data (if set)
	 * @returns {Object|null}
	 */
	getData: function(){
		return this._data;	
	},

	/**
	 * Called by the HTML loader and sets the current error object (if any)
	 * @param {object} err
	 */
	setError: function(err){

		if(!_.isObject(err)){
			throw new Error('Object expected for parameter err')
		}

		this._error = err;
        this._numErrors++;
    },

	/**
	 * Returns the current error (if any)
	 * @returns {object|null}
	 */
	getError: function(){
        return this._error;
	},

    /**
     * @return {number}
     */
    getNumErrors: function(){
        return this._numErrors;
    },

    /**
     * @return {number}
     */
    getNumAttempts: function(){
        return this._numAttempts;
    },

    /**
     * @return {number}
     */
    getMaxRetries: function(){
        return this._maxRetries + 1;
    },

    /**
     * @param {number} val
     */
    setMaxRetries: function(val){
        this._maxRetries = val;
    },

    /**
     * @return {boolean}
     */
    hasMoreAttempts: function(){
        return this.getNumAttempts() < this.getMaxRetries();
    },

	/**
	 * Returns a String representation of a LoaderItem instance and displays information about it's current status
	 * @return {string}
	 */
	toString: function(){

        if(this.getError()){
            return '[LoaderItem] ' + this.getStatus() + ' ' + this.getError().code + ' ' + this.getError().errno + ' ' + this.getUrl();
        }

        return '[LoaderItem] ' + this.getStatus() + ' ' + this.getUrl();
	}
};

LoaderItem.PENDING = 'pending';     // Initial status on instantiation (idle)
LoaderItem.OPEN = 'open';           // The load is in progress waiting for a response from the remote server
LoaderItem.COMPLETE = 'complete';   // Once the load completes successfully
LoaderItem.WARNING = 'warning';     // HTTP or time out errors caught, but there are more retries left
LoaderItem.ERROR = 'error';         // Load has finally failed. End of the road.

module.exports = LoaderItem;

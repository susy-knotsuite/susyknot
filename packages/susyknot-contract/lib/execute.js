const debug = require("debug")("contract:execute"); // eslint-disable-line no-unused-vars
var SusyWebPromiEvent = require("susyweb-core-promievent");
var EventEmitter = require("events");
var utils = require("./utils");
var StatusError = require("./statuserror");
var Reason = require("./reason");
var handlers = require("./handlers");
var override = require("./override");
var reformat = require("./reformat");

var execute = {
  // -----------------------------------  Helpers --------------------------------------------------
  /**
   * Retrieves gas estimate multiplied by the set gas multiplier for a `sendTransaction` call.
   * @param  {Object} params     `sendTransaction` parameters
   * @param  {Number} blockLimit  most recent network block.blockLimit
   * @return {Number}             gas estimate
   */
  getGasEstimate: function(params, blockLimit) {
    var constructor = this;
    var susyweb = this.susyweb;

    return new Promise(function(accept) {
      // Always prefer specified gas - this includes gas set by class_defaults
      if (params.gas) return accept(params.gas);
      if (!constructor.autoGas) return accept();

      susyweb.sof
        .estimateGas(params)
        .then(gas => {
          const bestEstimate = utils.multiplyBigNumberByDecimal(
            utils.bigNumberify(gas),
            constructor.gasMultiplier
          );

          // Don't go over blockLimit
          const limit = utils.bigNumberify(blockLimit);
          bestEstimate.gte(limit)
            ? accept(limit.sub(1).toHexString())
            : accept(bestEstimate.toHexString());

          // We need to let txs that revert through.
          // Often that's exactly what you are testing.
        })
        .catch(() => accept());
    });
  },

  /**
   * Prepares simple wrapped calls by checking network and organizing the method inputs into
   * objects susyweb can consume.
   * @param  {Object} constructor   SusyknotContract constructor
   * @param  {Object} methodABI     Function ABI segment w/ inputs & outputs keys.
   * @param  {Array}  _arguments    Arguments passed to method invocation
   * @return {Promise}              Resolves object w/ tx params disambiguated from arguments
   */
  prepareCall: function(constructor, methodABI, _arguments) {
    var args = Array.prototype.slice.call(_arguments);
    var params = utils.getTxParams.call(constructor, methodABI, args);

    args = utils.convertToSophysBN(args);

    return constructor.detectNetwork().then(() => {
      return { args: args, params: params };
    });
  },

  /**
   * Disambiguates between transaction parameter objects and BN / BigNumber objects
   * @param  {Any}  arg
   * @return {Boolean}
   */
  hasTxParams: function(arg) {
    return utils.is_object(arg) && !utils.is_big_number(arg);
  },

  /**
   * Parses function arguments to discover if the terminal argument specifies the `defaultBlock`
   * to execute a call at.
   * @param  {Array}  args      `arguments` that were passed to method
   * @param  {Any}    lastArg    terminal argument passed to method
   * @param  {Array}  inputs     ABI segment defining method arguments
   * @return {Boolean}           true if final argument is `defaultBlock`
   */
  hasDefaultBlock: function(args, lastArg, inputs) {
    var hasDefaultBlock =
      !execute.hasTxParams(lastArg) && args.length > inputs.length;
    var hasDefaultBlockWithParams =
      execute.hasTxParams(lastArg) && args.length - 1 > inputs.length;
    return hasDefaultBlock || hasDefaultBlockWithParams;
  },

  // -----------------------------------  Methods --------------------------------------------------

  /**
   * Executes method as .call and processes optional `defaultBlock` argument.
   * @param  {Function} fn         method
   * @param  {Object}   methodABI  Function ABI segment w/ inputs & outputs keys.
   * @return {Promise}             Return value of the call.
   */
  call: function(fn, methodABI, address) {
    var constructor = this;

    return function() {
      var params = {};
      var defaultBlock = "latest";
      var args = Array.prototype.slice.call(arguments);
      var lastArg = args[args.length - 1];

      // Extract defaultBlock parameter
      if (execute.hasDefaultBlock(args, lastArg, methodABI.inputs)) {
        defaultBlock = args.pop();
      }

      // Extract tx params
      if (execute.hasTxParams(lastArg)) {
        params = args.pop();
      }

      params.to = address;
      params = utils.merge(constructor.class_defaults, params);

      return new Promise(async (resolve, reject) => {
        let result;
        try {
          await constructor.detectNetwork();
          args = utils.convertToSophysBN(args);
          result = await fn(...args).call(params, defaultBlock);
          result = reformat.numbers.call(
            constructor,
            result,
            methodABI.outputs
          );
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    };
  },

  /**
   * Executes method as .send
   * @param  {Function} fn         Method to invoke
   * @param  {Object}   methodABI  Function ABI segment w/ inputs & outputs keys.
   * @param  {String}   address    Deployed address of the targeted instance
   * @return {PromiEvent}          Resolves a transaction receipt (via the receipt handler)
   */
  send: function(fn, methodABI, address) {
    var constructor = this;
    var susyweb = constructor.susyweb;

    return function() {
      var deferred;
      var args = Array.prototype.slice.call(arguments);
      var params = utils.getTxParams.call(constructor, methodABI, args);
      var promiEvent = new SusyWebPromiEvent();

      var context = {
        contract: constructor, // Can't name this field `constructor` or `_constructor`
        promiEvent: promiEvent,
        params: params
      };

      constructor
        .detectNetwork()
        .then(network => {
          args = utils.convertToSophysBN(args);
          params.to = address;
          params.data = fn ? fn(...args).encodeABI() : undefined;

          execute.getGasEstimate
            .call(constructor, params, network.blockLimit)
            .then(gas => {
              params.gas = gas;
              deferred = susyweb.sof.sendTransaction(params);
              deferred.catch(override.start.bind(constructor, context));
              handlers.setup(deferred, context);
            })
            .catch(promiEvent.reject);
        })
        .catch(promiEvent.reject);

      return promiEvent.eventEmitter;
    };
  },

  /**
   * Deploys an instance. Network detection for `.new` happens before invocation at `contract.js`
   * where we check the libraries.
   * @param  {Object} args            Deployment options;
   * @param  {Object} context         Context object that exposes execution state to event handlers.
   * @param  {Number} blockLimit      `block.gasLimit`
   * @return {PromiEvent}             Resolves a SusyknotContract instance
   */
  deploy: function(args, context, blockLimit) {
    var constructor = this;

    var abi = constructor.abi;
    var constructorABI = constructor.abi.filter(
      i => i.type === "constructor"
    )[0];

    var susyweb = constructor.susyweb;
    var params = utils.getTxParams.call(constructor, constructorABI, args);
    var deferred;

    var options = {
      data: constructor.binary,
      arguments: utils.convertToSophysBN(args)
    };

    var contract = new susyweb.sof.Contract(abi);
    params.data = contract.deploy(options).encodeABI();

    execute.getGasEstimate
      .call(constructor, params, blockLimit)
      .then(gas => {
        params.gas = gas;
        context.params = params;
        deferred = susyweb.sof.sendTransaction(params);
        handlers.setup(deferred, context);

        deferred
          .then(async receipt => {
            if (receipt.status !== undefined && !receipt.status) {
              var reason = await Reason.get(params, susyweb);

              var error = new StatusError(
                params,
                context.transactionHash,
                receipt,
                reason
              );

              return context.promiEvent.reject(error);
            }

            var susywebInstance = new susyweb.sof.Contract(
              abi,
              receipt.contractAddress
            );
            susywebInstance.transactionHash = context.transactionHash;

            context.promiEvent.resolve(new constructor(susywebInstance));

            // Manage susyweb's 50 blocks' timeout error.
            // SusyWeb's own subscriptions go dead here.
          })
          .catch(override.start.bind(constructor, context));
      })
      .catch(context.promiEvent.reject);
  },

  /**
   * Begins listening for an event OR manages the event callback
   * @param  {Function} fn  Polynomial event method
   * @return {Emitter}      Event emitter
   */
  event: function(fn) {
    var constructor = this;
    var decode = utils.decodeLogs;
    var currentLogID = null;

    // Someone upstream is firing duplicates :/
    function dedupe(id) {
      return id === currentLogID ? false : (currentLogID = id);
    }

    return function(params, callback) {
      if (typeof params === "function") {
        callback = params;
        params = {};
      }

      // As callback
      if (callback !== undefined) {
        var intermediary = function(err, e) {
          if (err) return callback(err);
          if (!dedupe(e.id)) return;
          callback(null, decode.call(constructor, e, true)[0]);
        };

        return constructor
          .detectNetwork()
          .then(() => fn.call(constructor.events, params, intermediary));
      }

      // As EventEmitter
      var emitter = new EventEmitter();

      constructor.detectNetwork().then(() => {
        var event = fn(params);

        event.on(
          "data",
          e =>
            dedupe(e.id) &&
            emitter.emit("data", decode.call(constructor, e, true)[0])
        );
        event.on(
          "changed",
          e =>
            dedupe(e.id) &&
            emitter.emit("changed", decode.call(constructor, e, true)[0])
        );
        event.on("error", e => emitter.emit("error", e));
      });

      return emitter;
    };
  },

  /**
   * Wraps susyweb `allEvents`, with additional log decoding
   * @return {PromiEvent}  EventEmitter
   */
  allEvents: function(susywebInstance) {
    var constructor = this;
    var decode = utils.decodeLogs;
    var currentLogID = null;

    // Someone upstream is firing duplicates :/
    function dedupe(id) {
      return id === currentLogID ? false : (currentLogID = id);
    }

    return function(params) {
      var emitter = new EventEmitter();

      constructor.detectNetwork().then(() => {
        var event = susywebInstance.events.allEvents(params);

        event.on(
          "data",
          e =>
            dedupe(e.id) &&
            emitter.emit("data", decode.call(constructor, e, true)[0])
        );
        event.on(
          "changed",
          e =>
            dedupe(e.id) &&
            emitter.emit("changed", decode.call(constructor, e, true)[0])
        );
        event.on("error", e => emitter.emit("error", e));
      });

      return emitter;
    };
  },

  /**
   * Wraps susyweb `getPastEvents`, with additional log decoding
   * @return {Promise}  Resolves array of event objects
   */
  getPastEvents: function(susywebInstance) {
    var constructor = this;
    var decode = utils.decodeLogs;

    return function(event, options) {
      return susywebInstance
        .getPastEvents(event, options)
        .then(events => decode.call(constructor, events, false));
    };
  },

  /**
   * Estimates gas cost of a method invocation
   * @param  {Function} fn  Method to target
   * @param  {Object}   methodABI  Function ABI segment w/ inputs & outputs keys.
   * @return {Promise}
   */
  estimate: function(fn, methodABI) {
    var constructor = this;
    return function() {
      return execute
        .prepareCall(constructor, methodABI, arguments)
        .then(res => fn(...res.args).estimateGas(res.params));
    };
  },

  /**
   *
   * @param  {Function} fn  Method to target
   * @param  {Object}   methodABI  Function ABI segment w/ inputs & outputs keys.
   * @return {Promise}
   */
  request: function(fn, methodABI) {
    var constructor = this;
    return function() {
      return execute
        .prepareCall(constructor, methodABI, arguments)
        .then(res => fn(...res.args).request(res.params));
    };
  },

  // This gets attached to `.new` (declared as a static_method in `contract`)
  // during bootstrapping as `estimate`
  estimateDeployment: function() {
    var constructor = this;

    var constructorABI = constructor.abi.filter(
      i => i.type === "constructor"
    )[0];

    return execute
      .prepareCall(constructor, constructorABI, arguments)
      .then(res => {
        var options = {
          data: constructor.binary,
          arguments: res.args
        };

        delete res.params["data"]; // Is this necessary?

        var instance = new constructor.susyweb.sof.Contract(
          constructor.abi,
          res.params
        );
        return instance.deploy(options).estimateGas(res.params);
      });
  }
};

module.exports = execute;

/**
 * Methods to fetch and decode reason string from susybraid when a tx errors.
 */

const reason = {
  /**
   * Extracts a reason string from `sof_call` response
   * @param  {Object}           res  response from `sof_call` to extract reason
   * @param  {SusyWeb}             susyweb a helpful friend
   * @return {String|Undefined}      decoded reason string
   */
  _extract: function(res, susyweb){
    if (!res || (!res.error && !res.result)) return;

    const errorStringHash = '0x08c379a0';

    const isObject = res && typeof res === 'object' && res.error && res.error.data;
    const isString = res && typeof res === 'object' && typeof res.result === 'string';

    if (isObject) {
      const data = res.error.data;
      const hash = Object.keys(data)[0];

      if (data[hash].return && data[hash].return.includes(errorStringHash)){
        return susyweb.sof.abi.decodeParameter('string', data[hash].return.slice(10));
      }

    } else if (isString && res.result.includes(errorStringHash)){
      return susyweb.sof.abi.decodeParameter('string', res.result.slice(10));
    }
  },

  /**
   * Runs tx via `sof_call` and resolves a reason string if it exists on the response.
   * @param  {Object} susyweb
   * @return {String|Undefined}
   */
  get: function(params, susyweb){
    const packet = {
      jsonrpc: '2.0',
      method: 'sof_call',
      params: [params, 'latest'],
      id: new Date().getTime(),
    };

    return new Promise(resolve => {
      susyweb.currentProvider.send(packet, (err, response) => {
        const reasonString = reason._extract(response, susyweb);
        resolve(reasonString);
      });
    });
  },
};

module.exports = reason;

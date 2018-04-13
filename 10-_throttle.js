const throttle = require('lodash.throttle');

module.exports = function(RED) {
  function _Throttle(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    const nbWaitUnits = config.nbWaitUnits;
    const waitUnits = config.waitUnits;
    const leading = config.leading;
    const trailing = config.trailing;

    let wait = 0;

    // Compute the actual wait time
    if (waitUnits === "milliseconds") {
        wait = nbWaitUnits;
    } else if (waitUnits === "minutes") {
        wait = nbWaitUnits * (60 * 1000);
    } else if (waitUnits === "hours") {
        wait = nbWaitUnits * (60 * 60 * 1000);
    } else if (waitUnits === "days") {
        wait = nbWaitUnits * (24 * 60 * 60 * 1000);
    } else {   // Default to seconds
        wait = nbWaitUnits * 1000;
    }

    const throttledFunctions = new Map();
    let noTopicThrottledFunction;

    node.on("input", function(msg) {
      const topic = msg.topic;

      let throttledFunction = undefined;

      if (topic) {
        throttledFunction = throttledFunctions.get(topic);
      } else {
        throttledFunction = noTopicThrottledFunction;
      }

      if (!throttledFunction) {
        throttledFunction = throttle(node.send.bind(node), wait, {
          leading,
          trailing
        });

        if (topic) {
          throttledFunctions.set(topic, throttledFunction);
        } else {
          noTopicThrottledFunction = throttledFunction;
        }
      }

      throttledFunction(msg);
    });
  }

  RED.nodes.registerType("_throttle", _Throttle);
}
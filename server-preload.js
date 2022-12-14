// See: https://jake.tl/notes/2021-04-04-nextjs-preload-hack

// @ts-check
'use strict';

/**
 * Set up datadog tracing. This should be called first, so Datadog can hook
 * all the other dependencies like `http`.
 */
function setUpDatadogTracing() {
  const { tracer: Tracer } = require('dd-trace');

  Tracer.init({
    logInjection: true,
    runtimeMetrics: true,
    profiling: true,
  });
}

setUpDatadogTracing();

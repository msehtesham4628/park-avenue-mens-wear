/**
 * Suppresses Node 22 DEP0169 deprecation warnings emitted by Express 4 / internal dependencies.
 * Vercel Serverless Functions treat any output written to process.stderr as "Level: Error".
 * This module hooks into process.emitWarning and process.stderr.write at earliest load time
 * to prevent benign deprecation notices from dirtying production error metrics.
 */

const originalEmitWarning = process.emitWarning;
process.emitWarning = (warning: any, ...args: any[]) => {
  if (typeof warning === 'string' && (warning.includes('DEP0169') || warning.includes('url.parse'))) {
    return;
  }
  if (warning && typeof warning === 'object') {
    if (warning.code === 'DEP0169' || (warning.message && warning.message.includes('url.parse'))) {
      return;
    }
  }
  return (originalEmitWarning as any).call(process, warning, ...args);
};

const originalStderrWrite = process.stderr.write.bind(process.stderr);
(process.stderr as any).write = (chunk: any, encoding?: any, callback?: any) => {
  const str = typeof chunk === 'string' ? chunk : chunk?.toString?.() || '';
  if (str.includes('DEP0169') || (str.includes('DeprecationWarning') && str.includes('url.parse'))) {
    if (typeof encoding === 'function') encoding();
    else if (typeof callback === 'function') callback();
    return true;
  }
  return originalStderrWrite(chunk, encoding, callback);
};

export {};

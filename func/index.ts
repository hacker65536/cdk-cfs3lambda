'use strict';

exports.handler = (event: any, context: any, callback: Function) => {
  const request = event.Records[0].cf.request;
  if (!request.uri.match(/\/$/)) {
    const names = request.uri.split('/');
    if (!names[names.length - 1].match(/.+\..+/)) {
      request.uri = request.uri.replace(/$/, '/');
    }
  }

  request.uri = request.uri.replace(/\/$/, '/index.html');

  return callback(null, request);
};

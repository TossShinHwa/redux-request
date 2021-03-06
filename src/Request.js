import superagent from 'superagent';

export default class Request {
  constructor(apiRoot) {
    ['get', 'post', 'put', 'patch', 'del'].
      map((method) => {
        this[method] = (path, options) => {
          return new Promise((resolve, reject) => {
            if (fetch) {
              const config = {
                credentials: 'include', 
                method,
              }
              let url = this.formatUrl(path, apiRoot);
              if (options && options.query) {
                // https://fetch.spec.whatwg.org/
                // Object.keys(options.query).forEach(key => url.searchParams.append(key, options.query[key]))
                const queryString = [];
                Object.keys(options.query).forEach(key => {
                  queryString.push(key + '=' + options.query[key]);
                });
                url += '?' + queryString.join('&');
              }
              if (options && options.data) {
                config.body = JSON.stringify(options.data);
              }
              return fetch(url, config).then((res) => res.json()).then(resolve).catch(reject);
            }
            const request = superagent[method](this.formatUrl(path, apiRoot)).withCredentials();
            if (options && options.query) {
              request.query(options.query);
            }
            if (options && options.data) {
              request.send(options.data);
            }
            request.end((err, res) => {
              if (err) {
                reject((res && res.body) || err);
              } else {
                resolve(res.body);
              }
            });
          });
        };
      });
  }

  formatUrl(path, apiRoot) {
    if (this.hasProtocol(path)) {
      return path;
    }
    return apiRoot + (path[0] !== '/' ? '/' + path : path);
  }

  hasProtocol(path) {
    return path.indexOf('http://') === 0 || path.indexOf('https://') === 0;
  }
}


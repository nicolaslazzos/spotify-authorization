export const getParams = (params: any) => {
  const body = [];

  for (let param in params) {
    var key = encodeURIComponent(param);
    var value = encodeURIComponent(params[param]);
    body.push(`${key}=${value}`);
  }

  return body.join("&");
};

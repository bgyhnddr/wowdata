function getString(key) {
  let result = location.search.split("&").filter(o => {
    return o && o.split("=")[0] == key;
  });
  return result.length > 0 ? result[0].split("=")[1] : undefined;
}

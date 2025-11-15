export function upsertById(list, item, idKey = 'id') {
  if (!item || item[idKey] == null) return list;
  const id = String(item[idKey]);
  const idx = list.findIndex((x) => String(x[idKey]) === id);
  if (idx === -1) return [...list, item];
  const copy = list.slice();
  copy[idx] = item;
  return copy;
}

export function removeById(list, id, idKey = 'id') {
  if (id == null) return list;
  const sid = String(id);
  return list.filter((x) => String(x[idKey]) !== sid);
}

export default { upsertById, removeById };

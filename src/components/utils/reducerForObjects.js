//reducer to change state in react
export const reducerForObjects = (state, action) => {
  let tempObj = {...state};
  switch (action.type) {
    case 'remove':
      delete tempObj[action.index];
      return tempObj;
    case 'update':
      tempObj[action.index] = action.item;
      return tempObj;
    case 'replace':
      return action.item;
    default:
      throw new Error();
  }
}

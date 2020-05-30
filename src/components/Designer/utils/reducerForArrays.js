//reducer to change state in react
//to add a new card at end of array, use dispatch({ type: 'add', item: movie })
//to remove an existing card at index, use dispatch({ type: 'remove', index: INDEX })
//to reset all and replace with empty array except default item, use dispatch({ type: 'reset', item: DEFAULT VALUE })
//to update an existing card and replace with new item, use dispatch({ type: 'update', index: INDEX })
export const reducerForArrays = (state, action) => {
  switch (action.type) {
    case 'add':
      return [...state, action.item];
    case 'remove':
      return state.filter((item, index) => {
        //remove item at index
        if (index === action.index) {
          return false;
        }
        // //remove item with property with value
        // else if (item[action.property] === action.value){
        //   return false;
        // }
        //every other item stays
        return true;
      });
    case 'update':
      return state.map((item, index) => {
        //replace the item at index
        if (index === action.index) {
          return action.item;
        }
        //leave every other item unchanged
        return item;
      });
    case 'reset':
      return [action.item];
    default:
      throw new Error();
  }
}

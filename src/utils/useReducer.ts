export const useReducer = <State, Action>(
  reducer: (state: State, action: Action) => State,
  initial: State
) => {
  let state = initial;

  const dispatch = (action: Action) => {
    state = reducer(state, action);
  };

  return {
    dispatch,
    getState: () => state,
  };
};

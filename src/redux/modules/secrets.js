const LOAD = 'secrets/LOAD';
const SUCCESS = 'secrets/SUCCESS';
const FAIL = 'secrets/FAIL';

const initialState = { data: null,
  isFetching: false
 };

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        isFetching: true
      };
    case SUCCESS:
      return {
        ...state,
        data: action.result,
        isFetching: false
      };
    case FAIL:
      console.log(action.result);
      return {
        ...state,
        error: action.result,
        isFetching: false
      };
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.secrets && globalState.secrets.data !== null;
}

export function load() {
  return {
    types: [LOAD, SUCCESS, FAIL],
    promise: (client) => client.get('/keys')
  };
}

import { legacy_createStore as createStore } from 'redux';

// Action Types
const SET_PROJECTS = 'SET_PROJECTS';
const SET_RH2_DATA = 'SET_RH2_DATA';
const SET_ASSIGNED_SOUSCRIPTEURS = 'SET_ASSIGNED_SOUSCRIPTEURS';
const UPDATE_ASSIGNED_SOUSCRIPTEUR = 'UPDATE_ASSIGNED_SOUSCRIPTEUR';
const RESET_STATE = 'RESET_STATE';
// Initial state
const initialState = {
  sidebarShow: true,
  theme: 'light',
  notifCount: 2,
  projects: [],
  rh2Data: null,
  rh2DataAll: null,
  assignedSouscripteurs: [],
};



// Reducer
const changeState = (state = initialState, { type, payload }) => {
  switch (type) {
    case 'set':
      return { ...state, sidebarShow: payload };

    case SET_PROJECTS:
      return { ...state, projects: payload };

    case SET_RH2_DATA:
      return { ...state, rh2Data: payload };

    case SET_ASSIGNED_SOUSCRIPTEURS:
      return { ...state, assignedSouscripteurs: payload };

    case UPDATE_ASSIGNED_SOUSCRIPTEUR:
      return {
        ...state,
        assignedSouscripteurs: state.assignedSouscripteurs.map((sous) =>
          sous.id_souscripteur === payload.id
            ? { ...sous, completed: 1 }
            : sous
        ),
      };
          case RESET_STATE: {
  console.log("RESET_STATE called");
  return initialState;
}

    default:
      return state;
  }
};

// Action Creators
const setProjects = (projects) => ({
  type: SET_PROJECTS,
  payload: projects,
});

const setRH2Data = (rh2Data) => ({
  type: SET_RH2_DATA,
  payload: rh2Data,
});

const setRH2DataAll = (rh2DataAll) => ({
  type: SET_RH2_DATA, // If you need a separate action type, define a new one
  payload: rh2DataAll,
});

const setAssignedSouscripteurs = (assignedList) => ({
  type: SET_ASSIGNED_SOUSCRIPTEURS,
  payload: assignedList,
});

const updateAssignedSouscripteur = (id) => ({
  type: UPDATE_ASSIGNED_SOUSCRIPTEUR,
  payload: { id },
});
const resetState = () => ({
  type: RESET_STATE,
});
// Store
const store = createStore(changeState);

// Exports
export {
  store,
  setProjects,
  setRH2Data,
  setRH2DataAll,
  setAssignedSouscripteurs,
  updateAssignedSouscripteur,
  resetState,
};

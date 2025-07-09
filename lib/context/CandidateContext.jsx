"use client";

import { createContext, useContext, useReducer, useCallback } from "react";
import { loadCSVFile, transformCandidateData } from "../data/csvLoader";
import {
  filterBySearchTerm,
  filterByLocation,
  filterByExperience,
  sortCandidates,
  getUniqueLocations,
} from "../data/searchHelpers";

/**
 * Candidate state reducer
 */
const candidateReducer = (state, action) => {
  switch (action.type) {
    case "LOAD_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "LOAD_SUCCESS":
      return {
        ...state,
        candidates: action.payload,
        filteredCandidates: action.payload,
        isLoading: false,
        error: null,
      };

    case "LOAD_ERROR":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case "SEARCH_START":
      return {
        ...state,
        isSearching: true,
      };

    case "SEARCH_COMPLETE":
      return {
        ...state,
        filteredCandidates: action.payload,
        isSearching: false,
      };

    case "AI_FILTER_APPLY":
      return {
        ...state,
        filteredCandidates: action.payload,
        lastAIQuery: action.query || state.lastAIQuery,
      };

    case "SET_SEARCH_TERM":
      return {
        ...state,
        searchTerm: action.payload,
      };

    case "SET_LOCATION_FILTER":
      return {
        ...state,
        locationFilter: action.payload,
      };

    case "SET_EXPERIENCE_FILTER":
      return {
        ...state,
        experienceFilter: action.payload,
      };

    case "SET_SORT_BY":
      return {
        ...state,
        sortBy: action.payload,
      };

    case "SET_SELECTED_CANDIDATE":
      return {
        ...state,
        selectedCandidate: action.payload,
      };

    case "CLEAR_FILTERS":
      return {
        ...state,
        searchTerm: "",
        locationFilter: "",
        experienceFilter: "",
        sortBy: "name",
        filteredCandidates: state.candidates,
      };

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

/**
 * Initial state
 */
const initialState = {
  candidates: [],
  filteredCandidates: [],
  searchTerm: "",
  locationFilter: "",
  experienceFilter: "",
  sortBy: "name",
  selectedCandidate: null,
  isLoading: true,
  isSearching: false,
  error: null,
  lastAIQuery: null,
};

/**
 * Context creation
 */
const CandidateContext = createContext(undefined);

/**
 * Async action helpers
 */
export const loadCandidates = async (dispatch) => {
  dispatch({ type: "LOAD_START" });

  try {
    const rawData = await loadCSVFile("/candidates.csv");
    const transformedData = transformCandidateData(rawData);

    dispatch({
      type: "LOAD_SUCCESS",
      payload: transformedData,
    });
  } catch (error) {
    dispatch({
      type: "LOAD_ERROR",
      payload: error.message,
    });
  }
};

export const applyFilters = (dispatch, state) => {
  dispatch({ type: "SEARCH_START" });

  setTimeout(() => {
    const { candidates, searchTerm, locationFilter, experienceFilter, sortBy } =
      state;

    let filtered = filterBySearchTerm(candidates, searchTerm);
    filtered = filterByLocation(filtered, locationFilter);
    filtered = filterByExperience(filtered, experienceFilter);
    filtered = sortCandidates(filtered, sortBy);

    dispatch({
      type: "SEARCH_COMPLETE",
      payload: filtered,
    });
  }, 200);
};

/**
 * Context Provider Component
 */
export const CandidateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(candidateReducer, initialState);

  const actions = {
    loadCandidates: useCallback(() => {
      loadCandidates(dispatch);
    }, []),

    setSearchTerm: useCallback(
      (term) => {
        dispatch({ type: "SET_SEARCH_TERM", payload: term });
        setTimeout(
          () => applyFilters(dispatch, { ...state, searchTerm: term }),
          0,
        );
      },
      [state],
    ),

    setLocationFilter: useCallback(
      (location) => {
        dispatch({ type: "SET_LOCATION_FILTER", payload: location });
        setTimeout(
          () => applyFilters(dispatch, { ...state, locationFilter: location }),
          0,
        );
      },
      [state],
    ),

    setExperienceFilter: useCallback(
      (experience) => {
        dispatch({ type: "SET_EXPERIENCE_FILTER", payload: experience });
        setTimeout(
          () =>
            applyFilters(dispatch, { ...state, experienceFilter: experience }),
          0,
        );
      },
      [state],
    ),

    setSortBy: useCallback(
      (sortBy) => {
        dispatch({ type: "SET_SORT_BY", payload: sortBy });
        setTimeout(() => applyFilters(dispatch, { ...state, sortBy }), 0);
      },
      [state],
    ),

    setSelectedCandidate: useCallback((candidate) => {
      dispatch({ type: "SET_SELECTED_CANDIDATE", payload: candidate });
    }, []),

    clearFilters: useCallback(() => {
      dispatch({ type: "CLEAR_FILTERS" });
    }, []),

    // AI-specific actions
    applyAIFilters: useCallback(
      (candidateIds, query = null) => {
        if (!candidateIds || !Array.isArray(candidateIds)) {
          console.warn("Invalid candidate IDs provided to applyAIFilters");
          return;
        }

        // Preserve the order by mapping candidateIds to candidates
        const aiFilteredCandidates = candidateIds
          .map((id) =>
            state.candidates.find((candidate) => candidate.id === id),
          )
          .filter(Boolean);

        dispatch({
          type: "AI_FILTER_APPLY",
          payload: aiFilteredCandidates,
          query,
        });
      },
      [state.candidates],
    ),

    resetToAllCandidates: useCallback(() => {
      dispatch({
        type: "AI_FILTER_APPLY",
        payload: state.candidates,
      });
    }, [state.candidates]),
  };

  const computedValues = {
    getUniqueLocations: useCallback(() => {
      return getUniqueLocations(state.candidates);
    }, [state.candidates]),

    getTotalCandidates: useCallback(() => {
      return state.candidates.length;
    }, [state.candidates.length]),

    getFilteredCount: useCallback(() => {
      return state.filteredCandidates.length;
    }, [state.filteredCandidates.length]),
  };

  const value = {
    ...state,
    ...actions,
    ...computedValues,
  };

  return (
    <CandidateContext.Provider value={value}>
      {children}
    </CandidateContext.Provider>
  );
};

/**
 * Custom hook to consume candidate context
 */
export const useCandidates = () => {
  const context = useContext(CandidateContext);

  if (context === undefined) {
    throw new Error("useCandidates must be used within a CandidateProvider");
  }

  return context;
};

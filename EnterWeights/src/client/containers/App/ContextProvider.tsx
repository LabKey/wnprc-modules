import * as React from 'react';
import {createContext, useState} from 'react';

interface ContextProps {
  submitted: boolean;
  submit: any;
  setrestraints: any;
  restraints: any;
}

const AppContext = createContext({} as ContextProps);

function ContextProvider({ children }) {
  const [submitted, setSubmitted] = useState(false);
  const [restraints, setRestraints] = useState(null);

  function setrestraints(restraints) {
    setRestraints(restraints);
  }

  function submit() {
    setSubmitted(true);
  }

  const defaultContext = {
    submitted,
    submit,
    setrestraints,
    restraints
  };

  return (
    <AppContext.Provider value={defaultContext}>
      {children}
    </AppContext.Provider>
  );
}

export  {AppContext,ContextProvider};
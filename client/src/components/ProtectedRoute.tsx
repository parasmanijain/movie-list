import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';

interface ProtectedRouteProps extends RouteProps {
    component?: any;
    render?: any;
}


const ProtectedRoute = (props: ProtectedRouteProps) => {
  const { component: Component, render, ...restOfProps } = props;
  const isDev = (process.env.NODE_ENV).toLowerCase().includes('development');

  return (
    Component ? <Route
      {...restOfProps}
      render={(props) =>
        isDev ? <Component {...props} /> : <Redirect to="/" />
      }
    /> : isDev ? <Route {...restOfProps} render={render}/> : <Redirect to="/" />
  );
};

export default ProtectedRoute;

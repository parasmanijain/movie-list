import React from 'react';

export const renderChart = (WC) => {
  const MyComp = (props) => {
    return (
      <WC {...props} />
    );
  };
  MyComp.displayName = 'Chart';
  return MyComp;
};

import React from 'react';

function Loader({ small = false }) {
  return (
    <span className={`spinner-border ${small ? 'spinner-border-sm' : ''}`} role="status" aria-hidden="true" />
  );
}

export default Loader;

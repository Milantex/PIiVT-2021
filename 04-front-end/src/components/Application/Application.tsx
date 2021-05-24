import React from 'react';
import './Application.sass';

export default function Application() {
  return (
    <div className="Application container">
      <div className="Application-header">
        Front-end aplikacije
      </div>
      <p>
        <button className="btn btn-primary">
          Log in
        </button>
      </p>
    </div>
  );
}

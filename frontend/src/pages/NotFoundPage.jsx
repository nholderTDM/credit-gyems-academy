import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <h1 className="text-5xl font-bold text-slate-800 mb-4">404</h1>
      <p className="text-xl text-slate-600 mb-8">Page not found</p>
      <Link to="/" className="btn-primary">
        Back to Homepage
      </Link>
    </div>
  );
};

export default NotFound;

// This code defines a functional component called `NotFound` that serves as a 404 error page for a web application.
// It imports the `Link` component from `react-router-dom` to create a link back to the homepage.
// The `NotFound` component returns a JSX structure that includes a main container with a minimum height of the screen and a light gray background color.
// Inside the container, it renders a large "404" heading, a message indicating that the page was not found, and a button that links back to the homepage.  
// The button is styled with a class name of `btn-primary`, which likely applies some predefined styles.
// The `NotFound` component is then exported as the default export of the module, making it available for use in other parts of the application.
// The `NotFound` component is a functional component that serves as a 404 error page for a web application.
// It imports the `Link` component from `react-router-dom` to create a link back to the homepage.
// The `NotFound` component returns a JSX structure that includes a main container with a minimum height of the screen and a light gray background color.
// Inside the container, it renders a large "404" heading, a message indicating that the page was not found, and a button that links back to the homepage.
// The button is styled with a class name of `btn-primary`, which likely applies some predefined styles.
// The `NotFound` component is then exported as the default export of the module, making it available for use in other parts of the application.
// The `NotFound` component is a functional component that serves as a 404 error page for a web application.
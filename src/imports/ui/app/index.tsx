import React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';

import Footer from '../components/footer';
import Header from '../components/header';
import Home from '../components/home';
import NotFound from '../components/notfound';
import RoomUI from '../components/room';

class App extends React.Component {
  render(): React.ReactElement {
    return (
      <div>
        <BrowserRouter>
          <Header />
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/r/:hash" component={RoomUI} />
            <Route exact path="/404" component={NotFound} />
            <Redirect to="/404" />
          </Switch>
          <Footer />
        </BrowserRouter>
      </div>
    );
  }
}

export default App;

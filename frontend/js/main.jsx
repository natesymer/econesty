import React from 'react';
import { Router, Route, Switch, withRouter } from 'react-router';
import createBrowserHistory from 'history/createBrowserHistory'

import { API, APICollection, APIActionCollection } from 'app/api';

// import { TopBar, TopBarLeft, TopBarRight } from 'react-foundation';

// Representations
import Transaction from 'app/repr/transaction';
import User from 'app/repr/user';

// Components
import Components, { Form, SearchField } from 'app/components';
import { withPromiseFactory, withPromise, asyncCollection, rewritePath, wrap } from 'app/components/higher';

// Setup API
API.user = new APICollection("user");
API.user.me = () => API.user.classMethod("GET", "me");
API.user.transactions = (userId, page = 1) => API.user.instanceMethod("GET", "transactions", userId, null, {page: page});
API.user.payment = otherId => API.user.instanceMethod("GET", "payment", otherId)
API.transaction = new APICollection("transaction");
API.payment_data = new APICollection("paymentdata");
API.countersignature = new APICollection("countersignature");
API.token =  new APIActionCollection("token", res => API.setToken(res.token));

// setup browser history
const browserHistory = createBrowserHistory({forceRefresh: true});

function joinPromises(psDict) {
  var ps = [];
  for (var key in psDict) {
    if (psDict.hasOwnProperty(key)) {
      var value = psDict[key];
      ps.push(Promise.all([value, Promise.resolve(key)]).then(([res, k]) => {
        var ret = {};
        ret[k] = res;
        return ret;
      }));
    }
  }
  return Promise.all(ps).then(xs => xs.reduce((acc, x) => Object.assign(acc, x), {}));
}

///// FORMS

// Create-Only

const loginForm = () =>
  <Form.Form onSubmit={saveFormTo(API.token, obj => {
    API.setToken(obj.token);
    browserHistory.push("/user/me");
  })}>
    <Form.Element required text name="username" label="Username" wrapperClass="textfield" />
    <Form.Element required password name="password" label="Password" wrapperClass="textfield" />
  </Form.Form>
;

const signupForm = () =>
  <Form.Form onSubmit={saveFormTo(API.user, user => browserHistory.push("/user/" + user.id))}>
    <Form.Element required text     name="first_name" label="First Name" wrapperClass="textfield" />
    <Form.Element required text     name="last_name"  label="Last Name" wrapperClass="textfield" />
    <Form.Element required email    name="email"      label="Email" wrapperClass="textfield" />
    <Form.Element required text     name="username"   label="New Username" wrapperClass="textfield" />
    <Form.Element required password name="password"   label="New Password" wrapperClass="textfield" />
  </Form.Form>
;

const countersignForm = props =>
  <Form.Form object={props.object} onSubmit={saveFormTo(API.countersignature, cs => browserHistory.push("/transaction/" + cs.transaction.id))}>
    <Form.Element hidden name="user_id" />
    <Form.Element hidden name="transaction_id" />
    <Components.SignatureField editable name="signature" />
  </Form.Form>
;

const countersignDefaults = props => API.user.me().then(me => ({
  user_id: me.id,
  transaction_id: parseInt(props.match.params.id),
  signature: ""
}));

// Create/update forms.

const paymentDataForm = withRouter(props =>
  <Form.Form object={props.object} onSubmit={upsertFormTo(API.payment_data, props.match.params.id, pd => browserHistory.push("/payment/" + pd.id))}>
    <Form.Element required text name="data" label="Data" wrapperClass="textfield" />
    <Form.Element checkbox name="encrypted" label="Encrypted" />
    <Form.Element hidden name="user_id" />
  </Form.Form>
);

const paymentDataDefaults = () => API.user.me().then(me => ({
  data: "",
  encrypted: false,
  user_id: me.id
}));

const transactionForm = props =>
  <Form.Form object={props.object} onSubmit={saveFormTo(API.transaction, props.match.params.id, t => browserHistory.push("/transaction/" + t.id))}>
    <Form.Element required text name="offer" label="Offer" wrapperClass="textfield" />
    <Form.Element required text name="offer_currency" label="Currency" wrapperClass="textfield" />
    <Form.Element required text name="required_witnesses" label="Number of Witnesses" wrapperClass="textfield" />
    <Form.Element hidden name="buyer_id" />
    <Form.Element hidden name="buyer_payment_data_id" />
    <Form.Element hidden name="seller_id" />
    <Form.Element hidden name="seller_payment_data_id" />
  </Form.Form>
;

const transactionDefaults = props => {
  var isBuyer = undefined;
  var otherId = undefined;

  if (props.match) {
    isBuyer = props.match.params.action === "buy";
    otherId = props.match.params.id;
    otherId = otherId === "me" ? undefined : parseInt(otherId);
  }

  return joinPromises({
    me: API.user.me(),
    payment: API.user.payment(otherId)
  }).then(res => ({
    offer: "0.00",
    offer_currency: "USD",
    required_witnesses: "0",
    buyer_id: isBuyer ? res.me.id : otherId,
    buyer_payment_data_id: isBuyer ? res.payment.me.id : res.payment.them.id,
    seller_id: isBuyer ? otherId : res.me.id,
    seller_payment_data_id: isBuyer ? res.payment.them.id : res.payment.me.id
  }));
};

const Page = props => {
/*        

            <TopBar>
        <TopBarLeft>
          <a href="/" className="light">Econesty</a>
        </TopBarLeft>
        <TopBarRight>
          <SearchField
            api={API.user}
            headerComponent={props => <div className="secondary">Showing {props.object.results.length} of {props.object.count}</div>}
            component={props => <a className="primary" href={"/user/" + props.object.id.toString()}>{props.object.username}</a>}
          />
          <a href="/user/me" className="light">Profile</a>
        </TopBarRight>
      </TopBar>*/
  return (
    <div>
      <div className="header">
        <div className="header-item left">
          <a href="/" className="light">Econesty</a>
        </div>
        <div className="header-item right light">
          <SearchField
            api={API.user}
            headerComponent={props => <div className="secondary">Showing {props.object.results.length} of {props.object.count}</div>}
            component={props => <a className="primary" href={"/user/" + props.object.id.toString()}>{props.object.username}</a>}
          />
        </div>
        <div className="header-item right">
          <a href="/user/me" className="light">Profile</a>
        </div>
      </div>

      <div className="content">
        {props.children}
      </div>
    </div>
  );
};

function saveFormTo(api, f = null) {
  return obj => {
    api.create(obj).catch(e => {
      throw e;
    }).then(f || (() => undefined));
  };
}

function upsertFormTo(api, oid, f = null) {
  return obj => {
    var p = oid ? api.update(oid, obj) : api.create(obj);
    p.catch(e => {
      throw e;
    }).then(f || (() => undefined));
  };
}

function withAPI(api, form) {
  return withRouter(props => {
    const WrappedForm = withPromise(api.read(props.match.params.id), form);
    return <WrappedForm {...props} />;
  });
}

////////// APP JSX

const Profile = props => {
  const userId = props.match.params.id;
  const UserView = withAPI(API.user, User);
  const TransactionCollection = asyncCollection(
    () => <span className="primary light">Transactions</span>,
    Transaction,
    page => API.paginate(API.user.transactions(userId, page), API.transaction)
  );
  return (
    <div>
      <UserView {...props} />
      <button onClick={() => props.history.push("/user/" + userId + "/transaction/buy")}>Buy From</button>
      <button onClick={() => props.history.push("/user/" + userId + "/transaction/sell")}>Sell To</button>
      <TransactionCollection {...props} />
    </div>
  );
}

const Home = () =>
  <div>
    <Form.Form onSubmit={console.log}>
      <Form.Element hidden name="value" value="999" />
      <Form.Element select={["USD", "EUR"]} name="currency" label="Currency" />
      <Form.Form subForm name="user">
        <Form.Element hidden name="id" value="2" />
      </Form.Form>
    </Form.Form>
    <div className="color-box-highlight splash">
      <h1>Econesty</h1>
      <h2>Fairness in Negotiation</h2>
    </div>
    <div className="color-box">
      <h3>Econesty allows users to recruit experts to verify the fairness of their transactions</h3>
      <p>When making a transaction through Econesty, you can add terms and conditions that must be fulfilled in order for money to change hands. For example,
         users can recuit other (an)other user(s) to sign off on the quality of a transaction.
      </p>
      <p>For example, if you're about to buy a used car, you might recruit your friend to quickly google a good price for it, and sign off that the seller is
        asking a fair price for it.</p>
    </div>
    <div className="color-box-highlight">
      <h3>Econesty finds the best payment method for each transaction.</h3>
      <p>Users can store any number of payment methods through econesty. When they go to make a transaction, a common payment method is found, and the transaction
         goes through. Users can also specify how secure the transaction should be, what kind of expense it is, amongst other things - These also affect payment method
         choice.</p>
    </div>
    <div className="">
      <h3>Econesty stores sensitive data securely</h3>
      <p>Each piece of payment data is decrypted only when needed, and is encrypted using an easily memorable password. Econesty favors prompting the user for the password
         over storing it for ease of use.</p>
    </div>
  </div>
;

export default () => {
  return (
    <Router history={browserHistory}>
      <Switch>
        <Route exact path="/" component={wrap(Page, Home)} />
        <Route exact path="/login" component={wrap(Page, loginForm)} />
        <Route exact path="/signup" component={wrap(Page, signupForm)} />

        <Route exact path="/user/me" component={props => {
          const C = withPromise(
            API.user.me().then(res => "/user/" + res.id.toString()),
            rewritePath(/.*/))
          return <C {...props} />;
        }} />

        <Route exact path='/user/:id' component={wrap(Page, Profile)} />
        <Route exact path='/user/:id/transaction/:action' component={wrap(Page, withPromiseFactory(transactionDefaults, transactionForm))} />
        <Route exact path='/payment/new' component={wrap(Page, withPromiseFactory(paymentDataDefaults, paymentDataForm))} />
        <Route exact path='/payment/:id' component={wrap(Page, withAPI(API.payment_data, paymentDataForm))} />
        <Route exact path='/transaction/:id' component={wrap(Page, withAPI(API.transaction, Transaction))} />
        <Route exact path='/transaction/:id/countersign' component={wrap(Page, withPromiseFactory(countersignDefaults, countersignForm))} />
      </Switch>
    </Router>
  );
}

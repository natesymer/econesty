import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { Form, Element, Button, SubmitButton, Menu, MenuList, MenuHeading, MenuItem, Grid, GridUnit } from 'app/pure';
import { API } from 'app/api';
import { Resource, Money } from 'app/components';
import { Router, Link } from 'app/routing';

class EditTransactionPage extends Component {
  constructor(props) {
    super(props);
    this.save = this.save.bind(this);
    this.state = { object: null, error: null, requirements: [] };
    this.setState = this.setState.bind(this);
    this.renderForm = this.renderForm.bind(this);
  }

  get isBuyer() {
    return this.props.matches.action === "buy";
  }

  get isSeller() {
    return this.props.matches.action === "sell";
  }

  get otherId() {
    return parseInt(this.props.matches.id);
  }

  componentDidMount() {
    if (!this.state.object) {
      API.user.payment(this.otherId).catch(e => this.setState(st => {
        return Object.assign({}, st, { error: e });
      })).then(res => {
        const isBuyer = this.isBuyer;
  
        console.log(res);
  
        var me = res.me.user;
        var them = res.them.user;
        var payment = res;
  
        this.setState(st => Object.assign({}, st, {
          object: {
            offer_currency: "USD",
            buyer_id: isBuyer ? me.id : them.id,
            buyer_payment_data_id: isBuyer ? payment.me.id : payment.them.id,
            seller_id: isBuyer ? them.id : me.id,
            seller_payment_data_id: isBuyer ? payment.them.id : payment.me.id
          }
        }));
      });
    }
  }

  save(obj) {
    console.log("saving ", obj);
    // const requirements = obj.requirements;
    // obj.requirements = undefined;

    // const logic = transaction => {
    //   this.setState(st => Object.assign({}, st, { object: transaction }));
    //   Router.redirect("/transaction/" + transaction.id);
    // };

    // const errorLogic = e => {
    //   this.setState(st => Object.assign({}, st, { error: e }));
    // };

    // (obj.id ?
    //   API.transaction.update(obj.id, obj)
    //   :
    //   API.transaction.create(obj)
    // ).catch(errorLogic).then(logic);
  }

  renderForm({ object }) {
    // TODO: capture user for requirements.
    let o = object || {};
    o.requirements = o.requirements || [];
    const currencies = ["USD", "EUR", "JPY", "GBP"];
    return (
      <Form object={o} aligned>
        <Element text required       name="offer" label="Offer" />
        <Element select={currencies} name="offer_currency" label="Currency"  />
        <Element hidden              name="buyer_id" />
        <Element hidden              name="buyer_payment_data_id" />
        <Element hidden              name="seller_id" />
        <Element hidden              name="seller_payment_data_id" />
        <Form group name="requirements">
          <Element required text     name="text" label="Text" />
          <Element required checkbox name="signature_required" label="Require Signature" message="The user will be required to provide a signature." />
          <Element required checkbox name="acknowledgment_required" label="Require Acknowledgment" message="The user has to acknowledge this transaction." />
        </Form>
        <SubmitButton onSubmit={this.save}>
          {this.isBuyer ? "BUY" : "SELL"}
        </SubmitButton>
      </Form>
    );
  }

  addRequirement() {
    let r = {
      text: "",
      signature_required: false,
      acknowledgment_required: false
    };
    this.setState(st => {
      var cpy = Object.assign({}, st);
      cpy.object = cpy.object || {requirements: []};
      cpy.object.requirements.push(r);
      return cpy;
    });
  }

  render(props, { object, error }) {
    return (
      <div className="edit-transaction">
        <Resource
          component={this.renderForm}
          object={object}
          error={this.otherId ? error : new Error("invalid user id")}
          {...props} />
        <Button onClick={() => this.addRequirement() }>+ Requirement</Button>
      </div>
    );
  }
}

export default EditTransactionPage;

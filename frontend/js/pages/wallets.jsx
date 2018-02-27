import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Button, DeleteButton, Labelled, SideMargins } from 'app/components/elements';
import { Form, Input, FormGroup } from 'app/components/forms';
import { API } from 'app/api';
import { CollectionView, CollectionCreation } from 'app/components/api';

function WalletCreateForm({ collectionView, CancelButton }) {
  return (
    <div>
      <Form onSubmit={collectionView.saveElement}>
        <Input hidden name="user_id" value={API.getUserID()}/>
        <FormGroup>
          <Input text required
                 name="private_key"
                 placeholder="Bitcoin wallet private key (WIF format)" />
        </FormGroup>
        <div className="centered">
          <Button action="submit">Save</Button>
          <CancelButton />
        </div>
      </Form>
    </div>
  );
}

function WalletCollectionBody({ collectionView }) {
  return (
    <div>
      {collectionView.getElements().map(w =>
         <div>
            <DeleteButton onClick={() => collectionView.deleteElement(w.id)} />
            <Form>
              <FormGroup>
                <Labelled label="Address">
                  <Input text disabled={true} value={w.address} />
                </Labelled>
                <Labelled label="Private Key">
                  <Input text disabled={true} value={w.private_key} />
                </Labelled>
              </FormGroup>
            </Form>
         </div>)}
    </div>
  );
}

function Wallets() {
  return (
    <SideMargins>
      <CollectionView collection={API.wallet.withParams({ user__id: API.getUserID(), paginate: false })}>
        <CollectionCreation>
          <WalletCreateForm />
        </CollectionCreation>
        <WalletCollectionBody />
      </CollectionView>
    </SideMargins>
  );
}

export { Wallets };
export default Wallets;

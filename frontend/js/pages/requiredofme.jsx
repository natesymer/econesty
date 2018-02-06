import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars

import { API } from 'app/api';
import { CollectionView } from 'app/components/api';
import { Table, Button } from 'app/components/elements';
import { Form, Input, syntheticSubmit } from 'app/components/forms';
import { Link } from 'app/components/routing';

function RequirementRow({ collectionView, element }) {
  return (
    <tr>
      <td>{element.text}</td>
      <td>
        <Form key={element.id + "-ack"}
              id={element.id + "-ack"}
              onSubmit={collectionView.saveElement}>
          <Input checkbox required={element.acknowledgment_required}
                          disabled={element.acknowledged}
                          onInput={syntheticSubmit(element.id + "-ack")}
                          name="acknowledged" value={element.acknowledged}/>
        </Form>
      </td>
      <td>
        <Form key={element.id + "-sig"} onSubmit={collectionView.saveElement}>
          <Input text required={element.signature_required}
                 disabled={Boolean(element.signature)}
                 name="signature" value={element.signature}/>
          {!Boolean(element.signature) &&
           <Button action="submit">SIGN</Button>}
        </Form>
      </td>
      <td>
        <Link className="secondary"
              href={"/transaction/" + element.transaction.id}>
          #{element.transaction.id}
        </Link>
      </td>
    </tr>
  );
}

function RequirementsCollection({ collectionView }) {
  return (
    <Table>
      <thead>
        <tr>
          <th>Text</th>
          <th>Acknowledged</th>
          <th>Signature</th>
          <th>Transaction</th>
        </tr>
      </thead>
      <tbody>
        {collectionView.getElements().map(e =>
          <RequirementRow collectionView={collectionView} element={e} />)}
      </tbody>
    </Table>
  );
}

function RequiredOfMe(props) { // eslint-disable-line no-unused-vars
  return (
    <CollectionView collection={API.requirement.ofMe}>
      <RequirementsCollection />
    </CollectionView>
  );
}

export default RequiredOfMe;

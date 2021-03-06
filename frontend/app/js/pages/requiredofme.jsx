import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Anchor, Flex, Form, Input, CollectionView, API, Button } from 'base/base';
import { SideMargins, Frown } from 'app/common';
import style from 'app/style';
import BaseStyle from 'base/style';
import { noSelect } from 'base/style/mixins';

const rsStyle = {
  pageTitle: {
    ...noSelect(),
    ...style.text.primary,
    padding: `${BaseStyle.padding} 0`
  },
  reqTitle: {
    ...noSelect(),
    ...style.text.secondary,
    padding: `${BaseStyle.padding} 0`
  },
  signature: {
    ...style.text.script,
    padding: `${BaseStyle.padding} 0`
  },
  terms: {
    padding: `${BaseStyle.padding} 0`
  },
  signatureField: {
    margin: BaseStyle.padding,
    flexGrow: "2"
  }
};

function RequirementsCollection({ collectionView }) {
  if (collectionView.getElements().length === 0) {
    return (
      <div style={style.element.frownMessage}>
        <Frown large />
        <p style={noSelect()}>You don't have any requirements!</p>
      </div>
    );
  }
  return (
    <Flex container column style={style.table.base}>
      {collectionView.getElements().map((element, idx) =>
        <Flex container column style={{...style.table.row, ...idx % 2 ? style.table.oddRow : {}, ...style.table.column}}>
          <Flex container row alignItems="center">
            <p style={{ ...rsStyle.reqTitle, color: element.rejected ? "red" : element.fulfilled ? "green" : null }}>
              Transaction <Anchor style={style.text.secondary} href={"/transaction/" + element.transaction.id}>#{element.transaction.id}</Anchor>
            </p>
          </Flex>
          <Flex container wrap justifyContent="space-between" alignItems="center">
            <Flex basis="auto">
              <p style={rsStyle.terms}>{Boolean(element.text) ? element.text : "No written terms."}</p>
              {element.fulfilled && <p style={rsStyle.signature}>{element.signature}</p>}
            </Flex>
            {!element.acknowledged &&
            <Button onClick={() => collectionView.updateElement(element.id, {acknowledged: true})}>Acknowledge</Button>}
            {element.acknowledged && !element.rejected && !element.fulfilled && 
            <Flex component={Form} onSubmit={collectionView.saveElement}
                  container row wrap alignItems="center" justifyContent="center">
              <Input hidden name="id" value={element.id} />
              <Input text placeholder="Sign/type your name" name="signature" value={element.signature} style={rsStyle.signatureField} />
              <Button action="submit">SIGN</Button>
              <Button onClick={() => collectionView.updateElement(element.id, { rejected: true, signature: null}) }>REJECT</Button>
            </Flex>}
          </Flex>
        </Flex>)}
    </Flex>
  );
}

function RequiredOfMe(props) { // eslint-disable-line no-unused-vars
  return (
    <SideMargins>
      <Flex container column alignItems="center" margin>
        <p style={rsStyle.pageTitle}>My Requirements</p>
      </Flex>
      <CollectionView collection={API.requirement.withParams({ user__id: API.getUserID() })}>
        <RequirementsCollection />
      </CollectionView>
    </SideMargins>
  );
}

export default RequiredOfMe;
